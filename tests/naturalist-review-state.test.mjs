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

test('all review stages are required before completion for every supported action',()=>{
 for(const action of ['update-existing','new-content','no-change']){
  const decisions=newReviewDecisions([entries[0]]);
  decisions[0].proposed_action=action;
  assert.equal(reviewProgress(decisions).completed,0);
  decisions[0].scientific_status='verified';
  assert.equal(reviewProgress(decisions).completed,0);
  decisions[0].editorial_status='approved';
  assert.equal(reviewProgress(decisions).completed,1);
  assert.equal(reviewRecoveryCheck(decisions,[entries[0]]).reason,'review-complete');
  assert.equal(reviewRecoveryCheck(decisions,[entries[0]]).can_auto_publish,false);
 }
});

test('read-only action queue includes only fully approved actionable changes',async()=>{
 const {reviewActionQueue}=await import('../src/core/naturalist-review-state.js');
 const decisions=newReviewDecisions(entries);
 decisions[0].scientific_status='verified';
 decisions[0].editorial_status='approved';
 decisions[0].proposed_action='new-content';
 decisions[0].reviewer_notes='Add species story';
 decisions[1].scientific_status='verified';
 decisions[1].editorial_status='approved';
 decisions[1].proposed_action='no-change';
 const queue=reviewActionQueue(decisions,entries);
 assert.equal(queue.valid,true);
 assert.equal(queue.reason,'review-complete');
 assert.equal(queue.can_auto_publish,false);
 assert.deepEqual(queue.items,[{index:0,action:'new-content',entry:entries[0],reviewer_notes:'Add species story'}]);
 decisions[1].proposed_action='update-existing';
 assert.equal(reviewActionQueue(decisions,entries).items.length,2);
 decisions[0].editorial_status='needs-revision';
 assert.deepEqual(reviewActionQueue(decisions,entries).items.map(item=>item.index),[1]);
 assert.deepEqual(reviewActionQueue([{...decisions[0],published:true},decisions[1]],entries),{valid:false,reason:'invalid-decisions',items:[],blocked_items:[],can_auto_publish:false});
});

test('flagged duplicate and scientific conflict actions are quarantined even after both approvals',async()=>{
 const {reviewActionQueue}=await import('../src/core/naturalist-review-state.js');
 const flagged=[{index:0,source_text:'A',duplicate_of:1,conflict_with:[]},{index:1,source_text:'B',duplicate_of:null,conflict_with:[2]},{index:2,source_text:'C',duplicate_of:null,conflict_with:[]}];
 const decisions=newReviewDecisions(flagged);
 decisions.forEach(d=>{d.scientific_status='verified';d.editorial_status='approved';d.proposed_action='update-existing';});
 const queue=reviewActionQueue(decisions,flagged);
 assert.equal(queue.valid,true);
 assert.deepEqual(queue.items.map(i=>i.index),[]);
 assert.deepEqual(queue.blocked_items.map(i=>[i.index,i.block_reasons]),[[0,['duplicate']],[1,['duplicate','scientific-conflict']],[2,['scientific-conflict']]]);
 assert.equal(queue.can_auto_publish,false);
});

test('malformed classifier references cannot enter the preparable Naturalist queue',async()=>{
 const {reviewActionQueue}=await import('../src/core/naturalist-review-state.js');
 const malformed=[
  {index:0,duplicate_of:null,conflict_with:[999]},
  {index:1,duplicate_of:1,conflict_with:[]},
  {index:2,duplicate_of:null,conflict_with:'invalid'},
  {index:3,duplicate_of:'invalid',conflict_with:[]}
 ];
 const decisions=newReviewDecisions(malformed);
 decisions.forEach(d=>{d.scientific_status='verified';d.editorial_status='approved';d.proposed_action='update-existing';});
 const result=reviewActionQueue(decisions,malformed);
 assert.equal(result.items.length,0);
 assert.deepEqual(result.blocked_items.map(x=>x.index),[0,1,2,3]);
 assert.ok(result.blocked_items.every(x=>x.block_reasons.includes('invalid-classification')));
 assert.equal(result.can_auto_publish,false);
});

