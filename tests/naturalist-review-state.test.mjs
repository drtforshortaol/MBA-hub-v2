import test from 'node:test';
import assert from 'node:assert/strict';
import {newReviewDecisions,validateReviewDecisions,reviewProgress,reviewStorageKey,readReview,writeReview,importReviewPacket,reviewRecoveryCheck} from '../src/core/naturalist-review-state.js';
const entries=[{index:0},{index:1}];
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};}
test('new reviews default to pending and never grant publication',()=>{
 const decisions=newReviewDecisions(entries);
 assert.equal(validateReviewDecisions(decisions,entries),true);
 assert.deepEqual(reviewProgress(decisions),{completed:0,total:2,revisions:0,can_auto_publish:false});
 decisions[0].scientific_status='verified';decisions[0].editorial_status='approved';decisions[0].proposed_action='update-existing';
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

test('portable review recovery requires matching classification and validated decisions',()=>{
 const decisions=newReviewDecisions(entries);
 decisions[0].reviewer_notes='Checked against original source';
 const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',review_context_sha256:'matching',review_decisions:decisions};
 assert.deepEqual(importReviewPacket(packet,'matching',entries),decisions);
 const restored=importReviewPacket(packet,'matching',entries);
 restored[0].reviewer_notes='changed';
 assert.equal(decisions[0].reviewer_notes,'Checked against original source');
 assert.equal(importReviewPacket(packet,'different',entries),null);
 assert.equal(importReviewPacket({...packet,kind:'unknown'},'matching',entries),null);
 assert.equal(importReviewPacket({...packet,review_decisions:[{...decisions[0],published:true},decisions[1]]},'matching',entries),null);
});

test('review save verifies persistence instead of trusting a silent storage write',()=>{
 const decisions=newReviewDecisions(entries),key='review',fingerprint='same';
 const ignored={setItem(){},getItem(){return null;}};
 assert.equal(writeReview(ignored,key,fingerprint,decisions,entries),false);
 const stale={setItem(){},getItem(){return JSON.stringify({schema_version:1,review_context_sha256:fingerprint,review_decisions:[{...decisions[0],reviewer_notes:'stale'},decisions[1]]});}};
 assert.equal(writeReview(stale,key,fingerprint,decisions,entries),false);
 const normal=storage();
 assert.equal(writeReview(normal,key,fingerprint,decisions,entries),true);
 assert.deepEqual(readReview(normal,key,fingerprint,entries),decisions);
});

test('review completion status remains advisory and never grants publication',()=>{
 const decisions=newReviewDecisions(entries);
 assert.deepEqual(reviewRecoveryCheck(decisions,entries),{valid:true,reason:'review-incomplete',completed:0,total:2,revisions:0,can_auto_publish:false});
 decisions.forEach(d=>{d.scientific_status='verified';d.editorial_status='approved';d.proposed_action='no-change';});
 assert.deepEqual(reviewRecoveryCheck(decisions,entries),{valid:true,reason:'review-complete',completed:2,total:2,revisions:0,can_auto_publish:false});
 decisions[0].editorial_status='needs-revision';
 assert.deepEqual(reviewRecoveryCheck(decisions,entries),{valid:true,reason:'revisions-required',completed:1,total:2,revisions:1,can_auto_publish:false});
 assert.deepEqual(reviewRecoveryCheck([{...decisions[0],published:true},decisions[1]],entries),{valid:false,reason:'invalid-decisions',can_auto_publish:false});
});

test('empty reviews are not reported as completed editorial work',()=>{
 const empty=newReviewDecisions([]);
 assert.equal(validateReviewDecisions(empty,[]),true);
 assert.equal(reviewRecoveryCheck(empty,[]).reason,'review-incomplete');
 assert.equal(reviewRecoveryCheck(empty,[]).can_auto_publish,false);
 assert.deepEqual(reviewProgress(null),{completed:0,total:0,revisions:0,can_auto_publish:false});
});

test('review persistence and portable import require a nonempty classification fingerprint',()=>{
 const decisions=newReviewDecisions(entries),store=storage();
 assert.equal(writeReview(store,'key','',decisions,entries),false);
 assert.equal(readReview(store,'key','',entries),null);
 const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',review_context_sha256:'',review_decisions:decisions};
 assert.equal(importReviewPacket(packet,'',entries),null);
 assert.equal(importReviewPacket(packet,undefined,entries),null);
});

test('verification and editorial approval without an action do not complete a review',()=>{
 const decisions=newReviewDecisions(entries);
 decisions.forEach(d=>{d.scientific_status='verified';d.editorial_status='approved';});
 assert.equal(reviewProgress(decisions).completed,0);
 assert.equal(reviewRecoveryCheck(decisions,entries).reason,'review-incomplete');
 decisions[0].proposed_action='new-content';
 assert.equal(reviewProgress(decisions).completed,1);
 assert.equal(reviewRecoveryCheck(decisions,entries).can_auto_publish,false);
});

test('invalid proposed actions never count as completed even in advisory progress',()=>{
 const decisions=newReviewDecisions(entries);
 decisions[0].scientific_status='verified';
 decisions[0].editorial_status='approved';
 decisions[0].proposed_action='publish';
 assert.equal(reviewProgress(decisions).completed,0);
 assert.equal(reviewRecoveryCheck(decisions,entries).valid,false);
});

test('advisory progress tolerates null and primitive records without marking review complete',()=>{
 const malformed=[null,undefined,42,'unexpected',[],{scientific_status:'verified',editorial_status:'approved',proposed_action:'publish'}];
 assert.deepEqual(reviewProgress(malformed),{completed:0,total:6,revisions:0,can_auto_publish:false});
 assert.equal(reviewRecoveryCheck(malformed,malformed).valid,false);
});

test('whitespace-only classification fingerprints cannot persist or restore reviews',()=>{
 const decisions=newReviewDecisions(entries),store=storage();
 const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',review_context_sha256:'   ',review_decisions:decisions};
 assert.equal(writeReview(store,'key','   ',decisions,entries),false);
 assert.equal(readReview(store,'key','   ',entries),null);
 assert.equal(importReviewPacket(packet,'   ',entries),null);
 assert.equal(writeReview(store,'key','real-id',decisions,entries),true);
 assert.deepEqual(readReview(store,'key','real-id',entries),decisions);
});

test('portable review import rejects packets claiming publication or preparation',()=>{
 const decisions=newReviewDecisions(entries);
 const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',review_context_sha256:'hash',review_decisions:decisions,published:false,committed:false,prepared:false};
 assert.deepEqual(importReviewPacket(packet,'hash',entries),decisions);
 for(const field of ['published','committed','prepared','can_auto_publish']){
  assert.equal(importReviewPacket({...packet,[field]:true},'hash',entries),null);
 }
});
