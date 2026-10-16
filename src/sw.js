const NAMESPACE='__NAMESPACE__',RELEASE='__RELEASE__',ROOT=new URL('./',self.location.href),PREFIX=NAMESPACE+':'+ROOT.pathname+':',CACHE=PREFIX+RELEASE;
const absolute=p=>new URL(p,ROOT).href;
async function verified(response,item){if(!response||!response.ok)return false;const bytes=await response.clone().arrayBuffer();if(bytes.byteLength!==item.bytes)return false;return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('')===item.sha256;}
async function prepare(){
 const response=await fetch(absolute('release.json'),{cache:'no-store'});if(!response.ok)throw Error('Release manifest unavailable');const manifest=await response.clone().json();if(manifest.release!==RELEASE||manifest.environment!==NAMESPACE.slice('mba-v2-'.length))throw Error('Deployment changed or environment mismatch during offline preparation');
 if(!Array.isArray(manifest.resources)||!manifest.resources.length)throw Error('Invalid release resources');
 const paths=new Set();for(const item of manifest.resources){if(typeof item.url!=='string'||!item.url||item.url.startsWith('/')||item.url.split('/').some(p=>!p||p==='.'||p==='..')||/[?#%\\\\]/.test(item.url)||!(/^[a-f0-9]{64}$/.test(item.sha256))||!Number.isSafeInteger(item.bytes)||item.bytes<0||paths.has(item.url))throw Error('Unsafe or duplicate release resource');paths.add(item.url);}

 const cache=await caches.open(CACHE),previous=(await caches.keys()).filter(k=>k.startsWith(PREFIX)&&k!==CACHE);
 // A failed preparation must never leave a partial bundle marked as ready.
 for(const item of manifest.resources){let resource=await cache.match(absolute(item.url));if(!await verified(resource,item)){resource=null;for(const old of previous){const candidate=await (await caches.open(old)).match(absolute(item.url));if(await verified(candidate,item)){resource=candidate;break;}}if(!resource)resource=await fetch(absolute(item.url),{cache:'no-store'});if(!await verified(resource,item))throw Error('Asset verification failed: '+item.url);await cache.put(absolute(item.url),resource);}}
 await cache.put(absolute('release.json'),response);return manifest;
}
self.addEventListener('install',event=>event.waitUntil((async()=>{try{await prepare();}catch(error){await caches.delete(CACHE);throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // Keep this and one prior compatible bundle. Touch only this environment and URL scope.
 const current=await caches.open(CACHE),manifestResponse=await current.match(absolute('release.json'));if(!manifestResponse)throw Error('Prepared release missing');const manifest=await manifestResponse.json();if(manifest.release!==RELEASE||!Array.isArray(manifest.resources)||!manifest.resources.length)throw Error('Prepared release invalid');const paths=new Set();for(const item of manifest.resources){if(typeof item.url!=='string'||!item.url||item.url.startsWith('/')||item.url.split('/').some(p=>!p||p==='.'||p==='..')||/[?#%\\\\]/.test(item.url)||!(/^[a-f0-9]{64}$/.test(item.sha256))||!Number.isSafeInteger(item.bytes)||item.bytes<0||paths.has(item.url))throw Error('Prepared release invalid');paths.add(item.url);}for(const item of manifest.resources){if(!await verified(await current.match(absolute(item.url)),item))throw Error('Prepared release incomplete');}
 const keys=(await caches.keys()).filter(k=>k.startsWith(PREFIX)&&k!==CACHE);const healthy=[];for(const key of keys){const older=await caches.open(key),response=await older.match(absolute('release.json'));if(!response)continue;try{const previous=await response.json();if(previous.release!==key.slice(PREFIX.length)||!Array.isArray(previous.resources)||!previous.resources.length)continue;let valid=true;const seen=new Set();for(const item of previous.resources){if(typeof item.url!=='string'||!item.url||item.url.startsWith('/')||item.url.split('/').some(p=>!p||p==='.'||p==='..')||/[?#%\\\\]/.test(item.url)||!(/^[a-f0-9]{64}$/.test(item.sha256))||!Number.isSafeInteger(item.bytes)||item.bytes<0||seen.has(item.url)){valid=false;break;}seen.add(item.url);if(!await verified(await older.match(absolute(item.url)),item)){valid=false;break;}}if(valid)healthy.push(key);}catch{/* Ignore invalid rollback candidates. */}}const keep=healthy.at(-1);for(const key of keys){if(key!==keep)await caches.delete(key);}await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);url.search='';url.hash='';if(url.pathname.endsWith('/'))url.pathname+='index.html';const hit=await cache.match(url.href);if(hit){const manifestResponse=await cache.match(absolute('release.json'));if(manifestResponse){try{const manifest=await manifestResponse.json();const relative=url.pathname.slice(ROOT.pathname.length);const item=manifest.resources?.find(entry=>entry.url===relative);if(item&&await verified(hit,item))return hit;}catch{/* Invalid cache metadata must not authorize serving unverified assets. */}}}
 // Unknown destinations are never silently replaced with the Hub.
 try{return await fetch(event.request);}catch{return new Response('This resource is not prepared offline.',{status:503,headers:{'Content-Type':'text/plain'}});}})());
});
self.addEventListener('message',event=>{
 let clientURL=null;try{if(event.source?.url)clientURL=new URL(event.source.url);}catch{return;}if(!clientURL||clientURL.origin!==ROOT.origin||!clientURL.pathname.startsWith(ROOT.pathname))return;
 event.waitUntil((async()=>{try{
 const type=event.data?.type;if(type==='REPAIR'){if(!NAMESPACE.endsWith('-developer'))throw Error('Read-only environment');await prepare();}
 else if(type!=='STATUS'&&type!=='ACTIVATE_UPDATE')throw Error('Unsupported command');
 const cache=await caches.open(CACHE),response=await cache.match(absolute('release.json'));if(!response){event.ports[0]?.postMessage({complete:false,count:0,total:0,release:RELEASE});return;}
 const manifest=await response.json();if(manifest.release!==RELEASE||!Array.isArray(manifest.resources)||!manifest.resources.length)throw Error('Invalid cached release manifest');const seen=new Set();for(const item of manifest.resources){if(typeof item.url!=='string'||!item.url||item.url.startsWith('/')||item.url.split('/').some(p=>!p||p==='.'||p==='..')||/[?#%\\\\]/.test(item.url)||!(/^[a-f0-9]{64}$/.test(item.sha256))||!Number.isSafeInteger(item.bytes)||item.bytes<0||seen.has(item.url))throw Error('Invalid cached release manifest');seen.add(item.url);}let count=0;for(const item of manifest.resources){if(await verified(await cache.match(absolute(item.url)),item))count++;}
 if(type==='ACTIVATE_UPDATE'){if(count!==manifest.resources.length)throw Error('Update is not completely verified');event.ports[0]?.postMessage({activating:true,release:RELEASE});await self.skipWaiting();return;}
 event.ports[0]?.postMessage({complete:count===manifest.resources.length,count,total:manifest.resources.length,release:RELEASE});
 }catch(e){event.ports[0]?.postMessage({error:e.message});}})());
});
