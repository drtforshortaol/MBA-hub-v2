import test from 'node:test';
import assert from 'node:assert/strict';
import {newReviewDecisions} from '../src/core/naturalist-review-state.js';
import {exportNaturalistReviewQueue} from '../src/core/naturalist-review-queue-export.js';
import {verifyNaturalistReviewQueue} from '../src/core/naturalist-review-queue-import.js';
const entries=[{index:0},{index:1,conflict_with:[0]}];
const decisions=newReviewDecisions(entries);
decisions.forEach(d=>{d.scientific_status='verified';d.editorial_status='approved';d.proposed_action='new-content';});
test('accepts only an exact read-only summary for the current review',()=>{
 const packet=exportNaturalistReviewQueue(decisions,entries,'context');
 assert.deepEqual(verifyNaturalistReviewQueue(packet,decisions,entries,'context'),{valid:true,reason:'verified-read-only',ready:0,blocked:2,can_auto_publish:false});
 assert.equal(verifyNaturalistReviewQueue(packet,decisions,entries,'changed').reason,'context-mismatch');
});
test('rejects tampered summary, injected fields, and publication claims',()=>{
 const packet=exportNaturalistReviewQueue(decisions,entries,'context');
 assert.equal(verifyNaturalistReviewQueue({...packet,summary:{...packet.summary,blocked:0}},decisions,entries,'context').reason,'summary-mismatch');
 assert.equal(verifyNaturalistReviewQueue({...packet,extra:'claim'},decisions,entries,'context').reason,'summary-mismatch');
 assert.equal(verifyNaturalistReviewQueue({...packet,published:true},decisions,entries,'context').reason,'unsafe-state');
 assert.equal(verifyNaturalistReviewQueue({...packet,can_auto_publish:true},decisions,entries,'context').reason,'unsafe-state');
 assert.equal(verifyNaturalistReviewQueue({...packet,ready_items:[{index:0,action:'new-content'}]},decisions,entries,'context').reason,'summary-mismatch');
 assert.equal(verifyNaturalistReviewQueue(null,decisions,entries,'context').reason,'invalid-packet');
});
test('accepts reordered object members without relaxing exact summary verification',()=>{
 const packet=exportNaturalistReviewQueue(decisions,entries,'context');
 const reorder=value=>Array.isArray(value)?value.map(reorder):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([key,item])=>[key,reorder(item)])):value;
 const reordered=JSON.parse(JSON.stringify(reorder(packet)));
 assert.equal(verifyNaturalistReviewQueue(reordered,decisions,entries,'context').valid,true);
 const moved=structuredClone(reordered);moved.blocked_items.reverse();
 assert.equal(verifyNaturalistReviewQueue(moved,decisions,entries,'context').reason,'summary-mismatch');
 const injected=structuredClone(reordered);injected.blocked_items[0].approved=true;
 assert.equal(verifyNaturalistReviewQueue(injected,decisions,entries,'context').reason,'summary-mismatch');
 const missing=structuredClone(reordered);delete missing.summary.review_state;
 assert.equal(verifyNaturalistReviewQueue(missing,decisions,entries,'context').reason,'summary-mismatch');
 const sparse=structuredClone(reordered);sparse.ready_items.length=3;
 assert.equal(verifyNaturalistReviewQueue(sparse,decisions,entries,'context').reason,'summary-mismatch');
});
