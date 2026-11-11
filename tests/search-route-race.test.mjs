import {renderClassification} from '../src/core/animal-classification.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {listedHubApps} from '../src/core/whale-reference.js';
import {animalIndexEntries,animalGroups} from '../src/core/animal-index.js';
import {searchHub} from '../src/core/search.js';
import {runInNewContext} from 'node:vm';

const source=fs.readFileSync('src/core/hub.js','utf8');
const routeSource=source.slice(source.indexOf('function categories('),source.indexOf("window.addEventListener('hashchange'"));
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
function fixture(){
 const requests=[],frames=[],inputs=[];
 let currentInput=null,currentResults=null,currentCategory=null;
 const view={querySelectorAll(selector){return selector==='.category'?this.children.filter(child=>child.props?.class==='category'):[];},children:[],textContent:'',replaceChildren(...children){this.children=children;this.textContent='';currentInput=children.find(child=>child.props?.id==='query')||null;currentResults=children.find(child=>child.props?.id==='results')||null;currentCategory=children.find(child=>child.props?.id==='search-category')||null;}};
 const node=(tag,props={},...children)=>({tag,props,children,value:'',append(...items){this.children.push(...items);},listeners:[],focused:false,addEventListener(type,listener){this.listeners.push({type,listener});},focus(){this.focused=true;},replaceChildren(...items){this.children=items;}});
 const context={view,node,searchHub,animalIndexEntries,animalGroups,listedHubApps,renderClassification,registry:{categories:[{id:'animals',title:'Animals'},{id:'guides',title:'Guides'}],apps:[{app_id:'ray',category:'animals'},{app_id:'guide',category:'guides'}]},location:{hash:'#search'},document:{querySelector(selector){if(selector==='#query'){if(currentInput&&!inputs.includes(currentInput))inputs.push(currentInput);return currentInput;}if(selector==='#results')return currentResults;if(selector==='#search-category')return currentCategory;return null;},createTextNode:text=>({text})},fetch(){const request=deferred();requests.push(request);return request.promise;},state:{query:'ray',scroll:190},returned:null,index:undefined,remember(){},safeHref:value=>value,requestAnimationFrame:callback=>frames.push(callback),scrollTo(){context.scrolls++;},scrolls:0,bindAnimalFilter(){}};
 const routes=runInNewContext(routeSource+'\n({route,renderRoute});',context);
 return {...routes,context,view,requests,frames,inputs,input:()=>currentInput,results:()=>currentResults,category:()=>currentCategory};
}
function clickRoute(f,destination,{scroll=0,hash=''}={}){
 const callback=source.split('\n').find(line=>line.startsWith("document.addEventListener('click'"));
 let click;
 f.context.document.addEventListener=(type,listener)=>{assert.equal(type,'click');click=listener;};
 Object.assign(f.context,{URL,root:new URL('https://example.test/v2/'),scrollY:scroll,
  environment:{namespace:'tester'},sessionStorage:{},crypto:{randomUUID:()=> 'visit'},
  captureVisit(url,root,origin,state){f.captured=structuredClone(state);return url;}});
 Object.assign(f.context.location,{href:'https://example.test/v2/index.html'+hash,pathname:'/v2/index.html',hash});
 runInNewContext(callback,f.context);
 const link={href:new URL(destination,f.context.location.href).href,target:''};
 click({target:{closest:()=>link},button:0,defaultPrevented:false});
 return link;
}
const response=data=>({ok:true,json:async()=>data});
const entries=[{title:'Ray habitat',text:'ray habitat',url:'apps/ray/index.html#habitat'}];

