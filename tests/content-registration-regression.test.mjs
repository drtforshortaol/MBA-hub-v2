import test from 'node:test';
import assert from 'node:assert/strict';
import {validate,safeLocalPath} from '../scripts/build.mjs';

const base=()=>({
 categories:[{id:'animals',title:'Animals'}],
 media:{assets:[{asset_id:'photo-1',path:'shared/media/photo.svg',owner:'species-ray',alt:'Ray',credit:'Guide',permission:'approved'}]},
 knowledge:{records:[{id:'fact-1',owner:'species-ray',version:'1',sections:[]}]},
 apps:[{schema_version:1,app_id:'species-ray',title:'Ray',owner:'guide',version:'1.0.0',entry_point:'apps/ray/index.html',type:'species',category:'animals',status:'development',offline_assets:['apps/ray/index.html','shared/media/photo.svg'],sections:[{id:'habitat',title:'Habitat'}],media:['photo-1'],knowledge:['fact-1'],dependencies:[],cross_links:[]}],
 exists:p=>new Set(['apps/ray/index.html','shared/media/photo.svg']).has(p)
});
const check=f=>validate(f());

test('new species app with registered offline photo passes foundation validation',()=>{
 assert.deepEqual(check(base),[]);
});
test('species registration rejects unknown category',()=>{
 assert(check(()=>{const x=base();x.apps[0].category='not-registered';return x;}).some(e=>e.includes('unknown category')));
});
test('species registration rejects missing entry point and offline image',()=>{
 const errors=check(()=>{const x=base();x.apps[0].offline_assets=['shared/media/missing.svg'];return x;});
 assert(errors.some(e=>e.includes('entry absent from offline bundle')));
 assert(errors.some(e=>e.includes('missing/unsafe asset')));
});
test('species registration rejects duplicate app identifiers',()=>{
 assert(check(()=>{const x=base();x.apps.push({...x.apps[0],entry_point:'apps/ray/other.html'});return x;}).some(e=>e.includes('duplicate app')));
});
test('species registration rejects missing media catalog reference',()=>{
 assert(check(()=>{const x=base();x.apps[0].media=['missing-photo'];return x;}).some(e=>e.includes('missing media')));
});
test('species registration rejects missing knowledge reference',()=>{
 assert(check(()=>{const x=base();x.apps[0].knowledge=['missing-fact'];return x;}).some(e=>e.includes('missing knowledge')));
});
test('species registration rejects broken cross-app navigation',()=>{
 assert(check(()=>{const x=base();x.apps[0].cross_links=[{app_id:'missing-app'}];return x;}).some(e=>e.includes('dangling cross-link')));
});
test('resource paths reject traversal, encoded separators and query fragments',()=>{
 for(const p of ['../escape.html','apps/%2e%2e/escape.html','apps/ray/index.html?x=1','/apps/ray/index.html','apps\\ray\\index.html'])assert.equal(safeLocalPath(p),false,p);
 assert.equal(safeLocalPath('apps/ray/index.html'),true);
});
