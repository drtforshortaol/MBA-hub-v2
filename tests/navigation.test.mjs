import test from 'node:test';import assert from 'node:assert/strict';import {mainHubURL,restoredHubState,captureVisit,visitContext,returnToVisit} from '../src/core/navigation.js';
test('MBA Hub action returns to the correct hosting scope and main view',()=>{const url=mainHubURL('https://example.test/MBA-hub-v2-test/');assert.equal(url.pathname,'/MBA-hub-v2-test/index.html');assert.equal(url.searchParams.get('home'),'1');assert.equal(url.hash,'');});
test('explicit Hub return resets position and categories',()=>{const state={scroll:860,open:['volunteer-tools'],query:'kelp'};assert.deepEqual(restoredHubState(state,'https://example.test/index.html?home=1'),{scroll:0,open:[],query:'kelp'});assert.equal(state.scroll,860);});
test('contextual Back preserves previous view position and open category',()=>{const state={scroll:860,open:['volunteer-tools'],query:'kelp'};assert.deepEqual(restoredHubState(state,'https://example.test/index.html'),state);});
const root='https://example.test/v2/';
function storage(){const values=new Map();return {setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k)||null};}
test('Back remains contextual after Return to Hub and another app visit',()=>{const store=storage(),firstState={scroll:860,open:['volunteer-tools']};const first=captureVisit('apps/one/index.html',root,root+'index.html',firstState,store,'tester','visit-one');const top=restoredHubState(firstState,mainHubURL(root));assert.equal(top.scroll,0);const secondState={...top,scroll:960,open:['volunteer-tools']},second=captureVisit('apps/two/index.html',root,root+'index.html',secondState,store,'tester','visit-two');const back=returnToVisit(root,second,store,'tester');assert.equal(back.searchParams.get('restore'),'visit-two');assert.deepEqual(visitContext(root,'visit-two',store,'tester').state,secondState);assert.deepEqual(visitContext(root,'visit-one',store,'tester').state,firstState);assert.equal(returnToVisit(root,first,store,'tester').searchParams.get('restore'),'visit-one');});
test('search result return keeps the search route and query',()=>{const store=storage(),state={query:'kelp',scroll:210},app=captureVisit('apps/one/index.html#relate',root,root+'index.html#search',state,store,'tester','search-visit');const back=returnToVisit(root,app,store,'tester');assert.equal(back.hash,'#search');assert.equal(app.hash,'#relate');assert.equal(visitContext(root,'search-visit',store,'tester').state.query,'kelp');});
test('return contexts do not cross environment or URL-scope boundaries',()=>{const store=storage(),app=captureVisit('apps/one/index.html',root,root+'index.html',{},store,'tester','visit');assert.equal(returnToVisit(root,app,store,'developer').searchParams.get('home'),'1');store.setItem('tester:return:bad',JSON.stringify({url:'https://other.test/'}));assert.equal(visitContext(root,'bad',store,'tester'),null);});
test('direct app entry has a safe main-Hub fallback',()=>{assert.equal(returnToVisit(root,root+'apps/one/index.html',storage(),'tester').searchParams.get('home'),'1');});

test('animal filter clears pressed state when the active letter is toggled off',async()=>{const {readFileSync}=await import('node:fs');const source=readFileSync(new URL('../src/core/hub.js',import.meta.url),'utf8');assert.match(source,/String\(Boolean\(letter\)\&\&x\.textContent===letter\)/);assert.equal(Boolean('')&&'A'==='A',false);assert.equal(Boolean('A')&&'A'==='A',true);});

test('navigation snapshots reject non-app destinations and non-Hub restore origins',()=>{const store=storage();const other=captureVisit(root+'search-index.json',root,root+'index.html',{},store,'tester','not-app');assert.equal(other.searchParams.has('visit'),false);store.setItem('tester:return:bad-origin',JSON.stringify({url:root+'apps/one/index.html',state:{}}));assert.equal(visitContext(root,'bad-origin',store,'tester'),null);});

test('visit capture rejects invalid tokens and non-Hub origins',()=>{const store=storage();const badToken=captureVisit(root+'apps/one/index.html',root,root+'index.html',{},store,'tester','../../invalid');assert.equal(badToken.searchParams.has('visit'),false);const badSource=captureVisit(root+'apps/one/index.html',root,root+'apps/other/index.html',{},store,'tester','valid-id');assert.equal(badSource.searchParams.has('visit'),false);assert.equal(visitContext(root,'valid-id',store,'tester'),null);});

