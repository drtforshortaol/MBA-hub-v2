import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';import {webcrypto} from 'node:crypto';
async function worker({fail=false,failAfter=null,offline=false,namespace='mba-v2-tester',prior=true,mutateManifest}={}){
 const handlers={},stores=new Map(),deletions=[],fetched=[];const root='https://example.test/v2/tester/';const manifest=JSON.parse(fs.readFileSync('dist/tester/release.json','utf8'));const installedRelease=manifest.release;if(mutateManifest)mutateManifest(manifest);
 const make=()=>{const files=new Map();return {files,async match(url){return files.get(String(url))?.clone();},async put(url,r){files.set(String(url),r.clone());}};};
 if(prior){const old=make();for(const item of manifest.resources)await old.put(new URL(item.url,root),new Response(fs.readFileSync('dist/tester/'+item.url)));stores.set(namespace+':/v2/tester/:prior',old);}stores.set('mba-shared-assets-v1',make());
 const caches={async keys(){return [...stores.keys()];},async open(key){if(!stores.has(key))stores.set(key,make());return stores.get(key);},async delete(key){deletions.push(key);return stores.delete(key);}};
 let skipped=false;const self={location:{href:root+'sw.js'},clients:{async claim(){}},async skipWaiting(){skipped=true;},addEventListener(type,fn){handlers[type]=fn;}};
 const fetch=async url=>{fetched.push(String(url));if(String(url).endsWith('release.json'))return new Response(JSON.stringify(manifest));if(offline)throw Error('Network unavailable');if(failAfter!==null&&fetched.length>failAfter)throw Error('Interrupted download');if(fail)return new Response('missing',{status:404});return new Response(fs.readFileSync('dist/tester/'+new URL(url).pathname.slice('/v2/tester/'.length)));};
 let source=fs.readFileSync('src/sw.js','utf8').replaceAll('__NAMESPACE__',namespace).replaceAll('__RELEASE__',installedRelease);vm.runInNewContext(source,{self,caches,fetch,Response,URL,crypto:webcrypto});
 async function invoke(type,event={}){let promise;handlers[type]({...event,waitUntil(p){promise=p;},respondWith(p){promise=p;}});return promise;}
 return {invoke,stores,deletions,fetched,root,manifest,get skipped(){return skipped;}};
}
test('incremental install reuses verified unchanged assets',async()=>{const w=await worker();await w.invoke('install');assert.equal(w.fetched.length,1);assert(w.stores.has('mba-shared-assets-v1'));});
test('failed downloads prevent installation and preserve prior cache',async()=>{const w=await worker({fail:true,prior:false});await assert.rejects(w.invoke('install'),/verification failed/);assert(w.stores.has('mba-shared-assets-v1'));});
test('activation never deletes V1 shared offline assets',async()=>{const w=await worker();await w.invoke('install');await w.invoke('activate');assert(!w.deletions.includes('mba-shared-assets-v1'));});
test('tester worker rejects repair even if a caller sends the command directly',async()=>{const w=await worker();let reply;await w.invoke('message',{source:{url:w.root+'index.html'},data:{type:'REPAIR'},ports:[{postMessage(v){reply=v;}}]});assert.equal(reply.error,'Read-only environment');});
test('explicit refresh activates only a completely verified bundle',async()=>{const w=await worker();await w.invoke('install');let reply;await w.invoke('message',{source:{url:w.root+'refresh.html'},data:{type:'ACTIVATE_UPDATE'},ports:[{postMessage(v){reply=v;}}]});assert.equal(reply.activating,true);assert.equal(w.skipped,true);assert(w.stores.has('mba-shared-assets-v1'));});
test('refresh refuses activation when a prepared resource is missing',async()=>{const w=await worker();await w.invoke('install');const current=[...w.stores].find(([k])=>k.endsWith(w.manifest.release))[1];current.files.delete(new URL(w.manifest.resources[0].url,w.root).href);let reply;await w.invoke('message',{source:{url:w.root+'refresh.html'},data:{type:'ACTIVATE_UPDATE'},ports:[{postMessage(v){reply=v;}}]});assert.match(reply.error,/not completely verified/);assert.equal(w.skipped,false);});

