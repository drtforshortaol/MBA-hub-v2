import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {releaseErrors} from '../scripts/build.mjs';
import {assessReleaseReadiness} from '../scripts/assess-release-readiness.mjs';
import {inheritedContentDigest,inheritedApprovalSupported,preparePublicReview} from '../scripts/public-review.mjs';

function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'mba-inheritance-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const sourceRoot=path.join(root,'src'),out=path.join(root,'out');
 for(const dir of ['apps/guide','shared/media'])fs.mkdirSync(path.join(sourceRoot,dir),{recursive:true});fs.mkdirSync(out);
 const app={app_id:'guide',source_repository:'owner/source',source_commit:'a'.repeat(40),publication_review:'pending',offline_assets:['apps/guide/index.html']};
 fs.writeFileSync(path.join(sourceRoot,'apps/guide/index.html'),'<p>Approved original</p>');
 fs.writeFileSync(path.join(sourceRoot,'apps/guide/manifest.json'),JSON.stringify(app));
 fs.writeFileSync(path.join(sourceRoot,'shared/knowledge.json'),'{}');
 fs.writeFileSync(path.join(sourceRoot,'shared/media/catalog.json'),'{}');
 const provenance={apps:[{app_id:app.app_id,source_repository:app.source_repository,source_commit:app.source_commit}]};
 const record={...provenance.apps[0],status:'reviewed-unchanged-v1',authorization_reference:'docs/GUIDE_CONTENT_RESTORED.md',review_reference:'reviewed-difference-record',content_sha256:inheritedContentDigest(app,{sourceRoot})};
 return {root,out,sourceRoot,app,provenance,evidence:{schema_version:1,apps:[record]}};
}

test('source repository alone cannot grant inherited approval or mutate source',t=>{
 const f=fixture(t),before=structuredClone(f.app);
 const result=preparePublicReview(f.out,[f.app],{...f,evidence:null});
 assert.equal(result[0].publication_review,'pending');assert.deepEqual(f.app,before);
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.out,'public-review.json'))).inheritedApproval.verifiedApps,[]);
});
test('unique reviewed unchanged evidence preserves scoped inherited authorization',t=>{
 const f=fixture(t);assert.equal(inheritedApprovalSupported(f.app,f),true);
 assert.equal(preparePublicReview(f.out,[f.app],f)[0].publication_review,'inherited-v1-approved');
 assert.equal(f.app.publication_review,'pending');
});
test('new app files, scientific text and shared data changes invalidate prior fidelity evidence',t=>{
 for(const change of ['new-file','scientific-text','shared-knowledge','shared-media','manifest']){
  const f=fixture(t);
  const target=change==='new-file'?'apps/guide/october-note.js':change==='scientific-text'?'apps/guide/index.html':change==='shared-knowledge'?'shared/knowledge.json':change==='shared-media'?'shared/media/catalog.json':'apps/guide/manifest.json';
  fs.writeFileSync(path.join(f.sourceRoot,target),'New material requiring separate review');
  assert.equal(inheritedApprovalSupported(f.app,f),false,change);
 }
});
test('duplicate, absent, mismatched or unreviewed evidence cannot inherit',t=>{
 const cases=[f=>f.evidence.apps.push({...f.evidence.apps[0]}),f=>f.provenance.apps.push({...f.provenance.apps[0]}),f=>f.provenance.apps=[],f=>f.evidence.apps=[],f=>f.evidence.apps[0].source_commit='b'.repeat(40),f=>f.provenance.apps[0].source_repository='another/repo',f=>f.evidence.apps[0].status='static-text-equal',f=>f.evidence.apps[0].review_reference='',f=>f.evidence.apps[0].authorization_reference='unrelated',f=>f.evidence.schema_version=2];
 for(const mutate of cases){const f=fixture(t);mutate(f);assert.equal(inheritedApprovalSupported(f.app,f),false);}
});
test('stale inherited source label is not accepted after material changes',t=>{
 const f=fixture(t);f.app.publication_review='inherited-v1-approved';
 assert.equal(preparePublicReview(f.out,[f.app],f)[0].publication_review,'pending');
 assert.equal(f.app.publication_review,'inherited-v1-approved');
});
test('unsafe resource paths and missing content fail closed',t=>{
 for(const resource of ['../outside','/absolute','apps/guide/missing.js','apps\\guide\\index.html']){
  const f=fixture(t);f.app.offline_assets=[resource];assert.equal(inheritedApprovalSupported(f.app,f),false);
 }
});

test('referenced central media bytes remain bound even when not marked offline',t=>{
 const f=fixture(t);f.app.media=['central-image'];
 fs.writeFileSync(path.join(f.sourceRoot,'shared/media/image.svg'),'<svg>original</svg>');
 fs.writeFileSync(path.join(f.sourceRoot,'shared/media/catalog.json'),JSON.stringify({assets:[{asset_id:'central-image',path:'shared/media/image.svg',offline:false}]}));
 f.evidence.apps[0].content_sha256=inheritedContentDigest(f.app,f);
 assert.equal(inheritedApprovalSupported(f.app,f),true);
 fs.writeFileSync(path.join(f.sourceRoot,'shared/media/image.svg'),'<svg>new</svg>');
 assert.equal(inheritedApprovalSupported(f.app,f),false);
});

test('publication and readiness gates use the same byte-bound inheritance decision',t=>{
 const f=fixture(t),platform={migrationComplete:true,ownerApproved:true,pilotPassed:true,deviceOfflinePassed:true,rollbackDevicePassed:true,privacyReviewed:true};
 const input={platform,apps:[f.app],media:{assets:[]},inventory:{apps:[{id:f.app.app_id}]},qaEvidence:{evidence:{}},migrationProvenance:f.provenance,inheritanceEvidence:f.evidence,sourceRoot:f.sourceRoot};
 assert.deepEqual(releaseErrors(platform,[f.app],input.media,input.inventory,f),[]);
 assert.equal(assessReleaseReadiness(input).releaseEligible,true);
 assert.equal(f.app.publication_review,'pending','scoped evidence does not flip source flags');
 assert(releaseErrors(platform,[f.app],input.media,input.inventory).includes('content review pending: guide'));
 fs.writeFileSync(path.join(f.sourceRoot,'apps/guide/october-note.js'),'new material');
 assert(releaseErrors(platform,[f.app],input.media,input.inventory,f).includes('content review pending: guide'));
 assert.equal(assessReleaseReadiness(input).releaseEligible,false);
 f.app.publication_review='inherited-v1-approved';
 assert(releaseErrors(platform,[f.app],input.media,input.inventory,f).includes('content review pending: guide'));
});
