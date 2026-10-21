import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {createHash,webcrypto} from 'node:crypto';

const hash=value=>createHash('sha256').update(value).digest('hex');
async function recoveryWorker({crypto=webcrypto}={}){
 const root='https://example.test/v2/tester/',body='verified recovery bytes';
 const item={url:'apps/guide/index.html',bytes:Buffer.byteLength(body),sha256:hash(body)};
 const resources=[item],release=hash(JSON.stringify(resources)).slice(0,16);
 const manifest={release,environment:'tester',resources},currentKey=`mba-v2-tester:/v2/tester/:${release}`;
 const stores=new Map(),handlers={};let network=async()=>new Response(body),putsFail=false;
 const make=()=>{const files=new Map();return {files,async match(url){return files.get(String(url))?.clone();},async put(url,response){if(putsFail)throw Error('Quota exceeded');files.set(String(url),response.clone());}};};
 const current=make();stores.set(currentKey,current);stores.set('mba-shared-assets-v1',make());
 await current.put(root+'release.json',new Response(JSON.stringify(manifest)));
 const self={location:{href:root+'sw.js'},addEventListener(type,handler){handlers[type]=handler;}};
 const caches={async open(key){if(!stores.has(key))stores.set(key,make());return stores.get(key);},async keys(){return [...stores.keys()];}};
 vm.runInNewContext(fs.readFileSync('src/sw.js','utf8').replaceAll('__NAMESPACE__','mba-v2-tester').replaceAll('__RELEASE__',release),{self,caches,fetch:request=>network(request),Response,URL,crypto});
 async function invoke(type,event){let result;handlers[type]({...event,waitUntil(p){result=p;},respondWith(p){result=p;}});return result;}
 return {root,body,item,manifest,current,stores,currentKey,
  network(fn){network=fn;},failPuts(){putsFail=true;},
  async command(type,path='refresh.html'){let reply;await invoke('message',{source:{url:root+path},data:{type},ports:[{postMessage(value){reply=value;}}]});return reply;},
  async status(){return this.command('STATUS','index.html');},
  fetch({path=item.url,headers={}}={}){return invoke('fetch',{request:{url:root+path,method:'GET',headers:new Headers(headers)}});},
  async rollback(){const old=make();await old.put(root+'release.json',new Response(JSON.stringify({...manifest,release:'prior'})));await old.put(root+item.url,new Response(body));stores.set('mba-v2-tester:/v2/tester/:prior',old);return old;}
 };
}

test('visiting a missing registered resource online restores verified offline readiness',async()=>{
 const w=await recoveryWorker();assert.equal((await w.status()).complete,false);
 assert.equal(await (await w.fetch()).text(),w.body);
 assert.equal((await w.status()).complete,true);
 w.network(async()=>{throw Error('offline');});
 assert.equal(await (await w.fetch()).text(),w.body);
 assert.equal(w.stores.get('mba-shared-assets-v1').files.size,0);
});

test('verified rollback recovery restores corrupt current entry without requiring network',async()=>{
 const w=await recoveryWorker(),prior=await w.rollback();
 await w.current.put(w.root+w.item.url,new Response('corrupt'));w.network(async()=>{throw Error('offline');});
 assert.equal(await (await w.fetch()).text(),w.body);
 assert.equal((await w.status()).complete,true);
 assert.equal(await (await prior.match(w.root+w.item.url)).text(),w.body);
});

test('unverified online responses remain uncached and do not claim offline readiness',async()=>{
 const w=await recoveryWorker();w.network(async()=>new Response('different deployed release'));
 assert.equal(await (await w.fetch()).text(),'different deployed release');
 assert.equal(await w.current.match(w.root+w.item.url),undefined);
 assert.equal((await w.status()).complete,false);
});

test('substituted current inventory cannot authorize opportunistic recovery',async()=>{
 const w=await recoveryWorker(),forged={...w.manifest,resources:[{...w.item,sha256:hash('substitute'),bytes:10}]};
 await w.current.put(w.root+'release.json',new Response(JSON.stringify(forged)));
 w.network(async()=>new Response('substitute'));await w.fetch();
 assert.equal(await w.current.match(w.root+w.item.url),undefined);
 assert.match((await w.status()).error,/inventory integrity mismatch/);
});