test('failed install removes incomplete V2 bundle without touching older caches',async()=>{const w=await worker({fail:true,prior:false});await assert.rejects(w.invoke('install'),/verification failed/);assert(![...w.stores.keys()].some(k=>k.endsWith(w.manifest.release)));assert(w.stores.has('mba-shared-assets-v1'));assert(w.deletions.some(k=>k.endsWith(w.manifest.release)));});

test('failed update preserves previous complete V2 bundle and V1 assets',async()=>{
 const w=await worker({fail:true,prior:true});
 const prior=[...w.stores.entries()].find(([key])=>key.endsWith(':prior'))[1];
 prior.files.delete(new URL(w.manifest.resources[0].url,w.root).href);
 await assert.rejects(w.invoke('install'),/verification failed/);
 assert(![...w.stores.keys()].some(k=>k.endsWith(w.manifest.release)),'incomplete current release should be deleted');
 assert([...w.stores.keys()].some(k=>k.endsWith(':prior')),'previous complete V2 release should remain');
 assert(w.stores.has('mba-shared-assets-v1'),'V1 assets should remain');
 assert(!w.deletions.includes('mba-shared-assets-v1'));
});

test('offline installer rejects parent traversal paths before fetching assets',async()=>{const w=await worker({prior:false,mutateManifest:m=>m.resources.unshift({...m.resources[0],url:'../outside.html'})});await assert.rejects(w.invoke('install'),/Unsafe or duplicate release resource/);assert.equal(w.fetched.length,1);assert(w.stores.has('mba-shared-assets-v1'));});
test('offline installer rejects duplicate release resources',async()=>{const w=await worker({prior:false,mutateManifest:m=>m.resources.push({...m.resources[0]})});await assert.rejects(w.invoke('install'),/Unsafe or duplicate release resource/);assert.equal(w.fetched.length,1);});

test('malformed message source URLs are ignored without crashing worker',async()=>{const w=await worker();await w.invoke('install');await w.invoke('message',{source:{url:'not a valid URL'},data:{type:'STATUS'},ports:[{postMessage(){throw Error('unexpected response');}}]});});

test('offline STATUS reports complete verified resource coverage',async()=>{const w=await worker();await w.invoke('install');let reply;await w.invoke('message',{source:{url:w.root+'index.html'},data:{type:'STATUS'},ports:[{postMessage(v){reply=v;}}]});assert.equal(reply.complete,true);assert.equal(reply.count,w.manifest.resources.length);assert.equal(reply.total,w.manifest.resources.length);assert.equal(reply.release,w.manifest.release);});
test('offline STATUS detects corrupted prepared assets',async()=>{const w=await worker();await w.invoke('install');const current=[...w.stores].find(([k])=>k.endsWith(w.manifest.release))[1];await current.put(new URL(w.manifest.resources[0].url,w.root),new Response('corrupt'));let reply;await w.invoke('message',{source:{url:w.root+'index.html'},data:{type:'STATUS'},ports:[{postMessage(v){reply=v;}}]});assert.equal(reply.complete,false);assert.equal(reply.count,w.manifest.resources.length-1);});
test('offline worker ignores commands from a different origin',async()=>{const w=await worker();await w.invoke('install');let called=false;await w.invoke('message',{source:{url:'https://attacker.test/v2/tester/index.html'},data:{type:'ACTIVATE_UPDATE'},ports:[{postMessage(){called=true;}}]});assert.equal(called,false);assert.equal(w.skipped,false);});
test('offline worker rejects unknown message commands',async()=>{const w=await worker();await w.invoke('install');let reply;await w.invoke('message',{source:{url:w.root+'index.html'},data:{type:'UNSUPPORTED'},ports:[{postMessage(v){reply=v;}}]});assert.match(reply.error,/Unsupported command/);});
test('offline worker rejects unsafe encoded release paths',async()=>{const w=await worker({prior:false,mutateManifest:m=>m.resources.push({...m.resources[0],url:'apps/%2e%2e/escape.html'})});await assert.rejects(w.invoke('install'),/Unsafe or duplicate release resource/);assert.equal(w.fetched.length,1);});

