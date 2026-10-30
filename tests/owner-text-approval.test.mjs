import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {inheritedContentDigest,ownerTextApprovalSupported,preparePublicReview} from '../scripts/public-review.mjs';
import {releaseErrors} from '../scripts/build.mjs';

function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'owner-text-review-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const dir of ['apps/guide','shared/media'])fs.mkdirSync(path.join(root,dir),{recursive:true});
 const app={app_id:'guide',status:'testing',publication_review:'owner-approved-text',entry_point:'apps/guide/index.html',offline_assets:['apps/guide/index.html'],media:[],sections:[{id:'fact',text:'Reviewed text'}]};
 fs.writeFileSync(path.join(root,'apps/guide/index.html'),'<p>Reviewed text</p>');
 fs.writeFileSync(path.join(root,'apps/guide/manifest.json'),JSON.stringify(app));
 fs.writeFileSync(path.join(root,'shared/media/catalog.json'),JSON.stringify({assets:[]}));
 fs.writeFileSync(path.join(root,'shared/knowledge.json'),'{}');
 const record={app_id:'guide',status:'owner-approved-text',scope:'authored-text-only',reviewer:'owner',reviewed_on:'2026-10-29',review_reference:'docs/decision.md',authorization_reference:'Explicit owner conversation',authorization_quote:'Proceed',content_sha256:inheritedContentDigest(app,{sourceRoot:root})};
 return {root,app,record,context:{sourceRoot:root,ownerTextEvidence:{schema_version:1,apps:[record]}}};
}

test('explicit reviewed text clears only its content gate, preserving media and operational blockers',t=>{
 const f=fixture(t);assert.equal(ownerTextApprovalSupported(f.app,f.context),true);
 const platform={migrationComplete:true,ownerApproved:false,pilotPassed:false,deviceOfflinePassed:false,rollbackDevicePassed:false,privacyReviewed:false};
 const media={assets:[{asset_id:'pending-photo',permission:'review-required'}]};
 const reasons=releaseErrors(platform,[f.app],media,{apps:[]},f.context);
 assert.equal(reasons.length,6);assert(reasons.includes('release gate: ownerApproved'));
 assert(reasons.includes('media permission review: pending-photo'));
 assert(!reasons.includes('content review pending: guide'));
 const without=releaseErrors(platform,[f.app],media,{apps:[]},{...f.context,ownerTextEvidence:null});
 assert(without.includes('content review pending: guide'));
});

test('absent, malformed, duplicate or improperly scoped owner records cannot grant text approval',t=>{
 const f=fixture(t);
 for(const apps of [[],[null],[f.record,f.record],Array(1),[ {...f.record,scope:'all-media-and-release'} ],[ {...f.record,authorization_quote:''} ],[ {...f.record,review_reference:''} ]]){
  assert.equal(ownerTextApprovalSupported(f.app,{...f.context,ownerTextEvidence:{schema_version:1,apps}}),false);
 }
 assert.equal(ownerTextApprovalSupported({...f.app,publication_review:'pending'},f.context),false);
});

test('changed displayed bytes or caller manifest invalidate the owner decision and reopen content review',t=>{
 const f=fixture(t),changed=structuredClone(f.app);changed.sections[0].text='Unreviewed claim';
 assert.equal(ownerTextApprovalSupported(changed,f.context),false);
 fs.writeFileSync(path.join(f.root,'apps/guide/index.html'),'<p>Unreviewed claim</p>');
 assert.equal(ownerTextApprovalSupported(f.app,f.context),false);
 assert(releaseErrors({},[f.app],{assets:[]},{apps:[]},f.context).includes('content review pending: guide'));
});

test('owner approval cannot follow a symlinked reviewed HTML resource',t=>{
 const f=fixture(t),file=path.join(f.root,'apps/guide/index.html');
 fs.renameSync(file,path.join(f.root,'same-bytes'));fs.symlinkSync(path.join(f.root,'same-bytes'),file);
 assert.equal(ownerTextApprovalSupported(f.app,f.context),false);
});


test('reviewer metadata preserves only verified owner-text markers and leaves source manifests unchanged',t=>{
 const f=fixture(t),out=path.join(f.root,'out');fs.mkdirSync(out);
 const verified=preparePublicReview(out,[f.app],{...f.context,provenance:null,evidence:null});
 assert.equal(verified[0].publication_review,'owner-approved-text');
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'public-review.json'))).ownerTextApproval.verifiedApps,['guide']);
 const stale=preparePublicReview(out,[f.app],{...f.context,ownerTextEvidence:null,provenance:null,evidence:null});
 assert.equal(stale[0].publication_review,'pending');
 assert.equal(f.app.publication_review,'owner-approved-text','source remains unchanged');
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'public-review.json'))).ownerTextApproval.pendingApps,['guide']);
});