test('network partial responses are never persisted as complete offline resources',async()=>{
 const w=await recoveryWorker();w.network(async()=>new Response(w.body,{status:206}));
 assert.equal((await w.fetch({headers:{range:'bytes=0-2'}})).status,206);
 assert.equal(await w.current.match(w.root+w.item.url),undefined);
 assert.equal((await w.status()).complete,false);
});

test('storage quota failure preserves verified online and rollback responses',async()=>{
 for(const rollback of [false,true]){
  const w=await recoveryWorker();if(rollback)await w.rollback();w.failPuts();
  assert.equal(await (await w.fetch()).text(),w.body);
  assert.equal((await w.status()).complete,false);
 }
});

test('unregistered destinations cannot add new offline inventory entries',async()=>{
 const w=await recoveryWorker();await w.fetch({path:'unregistered.html'});
 assert.equal(await w.current.match(w.root+'unregistered.html'),undefined);
 assert.equal(w.current.files.size,1);
});

test('interrupted recovery stays incomplete then a later visit restores offline availability',async()=>{
 const w=await recoveryWorker();w.network(async()=>{throw Error('interrupted download');});
 assert.equal((await w.fetch()).status,503);assert.equal((await w.status()).complete,false);
 w.network(async()=>new Response(w.body));assert.equal(await (await w.fetch()).text(),w.body);
 assert.equal((await w.status()).complete,true);
});

test('missing current manifest never promotes rollback or network bytes into a partial installation',async()=>{
 const w=await recoveryWorker();await w.rollback();w.current.files.delete(w.root+'release.json');
 assert.equal(await (await w.fetch()).text(),w.body);
 assert.equal(w.current.files.size,0);
 const status=await w.status();assert.equal(status.complete,false);assert.equal(status.count,0);assert.equal(status.total,0);
 assert.equal(w.current.files.size,0,'read-only status must not synthesize a manifest');
});

test('rollback range recovery stores full verified representation rather than partial response',async()=>{
 const w=await recoveryWorker();await w.rollback();w.network(async()=>{throw Error('offline');});
 const ranged=await w.fetch({headers:{range:'bytes=0-2'}});
 assert.equal(ranged.status,206);assert.equal(await ranged.text(),w.body.slice(0,3));
 const stored=await w.current.match(w.root+w.item.url);
 assert.equal(stored.status,200);assert.equal(await stored.text(),w.body);
 assert.equal((await w.status()).complete,true);
});


test('explicit same-release refresh reconstructs missing inventory without deleting unrelated data',async()=>{
 const w=await recoveryWorker();w.current.files.clear();const unrelated=w.stores.get('mba-shared-assets-v1');
 await unrelated.put('https://example.test/keep',new Response('keep'));
 w.network(async request=>new Response(String(request).endsWith('release.json')?JSON.stringify(w.manifest):w.body));
 const result=await w.command('RECOVER_OFFLINE');assert.equal(result.complete,true);assert.equal(result.count,1);
 assert.equal(await (await unrelated.match('https://example.test/keep')).text(),'keep');
 w.network(async()=>{throw Error('offline');});assert.equal(await (await w.fetch()).text(),w.body);
});

test('recovery is refresh-only and tester REPAIR stays prohibited',async()=>{
 const w=await recoveryWorker();let fetches=0;w.network(async()=>{fetches++;throw Error('unexpected');});
 assert.match((await w.command('RECOVER_OFFLINE','index.html')).error,/refresh page/);
 assert.match((await w.command('REPAIR')).error,/Read-only/);assert.equal(fetches,0);
});

test('interrupted full recovery preserves existing data and is retryable',async()=>{
 const w=await recoveryWorker();w.current.files.clear();
 w.network(async request=>{if(String(request).endsWith('release.json'))return new Response(JSON.stringify(w.manifest));throw Error('interrupted');});
 assert.match((await w.command('RECOVER_OFFLINE')).error,/interrupted/);assert.equal((await w.status()).complete,false);
 w.network(async request=>new Response(String(request).endsWith('release.json')?JSON.stringify(w.manifest):w.body));
 assert.equal((await w.command('RECOVER_OFFLINE')).complete,true);
});

