import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {captureAppView,restoreAppView} from '../src/core/app-view.js';
import {createSectionNavigator} from '../src/core/section-navigation.js';
const prefix='src/apps/aquarium-library-explorer/';const manifest=JSON.parse(fs.readFileSync(prefix+'manifest.json'));
const walk=n=>[n,...n.children.flatMap(walk)];
function node(tag){return {tagName:tag.toUpperCase(),children:[],attributes:{},dataset:{},value:'',textContent:'',type:tag==='select'?'select-one':'',open:false,tabIndex:-1,events:{},appendChild(n){n.parentElement=this;this.children.push(n);return n;},replaceChildren(...ns){this.children=[];ns.forEach(n=>this.appendChild(n));},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];},hasAttribute(k){return k in this.attributes;},addEventListener(k,fn){(this.events[k]??=[]).push(fn);},dispatchEvent(e){for(const fn of this.events[e.type]||[])fn(e);},querySelector(selector){return selector==='summary'?this.children.find(n=>n.tagName==='SUMMARY'):null;},focus(){this.focused=true;},scrollIntoView(){this.scrolls=(this.scrolls||0)+1;}};}
function fixture(query=''){
 const controls={};for(const [id,tag] of [['q','input'],['category','select'],['library-view','select'],['az','div'],['list','div'],['count','div']])controls[id]=Object.assign(node(tag),{id});
 const nodes=()=>Object.values(controls).flatMap(walk);
 const document={getElementById:id=>nodes().find(n=>n.id===id),createElement:node,createTextNode:t=>Object.assign(node('text'),{textContent:t}),querySelector:()=>null,querySelectorAll:s=>s==='input[id],select[id],textarea[id]'?[controls.q,controls.category,controls['library-view']]:s==='details'?nodes().filter(n=>n.tagName==='DETAILS'):[]};
 const location={search:query,pathname:'/apps/aquarium-library-explorer/index.html',hash:''};let replacements=0;const history={replaceState(a,b,url){replacements++;location.hash=new URL(url,'https://example.org').hash;}};
 const context=vm.createContext({window:{},document,location,history,URLSearchParams});vm.runInContext(fs.readFileSync(prefix+'library-data.js','utf8'),context);context.LIBRARY_DATA=context.window.LIBRARY_DATA;
 const html=fs.readFileSync(prefix+'index.html','utf8');const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];vm.runInContext(script,context);
 return {controls,document,context,location,replacements:()=>replacements,details:()=>document.querySelectorAll('details'),run:s=>vm.runInContext(s,context)};
}
test('all 17 wishlist query links render their exact book and native summary target',()=>{
 const wishes=manifest.sections.filter(s=>s.query?.view==='wishlist');assert.equal(wishes.length,17);
 for(const section of wishes){const f=fixture('?'+new URLSearchParams(section.query));assert.equal(f.details().length,17);const target=f.document.getElementById(section.id);assert(target,section.title);assert.equal(target.tagName,'SUMMARY');assert.equal(target.children[0].textContent,section.title);
 assert.equal(decodeURIComponent(f.location.hash.slice(1)),section.id);assert.equal(f.replacements(),1);const go=createSectionNavigator({document:f.document,location:f.location,escape:x=>x});assert(go());assert.equal(target.parentElement.open,true);assert.equal(target.focused,true);assert.equal(go(),false);}
});
test('default holdings and invalid wishlist queries retain normal 78-book view',()=>{
 for(const query of ['', '?view=wishlist&section=unknown&book=%3Cscript%3E','?view=wishlist']){const f=fixture(query);assert.equal(f.details().length,78);assert.equal(f.controls['library-view'].value,'');}
 assert.equal(manifest.sections.length,95);assert.equal(manifest.publication_review,'pending');
});
test('Back replays saved letter, category, text and panel state over entry wishlist initialization',()=>{
 const section=manifest.sections.find(s=>s.query),query='?'+new URLSearchParams(section.query);const f=fixture(query);
 f.controls['library-view'].value='M';f.controls['library-view'].dispatchEvent({type:'change'});
 f.controls.q.value='marine';f.controls.q.dispatchEvent({type:'input'});assert(f.details().length>0);f.details()[0].open=true;
 const saved=captureAppView(f.document,431);const fresh=fixture(query);let scroll;
 restoreAppView(fresh.document,saved,{Event:class{constructor(type){this.type=type;}},scrollTo:(x,y)=>{scroll=y;}});
 assert.equal(fresh.controls['library-view'].value,'M');assert.equal(fresh.controls.q.value,'marine');assert.equal(fresh.details().length,f.details().length);assert.equal(fresh.details()[0].open,true);assert.equal(scroll,431);
});
test('both bundles generate wishlist query routes and keep all library resources offline',()=>{
 for(const environment of ['developer','tester']){const index=JSON.parse(fs.readFileSync(`dist/${environment}/search-index.json`));const entries=index.filter(e=>e.app_id==='aquarium-library-explorer');for(const section of manifest.sections.filter(s=>s.query)){const found=entries.find(e=>{const u=new URL(e.url,'https://example.org/');return u.searchParams.get('section')===section.id;});assert(found,section.id);}
 const release=JSON.parse(fs.readFileSync(`dist/${environment}/release.json`));for(const file of ['index.html','library-data.js'])assert(release.resources.some(r=>r.url===`apps/aquarium-library-explorer/${file}`));}
});
