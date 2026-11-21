import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function node(tag='',text='') {
 return {tag,children:[],attributes:{},textContent:text,
  append(...children){this.children.push(...children);},
  setAttribute(key,value){this.attributes[key]=value;}};
}
function fixture(){
 const context=vm.createContext({window:{},document:{addEventListener(){},createElement:tag=>node(tag),createTextNode:text=>node('',text)}});
 vm.runInContext(fs.readFileSync(new URL('../src/apps/information-center/app.js',import.meta.url),'utf8'),context);
 return {context,render:(type,value)=>{const parent=node();context.parent=parent;context.block=type==='quickref'?{type,cards:[{label:'Hotline',value,note:'Call'}]}:{type,items:[value]};vm.runInContext('appendBlock(parent,block)',context);return parent;}};
}
function text(n){return n.textContent+n.children.map(text).join('');}
function descendants(n,tag){return [...(n.tag===tag?[n]:[]),...n.children.flatMap(c=>descendants(c,tag))];}

test('Information Center renders complete numbers and callable links in active list and card paths',()=>{
 for(const type of ['list','numbered','quickref']){
  const {render}=fixture(),value='Hotline: (831) 648-4867; visitor: 888-221-1010.';
  const output=render(type,value),links=descendants(output,'a');
  assert.ok(text(output).includes(value));
  assert.deepEqual(links.map(x=>x.href),['tel:+18316484867','tel:+18882211010']);
  assert.deepEqual(links.map(text),['(831) 648-4867','888-221-1010']);
  assert.equal(links[0].attributes['aria-label'],'Call (831) 648-4867');
 }
});
test('phone rendering preserves short extensions, literal markup and highlighted full numbers',()=>{
 const {context,render}=fixture();
 const extension='Internal extension 1234 <script>alert(1)</script>';
 assert.equal(text(render('list',extension)),extension);
 assert.equal(descendants(render('list',extension),'a').length,0);
 vm.runInContext("searchTerm='648'",context);
 const output=render('list','Call (831) 648-4867 now');
 assert.equal(text(output),'Call (831) 648-4867 now');
 assert.equal(descendants(output,'a')[0].href,'tel:+18316484867');
 assert.deepEqual(descendants(output,'mark').map(text),['648']);
});
