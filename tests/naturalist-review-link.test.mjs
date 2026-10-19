import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderNaturalistReviewLink} from '../src/core/naturalist-review-link.js';
import {newReviewDecisions,reviewActionQueue} from '../src/core/naturalist-review-state.js';
class Element{constructor(){this.listeners={};}addEventListener(type,callback){this.listeners[type]=callback;}}
const document={createElement:()=>new Element()};
test('queue links open blocked and preparable statements without changing approved decisions or blockers',()=>{
 const entries=[{index:0,conflict_with:[1]},{index:1,conflict_with:[]},{index:2,conflict_with:[]}];
 const decisions=newReviewDecisions(entries);
 decisions.forEach(d=>Object.assign(d,{scientific_status:'verified',editorial_status:'approved',proposed_action:'new-content'}));
 const original=JSON.stringify({entries,decisions});
 const queue=reviewActionQueue(decisions,entries);
 const shown=[],scrolled=[];
 const controls={isCurrentReview:()=>true,showStatement:index=>shown.push(index),statementCards:entries.map((_,index)=>({scrollIntoView:options=>scrolled.push([index,options])}))};
 for(const item of [...queue.blocked_items,...queue.items]){
  const link=renderNaturalistReviewLink(document,item.index,controls);
  assert.equal(link.textContent,'Review statement '+(item.index+1));
  assert.equal(link.type,'button');
  link.listeners.click();
 }
 assert.deepEqual(shown,[0,1,2]);
 assert.deepEqual(scrolled,[[0,{block:'nearest'}],[1,{block:'nearest'}],[2,{block:'nearest'}]]);
 assert.equal(JSON.stringify({entries,decisions}),original);
 assert.deepEqual(reviewActionQueue(decisions,entries),queue);
 assert.equal(queue.can_auto_publish,false);
});
test('retired queue links cannot navigate or scroll a newer review',()=>{
 let current=true;const shown=[],scrolled=[];
 const controls={isCurrentReview:()=>current,showStatement:index=>shown.push(index),statementCards:[{scrollIntoView:()=>scrolled.push(0)}]};
 const link=renderNaturalistReviewLink(document,0,controls);
 current=false;link.listeners.click();
 for(const index of [-1,1,0.5])renderNaturalistReviewLink(document,index,{...controls,isCurrentReview:()=>true}).listeners.click();
 assert.deepEqual(shown,[]);assert.deepEqual(scrolled,[]);
});
test('both queue sections render direct review links through existing statement navigation',()=>{
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 const start=code.indexOf('   function showQueue()'),end=code.indexOf("   refreshQueue.addEventListener",start);
 const queueCode=code.slice(start,end);
 assert.equal(queueCode.split('renderNaturalistReviewLink(document,item.index,{isCurrentReview,showStatement,statementCards})').length-1,2);
 assert.match(queueCode,/queue\.blocked_items/);
 assert.match(queueCode,/queue\.items/);
});
