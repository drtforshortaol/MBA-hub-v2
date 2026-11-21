import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {naturalistSourceStorageKey,saveNaturalistSource,readNaturalistSource,discardNaturalistSource,createNaturalistIntakePacket} from '../src/core/naturalist-intake.js';
const memory=()=>{const records=new Map();return {getItem:key=>records.get(key)??null,setItem:(key,value)=>records.set(key,value),removeItem:key=>records.delete(key)};};
test('source recovery preserves Unicode and whitespace, isolates environments, and clears only source',()=>{
 const storage=memory(),source='  Hey y’all!\r\n🐙 日本語.  ';
 storage.setItem('mba-v2-developer:naturalist-review:hash','approved annotations');
 assert.equal(saveNaturalistSource(storage,'mba-v2-developer',source),true);
 assert.equal(readNaturalistSource(storage,'mba-v2-developer').source,source);
 assert.equal(readNaturalistSource(storage,'mba-v2-tester').valid,false);
 assert.equal(discardNaturalistSource(storage,'mba-v2-developer'),true);
 assert.equal(readNaturalistSource(storage,'mba-v2-developer').valid,false);
 assert.equal(storage.getItem('mba-v2-developer:naturalist-review:hash'),'approved annotations');
});
test('blocked storage, corrupt packets, and ignored writes fail without losing caller source',()=>{
 for(const storage of [{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}},{getItem:()=>null,setItem(){},removeItem(){}}]){
  assert.equal(saveNaturalistSource(storage,'mba-v2-developer','source'),false);
  assert.equal(readNaturalistSource(storage,'mba-v2-developer').valid,false);
 }
 const storage=memory(),key=naturalistSourceStorageKey('mba-v2-developer');
 for(const packet of ['{bad',JSON.stringify({...createNaturalistIntakePacket('source'),published:true})]){
  storage.setItem(key,packet);assert.equal(readNaturalistSource(storage,'mba-v2-developer').valid,false);
 }
 for(const namespace of ['', 'mba-v1', '../source',null])assert.throws(()=>naturalistSourceStorageKey(namespace));
 assert.equal(saveNaturalistSource(storage,'mba-v2-developer','x'.repeat(60001)),false);
 assert.equal(saveNaturalistSource(storage,'mba-v2-developer',{}),false);
});
test('source recovery UI requires explicit restore and invalidates old review annotations',()=>{
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 // Execute the actual recovery event wiring against a tiny DOM, rather than a copy.
 const start=code.indexOf(' let activeIntakeImport=0'),end=code.indexOf(' const importIntakeLabel=',start);
 const storage=memory();saveNaturalistSource(storage,'mba-v2-developer','Saved source');
 class Element{constructor(){this.listeners={};this.value='';}setAttribute(){}addEventListener(type,listener){(this.listeners[type]??=[]).push(listener);}dispatchEvent(event){for(const listener of this.listeners[event.type]??[])listener(event);}}
 const input=new Element(),status=new Element();let invalidations=0;
 input.addEventListener('input',()=>invalidations++);
 const context={readNaturalistSource,saveNaturalistSource,discardNaturalistSource,localStorage:storage,env:{namespace:'mba-v2-developer'},document:{createElement:()=>new Element()},intake:{insertBefore(){}},intakeText:input,intakeStatus:status,Event:class{constructor(type){this.type=type;}}};
 vm.createContext(context);
 vm.runInContext(code.slice(start,end)+'\nglobalThis.controls={restoreSourceButton,discardSourceButton,recoveryStatus,fresh:()=>requireFreshIntakeReview};',context);
 const {controls}=context;
 assert.equal(input.value,'');assert.equal(controls.restoreSourceButton.disabled,false);
 controls.restoreSourceButton.dispatchEvent({type:'click'});
 assert.equal(input.value,'Saved source');assert.equal(invalidations,1);assert.equal(controls.fresh(),true);
 assert.equal(controls.restoreSourceButton.disabled,true);
 controls.discardSourceButton.dispatchEvent({type:'click'});
 assert.equal(input.value,'Saved source');assert.equal(readNaturalistSource(storage,'mba-v2-developer').valid,false);
 assert.equal(controls.discardSourceButton.disabled,true);
 assert.match(code,/if\(!requireFreshIntakeReview\)\{try\{saved=readReview/);
 assert.match(code,/if\(savedCurrentReview\)requireFreshIntakeReview=false/);
});

test('a restored source never reattaches saved scientific/editorial approvals for the same fingerprint',()=>{
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 const start=code.indexOf('   let saved=null;'),end=code.indexOf('   function reviewDecisionSummary',start);
 const oldApprovals=[{index:0,scientific_status:'verified',editorial_status:'approved',proposed_action:'update-existing',reviewer_notes:'previous review'}];
 const pending=()=>[{index:0,scientific_status:'pending',editorial_status:'pending',proposed_action:'needs-review',reviewer_notes:''}];
 for(const fresh of [true,false]){
  let storageReads=0;
  const context={requireFreshIntakeReview:fresh,localStorage:memory(),reviewKey:'same-key',sourceFingerprint:'same-fingerprint',packet:{entries:[{index:0}],review_decisions:pending()},readReview(){storageReads++;return oldApprovals;}};
  vm.createContext(context);vm.runInContext(code.slice(start,end),context);
  assert.equal(storageReads,fresh?0:1);
  assert.equal(context.packet.review_decisions[0].scientific_status,fresh?'pending':'verified');
  assert.equal(context.packet.review_decisions[0].editorial_status,fresh?'pending':'approved');
 }
});
