const NAMESPACE='__NAMESPACE__',RELEASE='__RELEASE__',ROOT=new URL('./',self.location.href),PREFIX=NAMESPACE+':'+ROOT.pathname+':',CACHE=PREFIX+RELEASE;
const absolute=p=>new URL(p,ROOT).href;
async function digest(response){const bytes=await response.clone().arrayBuffer();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function verified(response,item){return response&&response.ok&&(await digest(response))===item.sha256;}
async function prepare(){
 const response=await fetch(absolute('release.json'),{cache:'no-store'});if(!response.ok)throw Error('Release manifest unavailable');const manifest=await response.clone().json();if(manifest.release!==RELEASE)throw Error('Deployment changed during offline preparation');
 const cache=await caches.open(CACHE),previous=(await caches.keys()).filter(k=>k.startsWith(PREFIX)&&k!==CACHE);
 for(const item of manifest.resources){let resource=await cache.match(absolute(item.url));if(!await verified(resource,item)){resource=null;for(const old of previous){const candidate=await (await caches.open(old)).match(absolute(item.url));if(await verified(candidate,item)){resource=candidate;break;}}if(!resource)resource=await fetch(absolute(item.url),{cache:'no-store'});if(!await verified(resource,item))throw Error('Asset verification failed: '+item.url);await cache.put(absolute(item.url),resource);}}
 await cache.put(absolute('release.json'),response);return manifest;
}
self.addEventListener('install',event=>event.waitUntil(prepare()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // Keep this and one prior compatible bundle. Touch only this environment and URL scope.
 const keys=(await caches.keys()).filter(k=>k.startsWith(PREFIX)&&k!==CACHE);for(const k of keys.slice(0,-1))await caches.delete(k);await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);url.search='';url.hash='';if(url.pathname.endsWith('/'))url.pathname+='index.html';const hit=await cache.match(url.href);if(hit)return hit;
 // Unknown destinations are never silently replaced with the Hub.
 try{return await fetch(event.request);}catch{return new Response('This resource is not prepared offline.',{status:503,headers:{'Content-Type':'text/plain'}});}})());
});
self.addEventListener('message',event=>{
 const clientURL=event.source?.url?new URL(event.source.url):null;if(!clientURL||clientURL.origin!==ROOT.origin||!clientURL.pathname.startsWith(ROOT.pathname))return;
 event.waitUntil((async()=>{try{
 const type=event.data?.type;if(type==='REPAIR'){if(!NAMESPACE.endsWith('-developer'))throw Error('Read-only environment');await prepare();}
 else if(type!=='STATUS')throw Error('Unsupported command');
 const cache=await caches.open(CACHE),response=await cache.match(absolute('release.json'));if(!response){event.ports[0]?.postMessage({complete:false,count:0,total:0,release:RELEASE});return;}
 const manifest=await response.json();let count=0;for(const item of manifest.resources){if(await verified(await cache.match(absolute(item.url)),item))count++;}
 event.ports[0]?.postMessage({complete:count===manifest.resources.length,count,total:manifest.resources.length,release:RELEASE});
 }catch(e){event.ports[0]?.postMessage({error:e.message});}})());
});
