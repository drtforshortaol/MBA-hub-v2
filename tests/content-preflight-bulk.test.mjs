import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectAllRegistrations} from '../scripts/content-preflight.mjs';

function context(){
 const app=id=>({schema_version:1,app_id:id,title:id,owner:'guide',version:'1',entry_point:'apps/'+id+'/index.html',type:'species',category:'animals',status:'development',offline_assets:['apps/'+id+'/index.html'],sections:[{id:'overview',title:'Overview'}],media:[],knowledge:[],dependencies:[],cross_links:[]});
 return {apps:[app('ray'),app('shark')],categories:[{id:'animals',title:'Animals'}],media:{assets:[]},knowledge:{records:[]},exists:p=>['apps/ray/index.html','apps/shark/index.html'].includes(p)};
}
test('bulk preflight reports all registered apps',()=>{
 const result=inspectAllRegistrations(context());
 assert.equal(result.ready,true);
 assert.equal(result.checked,2);
 assert.deepEqual(result.results.map(x=>x.app_id),['ray','shark']);
});
test('bulk preflight preserves failures for each app',()=>{
 const c=context();c.apps[0].category='missing';c.apps[1].sections=[{title:'No ID'}];
 const result=inspectAllRegistrations(c);
 assert.equal(result.ready,false);
 assert.equal(result.checked,2);
 assert(result.results[0].errors.some(e=>e.includes('unknown category')));
 assert(result.results[1].errors.some(e=>e.includes('invalid section')));
});
test('bulk preflight handles empty registry without modifying it',()=>{
 const c=context();c.apps=[];
 const result=inspectAllRegistrations(c);
 assert.equal(result.ready,true);
 assert.equal(result.checked,0);
 assert.deepEqual(result.results,[]);
});
