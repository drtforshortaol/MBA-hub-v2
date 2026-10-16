import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const root='dist/developer';
const registry=read(path.join(root,'registry.json'));
const search=read(path.join(root,'search-index.json'));
const release=read(path.join(root,'release.json'));
const resourceSet=new Set(release.resources.map(r=>r.url));
const appDirs=fs.readdirSync('src/apps',{withFileTypes:true}).filter(d=>d.isDirectory());

test('every application folder is automatically registered exactly once',()=>{
 assert.equal(registry.apps.length,appDirs.length);
 const ids=registry.apps.map(a=>a.app_id);
 assert.equal(new Set(ids).size,ids.length);
 for(const dir of appDirs){
  const manifest=read(path.join('src/apps',dir.name,'manifest.json'));
  assert.equal(registry.apps.filter(a=>a.app_id===manifest.app_id).length,1,dir.name);
 }
});

test('all registered applications are searchable and bundled offline',()=>{
 for(const app of registry.apps){
  assert(search.some(item=>item.app_id===app.app_id),app.app_id+' missing from search');
  assert(resourceSet.has(app.entry_point),app.app_id+' missing offline entry point');
  assert(fs.statSync(path.join(root,app.entry_point)).size>0,app.app_id+' empty entry point');
  for(const asset of app.offline_assets){
   assert(resourceSet.has(asset),app.app_id+' missing offline asset '+asset);
   assert(fs.existsSync(path.join(root,asset)),app.app_id+' missing built asset '+asset);
  }
 }
});

test('categories are alphabetized and application titles sort predictably',()=>{
 const titles=registry.categories.map(c=>c.title);
 assert.deepEqual(titles,[...titles].sort((a,b)=>a.localeCompare(b)));
 for(const app of registry.apps)assert(registry.categories.some(c=>c.id===app.category),app.app_id+' invalid category');
});

test('offline release manifest has unique resources with SHA-256 digests',()=>{
 assert.equal(resourceSet.size,release.resources.length);
 for(const resource of release.resources){
  assert.match(resource.sha256,/^[a-f0-9]{64}$/);
  assert.equal(fs.statSync(path.join(root,resource.url)).size,resource.bytes,resource.url);
 }
});
