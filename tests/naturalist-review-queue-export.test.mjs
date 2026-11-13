import test from 'node:test';
import assert from 'node:assert/strict';
import {newReviewDecisions} from '../src/core/naturalist-review-state.js';
import {exportNaturalistReviewQueue} from '../src/core/naturalist-review-queue-export.js';
test('exports a portable read-only review queue with blocked reasons',()=>{
 const entries=[{index:0},{index:1,conflict_with:[2]},{index:2}];
 const decisions=newReviewDecisions(entries);
 decisions.forEach(d=>{d.scientific_status='verified';d.editorial_status='approved';d.proposed_action='new-content';});
 const packet=exportNaturalistReviewQueue(decisions,entries,'fingerprint');
 assert.equal(packet.summary.ready,1);
 assert.equal(packet.summary.blocked,2);
 assert.deepEqual(packet.blocked_items.map(x=>x.block_reasons),[['scientific-conflict'],['scientific-conflict']]);
 assert.equal(packet.can_auto_publish,false);
 assert.equal(packet.published,false);
 assert.equal(packet.prepared,false);
 assert.equal(packet.committed,false);
 assert.equal(Object.hasOwn(packet.ready_items[0],'entry'),false);
 assert.doesNotThrow(()=>JSON.stringify(packet));
});
test('rejects invalid review decisions and missing fingerprint',()=>{
 const entries=[{index:0}],decisions=newReviewDecisions(entries);
 assert.throws(()=>exportNaturalistReviewQueue(decisions,entries,' '),TypeError);
 assert.throws(()=>exportNaturalistReviewQueue([{...decisions[0],published:true}],entries,'hash'),TypeError);
});
