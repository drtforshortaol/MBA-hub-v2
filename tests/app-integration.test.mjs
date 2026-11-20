import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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
 assert.deepEqual(ids,[...ids].sort((a,b)=>a.localeCompare(b)),'registry ordering must be deterministic');
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

test('categories are alphabetized and application category references are valid',()=>{
 const titles=registry.categories.map(c=>c.title);
 assert.deepEqual(titles,[...titles].sort((a,b)=>a.localeCompare(b)));
 for(const app of registry.apps)assert(registry.categories.some(c=>c.id===app.category),app.app_id+' invalid category');
});

test('offline release manifest has unique resources with SHA-256 digests',()=>{
 assert.equal(resourceSet.size,release.resources.length);
 const urls=release.resources.map(resource=>resource.url);
 assert.deepEqual(urls,[...urls].sort(),'offline release resources must have deterministic ordering');
 for(const resource of release.resources){
  assert.match(resource.sha256,/^[a-f0-9]{64}$/);
  const bytes=fs.readFileSync(path.join(root,resource.url));
  assert.equal(bytes.length,resource.bytes,resource.url);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),resource.sha256,resource.url);
 }
});

test('complete collection preserves deployed Blue and includes the canonical additions',()=>{
 const inventory=read('config/v1-inventory.json');
 const policy=read('config/age-channel-policy.json');
 assert.equal(inventory.apps.length,25,'unexpected inherited V1 inventory size');
 const registered=registry.apps.map(app=>app.app_id);
 const expected=[...policy.blue_required_apps,'el-nino','nearby-dining','giant-clam','naturalist-briefing-20261118'];
 assert.deepEqual(registered.sort(),expected.sort());
 for(const app of inventory.apps)assert(registered.includes(app.id),'missing inherited app '+app.id);
});

test('El Niño and Nearby Dining search fragments and Hub return links resolve in both preview bundles',()=>{
 for(const environment of ['developer','tester']){
  const bundle = path.join('dist',environment);
  const index = read(path.join(bundle,'search-index.json'));
  for(const appId of ['el-nino','nearby-dining']){
   const entries = index.filter(entry => entry.app_id === appId && entry.url.includes('#'));
   assert(entries.length > 0, appId);
   for(const entry of entries){
    const [page,fragment] = entry.url.split('#');
    const html = fs.readFileSync(path.join(bundle,page),'utf8');
    assert(html.includes('id="' + fragment + '"'), entry.url);
    assert(html.includes('href="../../index.html?home=1"'), page);
    assert.equal(path.posix.normalize(path.posix.join(path.posix.dirname(page),'../../index.html')),'index.html');
    assert(fs.existsSync(path.join(bundle,'index.html')));
   }
  }
 }
});
