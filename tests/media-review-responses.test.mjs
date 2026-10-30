import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createMediaReviewResponseTemplate,validateMediaReviewResponses} from '../scripts/review-pending-media-responses.mjs';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const script=fileURLToPath(new URL('../scripts/review-pending-media-responses.mjs',import.meta.url));
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'mba-media-response-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(relative,value)=>{const filename=path.join(root,relative);fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,value);};
 const asset={asset_id:'fish-photo',path:'shared/media/fish.jpg',owner:'media-team',alt:'Fish',credit:'Attribution',permission:'review-required',offline:true,sha256:digest('image bytes'),source_repository:'example/source',source_commit:'a'.repeat(40),source_path:'fish.jpg',uses:[{app_id:'fish',source_path:'fish.jpg'}]};
 write('src/apps/fish/index.html','<img src="../../shared/media/fish.jpg">');
 write('src/apps/fish/manifest.json',JSON.stringify({app_id:'fish',title:'Fish',owner:'guides',media:['fish-photo'],offline_assets:[asset.path]}));
 write('src/shared/media/catalog.json',JSON.stringify({assets:[asset]}));write('src/shared/media/fish.jpg','image bytes');
 return {root,write,template:()=>createMediaReviewResponseTemplate(root)};
}
function complete(f){
 const response=f.template(),item=response.responses[0];
 item.scope={audience:'Aquarium guides',distribution_channels:['private-hub'],modification_plan:'No modification requested',attribution_plan:'Display requested credit'};
 item.evidence={rights_holder:'Submitted rights holder claim',permission_basis:'Submitted license claim',licensor_authority:'Submitted authority explanation',grant_scope:'Private guide use only',attribution_requirements:'Requested credit line',restrictions:'No public redistribution',submitted_by:'Example submitter',files:[{path:'evidence/license.txt',sha256:digest('license document')}]};
 f.write('evidence/license.txt','license document');return response;
}
test('live three-image template is deterministic with stable exact identity and blank evidence/scope',()=>{
 const root=path.resolve(path.dirname(script),'..'),first=createMediaReviewResponseTemplate(root);
 assert.deepEqual(createMediaReviewResponseTemplate(root),first);assert.equal(first.responses.length,1);
 assert.equal(new Set(first.responses.map(x=>x.response_id)).size,1);
 assert.equal(first.purpose,'evidence-submission-only');
 for(const row of first.responses){assert.equal(row.response_id,row.identity.app_id+':'+row.identity.asset_id);assert.match(row.identity.sha256,/^[a-f0-9]{64}$/);assert.deepEqual(row.evidence.files,[]);assert.deepEqual(row.scope.distribution_channels,[]);}
 const report=validateMediaReviewResponses(root,first);
 assert.equal(report.ready_for_human_review,false);assert.equal(report.pending_items,1);assert.equal(report.permission_granted,false);assert.equal(report.publication_authorized,false);
 assert.ok(report.items.every(row=>row.missing_fields.includes('evidence.files')));
});
test('empty and partial evidence packages stay pending with actionable per-image missing fields',t=>{
 const f=fixture(t),template=f.template();
 let report=validateMediaReviewResponses(f.root,template);
 assert.equal(report.ready_for_human_review,false);assert.ok(report.items[0].missing_fields.includes('scope.distribution_channels'));
 template.responses[0].evidence.rights_holder='Claim only';report=validateMediaReviewResponses(f.root,template);
 assert.ok(!report.items[0].missing_fields.includes('evidence.rights_holder'));assert.ok(report.items[0].missing_fields.includes('evidence.permission_basis'));
 template.responses=[];report=validateMediaReviewResponses(f.root,template);assert.deepEqual(report.items[0].missing_fields,['response']);
});
test('complete exact evidence bytes only mark a package ready for human review, never permission granted',t=>{
 const f=fixture(t),response=complete(f),before=fs.readFileSync(path.join(f.root,'src/shared/media/catalog.json'));
 const report=validateMediaReviewResponses(f.root,response,{evidenceRoot:f.root});
 assert.equal(report.ready_for_human_review,true);assert.equal(report.pending_items,0);
 assert.equal(report.permission_granted,false);assert.equal(report.publication_authorized,false);assert.equal(report.sourceWritePerformed,false);
 assert.equal(report.items[0].status,'ready_for_human_review');assert.equal(report.items[0].permission_granted,false);
 assert.equal(report.items[0].verified_evidence_files[0].sha256,digest('license document'));
 assert.deepEqual(report.items[0].submitted_scope,response.responses[0].scope);
 assert.deepEqual(fs.readFileSync(path.join(f.root,'src/shared/media/catalog.json')),before);
});
test('stale packet hashes, image hashes and provenance cannot validate against current identity',t=>{
 const f=fixture(t);
 for(const mutate of [r=>r.packet_sha256='0'.repeat(64),r=>r.responses[0].identity.sha256='0'.repeat(64),r=>r.responses[0].identity.source.commit='b'.repeat(40),r=>r.responses[0].identity.app_id='other']){
  const r=f.template();mutate(r);assert.throws(()=>validateMediaReviewResponses(f.root,r),/Stale/);
 }
});
test('duplicate, unknown, sparse and malformed response records fail closed',t=>{
 const f=fixture(t);
 for(const mutate of [r=>r.responses.push(r.responses[0]),r=>r.responses[0].response_id='unknown',r=>r.responses=new Array(1),r=>r.responses[0]=null,r=>r.responses[0].scope.audience=null,r=>r.responses[0].identity.source.uses=new Array(1),r=>r.permission_granted=true]){
  const r=f.template();mutate(r);assert.throws(()=>validateMediaReviewResponses(f.root,r),/Duplicate|Unknown|Malformed/);
 }
});
test('scope must explicitly identify supported nonduplicate distribution channels',t=>{
 const f=fixture(t);
 for(const uses of [['unbounded-anywhere'],['private-hub','private-hub'],new Array(1),'private-hub']){
  const r=f.template();r.responses[0].scope.distribution_channels=uses;
  assert.throws(()=>validateMediaReviewResponses(f.root,r),/Malformed distribution scope/);
 }
});
test('evidence traversal, remote paths, duplicate files and mismatched or empty files are rejected',t=>{
 const f=fixture(t);
 for(const badPath of ['../outside.txt','/outside.txt','https://example.test/license','evidence/../license.txt']){
  const r=complete(f);r.responses[0].evidence.files[0].path=badPath;
  assert.throws(()=>validateMediaReviewResponses(f.root,r,{evidenceRoot:f.root}),/Unsafe evidence path/);
 }
 const mismatch=complete(f);mismatch.responses[0].evidence.files[0].sha256='0'.repeat(64);
 assert.throws(()=>validateMediaReviewResponses(f.root,mismatch,{evidenceRoot:f.root}),/Evidence hash mismatch/);
 const duplicate=complete(f);duplicate.responses[0].evidence.files.push(duplicate.responses[0].evidence.files[0]);
 assert.throws(()=>validateMediaReviewResponses(f.root,duplicate,{evidenceRoot:f.root}),/Duplicate evidence/);
 const empty=complete(f);f.write('evidence/license.txt','');empty.responses[0].evidence.files[0].sha256=digest('');
 assert.throws(()=>validateMediaReviewResponses(f.root,empty,{evidenceRoot:f.root}),/Empty evidence/);
});
test('evidence file/ancestor/root symlinks cannot escape the declared evidence root',t=>{
 for(const location of ['file','ancestor','root']){
  const f=fixture(t),r=complete(f);let evidenceRoot=f.root;
  if(location==='file'){fs.renameSync(path.join(f.root,'evidence/license.txt'),path.join(f.root,'saved.txt'));fs.symlinkSync(path.join(f.root,'saved.txt'),path.join(f.root,'evidence/license.txt'));}
  if(location==='ancestor'){fs.renameSync(path.join(f.root,'evidence'),path.join(f.root,'saved'));fs.symlinkSync(path.join(f.root,'saved'),path.join(f.root,'evidence'),'dir');}
  if(location==='root'){fs.symlinkSync(f.root,path.join(f.root,'linked'),'dir');evidenceRoot=path.join(f.root,'linked');}
  assert.throws(()=>validateMediaReviewResponses(f.root,r,{evidenceRoot}),/Symlink/);
 }
});
test('JSON CLI creates a blank template and validates partial responses without altering source or evidence',t=>{
 const f=fixture(t),template=path.join(f.root,'review/template.json'),report=path.join(f.root,'review/report.json');
 let run=spawnSync(process.execPath,[script,'--root',f.root,'--template',template],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);const bytes=fs.readFileSync(template);
 run=spawnSync(process.execPath,[script,'--root',f.root,'--responses',template,'--report',report],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);assert.equal(JSON.parse(run.stdout).ready_for_human_review,false);
 assert.equal(JSON.parse(fs.readFileSync(report)).permission_granted,false);assert.deepEqual(fs.readFileSync(template),bytes);
 const unsafe=spawnSync(process.execPath,[script,'--root',f.root,'--template',path.join(f.root,'src/template.json')],{encoding:'utf8'});
 assert.equal(unsafe.status,1);assert.match(unsafe.stderr,/Unsafe review output/);
});
test('response validation never treats HTML-looking submitted text as executable output',t=>{
 const f=fixture(t),r=complete(f);r.responses[0].evidence.rights_holder='<script>alert(1)</script>';
 const report=validateMediaReviewResponses(f.root,r,{evidenceRoot:f.root});
 assert.equal(report.ready_for_human_review,true);assert.equal(report.permission_granted,false);
 assert.equal(report.items[0].submitted_evidence.rights_holder,'<script>alert(1)</script>');
 assert.equal(typeof JSON.parse(JSON.stringify(report)).items[0].submitted_evidence.rights_holder,'string');
});
test('CLI output cannot overwrite a supplied exact evidence file',t=>{
 const f=fixture(t),response=complete(f);f.write('evidence/license.json','license document');
 response.responses[0].evidence.files[0].path='evidence/license.json';
 f.write('responses.json',JSON.stringify(response));
 const evidence=path.join(f.root,'evidence/license.json');
 const run=spawnSync(process.execPath,[script,'--root',f.root,'--responses',path.join(f.root,'responses.json'),'--evidence-root',f.root,'--report',evidence],{encoding:'utf8'});
 assert.equal(run.status,1);assert.match(run.stderr,/cannot overwrite evidence/);assert.equal(fs.readFileSync(evidence,'utf8'),'license document');
});
test('response template CLI cannot overwrite protected configuration, code or existing evidence records',t=>{
 for(const relative of ['config/platform.json','config/inherited-v1-fidelity.json','scripts/package.json','tests/fixture.json','.github/workflows/release.json','package.json','docs/verification/rights.json']){
  const f=fixture(t);f.write(relative,'protected configuration bytes');const target=path.join(f.root,relative),before=fs.readFileSync(target);
  const run=spawnSync(process.execPath,[script,'--root',f.root,'--template',target],{encoding:'utf8'});
  assert.equal(run.status,1,relative);assert.match(run.stderr,/Unsafe review output/);
  assert.deepEqual(fs.readFileSync(target),before);
  f.write('review/responses.json',JSON.stringify(f.template()));
  const report=spawnSync(process.execPath,[script,'--root',f.root,'--responses',path.join(f.root,'review/responses.json'),'--report',target],{encoding:'utf8'});
  assert.equal(report.status,1,relative);assert.match(report.stderr,/Unsafe review output/);
  assert.deepEqual(fs.readFileSync(target),before);
 }
});
