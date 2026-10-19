import {observeOfflineLifecycle} from './offline-lifecycle.js';
import {request} from './worker-channel.js';
export async function initializeOffline(status){
 if(!('serviceWorker' in navigator)){if(status)status.textContent='Offline storage unavailable';return;}
 const serviceWorker=navigator.serviceWorker;
 const root=new URL('../',import.meta.url);
 let registration=null,registering=null;
 const register=()=>{
  if(registering)return registering;
  registering=Promise.resolve().then(()=>serviceWorker.register(new URL('sw.js',root),{scope:root.pathname,updateViaCache:'none'}))
   .then(result=>{registration=result;return result;}).finally(()=>{registering=null;});
  return registering;
 };
 const updateStatus=async()=>{
  if(status)status.textContent='Checking offline files…';
  const result=await request('STATUS');
  if(status)status.textContent=result.complete?`Ready offline · ${result.count} files`:`Preparing offline · ${result.count}/${result.total}`;
 };
 const checkForUpdate=async()=>{if(registration)await registration.update();else await register();};
 const lifecycle=observeOfflineLifecycle({window,document,serviceWorker,refresh:updateStatus,checkForUpdate,
  onError:()=>{if(status)status.textContent='Offline status temporarily unavailable';}});
 // Registration may fail offline or stall during an update. The controlling worker
 // can still verify its installed cache; recovery listeners must already exist.
 void register().then(()=>lifecycle.verify()).catch(()=>{});
 await lifecycle.verify();
 return lifecycle;
}