test('contextual return preserves distinct search and category snapshots',()=>{const store=storage();const category={scroll:640,open:['animals'],query:'ray'};const search={scroll:190,open:[],query:'nudibranch'};const a=captureVisit('apps/ray/index.html',root,root+'index.html',category,store,'tester','category-snapshot');const b=captureVisit('apps/nudibranch/index.html',root,root+'index.html#search',search,store,'tester','search-snapshot');assert.deepEqual(visitContext(root,'category-snapshot',store,'tester').state,category);assert.deepEqual(visitContext(root,'search-snapshot',store,'tester').state,search);assert.equal(returnToVisit(root,a,store,'tester').hash,'');assert.equal(returnToVisit(root,b,store,'tester').hash,'#search');});
test('visit snapshots are isolated from later mutations to the original state',()=>{const store=storage(),state={scroll:100,open:['animals'],query:'kelp'};captureVisit('apps/one/index.html',root,root+'index.html',state,store,'tester','immutable-snapshot');state.open.push('exhibits');state.scroll=900;assert.deepEqual(visitContext(root,'immutable-snapshot',store,'tester').state,{scroll:100,open:['animals'],query:'kelp'});});
test('cross-origin app destinations cannot capture a Hub visit',()=>{const store=storage();const target=captureVisit('https://elsewhere.test/v2/apps/one/index.html',root,root+'index.html',{},store,'tester','cross-origin');assert.equal(target.searchParams.has('visit'),false);assert.equal(visitContext(root,'cross-origin',store,'tester'),null);});
test('similarly prefixed application paths outside the hosting scope are rejected',()=>{const store=storage();const target=captureVisit('https://example.test/v2-other/apps/one/index.html',root,root+'index.html',{},store,'tester','outside-scope');assert.equal(target.searchParams.has('visit'),false);});
test('invalid restore tokens fall back to the main Hub',()=>{const store=storage();const target=returnToVisit(root,root+'apps/one/index.html?visit=../../bad',store,'tester');assert.equal(target.searchParams.get('home'),'1');assert.equal(visitContext(root,'../../bad',store,'tester'),null);});

test('malformed stored navigation state cannot restore an invalid snapshot',()=>{const store=storage();for(const value of [null,42,'invalid',[],true]){store.setItem('tester:return:malformed',JSON.stringify({url:root+'index.html#search',state:value}));assert.equal(visitContext(root,'malformed',store,'tester'),null);assert.equal(returnToVisit(root,root+'apps/one/index.html?visit=malformed',store,'tester').searchParams.get('home'),'1');}});

test('Hub initializes safely when session navigation data is malformed',async()=>{const {readFileSync}=await import('node:fs');const source=readFileSync(new URL('../src/core/hub.js',import.meta.url),'utf8');assert.match(source,/if\(!state\|\|typeof state!=='object'\|\|Array\.isArray\(state\)\)state=\{\};/);assert.match(source,/let url;try\{url=new URL\(link\.href\);\}catch\{return;\}/);});

test('Hub link validation enforces application scope and rejects malformed paths',async()=>{
 const {readFileSync}=await import('node:fs');
 const {runInNewContext}=await import('node:vm');
 const source=readFileSync(new URL('../src/core/hub.js',import.meta.url),'utf8');
 const declaration=source.split('\n').find(line=>line.startsWith('const safeHref='));
 assert(declaration,'Hub URL validator must be present');
 const script=declaration.replaceAll('import.meta.url',JSON.stringify(root+'core/hub.js'))+'\nsafeHref';
 const safe=runInNewContext(script,{URL,location:{origin:'https://example.test'}});
 assert.equal(safe('apps/one/index.html'),root+'apps/one/index.html');
 for(const url of ['https://other.test/v2/apps/one/index.html','https://example.test/v2-other/apps/one/index.html','../apps/one/index.html','/v2/apps/one/index.html','apps/%2e%2e/escape.html','apps/one\\\\index.html','search-index.json','not-a-valid-app.html','javascript:alert(1)',''])assert.equal(safe(url),'#','unsafe link: '+url);
});