test('offline install refuses mismatched release identifiers and preserves V1',async()=>{const w=await worker({prior:false,mutateManifest:m=>{m.release='unexpected-release';}});await assert.rejects(w.invoke('install'),/Deployment changed during offline preparation/);assert(w.stores.has('mba-shared-assets-v1'));assert.equal(w.fetched.length,1);});
test('offline install refuses empty release resource lists',async()=>{const w=await worker({prior:false,mutateManifest:m=>{m.resources=[];}});await assert.rejects(w.invoke('install'),/Invalid release resources/);assert.equal(w.fetched.length,1);});
test('offline install refuses absolute release paths',async()=>{const w=await worker({prior:false,mutateManifest:m=>m.resources.push({...m.resources[0],url:'/outside.html'})});await assert.rejects(w.invoke('install'),/Unsafe or duplicate release resource/);assert.equal(w.fetched.length,1);});
test('offline install refuses query and fragment release paths',async()=>{for(const suffix of ['?download=1','#fragment']){const w=await worker({prior:false,mutateManifest:m=>m.resources.push({...m.resources[0],url:'apps/one/index.html'+suffix})});await assert.rejects(w.invoke('install'),/Unsafe or duplicate release resource/);assert.equal(w.fetched.length,1);}});
test('offline worker ignores same-origin commands outside its deployment scope',async()=>{const w=await worker();await w.invoke('install');let called=false;await w.invoke('message',{source:{url:'https://example.test/v2/other/index.html'},data:{type:'ACTIVATE_UPDATE'},ports:[{postMessage(){called=true;}}]});assert.equal(called,false);assert.equal(w.skipped,false);});


test('offline installer rejects invalid SHA-256 digests before downloading assets',async()=>{
 const w=await worker({prior:false,mutateManifest:m=>{m.resources[0].sha256='not-a-sha256';}});
 await assert.rejects(w.invoke('install'),/Unsafe or duplicate release resource/);
 assert.equal(w.fetched.length,1);
 assert(w.stores.has('mba-shared-assets-v1'));
});
test('offline installer rejects missing or invalid resource byte lengths',async()=>{
 for(const value of [undefined,-1,1.5,'100']){
  const w=await worker({prior:false,mutateManifest:m=>{m.resources[0].bytes=value;}});
  await assert.rejects(w.invoke('install'),/Unsafe or duplicate release resource/);
  assert.equal(w.fetched.length,1);
 }
});
test('offline STATUS detects altered declared resource byte lengths',async()=>{
 const w=await worker();
 await w.invoke('install');
 const cache=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 const releaseURL=new URL('release.json',w.root);
 const altered=structuredClone(w.manifest);
 altered.resources[0].bytes++;
 await cache.put(releaseURL,new Response(JSON.stringify(altered)));
 let reply;
 await w.invoke('message',{source:{url:w.root+'index.html'},data:{type:'STATUS'},ports:[{postMessage(v){reply=v;}}]});
 assert.equal(reply.complete,false);
 assert.equal(reply.count,altered.resources.length-1);
});

test('activation refuses incomplete current release without deleting prior V2 or V1 caches',async()=>{
 const w=await worker();await w.invoke('install');
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 current.files.delete(new URL(w.manifest.resources[0].url,w.root).href);
 await assert.rejects(w.invoke('activate'),/Prepared release incomplete/);
 assert(w.stores.has('mba-v2-tester:/v2/tester/:prior'));
 assert(w.stores.has('mba-shared-assets-v1'));
 assert.equal(w.deletions.length,0);
});
test('activation refuses missing release manifest and preserves prior caches',async()=>{
 const w=await worker();await w.invoke('install');
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 current.files.delete(new URL('release.json',w.root).href);
 await assert.rejects(w.invoke('activate'),/Prepared release missing/);
 assert(w.stores.has('mba-v2-tester:/v2/tester/:prior'));
 assert(w.stores.has('mba-shared-assets-v1'));
});

