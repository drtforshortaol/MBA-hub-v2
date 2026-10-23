import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {auditRepositoryMedia,auditLocalMediaCoverage,extractMediaReferences,resolveLocalMedia} from '../scripts/audit-local-media-coverage.mjs';

const app={app_id:'fish',media:['photo'],offline_assets:['shared/media/fish.jpg']};
const asset={asset_id:'photo',path:'shared/media/fish.jpg',permission:'owner-approved-v1',permission_evidence:'Recorded V1 owner authorization'};
const audit=(html,changes={})=>auditLocalMediaCoverage({apps:[app],media:{assets:[asset]},files:[{path:'apps/fish/index.html',text:html}],exists:()=>true,...changes});

test('cataloged media requires app registration, offline coverage and recorded permission evidence',()=>{
 assert.equal(audit('<img src="../../shared/media/fish.jpg">').complete,true);
 const r=audit('<img src="../../shared/media/fish.jpg">',{apps:[{...app,media:[],offline_assets:[]}],media:{assets:[{...asset,permission:'review-required',permission_evidence:''}]}});
 assert.deepEqual(r.resources[0].issues,['not-in-app-media','permission-evidence-missing','not-in-app-offline-assets']);
 assert.equal(r.writePerformed,false);
});
test('uncataloged offline image produces registration and permission findings without moving it',()=>{
 const apps=[{...app,offline_assets:['apps/new.jpg']}],r=audit('<img src="../new.jpg"><img src="../new.jpg">',{apps});
 assert.equal(r.summary.uncataloged_resources,1);
 assert.deepEqual(r.resources[0].issues,['not-in-media-catalog','permission-evidence-missing']);
 assert.equal(r.resources[0].path,'apps/new.jpg');
 assert.equal(r.resources[0].references.length,1);
 assert.equal(r.complete,false);
});
test('relative paths, suffixes and percent encoding normalize; escapes fail before existence callbacks',()=>{
 assert.deepEqual(resolveLocalMedia('apps/fish/index.html','../../shared/media/fish.jpg?v=1#details'),{path:'shared/media/fish.jpg'});
 assert.deepEqual(resolveLocalMedia('apps/fish/index.html','../%6eew.jpg'),{path:'apps/new.jpg'});
 let calls=0;
 const r=audit('<img src="../../../../etc/photo.jpg"><img src="..%5cphoto.jpg"><img src="%zz.jpg">',{exists:()=>{calls++;return true;}});
 assert.equal(calls,0);assert.equal(r.errors.length,3);assert.equal(r.complete,false);
});
test('literal scanner ignores comments, prose URLs, external/data resources and interpolated templates',()=>{
 const js='// src: "fake.jpg"\n/* image: "fake2.jpg" */ const a={detail:"Hero image file: fake3.jpg.",src:"../../shared/media/fish.jpg"}; const b={image:`${folder}/dynamic.jpg`};';
 assert.deepEqual(extractMediaReferences('apps/fish/data.js',js),[{url:'../../shared/media/fish.jpg',kind:'script-media-property'}]);
 assert.equal(audit('<img src="https://example.test/image.jpg"><img src="data:image/svg+xml,a"><!-- <img src="fake.jpg"> -->').summary.local_resources,0);
 const refs=extractMediaReferences('apps/fish/index.html','<img alt="example src=\'fake.jpg\'" src="../../shared/media/fish.jpg">');
 assert.equal(refs.length,1);assert.equal(refs[0].url,'../../shared/media/fish.jpg');
});
test('source/srcset, video posters and CSS URLs are audited with shared paths deduplicated',()=>{
 const r=audit('<video poster="../../shared/media/fish.jpg"><source src="clip.mp4"></video><img srcset="../../shared/media/fish.jpg 1x, other.webp 2x"><style>.hero{background:url("../../shared/media/fish.jpg")}</style>');
 assert.equal(r.resources.length,3);
 assert.equal(r.resources.find(x=>x.path==='shared/media/fish.jpg').references.length,3);
 assert.ok(r.resources.some(x=>x.path==='apps/fish/clip.mp4'));
 assert.ok(r.resources.some(x=>x.path==='apps/fish/other.webp'));
});
test('missing files and denied or unknown permission labels remain findings',()=>{
 for(const permission of ['denied','pending','mystery']){
  const r=audit('<img src="../../shared/media/fish.jpg">',{exists:()=>false,media:{assets:[{...asset,permission}]}});
  assert.deepEqual(r.resources[0].issues,['missing-local-file','permission-evidence-missing']);
 }
});
test('platform shell icon exemption is explicit and unsafe catalog/source paths fail closed',()=>{
 const r=audit('<img src="../../icon.svg">');assert.equal(r.resources.length,0);assert.equal(r.platform_exemptions.length,1);
 assert.throws(()=>audit('',{media:{assets:[{...asset,path:'../outside.jpg'}]}}),/Invalid/);
 assert.throws(()=>audit('',{files:[{path:'../outside.html',text:''}]}),/Unsafe/);
 assert.throws(()=>audit('',{media:{assets:[asset,asset]}}),/duplicate/);
});
test('ambiguous ownership cannot silently hide one app declaration',()=>{
 assert.throws(()=>audit('',{apps:[app,app]}),/duplicate app/);
});
test('approved path aliases cannot mask unapproved records selected by the app',()=>{
 const pending={...asset,permission:'review-required',permission_evidence:''};
 const approvedAlias={...asset,asset_id:'approved-alias'};
 for(const media of [{assets:[pending,approvedAlias]},{assets:[approvedAlias,pending]}]){
  const unapproved=audit('<img src="../../shared/media/fish.jpg">',{media});
  assert.deepEqual(unapproved.resources[0].issues,['permission-evidence-missing']);
  assert.equal(unapproved.complete,false);
  const both=audit('<img src="../../shared/media/fish.jpg">',{media,apps:[{...app,media:['photo','approved-alias']}]});
  assert.deepEqual(both.resources[0].issues,['permission-evidence-missing']);
  const approved=audit('<img src="../../shared/media/fish.jpg">',{media,apps:[{...app,media:['approved-alias']}]});
  assert.equal(approved.complete,true);
 }
 const undeclared=audit('<img src="../../shared/media/fish.jpg">',{apps:[{...app,media:[]}]});
 assert.deepEqual(undeclared.resources[0].issues,['not-in-app-media','permission-evidence-missing']);
});

