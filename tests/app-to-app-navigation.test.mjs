import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {captureVisit,captureAppVisit,visitContext,returnToVisit,mainHubURL} from '../src/core/navigation.js';

const root='https://example.test/v2/';
function storage(){const values=new Map();return {setItem:(key,value)=>values.set(key,value),getItem:key=>values.get(key)||null};}
const snapshot=()=>({appView:true,scroll:480,details:[1],expanded:['habitat'],inputs:[{id:'station',value:'kelp',checked:false}]});

test('app cross-link Back restores originating page, query, fragment and view',()=>{
 const store=storage(),state=snapshot();
 const destination=captureAppVisit(root+'apps/ray/index.html?mode=guide#habitat',root,root+'apps/guide/index.html?station=kelp#facts',state,store,'tester','app-link');
 assert.equal(destination.searchParams.get('visit'),'app-link');
 assert.equal(destination.searchParams.get('mode'),'guide');
 assert.equal(destination.hash,'#habitat');
 const back=returnToVisit(root,destination,store,'tester');
 assert.equal(back.pathname,'/v2/apps/guide/index.html');
 assert.equal(back.searchParams.get('station'),'kelp');
 assert.equal(back.searchParams.get('restore'),'app-link');
 assert.equal(back.hash,'#facts');
 assert.deepEqual(visitContext(root,'app-link',store,'tester').state,state);
 state.details.push(2);
 assert.deepEqual(visitContext(root,'app-link',store,'tester').state.details,[1]);
});

test('Hub to app to app chain retains both levels of contextual Back',()=>{
 const store=storage(),hubState={scroll:250,open:['animals'],query:'ray'};
 const first=captureVisit('apps/guide/index.html',root,root+'index.html#search',hubState,store,'tester','hub-visit');
 const second=captureAppVisit(root+'apps/ray/index.html',root,first,snapshot(),store,'tester','cross-visit');
 const backToApp=returnToVisit(root,second,store,'tester');
 assert.equal(backToApp.searchParams.get('visit'),'hub-visit');
 assert.equal(backToApp.searchParams.get('restore'),'cross-visit');
 const backToHub=returnToVisit(root,backToApp,store,'tester');
 assert.equal(backToHub.pathname,'/v2/index.html');
 assert.equal(backToHub.hash,'#search');
 assert.deepEqual(visitContext(root,'hub-visit',store,'tester').state,hubState);
 assert.equal(mainHubURL(root).pathname,'/v2/index.html');
});

test('app contexts remain isolated between tester and developer namespaces',()=>{
 const store=storage(),target=captureAppVisit(root+'apps/ray/index.html',root,root+'apps/guide/index.html',snapshot(),store,'tester','cross-visit');
 assert.equal(visitContext(root,'cross-visit',store,'developer'),null);
 assert.equal(returnToVisit(root,target,store,'developer').searchParams.get('home'),'1');
});

test('cross-app capture rejects unsafe sources and destinations',()=>{
 const store=storage(),valid=root+'apps/guide/index.html';
 for(const unsafe of ['https://elsewhere.test/v2/apps/ray/index.html','https://example.test/v2-other/apps/ray/index.html',root+'search-index.json',root+'apps/ray/%2fsecret.html',root+'apps/ray/%5csecret.html',root+'apps/ray/%25secret.html']){
  assert.equal(captureAppVisit(unsafe,root,valid,snapshot(),store,'tester','bad').searchParams.has('visit'),false,unsafe);
  assert.equal(captureAppVisit(valid,root,unsafe,snapshot(),store,'tester','bad').searchParams.has('visit'),false,unsafe);
 }
 assert.equal(visitContext(root,'bad',store,'tester'),null);
});

test('same-page links, invalid tokens and non-app snapshots cannot create app contexts',()=>{
 const store=storage(),origin=root+'apps/guide/index.html';
 for(const [destination,state,id] of [[origin+'#facts',snapshot(),'same-page'],[root+'apps/ray/index.html',snapshot(),'../invalid'],[root+'apps/ray/index.html',{scroll:1},'no-view']]){
  assert.equal(captureAppVisit(destination,root,origin,state,store,'tester',id).searchParams.has('visit'),false);
  assert.equal(visitContext(root,id,store,'tester'),null);
 }
});

test('restoring app URLs requires an explicit app context and app view',()=>{
 const store=storage();
 for(const value of [{url:root+'apps/guide/index.html',state:snapshot()},{type:'app',url:root+'apps/guide/index.html',state:{}},{type:'app',url:'https://elsewhere.test/v2/apps/guide/index.html',state:snapshot()}]){
  store.setItem('tester:return:forged',JSON.stringify(value));
  assert.equal(visitContext(root,'forged',store,'tester'),null);
 }
});

test('unavailable session storage leaves cross-links usable with safe Back fallback',()=>{
 const broken={setItem(){throw Error('unavailable');},getItem(){throw Error('unavailable');}};
 const target=captureAppVisit(root+'apps/ray/index.html#facts',root,root+'apps/guide/index.html',snapshot(),broken,'tester','unavailable');
 assert.equal(target.searchParams.has('visit'),false);
 assert.equal(target.hash,'#facts');
 assert.equal(returnToVisit(root,target,broken,'tester').searchParams.get('home'),'1');
});

test('shared application contract uses the app-specific capture interface',()=>{
 const source=fs.readFileSync('src/core/app-contract.js','utf8');
 assert.match(source,/link\.href=captureAppVisit\(/);
 assert.doesNotMatch(source,/link\.href=captureVisit\(/);
});
