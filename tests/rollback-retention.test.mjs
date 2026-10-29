import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash,webcrypto} from 'node:crypto';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const root='https://example.test/v2/tester/';
const prefix='mba-v2-tester:/v2/tester/:';
function bundle(label){
 const files=new Map([['index.html',Buffer.from('<title>'+label+'</title>')],['icon.svg',Buffer.from('<svg>'+label+'</svg>')]]);
 const resources=[...files].map(([url,bytes])=>({url,bytes:bytes.length,sha256:hash(bytes)}));
 const manifest={environment:'tester',resources,release:hash(JSON.stringify(resources)).slice(0,16)};
 return {files,manifest};
}
async function fixture(){
 const stores=new Map(),handlers={},deletions=[],current=bundle('current');let claimed=0;
 function cache(){const files=new Map();return {files,async put(url,response){files.set(String(url),response.clone());},async match(url){return files.get(String(url))?.clone();}};}
 const caches={async keys(){return [...stores.keys()];},async open(key){if(!stores.has(key))stores.set(key,cache());return stores.get(key);},async delete(key){deletions.push(key);return stores.delete(key);}};
 async function seed(value,key=prefix+value.manifest.release){
  const store=await caches.open(key);
  for(const [url,bytes] of value.files)await store.put(new URL(url,root),new Response(bytes));
  await store.put(root+'release.json',new Response(JSON.stringify(value.manifest)));
  return key;
 }
 const self={location:{href:root+'sw.js'},clients:{async claim(){claimed++;}},addEventListener(type,handler){handlers[type]=handler;}};
 const source=fs.readFileSync('src/sw.js','utf8').replaceAll('__NAMESPACE__','mba-v2-tester').replaceAll('__RELEASE__',current.manifest.release);
 vm.runInNewContext(source,{self,caches,Response,URL,crypto:webcrypto,fetch:async input=>{
  const url=new URL(typeof input==='string'?input:input.url);
  if(url.href===root+'release.json')return new Response(JSON.stringify(current.manifest));
  const bytes=current.files.get(url.pathname.slice('/v2/tester/'.length));
  return new Response(bytes??'missing',{status:bytes?200:404});
 }});
 async function invoke(type){let done;handlers[type]({waitUntil(promise){done=promise;}});await done;}
 await invoke('install');
 return {stores,deletions,seed,invoke,current,get claimed(){return claimed;}};
}

test('activation retains the newest complete inventory-bound rollback bundle and preserves other scopes',async()=>{
 const f=await fixture(),older=await f.seed(bundle('older')),newest=await f.seed(bundle('newest'));
 for(const key of ['mba-shared-assets-v1','mba-v2-developer:/v2/tester/:foreign','mba-v2-tester:/another-scope/:foreign'])f.stores.set(key,{});
 await f.invoke('activate');
 assert(f.stores.has(prefix+f.current.manifest.release));assert(f.stores.has(newest));assert(!f.stores.has(older));
 assert.deepEqual(f.deletions,[older]);assert.equal(f.claimed,1);
 for(const key of ['mba-shared-assets-v1','mba-v2-developer:/v2/tester/:foreign','mba-v2-tester:/another-scope/:foreign'])assert(f.stores.has(key));
});

for(const mutation of ['subset','matching-body-substitution'])test('forged '+mutation+' cannot displace a complete rollback bundle',async()=>{
 const f=await fixture(),healthy=await f.seed(bundle('healthy')),forged=bundle('forged');
 const originalRelease=forged.manifest.release;
 if(mutation==='subset')forged.manifest.resources.pop();
 else{
  const bytes=Buffer.from('substituted prior body'),item=forged.manifest.resources[0];
  forged.files.set(item.url,bytes);item.bytes=bytes.length;item.sha256=hash(bytes);
 }
 const forgedKey=await f.seed(forged);
 assert.equal(forged.manifest.release,originalRelease,'mutation must retain stale release identity');
 await f.invoke('activate');
 assert(f.stores.has(healthy),'complete prior bundle must remain available');
 assert(!f.stores.has(forgedKey),'inventory must authenticate to its cache release ID');
 assert.deepEqual(f.deletions,[forgedKey]);assert.equal(f.claimed,1);
});
