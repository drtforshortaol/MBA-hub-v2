import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createSectionNavigator} from '../src/core/section-navigation.js';
const read=name=>fs.readFileSync(`src/apps/information-center/${name}`,'utf8');
const window={};vm.runInNewContext(read('data.js'),{window});
const manifest=JSON.parse(read('manifest.json'));
function node(tag='') {return {tag,tagName:tag.toUpperCase(),children:[],attributes:{},dataset:{},style:{},textContent:'',tabIndex:-1,append(...ns){for(const n of ns){n.parentElement=this;this.children.push(n);}},setAttribute(k,v){this.attributes[k]=v;},hasAttribute(k){return k in this.attributes;},getAttribute(k){return this.attributes[k];},querySelector(){return this.control||null;},focus(){this.focused=true;},scrollIntoView(){this.scrolls=(this.scrolls||0)+1;}};}
function all(n){return [n,...n.children.flatMap(all)];}
function text(n){return n.textContent+n.children.map(text).join('');}
function render(){const parent=node();const context=vm.createContext({window,document:{addEventListener(){},createElement:node,createTextNode:t=>Object.assign(node(),{textContent:t})},parent});vm.runInContext(read('app.js'),context);vm.runInContext('sections.forEach(section=>appendSection(parent,section))',context);return parent;}
test('all 18 handbook sections index every authored block at existing stable card IDs',()=>{
 assert.equal(window.IC_SECTIONS.length,18);assert.equal(manifest.sections.length,18);
 assert.equal(window.IC_SECTIONS.reduce((n,s)=>n+s.content.length,0),47);
 for(const s of window.IC_SECTIONS){const entry=manifest.sections.find(e=>e.id===`card-${s.id}`);assert(entry);assert.equal(entry.title,s.title);
 for(const b of s.content){const values=b.text?[b.text]:[b.heading,...(b.items||[]),...(b.cards||[]).flatMap(c=>[c.label,c.value,c.note])];for(const value of values.filter(Boolean))assert(entry.text.includes(value),value);}}
 assert.equal(manifest.publication_review,'pending');assert.equal(manifest.status,'testing');
});
test('actual active renderer supplies every indexed target and preserves authored block text',()=>{
 const tree=render(),nodes=all(tree);
 for(const s of window.IC_SECTIONS){const card=nodes.find(n=>n.id===`card-${s.id}`);assert(card);const visible=text(card);
 for(const b of s.content){const values=b.text?[b.text]:[b.heading,...(b.items||[]),...(b.cards||[]).flatMap(c=>[c.label,c.value,c.note])];for(const value of values.filter(Boolean))assert(visible.includes(value),value);}}
});
test('every actual card target reveals once and Back does not replay the initial fragment',()=>{
 for(const entry of manifest.sections){const card=all(render()).find(n=>n.id===entry.id);const header=card.children[0];header.click=()=>{header.attributes['aria-expanded']='true';card.children.at(-1).style.display='block';};card.control=header;
 const location={hash:`#${entry.id}`};const document={getElementById:id=>id===entry.id?card:null,querySelector:()=>null,querySelectorAll:()=>[]};
 const navigate=createSectionNavigator({document,location,escape:x=>x});assert(navigate());assert.equal(header.attributes['aria-expanded'],'true');assert.equal(card.scrolls,1);assert.equal(card.focused,true);assert.equal(navigate(),false);
 header.attributes['aria-expanded']='false';const restored=createSectionNavigator({document,location,escape:x=>x,skipInitial:true});assert.equal(restored(),false);assert.equal(header.attributes['aria-expanded'],'false');}
});
test('both generated environments include all 18 exact offline handbook search targets',()=>{
 for(const environment of ['developer','tester']){const index=JSON.parse(fs.readFileSync(`dist/${environment}/search-index.json`));const entries=index.filter(e=>e.app_id==='information-center');for(const s of manifest.sections)assert(entries.some(e=>e.url.endsWith(`#${s.id}`)),s.id);const release=JSON.parse(fs.readFileSync(`dist/${environment}/release.json`));for(const name of ['index.html','app.js','data.js','styles.css'])assert(release.resources.some(r=>r.url===`apps/information-center/${name}`));}
});