test('asymmetric scientific conflict blocks both endpoints from preparation',async()=>{
 const {reviewActionQueue}=await import('../src/core/naturalist-review-state.js');
 const entries=[{index:0,duplicate_of:null,conflict_with:[1]},{index:1,duplicate_of:null,conflict_with:[]},{index:2,duplicate_of:null,conflict_with:[]}];
 const decisions=newReviewDecisions(entries);
 decisions.forEach(d=>{d.scientific_status='verified';d.editorial_status='approved';d.proposed_action='update-existing';});
 const queue=reviewActionQueue(decisions,entries);
 assert.deepEqual(queue.items.map(x=>x.index),[2]);
 assert.deepEqual(queue.blocked_items.map(x=>x.index),[0,1]);
 assert.ok(queue.blocked_items.every(x=>x.block_reasons.includes('scientific-conflict')));
 assert.equal(queue.can_auto_publish,false);
});

test('portable review import rejects ambiguous publication state values',()=>{
 const entries=[{index:0}];
 const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',review_context_sha256:'hash',review_decisions:newReviewDecisions(entries)};
 for(const field of ['published','committed','prepared','can_auto_publish']){
  for(const value of [null,1,'false',{},[]]){
   assert.equal(importReviewPacket({...packet,[field]:value},'hash',entries),null);
  }
  assert.deepEqual(importReviewPacket({...packet,[field]:false},'hash',entries),packet.review_decisions);
 }
});

test('portable recovery rejects mismatched embedded classification despite matching fingerprint',()=>{
 const entries=[{index:0,source_text:'Sea otter',duplicate_of:null,conflict_with:[],placement:{target_app_id:'animals'},review:{flags:[]},existing_content:null}];
 const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',review_context_sha256:'hash',review_decisions:newReviewDecisions(entries),entries:structuredClone(entries),published:false,committed:false,prepared:false};
 assert.deepEqual(importReviewPacket(packet,'hash',entries),packet.review_decisions);
 for(const changed of [
  [{...entries[0],source_text:'Different source'}],
  [{...entries[0],placement:{target_app_id:'exhibits'}}],
  [{...entries[0],conflict_with:[0]}]
 ]){
  assert.equal(importReviewPacket({...packet,entries:changed},'hash',entries),null);
 }
 assert.equal(importReviewPacket({...packet,entries:[]},'hash',entries),null);
});

test('review recovery rejects stripped classification fields even when null-valued',()=>{
 const entries=[{index:0,source_text:'Octopus',duplicate_of:null,conflict_with:[],placement:null,review:null,existing_content:null}];
 const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',review_context_sha256:'hash',review_decisions:newReviewDecisions(entries),entries:structuredClone(entries)};
 assert.deepEqual(importReviewPacket(packet,'hash',entries),packet.review_decisions);
 for(const field of ['source_text','duplicate_of','conflict_with','placement','review','existing_content']){
  const altered=structuredClone(entries);
  delete altered[0][field];
  assert.equal(importReviewPacket({...packet,entries:altered},'hash',entries),null,field);
 }
});

test('reordered classifier entries cannot be prepared under approved decision indexes',async()=>{
 const {reviewActionQueue}=await import('../src/core/naturalist-review-state.js');
 const entries=[{index:1,duplicate_of:null,conflict_with:[]},{index:0,duplicate_of:null,conflict_with:[]},{index:2,duplicate_of:null,conflict_with:[]}];
 const decisions=newReviewDecisions(entries);
 decisions.forEach(d=>{d.scientific_status='verified';d.editorial_status='approved';d.proposed_action='update-existing';});
 const queue=reviewActionQueue(decisions,entries);
 assert.deepEqual(queue.items.map(x=>x.index),[2]);
 assert.deepEqual(queue.blocked_items.map(x=>x.index),[0,1]);
 assert.ok(queue.blocked_items.every(x=>x.block_reasons.includes('invalid-classification')));
 assert.equal(queue.can_auto_publish,false);
});

test('original and duplicate Naturalist statements are both quarantined',async()=>{
 const {reviewActionQueue}=await import('../src/core/naturalist-review-state.js');
 const entries=[{index:0,duplicate_of:null,conflict_with:[]},{index:1,duplicate_of:0,conflict_with:[]},{index:2,duplicate_of:null,conflict_with:[]}];
 const decisions=newReviewDecisions(entries);
 decisions.forEach(d=>{d.scientific_status='verified';d.editorial_status='approved';d.proposed_action='update-existing';});
 const queue=reviewActionQueue(decisions,entries);
 assert.deepEqual(queue.items.map(x=>x.index),[2]);
 assert.deepEqual(queue.blocked_items.map(x=>x.index),[0,1]);
 assert.ok(queue.blocked_items.every(x=>x.block_reasons.includes('duplicate')));
 assert.equal(queue.can_auto_publish,false);
});

