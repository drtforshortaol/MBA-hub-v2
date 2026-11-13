import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {hasNaturalistRelationshipFlag} from '../src/core/naturalist-review-triage.js';
import {newReviewDecisions,reviewActionQueue} from '../src/core/naturalist-review-state.js';

test('relationship triage visits both duplicate and one-sided conflict endpoints without changing evidence',()=>{
 const entries=[{index:0},{index:1,duplicate_of:0},{index:2},{index:3,conflict_with:[2]},{index:4}];
 const before=JSON.stringify(entries);
 assert.deepEqual(entries.map((_,i)=>hasNaturalistRelationshipFlag(entries,i)),[true,true,true,true,false]);
 assert.equal(JSON.stringify(entries),before);
 for(const index of [-1,5,0.5,'0',null])assert.equal(hasNaturalistRelationshipFlag(entries,index),false);
 for(const entry of [{duplicate_of:0,conflict_with:[0]},{duplicate_of:99,conflict_with:[-1,99,'0']}])assert.equal(hasNaturalistRelationshipFlag([entry],0),false);
 assert.equal(hasNaturalistRelationshipFlag(null,0),false);
});

test('actual flagged-review button wraps through related originals and retains source, decisions and blockers',()=>{
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 const start=code.indexOf("   const nextFlagged=document.createElement"),end=code.indexOf("   const nextRevision=",start);
 class Element{constructor(){this.listeners={};}addEventListener(type,fn){this.listeners[type]=fn;}}
 const entries=[{index:0,source_text:' Original 日本語\r\n ',review:{flags:[]}},
  {index:1,source_text:'Duplicate',duplicate_of:0,review:{flags:['duplicate-in-submission']}},
  {index:2,source_text:'Other conflict endpoint',review:{flags:[]}},
  {index:3,source_text:'Conflict',conflict_with:[2],review:{flags:[]}},
  {index:4,source_text:'Other classifier flag',review:{flags:['placement-review']}},
  {index:5,source_text:'Unflagged',review:{flags:[]}}];
 const packet={entries,review_decisions:newReviewDecisions(entries)};
 packet.review_decisions.forEach(d=>Object.assign(d,{scientific_status:'verified',editorial_status:'approved',proposed_action:'new-content'}));
 const before=JSON.stringify(packet),queue=reviewActionQueue(packet.review_decisions,entries),shown=[];let current=true;
 const context={document:{createElement:()=>new Element()},packet,hasNaturalistRelationshipFlag,
  statementCards:entries.map(()=>({scrollIntoView(){}})),activeStatement:5,isCurrentReview:()=>current,
  showStatement(index){context.activeStatement=index;shown.push(index);},intakeStatus:{}};
 vm.createContext(context);vm.runInContext(code.slice(start,end)+'\nglobalThis.button=nextFlagged;',context);
 for(let i=0;i<6;i++)context.button.listeners.click();
 assert.deepEqual(shown,[0,1,2,3,4,0]);
 current=false;context.button.listeners.click();assert.equal(shown.length,6);
 assert.equal(JSON.stringify(packet),before);assert.deepEqual(reviewActionQueue(packet.review_decisions,entries),queue);
 assert.equal(queue.can_auto_publish,false);
 current=true;packet.entries.forEach(e=>{e.review.flags=[];delete e.duplicate_of;delete e.conflict_with;});
 context.button.listeners.click();assert.equal(shown.length,6);
 assert.match(context.intakeStatus.textContent,/No automatically flagged statements/);
});
