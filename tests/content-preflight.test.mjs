import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectRegistration} from '../scripts/content-preflight.mjs';

function fixture(){
 const app={schema_version:1,app_id:'ray',title:'Ray',owner:'guide',version:'1.0.0',entry_point:'apps/ray/index.html',type:'species',category:'animals',status:'development',offline_assets:['apps/ray/index.html','shared/media/ray.svg'],sections:[{id:'overview',title:'Overview'}],media:['ray-photo'],knowledge:[],dependencies:[],cross_links:[]};
 return {apps:[app],categories:[{id:'animals',title:'Animals'}],media:{assets:[{asset_id:'ray-photo',path:'shared/media/ray.svg',owner:'ray',alt:'Ray photo',credit:'Guide',permission:'approved',offline:true}]},knowledge:{records:[]},exists:p=>['apps/ray/index.html','shared/media/ray.svg'].includes(p),appId:'ray'};
}
test('content preflight accepts complete registered species with offline media',()=>{
 const result=inspectRegistration(fixture());
 assert.equal(result.ready,true);
 assert.deepEqual(result.errors,[]);
});
test('content preflight identifies missing offline media entry',()=>{
 const f=fixture();f.apps[0].offline_assets=['apps/ray/index.html'];
 const result=inspectRegistration(f);
 assert.equal(result.ready,false);
 assert(result.errors.some(e=>e.includes('offline media not registered: ray-photo')));
});
test('content preflight identifies missing target app',()=>{
 const f=fixture();f.appId='unknown';
 const result=inspectRegistration(f);
 assert.equal(result.ready,false);
 assert(result.errors.includes('unknown app: unknown'));
});
test('content preflight identifies sections without stable IDs and titles',()=>{
 const f=fixture();f.apps[0].sections=[{id:'overview'}];
 const result=inspectRegistration(f);
 assert.equal(result.ready,false);
 assert(result.errors.some(e=>e.includes('invalid section')));
});
test('content preflight includes baseline registration errors',()=>{
 const f=fixture();f.apps[0].category='unregistered';
 const result=inspectRegistration(f);
 assert.equal(result.ready,false);
 assert(result.errors.some(e=>e.includes('unknown category')));
});
