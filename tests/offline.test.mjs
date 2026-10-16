import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';import {webcrypto} from 'node:crypto';
async function worker({fail=false,namespace='mba-v2-tester',prior=true,mutateManifest}={}){
 const handlers={},stores=new Map(),deletions=[],fetched=[];const root='https://example.test/v2/tester/';const manifest=JSON.parse(fs.readFileSync('dist/tester/release.json','utf8'));if(mutateManifest)mutateManifest(manifest);
 const make=()=>{const files=new Map();return {files,async match(url){return files.get(String(url))?.clone();},async put(url,r){files.set(String(url),r.clone());}};};
 if(prior){const old=make();for(const item of manifest.resources)await old.put(new URL(item.url,root),new Response(fs.readFileSync('dist/tester/'+item.url)));stores.set(namespace+':/v2/tester/:prior',old);}stores.set('mba-shared-assets-v1',make());
 const caches={async keys(){return [...stores.keys()];},async open(key){if(!stores.has(key))stores.set(key,make());return stores.get(key);},async delete(key){deletions.push(key);return stores.delete(key);}};
 let skipped=false;const self={location:{href:root+'sw.js'},clients:{async claim(){}},async skipWaiting(){skipped=true;},addEventListener(type,fn){handlers[type]=fn;}};
 const fetch=async url=>{fetched.push(String(url));if(String(url).endsWith('release.json'))return new Response(JSON.stringify(manifest));if(fail)return new Response('missing',{status:404});return new Response(fs.readFileSync('dist/tester/'+new URL(url).pathname.slice('/v2/tester/'.length)));};
 let source=fs.readFileSync('src/sw.js','utf8').replaceAll('__NAMESPACE__',namespace).replaceAll('__RELEASE__',manifest.release);vm.runInNewContext(source,{self,caches,fetch,Response,URL,crypto:webcrypto});
 async function invoke(type,event={}){let promise;handlers[type]({...event,waitUntil(p){promise=p;}});return promise;}
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
