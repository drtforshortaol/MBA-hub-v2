import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {ownerTextApprovalSupported} from '../scripts/public-review.mjs';
import {assessRepositoryReadiness} from '../scripts/assess-release-readiness.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');

test('Naturalist uses the exact approved candidate bytes and explicit owner decision',()=>{
 const packetPath='docs/verification/naturalist-final-text-candidate-20261029.json';
 const packet=read(packetPath),app=read('src/apps/naturalist-field-notes/manifest.json');
 for(const [file,candidate] of Object.entries(packet.candidate_files)){
  assert.equal(fs.readFileSync(file,'utf8'),candidate.content,'exact approved file '+file);
  assert.equal(hash(fs.readFileSync(file)),candidate.sha256);
 }
 const records=read('config/owner-text-reviews.json').apps.filter(r=>r.app_id===app.app_id);
 assert.equal(records.length,1);const record=records[0];
 assert.equal(record.candidate_commit,'74b91bb5af8f0215d4863bcdf9a2c39e76aa3c58');
 assert.equal(record.candidate_packet_sha256,hash(fs.readFileSync(packetPath)));
 assert.equal(record.authorization_quote,'Approved');assert.equal(record.scope,'authored-text-only');
 assert.equal(app.version,packet.planned_app_version);assert.equal(app.status,'testing');
 assert.equal(app.publication_review,'owner-approved-text');assert.equal(ownerTextApprovalSupported(app),true);
 const changed=structuredClone(app);changed.sections.at(-1).text+=' Unapproved claim.';
 assert.equal(ownerTextApprovalSupported(changed),false);
 const incomplete={...record,authorization_quote:''};
 assert.equal(ownerTextApprovalSupported(app,{ownerTextEvidence:{schema_version:1,apps:[incomplete]}}),false);
});

test('Naturalist approval clears only that content blocker and preserves all remaining gates',()=>{
 const report=assessRepositoryReadiness();
 assert(!report.blockers.some(b=>b.reason==='content review pending: naturalist-field-notes'));
 assert(report.blockers.some(b=>b.reason==='content review pending: big-bellied-seahorse'));
 assert.equal(report.blockers.filter(b=>b.category==='operational-gate').length,5);
 assert.equal(report.blockers.filter(b=>b.category==='media-review-required').length,6);
 assert.equal(report.blockers.length,12);assert.equal(report.releaseEligible,false);
 const catalog=read('src/shared/media/catalog.json');
 for(const id of ['asset-1bd100105f88c83a','asset-95daa2493750e82f','asset-47f9bbb193878eec','asset-df392914e6cf5502'])assert.equal(catalog.assets.find(a=>a.asset_id===id).permission,'approved');
 assert.equal(catalog.assets.find(a=>a.asset_id==='asset-50646c3fe1d0c359').permission,'review-required');
});