test('contextual Back retains app query parameters and deep-link fragments',()=>{
 const store=storage(),origin=root+'index.html#search';
 const app=captureVisit('apps/ray/index.html?mode=guide#habitat',root,origin,{query:'ray',scroll:350},store,'tester','deep-link');
 assert.equal(app.searchParams.get('mode'),'guide');
 assert.equal(app.searchParams.get('visit'),'deep-link');
 assert.equal(app.hash,'#habitat');
 const back=returnToVisit(root,app,store,'tester');
 assert.equal(back.hash,'#search');
 assert.equal(back.searchParams.get('restore'),'deep-link');
 assert.deepEqual(visitContext(root,'deep-link',store,'tester').state,{query:'ray',scroll:350});
});
test('contextual Back supports nested app pages without losing Hub scope',()=>{
 const store=storage();
 const app=captureVisit('apps/ray/topics/behavior.html',root,root+'index.html',{scroll:88,open:['animals']},store,'developer','nested-app');
 assert.equal(app.pathname,'/v2/apps/ray/topics/behavior.html');
 assert.equal(app.searchParams.get('visit'),'nested-app');
 assert.equal(returnToVisit(root,app,store,'developer').pathname,'/v2/index.html');
 assert.equal(returnToVisit(root,app,store,'tester').searchParams.get('home'),'1');
});
test('restoration removes stale home flag without changing the captured search route',()=>{
 const store=storage();
 const app=captureVisit('apps/ray/index.html',root,root+'index.html#search',{query:'seahorse'},store,'tester','restore-route');
 const back=returnToVisit(root,app,store,'tester');
 assert.equal(back.searchParams.has('home'),false);
 assert.equal(back.hash,'#search');
 assert.equal(back.searchParams.get('restore'),'restore-route');
});

test('Hub sanitizes malformed category, scroll, and search fields before rendering',async()=>{
 const {readFileSync}=await import('node:fs');
 const {runInNewContext}=await import('node:vm');
 const source=readFileSync(new URL('../src/core/hub.js',import.meta.url),'utf8');
 const lines=source.split('\n').filter(line=>line.startsWith('state.open=')||line.startsWith('state.scroll=')||line.startsWith('state.query='));
 assert.equal(lines.length,3,'expected three navigation field guards');
 const normalize=runInNewContext('(state)=>{'+lines.join('\n')+'return state;}',{Number,Array,Set,registry:{categories:[{id:'animals'},{id:'exhibits'}]}});
 const malformed=normalize({open:'animals',scroll:Infinity,query:{text:'ray'}});
 assert.equal(malformed.scroll,0);
 assert.equal(malformed.query,'');
 assert.deepEqual(Array.from(malformed.open),[]);
 const valid=normalize({open:['animals',null,'exhibits',4],scroll:245,query:'nudibranch'});
 assert.deepEqual(Array.from(valid.open),['animals','exhibits']);
 assert.equal(valid.scroll,245);
 assert.equal(valid.query,'nudibranch');
});

test('restored category IDs must exist in the current registry and cannot duplicate',async()=>{
 const {readFileSync}=await import('node:fs');
 const {runInNewContext}=await import('node:vm');
 const source=readFileSync(new URL('../src/core/hub.js',import.meta.url),'utf8');
 const line=source.split('\n').find(item=>item.startsWith('state.open='));
 assert(line,'category restoration guard missing');
 const restore=runInNewContext('(state)=>{'+line+'return state.open;}',{Array,Set,registry:{categories:[{id:'animals'},{id:'exhibits'}]}});
 assert.deepEqual(Array.from(restore({open:['animals','animals','unknown',null,'exhibits']})),['animals','exhibits']);
 assert.deepEqual(Array.from(restore({open:'animals'})),[]);
});

test('visit capture rejects encoded and backslash application paths',()=>{
 const store=storage();
 for(const destination of [
  root+'apps/%2e%2e/escape.html',
  root+'apps/ray/%2fsecret.html',
  root+'apps/ray/%5csecret.html',
  root+'apps/ray/%25secret.html'
 ]){
  const app=captureVisit(destination,root,root+'index.html',{},store,'tester','blocked-path');
  assert.equal(app.searchParams.has('visit'),false,'unsafe app path '+destination);
 }
 assert.equal(visitContext(root,'blocked-path',store,'tester'),null);
 const good=captureVisit(root+'apps/ray/index.html',root,root+'index.html',{},store,'tester','safe-path');
 assert.equal(good.searchParams.get('visit'),'safe-path');
});
