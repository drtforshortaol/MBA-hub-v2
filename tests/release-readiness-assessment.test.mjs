import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {assessRepositoryReadiness,assessReleaseReadiness} from '../scripts/assess-release-readiness.mjs';

test('read-only release assessment exposes actual outstanding gates without replacing recorded device evidence',()=>{
 const files=['config/platform.json','config/qa-evidence.json','docs/BUILD_REPORT.json'];
 const before=files.map(file=>fs.readFileSync(file,'utf8'));
 const report=assessRepositoryReadiness();
 assert.equal(report.releaseEligible,false);
 for(const gate of ['ownerApproved','pilotPassed','deviceOfflinePassed','rollbackDevicePassed','privacyReviewed']){
  const blocker=report.blockers.find(item=>item.reason===`release gate: ${gate}`);
  assert(blocker,gate);assert.equal(blocker.source,'config/platform.json');assert(blocker.action.length>20);
 }
 assert(!report.blockers.some(item=>item.reason==='release gate: migrationComplete'));
 assert(report.recordedQA.pending.some(item=>item.id==='pilot_other_guides'));
 assert(report.recordedQA.pending.some(item=>item.id==='android_install'));
 assert.equal(report.technicalEvidence.status,'not-provided');
 assert.equal(report.approvalReconciliation.inheritedCandidates,1);
 assert.equal(report.approvalReconciliation.contentReviewsRequired,1);
 assert.equal(report.blockers.length,17);
 assert.equal(report.blockers.filter(item=>item.reason.startsWith('media permission review: ')).length,10);
 assert.equal(report.blockers.find(item=>item.reason==='content review pending: big-bellied-seahorse').category,'content-review-required');
 assert.deepEqual(files.map(file=>fs.readFileSync(file,'utf8')),before);
});

test('approval reconciliation requires unique exact provenance and never resolves release blockers',()=>{
 const app={app_id:'guide',status:'development',publication_review:'pending',source_repository:'owner/source',source_commit:'a'.repeat(40)};
 const input={platform:{version:'review'},apps:[app],media:{assets:[]},inventory:{apps:[]},qaEvidence:{evidence:{}},migrationProvenance:{apps:[{...app}]}};
 const baseline=JSON.stringify(input),report=assessReleaseReadiness(input);
 assert.equal(report.approvalReconciliation.inheritedCandidates,1);
 assert.equal(report.releaseEligible,false);
 assert.equal(JSON.stringify(input),baseline);
 const reasons=report.blockers.map(item=>item.reason);
 for(const provenance of [null,{apps:[]},{apps:[{...app,source_commit:'b'.repeat(40)}]},{apps:[{...app,source_repository:'other/repo'}]},{apps:[{...app},{...app}]}]){
  const changed=assessReleaseReadiness({...input,migrationProvenance:provenance});
  assert.equal(changed.approvalReconciliation.inheritedCandidates,0);
  assert.equal(changed.approvalReconciliation.contentReviewsRequired,1);
  assert.deepEqual(changed.blockers.map(item=>item.reason),reasons);
  assert.equal(changed.releaseEligible,false);
 }
});

test('readiness CLI returns actionable current blockers and fails when requested verification evidence is missing',t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'mba-readiness-'));t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
 const normal=spawnSync(process.execPath,['scripts/assess-release-readiness.mjs'],{encoding:'utf8'});
 assert.equal(normal.status,0,normal.stderr);const baseline=JSON.parse(normal.stdout);
 const missing=spawnSync(process.execPath,['scripts/assess-release-readiness.mjs','--evidence-dir',directory,'--expected-commit','a'.repeat(40)],{encoding:'utf8'});
 assert.equal(missing.status,1);const report=JSON.parse(missing.stdout);
 assert.equal(report.technicalEvidence.status,'failed');assert(report.technicalEvidence.errors.length);
 assert.deepEqual(report.blockers,baseline.blockers);assert.equal(report.releaseEligible,false);
 assert.throws(()=>assessRepositoryReadiness({expectedCommit:'a'.repeat(40)}),/both/);
});
