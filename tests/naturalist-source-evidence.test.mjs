import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderNaturalistSourceEvidence} from '../src/core/naturalist-source-evidence.js';
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.style={};}
 append(...children){this.children.push(...children);}
 setAttribute(key,value){this.attributes[key]=value;}
 set innerHTML(value){throw Error('Source evidence must use literal text');}
}
const document={createElement:tag=>new Element(tag)};
test('long source statements and surrounding paragraphs remain readable without technical details',()=>{
 const source='  Hey y’all! 🐙 日本語\r\n'+('Long source sentence. '.repeat(30))+'<script>untrusted source</script>  ';
 const entry=Object.freeze({index:0,source_text:source,source_block:'Previous sentence.\r\n'+source+'\r\nFollowing sentence.',review:Object.freeze({approval_state:'pending',can_auto_publish:false})});
 const before=JSON.stringify(entry);
 const evidence=renderNaturalistSourceEvidence(document,entry);
 assert.equal(evidence.attributes['aria-label'],'Full Naturalist statement');
 assert.equal(evidence.children[0].textContent,'Statement to review');
 const statement=evidence.children[1];
 assert.equal(statement.tag,'p');assert.equal(statement.textContent,source);
 assert.equal(statement.hidden,undefined);
 assert.deepEqual(statement.style,{whiteSpace:'pre-wrap',overflowWrap:'anywhere'});
 const context=evidence.children[2];
 assert.equal(context.tag,'details');
 assert.equal(context.children[0].textContent,'Original source paragraph');
 assert.equal(context.children[1].textContent,entry.source_block);
 assert.deepEqual(context.children[1].style,{whiteSpace:'pre-wrap',overflowWrap:'anywhere'});
 assert.equal(JSON.stringify(entry),before);
});
test('identical or missing source paragraphs do not duplicate the visible statement',()=>{
 for(const source_block of [undefined,'Only statement']){
  const evidence=renderNaturalistSourceEvidence(document,{source_text:'Only statement',source_block});
  assert.equal(evidence.children.length,2);
  assert.equal(evidence.children[1].textContent,'Only statement');
 }
});
test('review cards present full evidence before routing and scientific/editorial controls',()=>{
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 assert.match(code,/import \{renderNaturalistSourceEvidence\} from '\.\/naturalist-source-evidence\.js'/);
 assert.match(code,/item\.append\(label,renderNaturalistSourceEvidence\(document,entry\),body,flags,related,technical,warning,form\)/);
});
