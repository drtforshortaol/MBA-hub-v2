import test from 'node:test';
import assert from 'node:assert/strict';
import {newReviewDecisions,validateReviewDecisions,reviewProgress,reviewStorageKey,readReview,writeReview} from '../src/core/naturalist-review-state.js';
const entries=[{index:0},{index:1}];
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};}
test('new reviews default to pending and never grant publication',()=>{
 const decisions=newReviewDecisions(entries);
 assert.equal(validateReviewDecisions(decisions,entries),true);
 assert.deepEqual(reviewProgress(decisions),{completed:0,total:2,revisions:0,can_auto_publish:false});
 decisions[0].scientific_status='verified';decisions[0].editorial_status='approved';
 decisions[1].scientific_status='needs-revision';
 assert.deepEqual(reviewProgress(decisions),{completed:1,total:2,revisions:1,can_auto_publish:false});
});
test('save and restore annotations with exact classification fingerprint',()=>{
 const store=storage(),key=reviewStorageKey('developer','abc');
 const decisions=newReviewDecisions(entries);decisions[0].reviewer_notes='Check source.';
 assert.equal(writeReview(store,key,'abc',decisions,entries),true);
 assert.deepEqual(readReview(store,key,'abc',entries),decisions);
 assert.equal(readReview(store,key,'different',entries),null);
 assert.equal(readReview(store,key,'abc',[entries[0]]),null);
 assert.equal(readReview(store,'missing','abc',entries),null);
});
test('reject malformed, reordered, oversized and unrecognized decisions',()=>{
 const decisions=newReviewDecisions(entries),store=storage(),key='review';
 for(const bad of [[decisions[1],decisions[0]],[{...decisions[0],reviewer_notes:'x'.repeat(4001)},decisions[1]],[{...decisions[0],scientific_status:'approved'},decisions[1]],[{...decisions[0],published:true},decisions[1]]]){
  assert.equal(validateReviewDecisions(bad,entries),false);
  assert.equal(writeReview(store,key,'hash',bad,entries),false);
 }
 store.setItem(key,'{invalid');assert.equal(readReview(store,key,'hash',entries),null);
 store.setItem(key,JSON.stringify({schema_version:1,review_context_sha256:'hash',review_decisions:[{...decisions[0],published:true},decisions[1]]}));
 assert.equal(readReview(store,key,'hash',entries),null);
});
test('storage errors do not corrupt reviews',()=>{
 const broken={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 assert.equal(readReview(broken,'key','hash',entries),null);
 assert.equal(writeReview(broken,'key','hash',newReviewDecisions(entries),entries),false);
});
