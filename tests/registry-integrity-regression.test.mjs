import test from 'node:test';
import assert from 'node:assert/strict';
import {validate} from '../scripts/build.mjs';

const make=()=>({
 categories:[{id:'animals',title:'Animals'}],
 media:{assets:[]},
 knowledge:{records:[]},
 exists:()=>true,
 apps:[{
  schema_version:1,app_id:'ray',title:'Ray',owner:'team',version:'1.0.0',
  entry_point:'apps/ray/index.html',type:'species',category:'animals',
  status:'development',offline_assets:['apps/ray/index.html'],
  sections:[{id:'overview',title:'Overview'}],media:[],knowledge:[],
  dependencies:[],cross_links:[]
 }]
});

test('registry baseline accepts a minimal internally consistent application',()=>{
 assert.deepEqual(validate(make()),[]);
});

test('registry rejects duplicate application IDs and entry points',()=>{
 const fixture=make();
 fixture.apps.push({...fixture.apps[0],sections:[...fixture.apps[0].sections]});
 const errors=validate(fixture);
 assert(errors.some(e=>e.includes('duplicate app ray')));
 assert(errors.some(e=>e.includes('duplicate entry point')));
});

test('registry detects missing offline entry, unsafe paths and repeated assets',()=>{
 const fixture=make();
 fixture.apps[0].offline_assets=['apps/ray/../bad.html','apps/ray/../bad.html'];
 const errors=validate(fixture);
 assert(errors.some(e=>e.includes('entry absent from offline bundle')));
 assert(errors.some(e=>e.includes('missing/unsafe asset')));
 assert(errors.some(e=>e.includes('duplicate offline asset')));
});

test('registry detects dangling cross-links and invalid section references',()=>{
 const fixture=make();
 fixture.apps[0].cross_links=[{app_id:'missing'},{app_id:'ray',section_id:'not-present'}];
 const errors=validate(fixture);
 assert(errors.some(e=>e.includes('dangling cross-link missing')));
 assert(errors.some(e=>e.includes('dangling cross-link ray')));
});

test('registry detects dependency cycles and mismatched interface versions',()=>{
 const fixture=make();
 const second={...fixture.apps[0],app_id:'kelp',title:'Kelp',entry_point:'apps/kelp/index.html',offline_assets:['apps/kelp/index.html'],sections:[{id:'overview'}],dependencies:[{id:'ray',version:'1.0.0'}],cross_links:[]};
 fixture.apps[0].dependencies=[{id:'kelp',version:'1.0.0'},{id:'navigation',version:'9.0.0'}];
 fixture.apps.push(second);
 const errors=validate(fixture);
 assert(errors.some(e=>e.includes('circular dependency')));
 assert(errors.some(e=>e.includes('incompatible interface navigation')));
});

test('registry rejects unknown categories and unrecognized app templates',()=>{
 const fixture=make();
 fixture.apps[0].category='unknown';
 fixture.apps[0].type='executable';
 const errors=validate(fixture);
 assert(errors.some(e=>e.includes('unknown category')));
 assert(errors.some(e=>e.includes('unknown template')));
});
