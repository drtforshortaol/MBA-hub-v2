import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderNaturalistComparisonEvidence} from '../src/core/naturalist-comparison-evidence.js';
class Element{constructor(tag){this.tag=tag;this.children=[];this.style={};this.listeners={};}append(...nodes){this.children.push(...nodes);}addEventListener(type,fn){this.listeners[type]=fn;}set innerHTML(value){throw Error('Use literal evidence');}}
const document={createElement:tag=>new Element(tag)};
test('outgoing comparison preserves counterpart paragraph, whitespace and literal markup without changing evidence',()=>{
 const entry={source_text:' Current\r\n日本語  ',duplicate_of:1};
 const other={source_text:' Other\n<script>literal</script> ',source_block:'Before.\r\n Other\n<script>literal</script> \r\nAfter.',placement:{target_app_id:'otter',target_section_id:'diet'}};
 const before=JSON.stringify({entry,other}),events=[];let current=true;
 const controls={isCurrentReview:()=>current,showStatement:index=>events.push(['show',index]),statementCards:[{}, {querySelector:()=>({focus:options=>events.push(['focus',options])}),scrollIntoView:options=>events.push(['scroll',options])}]};
 const row=renderNaturalistComparisonEvidence(document,entry,other,1,controls);
 assert.deepEqual(row.children.slice(0,-1).map(n=>n.textContent),['Statement 2 — possible duplicate','Current: '+entry.source_text,'Compare: '+other.source_text,'Original source paragraph — classification context',other.source_block,'Other proposed placement: otter / diet']);
 for(const child of row.children.slice(0,-1))assert.deepEqual(child.style,{whiteSpace:'pre-wrap',overflowWrap:'anywhere'});
 row.children.at(-1).listeners.click();
 assert.deepEqual(events,[['show',1],['focus',{preventScroll:true}],['scroll',{block:'nearest'}]]);
 current=false;row.children.at(-1).listeners.click();assert.equal(events.length,3);
 assert.equal(JSON.stringify({entry,other}),before);
});
test('conflict comparisons omit duplicate context and retain unresolved placement fallbacks',()=>{
 const row=renderNaturalistComparisonEvidence(document,{source_text:'A'},{source_text:'B',source_block:'B'},1,{});
 assert.equal(row.children.length,5);assert.equal(row.children[0].textContent,'Statement 2 — potential conflict');
 assert.equal(row.children[3].textContent,'Other proposed placement: unresolved / unresolved');
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 assert.match(code,/comparison\.append\(renderNaturalistComparisonEvidence\(document,entry,other,candidate,\{isCurrentReview,showStatement,statementCards\}\)\)/);
});
