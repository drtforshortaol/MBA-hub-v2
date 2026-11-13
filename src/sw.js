const NAMESPACE='__NAMESPACE__',RELEASE='__RELEASE__',ROOT=new URL('./',self.location.href),PREFIX=NAMESPACE+':'+ROOT.pathname+':',CACHE=PREFIX+RELEASE;
const absolute=p=>new URL(p,ROOT).href;
// Recovery only writes bytes already authenticated against the current inventory.
// Quota/eviction failures must not prevent serving a verified recovered response.
async function restoreVerified(cache,url,response){try{await cache.put(url,response.clone());}catch{/* Remain usable if storage is unavailable. */}}
async function verified(response,item){if(!response||!response.ok)return false;const bytes=await response.clone().arrayBuffer();if(bytes.byteLength!==item.bytes)return false;return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('')===item.sha256;}
// Fetch authorization requires a compatible, structurally valid bundle inventory.
async function compatibleManifest(manifest,release,bindInventory=false){
 if(!manifest||manifest.release!==release||manifest.environment!==NAMESPACE.slice('mba-v2-'.length)||!Array.isArray(manifest.resources)||!manifest.resources.length)return false;
 const seen=new Set();
 for(const item of manifest.resources){
  if(!item||typeof item.url!=='string'||!item.url||item.url.startsWith('/')||item.url.split('/').some(p=>!p||p==='.'||p==='..')||/[?#%\\\\]/.test(item.url)||/[\x00-\x20\x7f]/.test(item.url)||!(/^[a-f0-9]{64}$/.test(item.sha256))||!Number.isSafeInteger(item.bytes)||item.bytes<0||seen.has(item.url))return false;
  seen.add(item.url);
 }
 if(bindInventory){const bytes=await new Response(JSON.stringify(manifest.resources)).arrayBuffer();const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');if(digest.slice(0,16)!==release)return false;}
 return true;
}
// Safari media requests can seek within verified offline files. Never cache partial bodies.
async function cachedResponse(response,request){
 // Cached redirects retain their URL history. Safari rejects that history on navigation.
 // This helper is called only after complete body hash/size verification.
 if(response.redirected){
  const headers=Object.fromEntries(response.headers),bytes=await response.arrayBuffer();
  delete headers['content-encoding'];delete headers['transfer-encoding'];
  headers['content-length']=String(bytes.byteLength);
  response=new Response(bytes,{status:response.status,statusText:response.statusText,headers});
 }
 const range=request.headers?.get('range');
 if(!range||request.headers?.get('if-range')||response.status!==200)return response;
 const match=/^bytes=(\d*)-(\d*)$/.exec(range.trim());
 // Unsupported or malformed ranges are ignored; the complete representation is valid.
 if(!match||(!match[1]&&!match[2]))return response;
 const first=match[1]?Number(match[1]):null,last=match[2]?Number(match[2]):null;
 if((first!==null&&!Number.isSafeInteger(first))||(last!==null&&!Number.isSafeInteger(last))||(first!==null&&last!==null&&first>last))return response;
 const bytes=await response.arrayBuffer(),total=bytes.byteLength;
 const start=first===null?Math.max(0,total-last):first,end=first===null?total-1:Math.min(last??total-1,total-1);
 if(!total||start>=total||(first===null&&last===0))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${total}`,'Accept-Ranges':'bytes','Content-Length':'0'}});
 const headers=Object.fromEntries(response.headers);
 delete headers['content-encoding'];delete headers['transfer-encoding'];
 headers['content-range']=`bytes ${start}-${end}/${total}`;headers['content-length']=String(end-start+1);headers['accept-ranges']='bytes';
 return new Response(bytes.slice(start,end+1),{status:206,headers});
}
// Multiple explicit refresh tabs may request the same bundle concurrently.
// Share only in-flight work; failures release the slot so a later retry can resume.
let preparing=null;
function prepareShared(){
 if(!preparing)preparing=prepare().finally(()=>{preparing=null;});
 return preparing;
}
async function prepare(){
 const response=await fetch(absolute('release.json'),{cache:'no-store'});if(!response.ok)throw Error('Release manifest unavailable');const manifest=await response.clone().json();if(manifest.release!==RELEASE||manifest.environment!==NAMESPACE.slice('mba-v2-'.length))throw Error('Deployment changed during offline preparation (release or environment mismatch)');
 if(!Array.isArray(manifest.resources)||!manifest.resources.length)throw Error('Invalid release resources');
 const paths=new Set();for(const item of manifest.resources){if(typeof item.url!=='string'||!item.url||item.url.startsWith('/')||item.url.split('/').some(p=>!p||p==='.'||p==='..')||/[?#%\\\\]/.test(item.url)||!(/^[a-f0-9]{64}$/.test(item.sha256))||!Number.isSafeInteger(item.bytes)||item.bytes<0||paths.has(item.url))throw Error('Unsafe or duplicate release resource');paths.add(item.url);}

 if(!await compatibleManifest(manifest,RELEASE,true))throw Error('Release inventory integrity mismatch');
 const cache=await caches.open(CACHE),previous=(await caches.keys()).filter(k=>k.startsWith(PREFIX)&&k!==CACHE);
 // A failed preparation must never leave a partial bundle marked as ready.
 for(const item of manifest.resources){let resource=await cache.match(absolute(item.url));if(!await verified(resource,item)){resource=null;for(const old of previous){const candidate=await (await caches.open(old)).match(absolute(item.url));if(await verified(candidate,item)){resource=candidate;break;}}if(!resource)resource=await fetch(absolute(item.url),{cache:'no-store'});if(!await verified(resource,item))throw Error('Asset verification failed: '+item.url);await cache.put(absolute(item.url),resource);}}
 await cache.put(absolute('release.json'),response);return manifest;
}
self.addEventListener('install',event=>event.waitUntil((async()=>{try{await prepareShared();}catch(error){await caches.delete(CACHE);throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // Keep this and one prior compatible bundle. Touch only this environment and URL scope.
 const current=await caches.open(CACHE),manifestResponse=await current.match(absolute('release.json'));if(!manifestResponse)throw Error('Prepared release missing');const manifest=await manifestResponse.json();if(manifest.release!==RELEASE||manifest.environment!==NAMESPACE.slice('mba-v2-'.length)||!Array.isArray(manifest.resources)||!manifest.resources.length)throw Error('Prepared release invalid');const paths=new Set();for(const item of manifest.resources){if(typeof item.url!=='string'||!item.url||item.url.startsWith('/')||item.url.split('/').some(p=>!p||p==='.'||p==='..')||/[?#%\\\\]/.test(item.url)||!(/^[a-f0-9]{64}$/.test(item.sha256))||!Number.isSafeInteger(item.bytes)||item.bytes<0||paths.has(item.url))throw Error('Prepared release invalid');paths.add(item.url);}if(!await compatibleManifest(manifest,RELEASE,true))throw Error('Prepared release inventory integrity mismatch');for(const item of manifest.resources){if(!await verified(await current.match(absolute(item.url)),item))throw Error('Prepared release incomplete');}
 const keys=(await caches.keys()).filter(k=>k.startsWith(PREFIX)&&k!==CACHE);const healthy=[];for(const key of keys){const older=await caches.open(key),response=await older.match(absolute('release.json'));if(!response)continue;try{const previous=await response.json();if(previous.release!==key.slice(PREFIX.length)||previous.environment!==NAMESPACE.slice('mba-v2-'.length)||!Array.isArray(previous.resources)||!previous.resources.length)continue;let valid=true;const seen=new Set();for(const item of previous.resources){if(typeof item.url!=='string'||!item.url||item.url.startsWith('/')||item.url.split('/').some(p=>!p||p==='.'||p==='..')||/[?#%\\\\]/.test(item.url)||!(/^[a-f0-9]{64}$/.test(item.sha256))||!Number.isSafeInteger(item.bytes)||item.bytes<0||seen.has(item.url)){valid=false;break;}seen.add(item.url);if(!await verified(await older.match(absolute(item.url)),item)){valid=false;break;}}if(valid)healthy.push(key);}catch{/* Ignore invalid rollback candidates. */}}const keep=healthy.at(-1);for(const key of keys){if(key!==keep)await caches.delete(key);}await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);url.search='';url.hash='';if(url.pathname.endsWith('/'))url.pathname+='index.html';const hit=await cache.match(url.href);if(hit){const manifestResponse=await cache.match(absolute('release.json'));if(manifestResponse){try{const manifest=await manifestResponse.json();const relative=url.pathname.slice(ROOT.pathname.length);const item=manifest.resources?.find(entry=>entry.url===relative);if(await compatibleManifest(manifest,RELEASE,true)&&item&&await verified(hit,item))return cachedResponse(hit,event.request);}catch{/* Invalid cache metadata must not authorize serving unverified assets. */}}}
 // Recover an identical verified asset from a previous compatible release if the current cache is corrupt.
 let recoverableItem=null;
 const currentManifest=await cache.match(absolute('release.json'));
 if(currentManifest){
  try{
   const manifest=await currentManifest.json();
   if(await compatibleManifest(manifest,RELEASE,true)){
    const relative=url.pathname.slice(ROOT.pathname.length);
    const item=manifest.resources?.find(entry=>entry.url===relative);
    recoverableItem=item||null;
    if(item&&typeof item.sha256==='string'&&/^[a-f0-9]{64}$/.test(item.sha256)&&Number.isSafeInteger(item.bytes)&&item.bytes>=0){
     for(const key of await caches.keys()){
      if(!key.startsWith(PREFIX)||key===CACHE)continue;
      const previous=await caches.open(key),metadata=await previous.match(absolute('release.json'));
      if(!metadata)continue;
      try{
       const oldManifest=await metadata.json();
       if(!await compatibleManifest(oldManifest,key.slice(PREFIX.length)))continue;
       const oldItem=oldManifest.resources?.find(entry=>entry.url===relative&&entry.sha256===item.sha256&&entry.bytes===item.bytes);
       if(!oldItem)continue;
       const candidate=await previous.match(url.href);
       if(await verified(candidate,item)){await restoreVerified(cache,url.href,candidate);return cachedResponse(candidate,event.request);}
      }catch{/* Ignore incompatible rollback cache. */}
     }
    }
   }
  }catch{/* A corrupt manifest cannot authorize fallback content. */}
 }
 // Unknown destinations are never silently replaced with the Hub.
 try{const response=await fetch(event.request);
  // Never persist partial responses or network bytes without current release authority.
  if(recoverableItem&&response.status===200&&!event.request.headers?.get('range')&&await verified(response,recoverableItem)){
   await restoreVerified(cache,url.href,response);return cachedResponse(response,event.request);
  }
  return response;
 }catch{return new Response('This resource is not prepared offline.',{status:503,headers:{'Content-Type':'text/plain'}});}})());
});
self.addEventListener('message',event=>{
 let clientURL=null;try{if(event.source?.url)clientURL=new URL(event.source.url);}catch{return;}if(!clientURL||clientURL.origin!==ROOT.origin||!clientURL.pathname.startsWith(ROOT.pathname))return;
 event.waitUntil((async()=>{try{
 const type=event.data?.type;if(type==='REPAIR'){if(!NAMESPACE.endsWith('-developer'))throw Error('Read-only environment');await prepareShared();}
 // Explicit refresh can refill only this worker's authenticated release; it neither
 // deletes caches nor activates a worker, and does not grant general REPAIR access.
 else if(type==='RECOVER_OFFLINE'){if(clientURL.pathname!==new URL('refresh.html',ROOT).pathname)throw Error('Recovery requires the refresh page');await prepareShared();}
 else if(type!=='STATUS'&&type!=='ACTIVATE_UPDATE')throw Error('Unsupported command');
 const cache=await caches.open(CACHE),response=await cache.match(absolute('release.json'));if(!response){event.ports[0]?.postMessage({complete:false,count:0,total:0,release:RELEASE});return;}
 const invalidInventory=message=>Object.assign(Error(message),{code:'OFFLINE_INVENTORY_INVALID'});
 let manifest;try{const text=await response.text();try{manifest=JSON.parse(text);}catch{throw invalidInventory('Invalid cached release manifest JSON');}if(!manifest||manifest.release!==RELEASE||manifest.environment!==NAMESPACE.slice('mba-v2-'.length)||!Array.isArray(manifest.resources)||!manifest.resources.length)throw invalidInventory('Invalid cached release manifest');const seen=new Set();for(const item of manifest.resources){if(!item||typeof item.url!=='string'||!item.url||item.url.startsWith('/')||item.url.split('/').some(p=>!p||p==='.'||p==='..')||/[?#%\\\\]/.test(item.url)||!(/^[a-f0-9]{64}$/.test(item.sha256))||!Number.isSafeInteger(item.bytes)||item.bytes<0||seen.has(item.url))throw invalidInventory('Invalid cached release manifest');seen.add(item.url);}if(!await compatibleManifest(manifest,RELEASE,true))throw invalidInventory('Cached release inventory integrity mismatch');}
 catch(error){if(type==='STATUS'&&error.code==='OFFLINE_INVENTORY_INVALID'){event.ports[0]?.postMessage({error:error.message,code:'OFFLINE_INVENTORY_INVALID'});return;}throw error;}
 let count=0;for(const item of manifest.resources){if(await verified(await cache.match(absolute(item.url)),item))count++;}
 if(type==='ACTIVATE_UPDATE'){if(count!==manifest.resources.length)throw Error('Update is not completely verified');event.ports[0]?.postMessage({activating:true,release:RELEASE});await self.skipWaiting();return;}
 event.ports[0]?.postMessage({complete:count===manifest.resources.length,count,total:manifest.resources.length,release:RELEASE});
 }catch(e){event.ports[0]?.postMessage({error:e.message});}})());
});