test('activation rejects malformed cached resource metadata before cache pruning',async()=>{
 for(const change of [
  m=>{m.resources[0].sha256='bad';},
  m=>{m.resources[0].bytes=-1;},
  m=>{m.resources.push({...m.resources[0]});},
  m=>{m.resources[0].url='../escape.html';}
 ]){
  const w=await worker();await w.invoke('install');
  const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
  const altered=structuredClone(w.manifest);change(altered);
  await current.put(new URL('release.json',w.root),new Response(JSON.stringify(altered)));
  await assert.rejects(w.invoke('activate'),/Prepared release invalid/);
  assert.equal(w.deletions.length,0);
  assert(w.stores.has('mba-v2-tester:/v2/tester/:prior'));
  assert(w.stores.has('mba-shared-assets-v1'));
 }
});

test('STATUS and ACTIVATE_UPDATE reject corrupted cached manifest metadata',async()=>{
 for(const type of ['STATUS','ACTIVATE_UPDATE']){
  const w=await worker();await w.invoke('install');
  const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
  const altered=structuredClone(w.manifest);altered.resources[0].sha256='invalid';
  await current.put(new URL('release.json',w.root),new Response(JSON.stringify(altered)));
  let reply;
  await w.invoke('message',{source:{url:w.root+'refresh.html'},data:{type},ports:[{postMessage(v){reply=v;}}]});
  assert.match(reply.error,/Invalid cached release manifest/);
  assert.equal(w.skipped,false);
  assert(w.stores.has('mba-shared-assets-v1'));
 }
});

test('offline fetch serves verified cached resources',async()=>{
 const w=await worker();await w.invoke('install');
 const item=w.manifest.resources[0];
 const response=await w.invoke('fetch',{request:{method:'GET',url:new URL(item.url,w.root).href}});
 assert.equal(response.status,200);
 assert.equal((await response.arrayBuffer()).byteLength,item.bytes);
});
test('offline fetch rejects corrupted cache when network is unavailable',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const item=w.manifest.resources[0];
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 await current.put(new URL(item.url,w.root),new Response('corrupted'));
 const response=await w.invoke('fetch',{request:{method:'GET',url:new URL(item.url,w.root).href}});
 assert.equal(response.status,503);
 assert(w.stores.has('mba-shared-assets-v1'));
});

test('activation retains verified prior release for rollback',async()=>{
 const w=await worker();await w.invoke('install');
 const old=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 await old.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,release:'prior'})));
 await w.invoke('activate');
 assert(w.stores.has('mba-v2-tester:/v2/tester/:prior'));
 assert(w.stores.has('mba-shared-assets-v1'));
});
test('activation discards invalid rollback candidate without deleting V1 assets',async()=>{
 const w=await worker();await w.invoke('install');
 const old=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 await old.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,release:'prior'})));
 old.files.delete(new URL(w.manifest.resources[0].url,w.root).href);
 await w.invoke('activate');
 assert(!w.stores.has('mba-v2-tester:/v2/tester/:prior'));
 assert(w.stores.has('mba-shared-assets-v1'));
});

test('activation rejects rollback caches with mismatched release identity',async()=>{
 const w=await worker();await w.invoke('install');
 const old=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 await old.put(new URL('release.json',w.root),new Response(JSON.stringify(w.manifest)));
 await w.invoke('activate');
 assert(!w.stores.has('mba-v2-tester:/v2/tester/:prior'));
 assert(w.stores.has('mba-shared-assets-v1'));
});
test('activation rejects rollback manifest with unsafe resource URL',async()=>{
 const w=await worker();await w.invoke('install');
 const old=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 const previous=structuredClone(w.manifest);previous.release='prior';previous.resources[0].url='../escape.html';
 await old.put(new URL('release.json',w.root),new Response(JSON.stringify(previous)));
 await w.invoke('activate');
 assert(!w.stores.has('mba-v2-tester:/v2/tester/:prior'));
 assert(w.stores.has('mba-shared-assets-v1'));
});