test('leaving search before its index loads preserves the current Hub view',async()=>{
 const f=fixture(),pending=f.renderRoute();f.context.location.hash='';await f.renderRoute();
 f.requests[0].resolve(response(entries));await pending;
 assert.equal(f.view.children[0].props['data-category'],'animals');assert.equal(f.view.textContent,'');
});
test('late search failures cannot replace a newer help route with an error',async()=>{
 const f=fixture(),pending=f.renderRoute();f.context.location.hash='#help';await f.renderRoute();
 f.requests[0].reject(Error('network unavailable'));await pending;
 assert.equal(f.view.children[1].props.text,'Install & Help');assert.equal(f.view.textContent,'');
});
test('overlapping search arrivals attach input behavior only to the latest view',async()=>{
 const f=fixture(),first=f.renderRoute();f.context.location.hash='#help';await f.renderRoute();
 f.context.location.hash='#search';const second=f.renderRoute(),latest=f.input();
 f.requests[1].resolve(response(entries));await second;
 assert.equal(latest.listeners.length,1);assert.equal(latest.focused,true);
 f.requests[0].resolve(response(entries));await first;
 assert.equal(f.input(),latest);assert.equal(latest.listeners.length,1);
 assert.equal(f.results().children[0].props.href,'apps/ray/index.html#habitat');
});
test('current search load failures render safely and allow a later retry',async()=>{
 const f=fixture(),first=f.renderRoute();f.requests[0].resolve({ok:false,json:async()=>entries});await first;
 assert.equal(f.view.children[1].props.text,'Search index unavailable');
 assert.equal(f.view.children[0].props.href,'#');
 const retry=f.view.children[2];assert.equal(retry.props.text,'Try again');
 const second=retry.listeners[0].listener();f.requests[1].resolve(response(entries));await second;
 assert.equal(f.view.textContent,'');assert.equal(f.input().listeners.length,1);
});
test('successful search keeps multiword matching and search input updates',async()=>{
 const f=fixture(),pending=f.renderRoute();f.requests[0].resolve(response(entries));await pending;
 const input=f.input();input.value='ray habitat';input.listeners[0].listener();
 assert.equal(f.context.state.query,'ray habitat');assert.equal(f.results().children[0].props.href,'apps/ray/index.html#habitat');
 input.value='ray missing';input.listeners[0].listener();assert.equal(f.results().children[0].props.text,'No matching results in the current Hub collection.');
});
test('deferred search scroll restoration cannot move a newer route',async()=>{
 const f=fixture();f.context.returned={state:{query:'ray'}};
 const pending=f.renderRoute();f.requests[0].resolve(response(entries));await pending;
 assert.equal(f.frames.length,1);f.context.location.hash='#help';await f.renderRoute();f.frames[0]();
 assert.equal(f.context.scrolls,0);
});

test('malformed search index records render recoverable errors and are not cached',async()=>{
 for(const data of [{results:entries},null,[null],[{title:'Ray',url:'apps/ray/index.html'}],[{title:42,text:'ray',url:'apps/ray/index.html'}]]){
  const f=fixture(),pending=f.renderRoute();f.requests[0].resolve(response(data));await pending;
  assert.equal(f.view.children[1].props.role,'alert');
  assert.equal(f.view.children[1].props.text,'Search index unavailable');
  const retry=f.view.children[2].listeners[0].listener();f.requests[1].resolve(response(entries));await retry;
  assert.equal(f.input().listeners.length,1);
 }
});

test('category selection filters guide results and survives route return with the query',async()=>{
 const f=fixture(),pending=f.renderRoute();
 const data=[{app_id:'ray',title:'Ray',text:'ray',url:'apps/ray/index.html'},{app_id:'guide',title:'Ray guide',text:'ray',url:'apps/guide/index.html'}];
 f.requests[0].resolve(response(data));await pending;
 f.category().value='guides';f.category().listeners[0].listener();
 assert.equal(f.context.state.searchCategory,'guides');assert.equal(f.context.state.query,'ray');
 assert.equal(f.results().children.length,1);assert.equal(f.results().children[0].props.href,'apps/guide/index.html');
 f.context.location.hash='#help';await f.renderRoute();f.context.location.hash='#search';await f.renderRoute();
 assert.equal(f.input().value,'ray');assert.equal(f.category().value,'guides');
 assert.equal(f.results().children.length,1);
 f.category().value='';f.category().listeners[0].listener();assert.equal(f.results().children.length,2);
});
test('search displays app-title matches before body matches and announces results politely',async()=>{
 const f=fixture(),pending=f.renderRoute();
 f.requests[0].resolve(response([{title:'Guide',text:'ray',url:'apps/guide/index.html'},...entries,{title:'Ray',text:'ray',url:'apps/ray/index.html'}]));await pending;
 assert.equal(f.results().children[0].props.href,'apps/ray/index.html');
 assert.equal(f.results().props['aria-live'],'polite');
});

