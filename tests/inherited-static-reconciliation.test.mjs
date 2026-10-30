import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inheritedApprovalSupported} from '../scripts/public-review.mjs';
import {assessRepositoryReadiness} from '../scripts/assess-release-readiness.mjs';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
test('thirty-one reviewed migrations reconcile existing content without changing source or release/device authority',()=>{
 const evidence=read('config/inherited-v1-fidelity.json'),provenance=read('config/migration-provenance.json');
 const expected=['california-flying-fish','flamboyant-cuttlefish','green-falsejingle', 'bluespotted-ribbontail-ray','california-sheephead','gray-whale','gray-whale-skeleton-exhibit','hopkins-rose-nudibranch','inaturalist-citizen-science','pacific-white-sided-dolphin','pseudo-nitzschia','sea-slugs-nudibranchs','sperm-whale','stargazer-species-guide','whale-associated-organisms','wildfires-ocean-health','wildlife-rescue','gooseneck-barnacle','applied-water-science-life-support','interpretation-principles','mba-leadership','information-center','aquarium-library-explorer','mmc-narrations','five-senses-pwa','kelp-forest','northern-elephant-seal','open-sea','tree-of-life-origins','whale-parasites-associates','evolution-timeline'].sort();
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
 assert.equal(report.blockers.filter(item=>item.reason.startsWith('media permission review:')).length,4);
 assert(report.blockers.some(item=>item.reason==='content review pending: big-bellied-seahorse'));
 assert(!report.blockers.some(item=>item.reason==='content review pending: naturalist-field-notes'));
 assert.equal(report.approvalReconciliation.inheritedCandidates,0);
 assert.deepEqual(report.blockers.filter(item=>item.category==='inherited-approval-reconciliation').map(item=>item.reason).sort(),[]);
 assert.equal(report.blockers.length,10);
 assert.equal(report.releaseEligible,false);
});