test('malformed app declarations fail even when no source file references media',()=>{
 const sparse=[];sparse.length=1;
 for(const changes of [{media:null},{offline_assets:null},{media:sparse},{offline_assets:sparse},{media:['photo','photo']},{offline_assets:['../outside.jpg']},{offline_assets:['shared/media/fish.jpg','shared/media/fish.jpg']}]){
  assert.throws(()=>audit('',{apps:[{...app,...changes}],files:[]}),/Malformed app declarations/);
 }
});
function repositoryFixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'mba-media-audit-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(name,value)=>{const target=path.join(root,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,value);};
 write('src/apps/fish/manifest.json',JSON.stringify(app));write('src/apps/fish/index.html','<img src="../../shared/media/fish.jpg">');
 write('src/shared/media/catalog.json',JSON.stringify({assets:[asset]}));write('src/shared/media/fish.jpg','image bytes');
 return root;
}
test('repository audit checks regular file existence without changing source bytes',t=>{
 const root=repositoryFixture(t),catalog=fs.readFileSync(path.join(root,'src/shared/media/catalog.json'));
 assert.equal(auditRepositoryMedia(root).complete,true);
 fs.unlinkSync(path.join(root,'src/shared/media/fish.jpg'));
 assert.deepEqual(auditRepositoryMedia(root).resources[0].issues,['missing-local-file']);
 assert.deepEqual(fs.readFileSync(path.join(root,'src/shared/media/catalog.json')),catalog);
});
test('repository audit rejects symlinked media ancestors and catalog before reading them',t=>{
 for(const relative of ['src/shared/media','src/shared/media/catalog.json']){
  const root=repositoryFixture(t),target=path.join(root,relative),saved=path.join(root,'outside');
  fs.renameSync(target,saved);fs.symlinkSync(saved,target,fs.statSync(saved).isDirectory()?'dir':'file');
  assert.throws(()=>auditRepositoryMedia(root),/Symlink prohibited in media audit/);
 }
});
test('repository audit rejects symlinked source roots, app directories and manifests',t=>{
 for(const relative of ['src','src/apps','src/apps/fish','src/apps/fish/manifest.json']){
  const root=repositoryFixture(t),target=path.join(root,relative),saved=path.join(root,'outside');
  fs.renameSync(target,saved);fs.symlinkSync(saved,target,fs.statSync(saved).isDirectory()?'dir':'file');
  assert.throws(()=>auditRepositoryMedia(root),/Symlink prohibited in media audit/);
 }
});
