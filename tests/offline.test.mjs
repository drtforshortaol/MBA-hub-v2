import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';import {webcrypto} from 'node:crypto';
async function worker({fail=false,namespace='mba-v2-tester',prior=true}={}){
 const handlers={},stores=new Map(),deletions=[],fetched=[];const root='https://example.test/v2/tester/';const manifest=JSON.parse(fs.readFileSync('dist/tester/release.json','utf8'));
 const make=()=>{const files=new Map();return {files,async match(url){return files.get(String(url))?.clone();},async put(url,r){files.set(String(url),r.clone());}};};
 if(prior){const old=make();for(const item of manifest.resources)await old.put(new URL(item.url,root),new Response(fs.readFileSync('dist/tester/'+item.url)));stores.set(namespace+':/v2/tester/:prior',old);}stores.set('mba-shared-assets-v1',make());
 const caches={async keys(){return [...stores.keys()];},async open(key){if(!stores.has(key))stores.set(key,make());return stores.get(key);},async delete(key){deletions.push(key);return stores.delete(key);}};
 const self={location:{href:root+'sw.js'},clients:{async claim(){}},addEventListener(type,fn){handlers[type]=fn;}};
 const fetch=async url=>{fetched.push(String(url));if(String(url).endsWith('release.json'))return new Response(JSON.stringify(manifest));if(fail)return new Response('missing',{status:404});return new Response(fs.readFileSync('dist/tester/'+new URL(url).pathname.slice('/v2/tester/'.length)));};
 let source=fs.readFileSync('src/sw.js','utf8').replaceAll('__NAMESPACE__',namespace).replaceAll('__RELEASE__',manifest.release);vm.runInNewContext(source,{self,caches,fetch,Response,URL,crypto:webcrypto});
 async function invoke(type,event={}){let promise;handlers[type]({...event,waitUntil(p){promise=p;}});return promise;}
 return {invoke,stores,deletions,fetched,root,manifest};
}
test('incremental install reuses verified unchanged assets',async()=>{const w=await worker();await w.invoke('install');assert.equal(w.fetched.length,1);assert(w.stores.has('mba-shared-assets-v1'));});
test('failed downloads prevent installation and preserve prior cache',async()=>{const w=await worker({fail:true,prior:false});await assert.rejects(w.invoke('install'),/verification failed/);assert(w.stores.has('mba-shared-assets-v1'));});
test('activation never deletes V1 shared offline assets',async()=>{const w=await worker();await w.invoke('install');await w.invoke('activate');assert(!w.deletions.includes('mba-shared-assets-v1'));});
test('tester worker rejects repair even if a caller sends the command directly',async()=>{const w=await worker();let reply;await w.invoke('message',{source:{url:w.root+'index.html'},data:{type:'REPAIR'},ports:[{postMessage(v){reply=v;}}]});assert.equal(reply.error,'Read-only environment');});
