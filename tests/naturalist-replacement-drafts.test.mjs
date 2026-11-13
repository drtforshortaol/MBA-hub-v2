import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {readReplacementDrafts,saveReplacementDrafts} from '../src/core/naturalist-replacement-drafts.js';
const fingerprint='a'.repeat(64),namespace='mba-v2-developer';
const entries=[{index:0,route:{action:'update-existing'}},{index:1,route:{action:'new-content'}}];
function memory(){const records=new Map();return {getItem:key=>records.get(key)??null,setItem:(key,value)=>records.set(key,value),removeItem:key=>records.delete(key),records};}
test('replacement text survives regeneration with exact context and preserves no approvals',()=>{
 const storage=memory(),drafts=[[0,'  Reviewed source proposal 日本語 🐙.\r\n ']];
 assert.equal(saveReplacementDrafts(storage,namespace,fingerprint,entries,drafts),true);
 assert.deepEqual(readReplacementDrafts(storage,namespace,fingerprint,entries),{valid:true,drafts});
 assert.deepEqual(readReplacementDrafts(storage,namespace,'b'.repeat(64),entries),{valid:true,drafts:[]});
 assert.deepEqual(readReplacementDrafts(storage,'mba-v2-tester',fingerprint,entries),{valid:true,drafts:[]});
 const packet=JSON.parse([...storage.records.values()][0]);
 assert.deepEqual(Object.keys(packet).sort(),['can_auto_publish','drafts','kind','review_context_sha256','schema_version']);
 assert.equal(packet.can_auto_publish,false);
});
test('changed routing, malformed or approval-bearing draft records fail closed',()=>{
 const storage=memory();saveReplacementDrafts(storage,namespace,fingerprint,entries,[[0,'Proposal']]);
 const [key,raw]=[...storage.records.entries()][0];
 assert.equal(readReplacementDrafts(storage,namespace,fingerprint,[{index:0,route:{action:'new-content'}}]).valid,false);
 for(const modify of [p=>p.published=true,p=>p.can_auto_publish=true,p=>p.review_context_sha256='b'.repeat(64),p=>p.drafts=[[0,'One'],[0,'Two']],p=>p.drafts=[[1,'Wrong route']],p=>p.drafts=[[0,'x'.repeat(20001)]],p=>p.drafts=[[0,'  ']]]){
  const packet=JSON.parse(raw);modify(packet);storage.setItem(key,JSON.stringify(packet));
  assert.equal(readReplacementDrafts(storage,namespace,fingerprint,entries).valid,false);
 }
 storage.setItem(key,'{bad');assert.equal(readReplacementDrafts(storage,namespace,fingerprint,entries).valid,false);
 storage.setItem(key,'x'.repeat(2000001));assert.equal(readReplacementDrafts(storage,namespace,fingerprint,entries).valid,false);
});
test('storage failure never reports success and empty edits clear only replacement text',()=>{
 const storage=memory();storage.setItem('unrelated-review','keep');
 assert.equal(saveReplacementDrafts(storage,namespace,fingerprint,entries,[[0,'Proposal']]),true);
 assert.equal(saveReplacementDrafts(storage,namespace,fingerprint,entries,[]),true);
 assert.deepEqual(readReplacementDrafts(storage,namespace,fingerprint,entries).drafts,[]);
 assert.equal(storage.getItem('unrelated-review'),'keep');
 for(const unavailable of [{getItem(){throw Error('blocked');},setItem(){throw Error('QuotaExceededError');}},{getItem:()=>null,setItem(){},removeItem(){}}]){
  assert.equal(saveReplacementDrafts(unavailable,namespace,fingerprint,entries,[[0,'Proposal']]),false);
 }
 assert.equal(saveReplacementDrafts(storage,'invalid',fingerprint,entries,[[0,'Proposal']]),false);
 assert.equal(saveReplacementDrafts(storage,namespace,'invalid',entries,[[0,'Proposal']]),false);
});
test('actual replacement input persists edits, restores text, and ignores stale review handlers',()=>{
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 const start=code.indexOf('   const replacementDrafts=new Map();'),end=code.indexOf('   // Reject ambiguous IDs',start);
 const storage=memory(),pending=[{scientific_status:'pending',editorial_status:'pending'}];
 const context={readReplacementDrafts,saveReplacementDrafts,localStorage:storage,env:{namespace},sourceFingerprint:fingerprint,packet:{entries,review_decisions:pending},document:{createElement(){return {setAttribute(){}};}},reviewOutput:{append(){}},isCurrentReview:()=>true,item:{index:0},replacementInput:{value:'New replacement',addEventListener(type,callback){context.edit=callback;}},refreshPreview(){}};
 vm.createContext(context);
 vm.runInContext(code.slice(start,end)+'\nglobalThis.savedDrafts=replacementDrafts;globalThis.saveEdits=saveReplacements;globalThis.status=replacementRecoveryStatus;',context);
 const line=code.split('\n').find(line=>line.includes("replacementInput.addEventListener('input'"));
 vm.runInContext(line,context);context.edit();
 assert.equal(readReplacementDrafts(storage,namespace,fingerprint,entries).drafts[0][1],'New replacement');
 assert.equal(context.packet.review_decisions,pending);assert.equal(pending[0].scientific_status,'pending');
 context.isCurrentReview=()=>false;context.replacementInput.value='Stale edit';context.edit();
 assert.equal(readReplacementDrafts(storage,namespace,fingerprint,entries).drafts[0][1],'New replacement');
 // A new generated interface recovers only the proposal text.
 const recovery={...context};delete recovery.savedDrafts;vm.createContext(recovery);
 vm.runInContext(code.slice(start,end)+'\nglobalThis.restored=replacementDrafts.get(0);',recovery);
 assert.equal(recovery.restored,'New replacement');assert.equal(pending[0].editorial_status,'pending');
 context.isCurrentReview=()=>true;context.replacementInput.value='';context.edit();
 assert.deepEqual(readReplacementDrafts(storage,namespace,fingerprint,entries).drafts,[]);
});
