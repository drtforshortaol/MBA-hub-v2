import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderNaturalistReferencedEvidence} from '../src/core/naturalist-referenced-evidence.js';
import {newReviewDecisions,reviewActionQueue} from '../src/core/naturalist-review-state.js';
class Element{constructor(tag){this.tag=tag;this.children=[];this.style={};this.listeners={};}append(...nodes){this.children.push(...nodes);}setAttribute(){}addEventListener(type,fn){this.listeners[type]=fn;}set innerHTML(value){throw Error('Literal text only');}}
const document={createElement:tag=>new Element(tag)};
const nodes=node=>[node,...node.children.flatMap(nodes)];
test('original statement exposes inbound duplicate and conflict evidence with unchanged approval blockers',()=>{
 const entries=[{index:0,source_text:'Original'},
  {index:1,duplicate_of:0,source_text:'  Duplicate 日本語 <literal>\r\n ',source_block:' Context\r\nDuplicate 日本語 <literal> ',route:{app_id:'otter',section_id:'diet'}},
  {index:2,conflict_with:[0],source_text:'Conflicting statement'}];
 const decisions=newReviewDecisions(entries);decisions.forEach(d=>Object.assign(d,{scientific_status:'verified',editorial_status:'approved',proposed_action:'new-content'}));
 const before=JSON.stringify({entries,decisions}),queue=reviewActionQueue(decisions,entries),events=[];
 const controls={isCurrentReview:()=>true,showStatement:i=>events.push(['show',i]),statementCards:entries.map((_,i)=>({querySelector:()=>({focus:()=>events.push(['focus',i])}),scrollIntoView:()=>events.push(['scroll',i])}))};
 const section=renderNaturalistReferencedEvidence(document,entries[0],entries,controls),all=nodes(section),text=all.map(n=>n.textContent);
 assert(text.includes(entries[1].source_text));assert(text.includes(entries[1].source_block));
 assert(text.includes('Statement 2 — possible duplicate'));assert(text.includes('Statement 3 — potential conflict'));
 assert(text.includes('Proposed destination: otter / diet'));assert(text.includes('Proposed destination: unresolved / unresolved'));
 all.filter(n=>n.tag==='button').forEach(button=>button.listeners.click());
 assert.deepEqual(events,[['show',1],['focus',1],['scroll',1],['show',2],['focus',2],['scroll',2]]);
 assert.equal(JSON.stringify({entries,decisions}),before);assert.deepEqual(reviewActionQueue(decisions,entries),queue);
 assert.equal(queue.blocked_items.length,3);assert.equal(queue.can_auto_publish,false);
});
test('outgoing comparisons are not repeated and retired links remain inert',()=>{
 const entries=[{index:0,source_text:'Original',conflict_with:[1],duplicate_of:2},{index:1,source_text:'Conflict',conflict_with:[0]},{index:2,source_text:'Duplicate',duplicate_of:0}];
 const controls={isCurrentReview:()=>false,showStatement:()=>assert.fail('stale navigation'),statementCards:[{},{},{}]};
 assert.equal(renderNaturalistReferencedEvidence(document,entries[0],entries,controls),null);
 delete entries[0].duplicate_of;
 const section=renderNaturalistReferencedEvidence(document,entries[0],entries,controls);
 const all=nodes(section);assert.equal(all.filter(n=>n.tag==='button').length,1);
 assert(!all.some(n=>n.textContent==='Original source paragraph — classification context'));
 all.find(n=>n.tag==='button').listeners.click();
});
test('Developer review cards include inbound evidence using the existing guarded navigation',()=>{
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 assert(code.includes('renderNaturalistReferencedEvidence(document,entry,packet.entries,{isCurrentReview,showStatement,statementCards})'));
 assert(code.includes('if(referencedEvidence)related.append(referencedEvidence)'));
});