test('portable review import refuses reordered classification records',()=>{
 const entries=[{index:0,source_text:'A',duplicate_of:null,conflict_with:[],placement:null,review:null,existing_content:null},{index:1,source_text:'B',duplicate_of:null,conflict_with:[],placement:null,review:null,existing_content:null}];
 const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',review_context_sha256:'hash',review_decisions:newReviewDecisions(entries),entries:structuredClone(entries)};
 assert.deepEqual(importReviewPacket(packet,'hash',entries),packet.review_decisions);
 const reversed=structuredClone(entries).reverse();
 assert.equal(importReviewPacket({...packet,entries:reversed},'hash',entries),null);
 assert.equal(importReviewPacket({...packet,entries:[null,entries[1]]},'hash',entries),null);
});

test('review recovery binds extraction provenance and required-review state',()=>{
 const entries=[{index:0,source_text:'Sea stars',source_block:'Source paragraph',extraction:{method:'paragraph'},duplicate_of:null,conflict_with:[],placement:null,review:null,existing_content:null,review_required:true}];
 const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',review_context_sha256:'hash',review_decisions:newReviewDecisions(entries),entries:structuredClone(entries)};
 assert.deepEqual(importReviewPacket(packet,'hash',entries),packet.review_decisions);
 for(const field of ['source_block','extraction','review_required']){
  const changed=structuredClone(entries);
  changed[0][field]=field==='review_required'?false:'tampered';
  assert.equal(importReviewPacket({...packet,entries:changed},'hash',entries),null,field);
  const stripped=structuredClone(entries);
  delete stripped[0][field];
  assert.equal(importReviewPacket({...packet,entries:stripped},'hash',entries),null,field+' missing');
 }
});

test('local review recovery rejects ambiguous preparation and publication flags',()=>{
 const store=storage(),key='review-flags',decisions=newReviewDecisions(entries);
 const record={schema_version:1,review_context_sha256:'hash',review_decisions:decisions};
 store.setItem(key,JSON.stringify(record));
 assert.deepEqual(readReview(store,key,'hash',entries),decisions);
 for(const field of ['published','committed','prepared','can_auto_publish']){
  for(const value of [true,null,1,'false',{},[]]){
   store.setItem(key,JSON.stringify({...record,[field]:value}));
   assert.equal(readReview(store,key,'hash',entries),null,field+'='+String(value));
  }
  store.setItem(key,JSON.stringify({...record,[field]:false}));
  assert.deepEqual(readReview(store,key,'hash',entries),decisions);
 }
});

test('review recovery fails closed for missing or malformed expected classification records',()=>{
 const expected=[{index:0,source_text:'Kelp',duplicate_of:null,conflict_with:[]}];
 const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',review_context_sha256:'hash',review_decisions:newReviewDecisions(expected),entries:structuredClone(expected)};
 assert.deepEqual(importReviewPacket(packet,'hash',expected),packet.review_decisions);
 for(const bad of [null,undefined,42,'bad',[],{index:1,source_text:'Kelp',duplicate_of:null,conflict_with:[]}]){
  assert.equal(importReviewPacket(packet,'hash',[bad]),null);
 }
});


test('non-null malformed duplicate references are quarantined rather than silently accepted',async()=>{
 const {reviewActionQueue}=await import('../src/core/naturalist-review-state.js');
 for(const invalid of [false,true,'',0.5,{},[],-1,2]){
  const records=[{index:0,duplicate_of:invalid,conflict_with:[]}];
  const decisions=newReviewDecisions(records);
  decisions[0].scientific_status='verified';
  decisions[0].editorial_status='approved';
  decisions[0].proposed_action='update-existing';
  const queue=reviewActionQueue(decisions,records);
  assert.equal(queue.items.length,0,JSON.stringify(invalid));
  assert.ok(queue.blocked_items[0].block_reasons.includes('invalid-classification'));
  assert.equal(queue.can_auto_publish,false);
 }
});
