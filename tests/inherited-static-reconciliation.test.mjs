import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inheritedApprovalSupported} from '../scripts/public-review.mjs';
import {assessRepositoryReadiness} from '../scripts/assess-release-readiness.mjs';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
test('three reviewed static migrations reconcile existing content without changing source or release/device authority',()=>{
 const evidence=read('config/inherited-v1-fidelity.json'),provenance=read('config/migration-provenance.json');
 const expected=['california-flying-fish','flamboyant-cuttlefish','green-falsejingle'];
 assert.deepEqual(evidence.apps.map(app=>app.app_id).sort(),expected);
 for(const app_id of expected){
  const app=read(`src/apps/${app_id}/manifest.json`);
  assert.equal(app.publication_review,'pending');assert.equal(app.status,'testing');
  assert.equal(inheritedApprovalSupported(app,{evidence,provenance}),true);
  const changed=structuredClone(app);changed.sections[0].text+=' New unreviewed claim.';
  assert.equal(inheritedApprovalSupported(changed,{evidence,provenance}),false);
 }
 const report=assessRepositoryReadiness();
 for(const app_id of expected)assert(!report.blockers.some(item=>item.reason===`content review pending: ${app_id}`));
 assert.equal(report.blockers.filter(item=>item.category==='operational-gate').length,5);
 assert.equal(report.blockers.filter(item=>item.reason.startsWith('media permission review:')).length,9);
 assert(report.blockers.some(item=>item.reason==='content review pending: big-bellied-seahorse'));
 assert(report.blockers.some(item=>item.reason==='content review pending: naturalist-field-notes'));
 assert.equal(report.releaseEligible,false);
});