test('offline fetch serves nested registered app entry points from verified cache',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const entries=w.manifest.resources.filter(item=>item.url.startsWith('apps/')&&item.url.endsWith('/index.html'));
 assert(entries.length>0,'built distribution must contain registered app entry points');
 for(const item of entries){
  const response=await w.invoke('fetch',{request:{method:'GET',url:new URL(item.url,w.root).href}});
  assert.equal(response.status,200,item.url);
  assert.equal((await response.arrayBuffer()).byteLength,item.bytes,item.url);
 }
});
test('offline fetch does not replace unknown app routes with Hub HTML',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const response=await w.invoke('fetch',{request:{method:'GET',url:w.root+'apps/not-registered/index.html'}});
 assert.equal(response.status,503);
 assert.match(await response.text(),/not prepared offline/);
});
test('offline fetch ignores cross-origin and out-of-scope requests',async()=>{
 const w=await worker();await w.invoke('install');
 assert.equal(await w.invoke('fetch',{request:{method:'GET',url:'https://other.test/v2/tester/index.html'}}),undefined);
 assert.equal(await w.invoke('fetch',{request:{method:'GET',url:'https://example.test/v2/other/index.html'}}),undefined);
 assert.equal(await w.invoke('fetch',{request:{method:'POST',url:w.root+'index.html'}}),undefined);
});

test('offline manifest covers every registered tester app entry point',async()=>{
 const registry=JSON.parse(fs.readFileSync('dist/tester/registry.json','utf8'));
 const w=await worker();
 const prepared=new Set(w.manifest.resources.map(item=>item.url));
 assert(registry.apps.length>0);
 for(const app of registry.apps){
  assert(prepared.has(app.entry_point),'missing offline app entry point: '+app.app_id);
  for(const asset of app.offline_assets)assert(prepared.has(asset),'missing offline asset for '+app.app_id+': '+asset);
 }
});

test('offline install rejects a manifest from another environment without altering V1 caches',async()=>{
 const w=await worker({prior:false,mutateManifest:m=>{m.environment='developer';}});
 await assert.rejects(w.invoke('install'),/environment mismatch/);
 assert.equal(w.fetched.length,1,'foreign environment must be rejected before asset downloads');
 assert(w.stores.has('mba-shared-assets-v1'));
 assert(![...w.stores.keys()].some(key=>key.endsWith(w.manifest.release)));
});
test('offline install accepts a correctly scoped tester manifest',async()=>{
 const w=await worker({prior:false});
 assert.equal(w.manifest.environment,'tester');
 await w.invoke('install');
 assert([...w.stores.keys()].some(key=>key.endsWith(w.manifest.release)));
});

test('activation refuses cached manifests from another environment without deleting rollback caches',async()=>{
 const w=await worker();await w.invoke('install');
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 await current.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,environment:'developer'})));
 await assert.rejects(w.invoke('activate'),/Prepared release invalid/);
 assert.equal(w.deletions.length,0);
 assert(w.stores.has('mba-shared-assets-v1'));
});
test('STATUS and update activation refuse cross-environment cached manifests',async()=>{
 for(const type of ['STATUS','ACTIVATE_UPDATE']){
  const w=await worker();await w.invoke('install');
  const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
  await current.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,environment:'developer'})));
  let reply;
  await w.invoke('message',{source:{url:w.root+'index.html'},data:{type},ports:[{postMessage(v){reply=v;}}]});
  assert.match(reply.error,/Invalid cached release manifest/);
  assert.equal(w.skipped,false);
 }
});
test('activation rejects rollback cache from a different environment',async()=>{
 const w=await worker();await w.invoke('install');
 const old=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 await old.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,release:'prior',environment:'developer'})));
 await w.invoke('activate');
 assert(!w.stores.has('mba-v2-tester:/v2/tester/:prior'));
 assert(w.stores.has('mba-shared-assets-v1'));
});