for(const destination of ['help','history','search'])test(`category scroll restoration cannot move a newer ${destination} route`,async()=>{
 const f=fixture();f.context.location.hash='';await f.renderRoute();
 assert.equal(f.frames.length,1);f.context.location.hash='#'+destination;const next=f.renderRoute();
 f.frames[0]();assert.equal(f.context.scrolls,0);
 if(destination==='search')f.requests[0].resolve(response(entries));await next;
});
test('returning to categories invalidates old frames and restores the latest position',async()=>{
 const f=fixture();f.context.location.hash='';await f.renderRoute();
 f.context.location.hash='#help';await f.renderRoute();
 f.context.state.scroll=420;f.context.location.hash='';await f.renderRoute();
 const positions=[];f.context.scrollTo=(x,y)=>positions.push([x,y]);
 f.frames[0]();assert.deepEqual(positions,[]);
 f.frames[1]();assert.deepEqual(positions,[[0,420]]);
});


test('contextual search arrival restores once and later explicit search visits focus normally',async()=>{
 const f=fixture();f.context.returned={state:{query:'ray',scroll:190}};
 const pending=f.renderRoute();f.requests[0].resolve(response(entries));await pending;
 assert.equal(f.frames.length,1);assert.equal(f.input().focused,false);
 f.frames[0]();assert.equal(f.context.scrolls,1);
 f.context.location.hash='#help';await f.renderRoute();
 f.context.location.hash='#search';await f.renderRoute();
 assert.equal(f.input().focused,true,'a later explicit Search visit must receive normal input focus');
 assert.equal(f.frames.length,1,'the original app-return position must not be replayed');
 assert.equal(f.input().value,'ray','the saved query remains available');
});

test('abandoned contextual search arrival cannot transfer restoration to a newer search visit',async()=>{
 const f=fixture();f.context.returned={state:{query:'ray',scroll:190}};
 const abandoned=f.renderRoute();f.context.location.hash='#help';await f.renderRoute();
 f.context.location.hash='#search';const current=f.renderRoute();
 f.requests[1].resolve(response(entries));await current;
 assert.equal(f.input().focused,true);assert.equal(f.frames.length,0);
 f.requests[0].resolve(response(entries));await abandoned;
 assert.equal(f.frames.length,0);assert.equal(f.context.scrolls,0);
});


test('category route links capture current position before native hash navigation resets scrolling',async()=>{
 for(const destination of ['help','history','search']){
  const f=fixture();f.context.location.hash='';await f.renderRoute();f.frames.shift()();
  clickRoute(f,'#'+destination,{scroll:615});
  assert.equal(f.context.state.categoryScroll,615);
  f.context.scrollY=0;f.context.location.hash='#'+destination;
  const next=f.renderRoute();if(destination==='search')f.requests[0].resolve(response(entries));await next;
  f.context.location.hash='';await f.renderRoute();
  const restored=[];f.context.scrollTo=(x,y)=>restored.push(y);f.frames.at(-1)();
  assert.deepEqual(restored,[615]);
 }
});

test('Search app visits preserve their own position without replacing saved category position',async()=>{
 const f=fixture();clickRoute(f,'#search',{scroll:520});
 clickRoute(f,'apps/ray/index.html#habitat',{scroll:260,hash:'#search'});
 assert.equal(f.captured.scroll,260);assert.equal(f.captured.categoryScroll,520);
 f.context.state=f.captured;f.context.returned={state:f.captured};
 const returned=f.renderRoute();f.requests[0].resolve(response(entries));await returned;
 const restored=[];f.context.scrollTo=(x,y)=>restored.push(y);f.frames.at(-1)();
 assert.deepEqual(restored,[260],'contextual Back first restores Search position');
 f.context.location.hash='';await f.renderRoute();f.frames.at(-1)();
 assert.deepEqual(restored,[260,520],'Back to Hub restores independent category position');
});

