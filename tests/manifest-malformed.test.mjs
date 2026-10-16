import test from 'node:test';
import assert from 'node:assert/strict';
import {validate} from '../scripts/build.mjs';

const base=()=>({
 apps:[{schema_version:1,app_id:'sample',title:'Sample',owner:'platform',version:'1.0.0',entry_point:'apps/sample/index.html',type:'reference',category:'reference',status:'development',offline_assets:['apps/sample/index.html'],sections:[],media:[],knowledge:[],dependencies:[],cross_links:[]}],
 categories:[{id:'reference'}],media:{assets:[]},knowledge:{records:[]},exists:()=>true
});

test('malformed manifest arrays produce validation errors rather than exceptions',()=>{
 for(const field of ['offline_assets','sections','media','knowledge','dependencies','cross_links']){
  const data=base();delete data.apps[0][field];
  assert.doesNotThrow(()=>validate(data),field);
  assert(validate(data).includes(`invalid ${field} in sample`),field);
 }
});

test('duplicate entry points are rejected',()=>{
 const data=base();data.apps.push({...data.apps[0],app_id:'another'});
 assert(validate(data).some(error=>error.includes('duplicate entry point')));
});
