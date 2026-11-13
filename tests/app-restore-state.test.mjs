import test from 'node:test';
import assert from 'node:assert/strict';
import {appRestoreState,captureAppVisit,returnToVisit} from '../src/core/navigation.js';
const root='https://example.test/v2/';
function fixture(state={appView:true,scroll:350,details:[1],expanded:['facts'],inputs:[{id:'filter',value:'ray',checked:true}]}){
 const values=new Map(),storage={setItem:(key,value)=>values.set(key,value),getItem:key=>values.get(key)||null};
 const origin=root+'apps/guide/index.html?station=kelp&visit=hub#facts';
 const target=captureAppVisit(root+'apps/ray/index.html',root,origin,state,storage,'tester','cross');
 return {storage,back:returnToVisit(root,target,storage,'tester')};
}
test('app restoration retains the captured page, query, fragment and previous visit',()=>{
 const f=fixture(),state=appRestoreState(root,f.back,f.storage,'tester');
 assert.deepEqual(state,{appView:true,scroll:350,details:[1],expanded:['facts'],inputs:[{id:'filter',value:'ray',checked:true}]});
 assert.equal(f.back.searchParams.get('visit'),'hub');
});
test('a copied restore token cannot apply another app, query, fragment or visit snapshot',()=>{
 const f=fixture();
 for(const change of [url=>url.pathname='/v2/apps/ray/index.html',url=>url.searchParams.set('station','ocean'),url=>url.hash='#other',url=>url.searchParams.set('visit','other')]){
  const current=new URL(f.back);change(current);
  assert.equal(appRestoreState(root,current,f.storage,'tester'),null);
 }
 assert.equal(appRestoreState(root,f.back,f.storage,'developer'),null);
});
test('malformed app view fields are normalized before restoration',()=>{
 const f=fixture({appView:true,scroll:Infinity,details:[1,1,-1,'2',null],expanded:['facts',null,'facts',3],inputs:[null,{}, {id:'filter',value:'ray',checked:'yes'}]});
 assert.deepEqual(appRestoreState(root,f.back,f.storage,'tester'),{appView:true,scroll:0,details:[1],expanded:['facts'],inputs:[{id:'filter',value:'ray',checked:false}]});
 const malformed=fixture({appView:true,scroll:-5,details:{},expanded:'facts',inputs:42});
 assert.deepEqual(appRestoreState(root,malformed.back,malformed.storage,'tester'),{appView:true,scroll:0,details:[],expanded:[],inputs:[]});
});
test('nested return restores replace an older restore token without losing the app snapshot',()=>{
 const f=fixture();const origin=new URL(f.back);origin.searchParams.set('restore','older');
 const target=captureAppVisit(root+'apps/ray/index.html',root,origin,{appView:true,scroll:100},f.storage,'tester','newer');
 const back=returnToVisit(root,target,f.storage,'tester');
 assert.equal(back.searchParams.get('restore'),'newer');
 assert.equal(appRestoreState(root,back,f.storage,'tester').scroll,100);
});
test('invalid restore storage or malformed URLs leave app entry usable',()=>{
 assert.equal(appRestoreState(root,'invalid',{},'tester'),null);
 const f=fixture();assert.equal(appRestoreState(root,f.back,{getItem(){throw Error('unavailable');}},'tester'),null);
});