test('offline fetch recovers a corrupted current asset from a verified compatible rollback cache',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const item=w.manifest.resources[0];
 const prior=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 await prior.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,release:'prior'})));
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 await current.put(new URL(item.url,w.root),new Response('corrupt'));
 const response=await w.invoke('fetch',{request:{method:'GET',url:new URL(item.url,w.root).href}});
 assert.equal(response.status,200);
 assert.equal((await response.arrayBuffer()).byteLength,item.bytes);
});
test('offline fallback rejects rollback caches from another environment',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const item=w.manifest.resources[0];
 const prior=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 await prior.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,release:'prior',environment:'developer'})));
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 await current.put(new URL(item.url,w.root),new Response('corrupt'));
 const response=await w.invoke('fetch',{request:{method:'GET',url:new URL(item.url,w.root).href}});
 assert.equal(response.status,503);
});
test('offline fallback rejects rollback assets whose hashes differ from the current release',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const item=w.manifest.resources[0];
 const prior=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 const old=structuredClone(w.manifest);old.release='prior';old.resources[0].sha256='0'.repeat(64);
 await prior.put(new URL('release.json',w.root),new Response(JSON.stringify(old)));
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 await current.put(new URL(item.url,w.root),new Response('corrupt'));
 const response=await w.invoke('fetch',{request:{method:'GET',url:new URL(item.url,w.root).href}});
 assert.equal(response.status,503);
});

test('offline fallback skips corrupted rollback asset and recovers from another verified release',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const item=w.manifest.resources[0],assetURL=new URL(item.url,w.root);
 const first=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 await first.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,release:'prior'})));
 await first.put(assetURL,new Response('corrupt'));
 const second=await (async()=>{const cache={files:new Map(),async match(url){return this.files.get(String(url))?.clone();},async put(url,response){this.files.set(String(url),response.clone());}};w.stores.set('mba-v2-tester:/v2/tester/:second',cache);return cache;})();
 await second.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,release:'second'})));
 await second.put(assetURL,new Response(fs.readFileSync('dist/tester/'+item.url)));
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 await current.put(assetURL,new Response('corrupt'));
 const response=await w.invoke('fetch',{request:{method:'GET',url:assetURL.href}});
 assert.equal(response.status,200);
 assert.equal((await response.arrayBuffer()).byteLength,item.bytes);
});
test('offline fallback rejects a rollback candidate with a mismatched declared size',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const item=w.manifest.resources[0],assetURL=new URL(item.url,w.root);
 const prior=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 const old=structuredClone(w.manifest);old.release='prior';old.resources[0].bytes++;
 await prior.put(new URL('release.json',w.root),new Response(JSON.stringify(old)));
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 await current.put(assetURL,new Response('corrupt'));
 const response=await w.invoke('fetch',{request:{method:'GET',url:assetURL.href}});
 assert.equal(response.status,503);
});
test('offline fallback does not serve unregistered paths from rollback caches',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const prior=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 await prior.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,release:'prior'})));
 await prior.put(new URL('apps/unknown/index.html',w.root),new Response('unexpected'));
 const response=await w.invoke('fetch',{request:{method:'GET',url:new URL('apps/unknown/index.html',w.root).href}});
 assert.equal(response.status,503);
});


test('interrupted multi-resource download removes partial release and preserves V1 cache',async()=>{
 const w=await worker({prior:false,failAfter:2});
 await assert.rejects(w.invoke('install'),/Interrupted download/);
 assert(w.fetched.length>2,'interruption must happen after at least one asset');
 assert(![...w.stores.keys()].some(k=>k.endsWith(w.manifest.release)));
 assert(w.stores.has('mba-shared-assets-v1'));
 assert(w.deletions.some(k=>k.endsWith(w.manifest.release)));
});

