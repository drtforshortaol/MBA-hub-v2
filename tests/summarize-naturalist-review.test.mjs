import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeNaturalistReview} from '../scripts/summarize-naturalist-review.mjs';
import {previewNaturalistPacket} from '../scripts/preview-automatic-update.mjs';
test('counts review flags once per statement and tracks duplicate references',()=>{
 const entries=[
  {review:{flags:['placement-unresolved','placement-unresolved']},placement:{proposal_type:'new-application-or-placement-candidate'},duplicate_of:null},
  {review:{flags:['duplicate-in-submission','placement-unresolved']},placement:{proposal_type:'new-application-or-placement-candidate'},duplicate_of:0}
 ];
 const summary=summarizeNaturalistReview(entries);
 assert.equal(summary.statement_count,2);
 assert.equal(summary.duplicate_statement_count,1);
 assert.equal(summary.review_flag_counts['placement-unresolved'],2);
 assert.equal(summary.can_auto_publish,false);
});
test('empty batch is valid but still not approved',()=>{
 const summary=summarizeNaturalistReview([]);
 assert.equal(summary.statement_count,0);
 assert.equal(summary.approval_state,'pending');
});
test('malformed entries fail safely',()=>{
 assert.equal(summarizeNaturalistReview(null).valid,false);
 assert.equal(summarizeNaturalistReview([{}]).valid,false);
});
test('preview packet contains read-only review summary',()=>{
 const packet=previewNaturalistPacket('Sea otters use tools.\n\nSea otters use tools!');
 assert.equal(packet.review_summary.statement_count,2);
 assert.equal(packet.review_summary.duplicate_statement_count,1);
 assert.equal(packet.review_summary.can_auto_publish,false);
 assert.equal(packet.published,false);
});

test('summary counts both sides of a possible scientific conflict without approving claims',()=>{
 const packet=previewNaturalistPacket('Sea otters use tools to open shellfish. Sea otters do not use tools to open shellfish.');
 assert.equal(packet.valid,true);
 assert.equal(packet.conflict_signals.length,1);
 assert.equal(packet.review_summary.conflicted_statement_count,2);
 assert.equal(packet.review_summary.can_auto_publish,false);
 assert.equal(packet.published,false);
});
