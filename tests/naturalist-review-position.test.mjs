import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {readNaturalistReviewPosition,saveNaturalistReviewPosition} from '../src/core/naturalist-review-position.js';
const fingerprint='a'.repeat(64),namespace='mba-v2-developer';
const memory=()=>{const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),map};};
test('review position resumes only within the same environment and classification',()=>{
 const storage=memory();storage.setItem('separate-review-approvals','pending');
 assert.equal(saveNaturalistReviewPosition(storage,namespace,fingerprint,2,4),true);
 assert.equal(readNaturalistReviewPosition(storage,namespace,fingerprint,4),2);
 assert.equal(readNaturalistReviewPosition(storage,'mba-v2-tester',fingerprint,4),0);
 assert.equal(readNaturalistReviewPosition(storage,namespace,'b'.repeat(64),4),0);
 assert.equal(readNaturalistReviewPosition(storage,namespace,fingerprint,3),0);
 assert.equal(storage.getItem('separate-review-approvals'),'pending');
 assert.deepEqual(JSON.parse(storage.getItem(namespace+':naturalist-position:'+fingerprint)),{schema_version:1,index:2,count:4});
});
test('invalid saved positions and unavailable storage keep the first statement usable',()=>{
 const storage=memory(),key=namespace+':naturalist-position:'+fingerprint;
 for(const record of ['{bad',JSON.stringify({schema_version:1,index:99,count:4}),JSON.stringify({schema_version:1,index:2,count:4,approved:true})]){
  storage.setItem(key,record);assert.equal(readNaturalistReviewPosition(storage,namespace,fingerprint,4),0);
 }
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 assert.equal(readNaturalistReviewPosition(blocked,namespace,fingerprint,4),0);
 assert.equal(saveNaturalistReviewPosition(blocked,namespace,fingerprint,2,4),false);
 assert.equal(saveNaturalistReviewPosition(storage,namespace,fingerprint,-1,4),false);
 assert.equal(saveNaturalistReviewPosition(storage,namespace,fingerprint,4,4),false);
});
test('actual statement navigation resumes and saves the displayed card without altering decisions',()=>{
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 const navigationStart=code.indexOf('   const navigation=document.createElement'),navigationEnd=code.indexOf("   const heading=document.createElement('h4')",navigationStart);
 const restoreStart=code.indexOf('   if(statementCards.length>1)'),restoreEnd=code.indexOf('   const recoveryLabel=',restoreStart);
 class Element{constructor(){this.children=[];this.listeners={};}setAttribute(){}append(...children){this.children.push(...children);}addEventListener(type,handler){this.listeners[type]=handler;}scrollIntoView(){}}
 const storage=memory();saveNaturalistReviewPosition(storage,namespace,fingerprint,2,3);
 const packet={entries:[0,1,2].map(index=>({index,source_text:'Statement '+index,review:{flags:[]}})),review_decisions:[0,1,2].map(()=>({scientific_status:'pending',editorial_status:'pending',proposed_action:'needs-review'}))};
 const original=JSON.stringify(packet);let current=true;
 const context={document:{createElement:()=>new Element()},packet,localStorage:storage,env:{namespace},sourceFingerprint:fingerprint,readNaturalistReviewPosition,saveNaturalistReviewPosition,isCurrentReview:()=>current,intakeStatus:{},reviewOutput:{insertBefore(){}}};
 vm.createContext(context);
 vm.runInContext(code.slice(navigationStart,navigationEnd)+'\nstatementCards.push(...packet.entries.map(()=>document.createElement("details")));\n'+code.slice(restoreStart,restoreEnd)+'\nglobalThis.controls={previous,next,nextPending,jumpToStatement,statementCards,position};',context);
 const {controls}=context;
 assert.equal(controls.jumpToStatement.value,'2');assert.equal(controls.statementCards[2].hidden,false);
 controls.previous.listeners.click();
 assert.equal(controls.jumpToStatement.value,'1');assert.equal(readNaturalistReviewPosition(storage,namespace,fingerprint,3),1);
 controls.nextPending.listeners.click();
 assert.equal(controls.jumpToStatement.value,'2');
 controls.jumpToStatement.value='0';controls.jumpToStatement.listeners.change();
 assert.equal(readNaturalistReviewPosition(storage,namespace,fingerprint,3),0);
 current=false;controls.next.listeners.click();
 assert.equal(readNaturalistReviewPosition(storage,namespace,fingerprint,3),0);
 assert.equal(JSON.stringify(packet),original);
});