test('interrupted update retains previous rollback cache without exposing partial current release',async()=>{
 const w=await worker({prior:true,failAfter:1});
 const prior=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 prior.files.delete(new URL(w.manifest.resources[0].url,w.root).href);
 await assert.rejects(w.invoke('install'),/Interrupted download/);
 assert(w.stores.has('mba-v2-tester:/v2/tester/:prior'));
 assert(![...w.stores.keys()].some(k=>k.endsWith(w.manifest.release)));
 assert(w.stores.has('mba-shared-assets-v1'));
});


test('offline navigation resolves directory URLs to verified registered index pages',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const entry=w.manifest.resources.find(item=>item.url.startsWith('apps/')&&item.url.endsWith('/index.html'));
 assert(entry,'at least one app entry is required');
 const directory=new URL(entry.url.slice(0,-'index.html'.length),w.root);
 const response=await w.invoke('fetch',{request:{method:'GET',url:directory.href}});
 assert.equal(response.status,200);
 assert.equal((await response.arrayBuffer()).byteLength,entry.bytes);
});

test('offline navigation does not serve a corrupted registered app entry',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const entry=w.manifest.resources.find(item=>item.url.startsWith('apps/')&&item.url.endsWith('/index.html'));
 assert(entry,'at least one app entry is required');
 const cache=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 await cache.put(new URL(entry.url,w.root),new Response('corrupt'));
 const response=await w.invoke('fetch',{request:{method:'GET',url:new URL(entry.url,w.root).href}});
 assert.equal(response.status,503);
});

test('offline navigation ignores query parameters for registered resources',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const entry=w.manifest.resources.find(item=>item.url.startsWith('apps/')&&item.url.endsWith('/index.html'));
 assert(entry,'at least one app entry is required');
 const url=new URL(entry.url,w.root);url.searchParams.set('view','details');
 const response=await w.invoke('fetch',{request:{method:'GET',url:url.href}});
 assert.equal(response.status,200);
 assert.equal((await response.arrayBuffer()).byteLength,entry.bytes);
});


test('offline app navigation recovers a corrupted entry from a compatible rollback release',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const entry=w.manifest.resources.find(item=>item.url.startsWith('apps/')&&item.url.endsWith('/index.html'));
 assert(entry,'a registered app entry must exist');
 const url=new URL(entry.url,w.root);
 const prior=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 await prior.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,release:'prior'})));
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 await current.put(url,new Response('corrupt'));
 const response=await w.invoke('fetch',{request:{method:'GET',url:url.href}});
 assert.equal(response.status,200);
 assert.equal((await response.arrayBuffer()).byteLength,entry.bytes);
});

test('offline app navigation refuses rollback entries from another environment',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const entry=w.manifest.resources.find(item=>item.url.startsWith('apps/')&&item.url.endsWith('/index.html'));
 assert(entry,'a registered app entry must exist');
 const url=new URL(entry.url,w.root);
 const prior=w.stores.get('mba-v2-tester:/v2/tester/:prior');
 await prior.put(new URL('release.json',w.root),new Response(JSON.stringify({...w.manifest,release:'prior',environment:'developer'})));
 const current=[...w.stores].find(([key])=>key.endsWith(w.manifest.release))[1];
 await current.put(url,new Response('corrupt'));
 const response=await w.invoke('fetch',{request:{method:'GET',url:url.href}});
 assert.equal(response.status,503);
});


test('service worker never intercepts non-GET application requests',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 const entry=w.manifest.resources.find(item=>item.url.startsWith('apps/')&&item.url.endsWith('/index.html'));
 assert(entry);
 for(const method of ['POST','PUT','DELETE']){
  const response=await w.invoke('fetch',{request:{method,url:new URL(entry.url,w.root).href}});
  assert.equal(response,undefined,method+' must bypass offline interception');
 }
});

test('service worker never intercepts resources outside its origin or URL scope',async()=>{
 const w=await worker({offline:true});await w.invoke('install');
 for(const url of ['https://external.test/v2/tester/index.html','https://example.test/v2/other/index.html','https://example.test/v2/tester-other/index.html']){
  const response=await w.invoke('fetch',{request:{method:'GET',url}});
  assert.equal(response,undefined,url+' must bypass offline interception');
 }
});
