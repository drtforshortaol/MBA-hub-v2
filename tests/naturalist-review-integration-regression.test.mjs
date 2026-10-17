import test from 'node:test';
import assert from 'node:assert/strict';
import {newReviewDecisions,reviewProgress,reviewStorageKey,readReview,writeReview} from '../src/core/naturalist-review-state.js';

function memoryStorage(){
 const data=new Map();
 return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),snapshot:()=>new Map(data)};
}
test('Naturalist review annotations survive reload without granting publication',()=>{
 const entries=[{index:0},{index:1},{index:2}],store=memoryStorage();
 const key=reviewStorageKey('developer','context-A');
 const decisions=newReviewDecisions(entries);
 decisions[0]={...decisions[0],scientific_status:'verified',editorial_status:'approved',proposed_action:'update-existing',reviewer_notes:'Reviewed source'};
 decisions[1]={...decisions[1],scientific_status:'needs-revision',reviewer_notes:'Check claim'};
 assert.equal(writeReview(store,key,'context-A',decisions,entries),true);
 const restored=readReview(store,key,'context-A',entries);
 assert.deepEqual(restored,decisions);
 restored[0].reviewer_notes='Changed locally';
 assert.equal(readReview(store,key,'context-A',entries)[0].reviewer_notes,'Reviewed source');
 assert.deepEqual(reviewProgress(restored),{completed:1,total:3,revisions:1,can_auto_publish:false});
});
test('classification changes invalidate saved decisions and isolate review namespaces',()=>{
 const entries=[{index:0}],store=memoryStorage(),decisions=newReviewDecisions(entries);
 const oldKey=reviewStorageKey('developer','context-A');
 assert.equal(writeReview(store,oldKey,'context-A',decisions,entries),true);
 assert.equal(readReview(store,oldKey,'context-B',entries),null);
 assert.equal(readReview(store,reviewStorageKey('developer','context-B'),'context-B',entries),null);
 assert.equal(readReview(store,reviewStorageKey('tester','context-A'),'context-A',entries),null);
 assert.equal(store.snapshot().size,1);
});
test('corrupt or mismatched review packets fail closed',()=>{
 const entries=[{index:0}],store=memoryStorage(),key=reviewStorageKey('developer','context');
 store.setItem(key,JSON.stringify({schema_version:1,review_context_sha256:'context',review_decisions:[{...newReviewDecisions(entries)[0],editorial_status:'published'}]}));
 assert.equal(readReview(store,key,'context',entries),null);
 store.setItem(key,JSON.stringify({schema_version:1,review_context_sha256:'context',review_decisions:newReviewDecisions(entries),published:true}));
 // The annotation reader does not treat unrelated packet fields as publication authorization.
 assert.equal(readReview(store,key,'context',entries)?.length,1);
 assert.equal(reviewProgress(readReview(store,key,'context',entries)).can_auto_publish,false);
});