test('full recovery rejects changed release and forged inventory without replacing metadata',async()=>{
 for(const mutation of [manifest=>({...manifest,release:'changed'}),manifest=>({...manifest,resources:[{...manifest.resources[0],bytes:1}]})]){
  const w=await recoveryWorker(),before=await (await w.current.match(w.root+'release.json')).text();
  w.network(async()=>new Response(JSON.stringify(mutation(w.manifest))));
  assert.ok((await w.command('RECOVER_OFFLINE')).error);
  assert.equal(await (await w.current.match(w.root+'release.json')).text(),before);
 }
});

test('offline and quota failures cannot claim full recovery or delete retained data',async()=>{
 for(const quota of [false,true]){
  const w=await recoveryWorker();await w.current.put(w.root+w.item.url,new Response(w.body));
  const before=await (await w.current.match(w.root+w.item.url)).text();
  if(quota){w.failPuts();w.network(async request=>new Response(String(request).endsWith('release.json')?JSON.stringify(w.manifest):w.body));}
  else w.network(async()=>{throw Error('offline');});
  assert.ok((await w.command('RECOVER_OFFLINE')).error);
  assert.equal(await (await w.current.match(w.root+w.item.url)).text(),before);
 }
});

test('corrupt cached metadata is typed by STATUS and explicitly recoverable against live release authority',async()=>{
 for(const metadata of ['null','[]','7','{broken',JSON.stringify({}),JSON.stringify({release:'wrong',environment:'tester',resources:[]}),JSON.stringify({release:'wrong',environment:'developer',resources:[null]})]){
  const w=await recoveryWorker();await w.current.put(w.root+'release.json',new Response(metadata));
  const status=await w.status();assert.equal(status.code,'OFFLINE_INVENTORY_INVALID');assert.ok(status.error);
  w.network(async request=>new Response(String(request).endsWith('release.json')?JSON.stringify(w.manifest):w.body));
  assert.equal((await w.command('RECOVER_OFFLINE')).complete,true);
  assert.equal((await w.status()).complete,true);
 }
});

test('tampered inventory digest is typed but cannot authorize stale or forged live restoration',async()=>{
 const w=await recoveryWorker(),forged={...w.manifest,resources:[{...w.item,bytes:1}]};
 await w.current.put(w.root+'release.json',new Response(JSON.stringify(forged)));
 assert.equal((await w.status()).code,'OFFLINE_INVENTORY_INVALID');
 for(const live of [forged,{...w.manifest,release:'newer'}]){
  w.network(async()=>new Response(JSON.stringify(live)));assert.ok((await w.command('RECOVER_OFFLINE')).error);
  assert.equal(await (await w.current.match(w.root+'release.json')).text(),JSON.stringify(forged));
 }
});

test('offline or interrupted corrupt inventory recovery preserves metadata and existing verified files',async()=>{
 for(const offline of [false,true]){
  const w=await recoveryWorker();await w.current.put(w.root+'release.json',new Response('malformed'));
  w.network(async request=>{if(!offline&&String(request).endsWith('release.json'))return new Response(JSON.stringify(w.manifest));throw Error(offline?'offline':'interrupted');});
  assert.ok((await w.command('RECOVER_OFFLINE')).error);
  assert.equal(await (await w.current.match(w.root+'release.json')).text(),'malformed');
  w.network(async request=>new Response(String(request).endsWith('release.json')?JSON.stringify(w.manifest):w.body));
  assert.equal((await w.command('RECOVER_OFFLINE')).complete,true);
 }
});


test('null resource entries are typed as invalid inventory rather than runtime failures',async()=>{
 const w=await recoveryWorker();await w.current.put(w.root+'release.json',new Response(JSON.stringify({...w.manifest,resources:[null]})));
 assert.equal((await w.status()).code,'OFFLINE_INVENTORY_INVALID');
});


test('runtime verification errors are not classified as recoverable metadata failures',async()=>{
 const w=await recoveryWorker({crypto:{subtle:{digest:async()=>{throw Error('crypto unavailable');}}}});
 const status=await w.status();assert.match(status.error,/crypto unavailable/);assert.equal(status.code,undefined);
});