test('direct category app visits capture the latest category position in each visit snapshot',()=>{
 const f=fixture();clickRoute(f,'apps/ray/index.html',{scroll:740});
 assert.equal(f.captured.scroll,740);assert.equal(f.captured.categoryScroll,740);
});


test('Search retains typing and category changes made before a delayed index finishes loading',async()=>{
 const f=fixture(),pending=f.renderRoute();
 assert.equal(f.input().value,'ray','saved query is visible while loading');
 f.input().value='kelp';f.input().listeners[0].listener();
 f.category().value='guides';f.category().listeners[0].listener();
 assert.equal(f.context.state.query,'kelp');assert.equal(f.context.state.searchCategory,'guides');
 assert.equal(f.results().children.length,0,'loading must not announce false empty results');
 f.requests[0].resolve(response([
  {app_id:'ray',title:'Kelp ray',text:'kelp',url:'apps/ray/index.html'},
  {app_id:'guide',title:'Kelp guide',text:'kelp',url:'apps/guide/index.html'}
 ]));await pending;
 assert.equal(f.input().value,'kelp');assert.equal(f.category().value,'guides');
 assert.equal(f.results().children.length,1);assert.equal(f.results().children[0].props.href,'apps/guide/index.html');
});
test('Search retry preserves a query entered before a failed index request',async()=>{
 const f=fixture(),pending=f.renderRoute();f.input().value='kelp';f.input().listeners[0].listener();
 f.requests[0].reject(Error('network unavailable'));await pending;
 const retry=f.view.children[2].listeners[0].listener();
 assert.equal(f.input().value,'kelp');f.requests[1].resolve(response([{title:'Kelp',text:'kelp',url:'apps/guide/index.html'}]));await retry;
 assert.equal(f.input().value,'kelp');assert.equal(f.results().children[0].props.href,'apps/guide/index.html');
});
test('detached loading Search controls cannot overwrite a later route query',async()=>{
 const f=fixture(),pending=f.renderRoute(),abandoned=f.input();
 f.context.location.hash='#help';await f.renderRoute();
 f.context.state.query='later query';abandoned.value='stale query';abandoned.listeners[0].listener();
 assert.equal(f.context.state.query,'later query');
 f.requests[0].resolve(response(entries));await pending;
 assert.equal(f.view.children[1].props.text,'Install & Help');assert.equal(f.context.state.query,'later query');
});


test('delayed Search completion does not refocus query after the user changes category',async()=>{
 const f=fixture(),pending=f.renderRoute();
 f.category().value='guides';f.category().listeners[0].listener();
 f.requests[0].resolve(response([{app_id:'guide',title:'Ray guide',text:'ray',url:'apps/guide/index.html'}]));await pending;
 assert.equal(f.input().focused,false,'completion must not move focus from a category the user selected');
 assert.equal(f.category().value,'guides');assert.equal(f.results().children[0].props.href,'apps/guide/index.html');
});
test('editing a contextual Search before loading completes cancels the old scroll restoration',async()=>{
 const f=fixture();f.context.returned={state:{query:'ray',scroll:190}};
 const pending=f.renderRoute();f.input().value='kelp';f.input().listeners[0].listener();
 f.requests[0].resolve(response([{title:'Kelp',text:'kelp',url:'apps/guide/index.html'}]));await pending;
 assert.equal(f.frames.length,0,'old app-return scroll must not override an explicit new query');
 assert.equal(f.context.scrolls,0);assert.equal(f.input().value,'kelp');
 assert.equal(f.results().children[0].props.href,'apps/guide/index.html');
});
test('editing Search after restoration is queued cancels its stale scroll frame',async()=>{
 const f=fixture();f.context.returned={state:{query:'ray',scroll:190}};
 const pending=f.renderRoute();f.requests[0].resolve(response(entries));await pending;
 assert.equal(f.frames.length,1,'untouched contextual arrival still queues restoration');
 f.input().value='ray missing';f.input().listeners[0].listener();f.frames[0]();
 assert.equal(f.context.scrolls,0);assert.equal(f.context.state.query,'ray missing');
 assert.equal(f.results().children[0].props.text,'No matching results in the current Hub collection.');
});
