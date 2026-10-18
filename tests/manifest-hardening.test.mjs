import test from 'node:test';
import assert from 'node:assert/strict';
import {validate} from '../scripts/build.mjs';
const category={id:'animals',title:'Animals'};
const app={schema_version:1,app_id:'app-one',title:'One',owner:'owner',version:'1',entry_point:'apps/one/index.html',type:'reference',status:'development',category:'animals',offline_assets:['apps/one/index.html'],sections:[],media:[],knowledge:[],dependencies:[],cross_links:[]};
const input=()=>({apps:[structuredClone(app)],categories:[structuredClone(category)],media:{assets:[]},knowledge:{records:[]},exists:()=>true});
test('valid minimal manifest passes structural validation',()=>assert.deepEqual(validate(input()),[]));
test('duplicate offline resources are rejected',()=>{const v=input();v.apps[0].offline_assets.push(v.apps[0].entry_point);assert.match(validate(v).join('\n'),/duplicate offline asset/);});
test('categories require stable ID and title',()=>{const v=input();v.categories[0].title='';assert.match(validate(v).join('\n'),/invalid category metadata/);});
test('unscoped self links are rejected',()=>{const v=input();v.apps[0].cross_links.push({app_id:'app-one'});assert.match(validate(v).join('\n'),/unscoped self-link/);});

test('duplicate permanent application IDs are rejected',()=>{const v=input();v.apps.push(structuredClone(v.apps[0]));assert.match(validate(v).join('\n'),/duplicate app/);});
test('duplicate entry points are rejected even across distinct IDs',()=>{const v=input();const other=structuredClone(app);other.app_id='app-two';v.apps.push(other);assert.match(validate(v).join('\n'),/duplicate entry point/);});
test('unknown categories are rejected',()=>{const v=input();v.apps[0].category='missing';assert.match(validate(v).join('\n'),/unknown category/);});
test('unsafe traversal and missing offline resources are rejected',()=>{const v=input();v.apps[0].offline_assets.push('../secret');v.exists=()=>false;assert.match(validate(v).join('\n'),/missing\/unsafe asset/);});
test('dangling cross-app links are rejected',()=>{const v=input();v.apps[0].cross_links.push({app_id:'absent'});assert.match(validate(v).join('\n'),/dangling cross-link/);});
test('circular application dependencies are rejected',()=>{const v=input();const other={...structuredClone(app),app_id:'app-two',entry_point:'apps/two/index.html',offline_assets:['apps/two/index.html'],dependencies:[{id:'app-one',version:'1'}]};v.apps[0].dependencies.push({id:'app-two',version:'1'});v.apps.push(other);assert.match(validate(v).join('\n'),/circular dependency/);});
test('missing media and knowledge references are rejected',()=>{const v=input();v.apps[0].media.push('missing-media');v.apps[0].knowledge.push('missing-knowledge');const errors=validate(v).join('\n');assert.match(errors,/missing media/);assert.match(errors,/missing knowledge/);});

test('all inherited V1 inventory entries retain permanent V2 app IDs',async()=>{const fs=await import('node:fs');const path=await import('node:path');const inventory=JSON.parse(fs.readFileSync('config/v1-inventory.json','utf8'));const manifests=fs.readdirSync('src/apps',{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>JSON.parse(fs.readFileSync(path.join('src/apps',d.name,'manifest.json'),'utf8')));const ids=new Set(manifests.map(m=>m.app_id));const inherited=inventory.apps.map(a=>a.id);assert.equal(new Set(inherited).size,inherited.length,'V1 inventory IDs must be unique');assert.equal(ids.size,manifests.length,'V2 manifest IDs must be unique');for(const id of inherited)assert(ids.has(id),'missing inherited app: '+id);assert.equal(inherited.length,25,'documented V1 inventory baseline');assert.equal(manifests.length,33,'25 inherited apps plus 8 supporting apps');});
test('every application manifest entry point exists on disk',async()=>{const fs=await import('node:fs');const path=await import('node:path');for(const dir of fs.readdirSync('src/apps',{withFileTypes:true}).filter(d=>d.isDirectory())){const manifest=JSON.parse(fs.readFileSync(path.join('src/apps',dir.name,'manifest.json'),'utf8'));assert(fs.existsSync(path.join('src',manifest.entry_point)),'missing entry point: '+manifest.app_id);}});
