import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {preparePendingMediaReview,renderPendingMediaReview,writePendingMediaReview} from '../scripts/prepare-pending-media-review.mjs';

const script=fileURLToPath(new URL('../scripts/prepare-pending-media-review.mjs',import.meta.url));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'mba-pending-media-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(relative,value)=>{const filename=path.join(root,relative);fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,value);};
 const media='exact fixture image bytes';
 const asset={asset_id:'photo',path:'shared/media/fish.jpg',owner:'media-custodian',alt:'Fish photograph',credit:'Recorded attribution only',permission:'review-required',offline:true,sha256:digest(media),source_repository:'example/source',source_commit:'a'.repeat(40),source_path:'images/fish.jpg',uses:[{app_id:'fish',source_path:'images/fish.jpg'}]};
 const manifest={app_id:'fish',title:'Fish',owner:'guide-team',media:['photo'],offline_assets:['shared/media/fish.jpg']};
 const saveAsset=()=>write('src/shared/media/catalog.json',JSON.stringify({assets:[asset]}));
 const saveManifest=()=>write('src/apps/fish/manifest.json',JSON.stringify(manifest));
 write('src/apps/fish/index.html','<img src="../../shared/media/fish.jpg">');
 write('src/shared/media/fish.jpg',media);saveAsset();saveManifest();
 return {root,write,asset,manifest,saveAsset,saveManifest};
}
test('pending packet is deterministic, byte-bound and actionable without inferring ownership or approval',t=>{
 const f=fixture(t),before=fs.readFileSync(path.join(f.root,'src/shared/media/catalog.json'));
 const first=preparePendingMediaReview(f.root),second=preparePendingMediaReview(f.root);
 assert.deepEqual(second,first);assert.equal(first.pending_items,1);
 assert.equal(first.sourceWritePerformed,false);assert.equal(first.permissionReviewComplete,false);
 const item=first.items[0];assert.equal(item.sha256,f.asset.sha256);assert.equal(item.bytes,Buffer.byteLength('exact fixture image bytes'));
 assert.equal(item.app_owner,'guide-team');assert.equal(item.catalog_custodian,'media-custodian');
 assert.equal(item.copyright_owner,'Not established by this packet');
 assert.deepEqual(item.source,{repository:f.asset.source_repository,commit:f.asset.source_commit,path:f.asset.source_path,uses:f.asset.uses});
 assert.deepEqual(item.registration,{cataloged:true,app_media_registered:true,offline_registered:true});
 assert.equal(item.review_status,'pending');assert.equal(item.missing_evidence.length,4);
 assert.match(item.missing_evidence.join(' '),/exact image/);
 assert.deepEqual(fs.readFileSync(path.join(f.root,'src/shared/media/catalog.json')),before);
});
test('live repository packet contains the existing nine permission-only items and preserves review gates',()=>{
 const root=path.resolve(path.dirname(script),'..'),packet=preparePendingMediaReview(root);
 assert.equal(packet.pending_items,9);assert.equal(packet.registrationValid,true);assert.equal(packet.permissionReviewComplete,false);
 assert.equal(new Set(packet.items.map(x=>x.app_id)).size,2);
 for(const item of packet.items){assert.equal(item.recorded_permission,'review-required');assert.equal(item.recorded_permission_evidence,'');assert.equal(item.catalog_hash_matches,true);assert.equal(item.review_status,'pending');}
});
test('unsafe paths, source symlinks and modified exact media bytes fail closed',t=>{
 for(const mutation of ['unsafe','symlink-file','symlink-parent','hash']){
  const f=fixture(t);
  if(mutation==='unsafe'){f.asset.path='../outside.jpg';f.saveAsset();}
  if(mutation==='hash')f.write('src/shared/media/fish.jpg','modified bytes');
  if(mutation.startsWith('symlink')){
   const target=path.join(f.root,mutation==='symlink-file'?'src/shared/media/fish.jpg':'src/shared/media'),saved=path.join(f.root,'saved');
   fs.renameSync(target,saved);fs.symlinkSync(saved,target,mutation==='symlink-file'?'file':'dir');
  }
  assert.throws(()=>preparePendingMediaReview(f.root),/Unsafe|Invalid|Symlink|hash mismatch/);
 }
});
test('malformed selected metadata and source provenance cannot produce review-ready packets',t=>{
 for(const patch of [{owner:null},{sha256:'wrong'},{source_commit:'latest'},{source_repository:''},{permission_evidence:[]},{uses:[null]},{uses:[]}]){
  const f=fixture(t);Object.assign(f.asset,patch);f.saveAsset();
  assert.throws(()=>preparePendingMediaReview(f.root),/Malformed/);
 }
 const f=fixture(t);f.manifest.title=null;f.saveManifest();assert.throws(()=>preparePendingMediaReview(f.root),/Malformed/);
});
test('technical media findings remain blockers rather than being packaged as permission approval',t=>{
 const f=fixture(t);f.manifest.offline_assets=[];f.saveManifest();
 assert.throws(()=>preparePendingMediaReview(f.root),/Technical media findings/);
});
test('contact sheet escapes metadata and uses only local relative image/link targets',t=>{
 const f=fixture(t),payload='<script>alert("x")</script><img src=x onerror=alert(1)>';
 for(const key of ['alt','owner','credit','source_repository','source_path'])f.asset[key]=payload;
 f.manifest.title=payload;f.saveAsset();f.saveManifest();
 const htmlFile=path.join(f.root,'review','contact.html');
 const html=renderPendingMediaReview(preparePendingMediaReview(f.root),{root:f.root,htmlFile});
 assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img src=x'));assert.match(html,/&lt;script&gt;/);
 assert.ok(html.includes('Content-Security-Policy'));assert.ok(!html.includes('<script '));
 const links=[...html.matchAll(/\s(?:src|href)="([^"]*)"/g)].map(m=>m[1]);
 assert.equal(links.length,2);
 for(const link of links){assert.ok(!/^(?:[a-z]+:|\/\/|\/)/i.test(link));assert.equal(path.resolve(path.dirname(htmlFile),decodeURIComponent(link)),path.join(f.root,'src/shared/media/fish.jpg'));}
});
test('rendering refuses stale or tampered media bytes after packet preparation',t=>{
 const f=fixture(t),packet=preparePendingMediaReview(f.root);f.write('src/shared/media/fish.jpg','changed after preparation');
 assert.throws(()=>renderPendingMediaReview(packet,{root:f.root,htmlFile:path.join(f.root,'review.html')}),/hash mismatch/);
});
test('CLI writes deterministic JSON and standalone HTML with explicit root and no source modifications',t=>{
 const f=fixture(t),report=path.join(f.root,'review','packet.json'),html=path.join(f.root,'review','contact.html');
 const run=()=>spawnSync(process.execPath,[script,'--root',f.root,'--report',report,'--html',html],{encoding:'utf8'});
 const first=run();assert.equal(first.status,0,first.stderr);
 const result=JSON.parse(first.stdout);assert.equal(result.pending_items,1);assert.equal(result.sourceWritePerformed,false);assert.equal(result.permissionReviewComplete,false);
 const bytes=[fs.readFileSync(report),fs.readFileSync(html)];assert.equal(run().status,0);
 assert.deepEqual(fs.readFileSync(report),bytes[0]);assert.deepEqual(fs.readFileSync(html),bytes[1]);
 assert.equal(JSON.parse(fs.readFileSync(path.join(f.root,'src/shared/media/catalog.json'))).assets[0].permission,'review-required');
});
test('output paths cannot target the source tree or traverse symlinked directories/files',t=>{
 const f=fixture(t),report=path.join(f.root,'report.json'),html=path.join(f.root,'contact.html');
 assert.throws(()=>writePendingMediaReview({root:f.root,report:path.join(f.root,'src','report.json'),html}),/Unsafe review output/);
 const outside=path.join(f.root,'outside');fs.mkdirSync(outside);fs.symlinkSync(outside,path.join(f.root,'linked'),'dir');
 assert.throws(()=>writePendingMediaReview({root:f.root,report:path.join(f.root,'linked','report.json'),html}),/Symlink/);
 fs.symlinkSync(path.join(f.root,'missing'),report,'file');
 assert.throws(()=>writePendingMediaReview({root:f.root,report,html}),/Symlink/);
 assert.ok(!fs.existsSync(html));
});
test('artifact contact sheet can use an exact-byte built developer media base',t=>{
 const f=fixture(t);f.write('dist/developer/shared/media/fish.jpg','exact fixture image bytes');
 const report=path.join(f.root,'dist','pending-media.json'),html=path.join(f.root,'dist','pending-media.html');
 const result=spawnSync(process.execPath,[script,'--root',f.root,'--report',report,'--html',html,'--asset-base','developer/'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const markup=fs.readFileSync(html,'utf8');assert.match(markup,/src="\.\/developer\/shared\/media\/fish\.jpg"/);
 assert.ok(!markup.includes('../src/'));
 f.write('dist/developer/shared/media/fish.jpg','wrong build image bytes');
 assert.throws(()=>writePendingMediaReview({root:f.root,report,html,assetBase:'developer/'}),/Preview media hash mismatch/);
 for(const assetBase of ['../src','/outside','https://example.test/'])assert.throws(()=>writePendingMediaReview({root:f.root,report,html,assetBase}),/Unsafe review asset base/);
});
test('packet outputs cannot overwrite protected repository configuration, code or verification records',t=>{
 const reserved=['config/platform.json','config/inherited-v1-fidelity.json','scripts/package.json','tests/fixture.json','.github/workflows/release.json','package.json','docs/verification/rights.json'];
 for(const relative of reserved){
  const f=fixture(t);f.write(relative,'protected repository bytes');
  const target=path.join(f.root,relative),before=fs.readFileSync(target);
  assert.throws(()=>writePendingMediaReview({root:f.root,report:target,html:path.join(f.root,'review','contact.html')}),/Unsafe review output/);
  assert.deepEqual(fs.readFileSync(target),before);
 }
});

test('contact sheet and JSON outputs reject hard-linked aliases without altering protected bytes',t=>{
 for(const kind of ['report','html']){
  const f=fixture(t),protectedPath=path.join(f.root,'src/shared/media/catalog.json');
  const before=fs.readFileSync(protectedPath),report=path.join(f.root,'review','packet.json'),html=path.join(f.root,'review','contact.html');
  fs.mkdirSync(path.dirname(report),{recursive:true});
  const alias=kind==='report'?report:html;
  fs.linkSync(protectedPath,alias);
  assert.throws(()=>writePendingMediaReview({root:f.root,report,html}),/singly linked regular file/);
  assert.deepEqual(fs.readFileSync(protectedPath),before);
  assert.deepEqual(fs.readFileSync(alias),before);
  assert.equal(fs.existsSync(kind==='report'?html:report),false,'no partial packet output');
 }
});
