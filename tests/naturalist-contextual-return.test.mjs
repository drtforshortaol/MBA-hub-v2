import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {captureAppView,restoreAppView} from '../src/core/app-view.js';

const data=readFileSync(new URL('../src/apps/naturalist-field-notes/data.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/apps/naturalist-field-notes/app.js',import.meta.url),'utf8');
function fixture(href='https://example.test/v2/apps/naturalist-field-notes/index.html'){
 const handlers={},scrolls=[];let markup='',details=[];
 const location={};const update=url=>{const value=new URL(url);location.href=value.href;location.search=value.search;};update(href);
 const control=(id,type='button')=>({id,type,tagName:type==='search'?'INPUT':'BUTTON',value:'',checked:false,
  addEventListener(name,fn){this[name]=fn;},dispatchEvent(event){this[event.type]?.(event);}});
 const controls=Object.fromEntries(['search','clearSearch','clearCache','offlineStatus'].map(id=>[id,control(id,id==='search'?'search':'button')]));
 const content={replaceChildren(fragment){markup=fragment.nodes.map(node=>node.markup).join('');details=markup.includes('class="card article"')?[{open:false}]:[];}};
 const document={defaultView:{CustomEvent:class{constructor(type,options){Object.assign(this,{type},options);}}},
  addEventListener(name,fn){handlers[name]=fn;},dispatchEvent(event){handlers[event.type]?.(event);return true;},
  getElementById:id=>controls[id]||null,
  querySelector:selector=>selector==='#content'?content:controls[selector.slice(1)],
  querySelectorAll(selector){if(selector==='input[id],select[id],textarea[id]')return [controls.search];if(selector==='details')return details;return [];},
  createDocumentFragment(){return {nodes:[],appendChild(node){this.nodes.push(node);node.owner.firstChild=null;},querySelectorAll(){return [];}};}
 };
 const context={document,content,location,URL,URLSearchParams,navigator:{onLine:true},
  history:{replaceState(a,b,url){update(String(url));}},window:{location,addEventListener(){},scrollTo:(...args)=>scrolls.push(args)},
  DOMParser:class{parseFromString(value){const body={};body.firstChild={markup:value,owner:body};return {body};}},
  console:{warn(){}},setTimeout(){}};
 vm.createContext(context);vm.runInContext(data+'\n'+app,context,{timeout:3000});
 return {context,document,controls,location,scrolls,get markup(){return markup;},get details(){return details;},
  openFirst(){vm.runInContext('openIssue(FIELD_NOTES[0].id)',context);},
  options:{Event:class{constructor(type){this.type=type;}},scrollTo:(...args)=>scrolls.push(args)}};
}

test('Naturalist contextual Back retains the selected note, prior query, disclosures and scroll',()=>{
 const original=fixture();original.controls.search.value='whale';original.controls.search.dispatchEvent({type:'input'});original.openFirst();
 assert.match(original.markup,/class="card article"/);original.details[0].open=true;
 const state=captureAppView(original.document,430),returned=fixture(original.location.href);
 restoreAppView(returned.document,state,returned.options);
 assert.match(returned.markup,/class="card article"/,'restored query must not replace the selected note with search results');
 assert.equal(returned.controls.search.value,'whale');assert.equal(returned.details[0].open,true);
 assert.equal(new URL(returned.location.href).searchParams.get('note'),new URL(original.location.href).searchParams.get('note'));
 assert.deepEqual(returned.scrolls.at(-1),[0,430]);
});

test('Naturalist return to a search route stays in search and unknown note routes do not open an article',()=>{
 for(const suffix of ['', '?note=not-a-published-note']){
  const f=fixture('https://example.test/v2/apps/naturalist-field-notes/index.html'+suffix);
  restoreAppView(f.document,{inputs:[{id:'search',value:'whale',checked:false}],details:[],expanded:[],scroll:90},f.options);
  assert.match(f.markup,/class="search-results"/);assert.doesNotMatch(f.markup,/class="card article"/);
  assert.deepEqual(f.scrolls.at(-1),[0,90]);
 }
});

test('clearing Naturalist search also clears a stale note deep link',()=>{
 const f=fixture();
 f.openFirst();
 assert.ok(new URL(f.location.href).searchParams.has('note'));
 f.controls.search.value='whale';
 f.controls.clearSearch.onclick();
 assert.equal(new URL(f.location.href).searchParams.has('note'),false);
 assert.equal(f.controls.search.value,'');
 assert.match(f.markup,/class="home-intro"/);
});

test('typing in Naturalist search drops stale note route without breaking restored input replay',()=>{
 const f=fixture();
 f.openFirst();
 f.controls.search.value='whale';
 f.controls.search.dispatchEvent({type:'input',isTrusted:true});
 assert.equal(new URL(f.location.href).searchParams.has('note'),false);
 assert.match(f.markup,/class="search-results"/);
 const selected=fixture();
 selected.openFirst();
 selected.controls.search.value='whale';
 selected.controls.search.dispatchEvent({type:'input',isTrusted:false});
 assert.ok(new URL(selected.location.href).searchParams.has('note'),
  'synthetic contextual-back input must preserve the selected note route');
});

test('optional Naturalist photographs may be absent',()=>{
 const f=fixture();
 assert.equal(vm.runInContext('photo(null)',f.context),'');
 assert.equal(vm.runInContext('photo({})',f.context),'');
});
