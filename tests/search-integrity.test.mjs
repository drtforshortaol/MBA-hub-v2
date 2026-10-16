import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const environments=['developer','tester'];
function manifestFiles(){return fs.readdirSync('src/apps',{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>JSON.parse(fs.readFileSync(path.join('src/apps',d.name,'manifest.json'),'utf8')));}
for(const environment of environments){
 test(environment+' search index includes every registered app',()=>{
  const registry=JSON.parse(fs.readFileSync('dist/'+environment+'/registry.json','utf8'));
  const index=JSON.parse(fs.readFileSync('dist/'+environment+'/search-index.json','utf8'));
  const ids=new Set(registry.apps.map(a=>a.app_id));
  assert.equal(ids.size,registry.apps.length,'duplicate registry app ID');
  for(const app of registry.apps)assert(index.some(item=>item.app_id===app.app_id&&item.url===app.entry_point&&item.title===app.title),'missing search entry: '+app.app_id);
  for(const item of index){assert(ids.has(item.app_id),'orphaned search entry: '+item.app_id);assert.equal(typeof item.title,'string');assert.equal(typeof item.text,'string');assert.equal(typeof item.url,'string');assert(!item.url.startsWith('/'),'search URL must be scope-relative');assert(!item.url.includes('..'),'search URL must not traverse directories');}
 });
 test(environment+' search index targets bundled app pages',()=>{
  const index=JSON.parse(fs.readFileSync('dist/'+environment+'/search-index.json','utf8'));
  for(const item of index){const pathname=item.url.split(/[?#]/,1)[0];assert(fs.existsSync(path.join('dist',environment,pathname)),'missing search destination: '+item.url);}
 });
}
test('all app manifests are represented in both environment registries',()=>{
 const ids=new Set(manifestFiles().map(a=>a.app_id));
 for(const environment of environments){const registry=JSON.parse(fs.readFileSync('dist/'+environment+'/registry.json','utf8'));assert.deepEqual(new Set(registry.apps.map(a=>a.app_id)),ids);}
});
