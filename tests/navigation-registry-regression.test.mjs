import test from 'node:test';
import assert from 'node:assert/strict';
import {validate} from '../scripts/build.mjs';

function fixture(){
 const apps=[
  {schema_version:1,app_id:'ray',title:'Ray',owner:'guide',version:'1',entry_point:'apps/ray/index.html',type:'species',category:'animals',status:'development',offline_assets:['apps/ray/index.html'],sections:[{id:'overview',title:'Overview'}],media:[],knowledge:[],dependencies:[],cross_links:[]},
  {schema_version:1,app_id:'shark',title:'Shark',owner:'guide',version:'1',entry_point:'apps/shark/index.html',type:'species',category:'animals',status:'development',offline_assets:['apps/shark/index.html'],sections:[{id:'overview',title:'Overview'}],media:[],knowledge:[],dependencies:[],cross_links:[]}
 ];
 return {apps,categories:[{id:'animals',title:'Animals'}],media:{assets:[]},knowledge:{records:[]},exists:p=>p==='apps/ray/index.html'||p==='apps/shark/index.html'};
}
const check=change=>{const x=fixture();change(x);return validate(x);};
test('valid cross-app section navigation is accepted',()=>{
 assert.deepEqual(check(x=>x.apps[0].cross_links=[{app_id:'shark',section_id:'overview'}]),[]);
});
test('cross-app links to missing sections are rejected',()=>{
 assert(check(x=>x.apps[0].cross_links=[{app_id:'shark',section_id:'not-found'}]).some(e=>e.includes('dangling cross-link shark')));
});
test('unscoped self-links are rejected while scoped self-links work',()=>{
 assert(check(x=>x.apps[0].cross_links=[{app_id:'ray'}]).some(e=>e.includes('unscoped self-link')));
 assert.deepEqual(check(x=>x.apps[0].cross_links=[{app_id:'ray',section_id:'overview'}]),[]);
});
test('dependency versions must match the referenced app',()=>{
 assert(check(x=>x.apps[0].dependencies=[{id:'shark',version:'2'}]).some(e=>e.includes('invalid dependency shark')));
 assert.deepEqual(check(x=>x.apps[0].dependencies=[{id:'shark',version:'1'}]),[]);
});
test('cyclic application dependencies are rejected',()=>{
 assert(check(x=>{x.apps[0].dependencies=[{id:'shark',version:'1'}];x.apps[1].dependencies=[{id:'ray',version:'1'}];}).some(e=>e.includes('circular dependency')));
});
test('duplicate sections are rejected to preserve deep-link identity',()=>{
 assert(check(x=>x.apps[0].sections.push({id:'overview',title:'Repeated'})).some(e=>e.includes('duplicate section overview')));
});
test('duplicate offline assets are rejected',()=>{
 assert(check(x=>x.apps[0].offline_assets.push('apps/ray/index.html')).some(e=>e.includes('duplicate offline asset')));
});
test('duplicate entry points are rejected across applications',()=>{
 assert(check(x=>x.apps[1].entry_point='apps/ray/index.html').some(e=>e.includes('duplicate entry point')));
});
