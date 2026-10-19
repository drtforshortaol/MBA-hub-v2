import {observeOfflineLifecycle} from './offline-lifecycle.js';
import {request} from './worker-channel.js';
import {attachOfflineCheck} from './offline-controls.js';
export async function initializeOffline(status){
 if(!('serviceWorker' in navigator)){if(status)status.textContent='Offline storage unavailable';return;}
 const serviceWorker=navigator.serviceWorker;
 const root=new URL('../',import.meta.url);
 let registration=null,registering=null,stopped=false;
 let activeRequest=null;
 const register=()=>{
  if(registering)return registering;
  registering=Promise.resolve().then(()=>serviceWorker.register(new URL('sw.js',root),{scope:root.pathname,updateViaCache:'none'}))
   .then(result=>{registration=result;return result;}).finally(()=>{registering=null;});
  return registering;
 };
 const updateStatus=async()=>{
  if(stopped)return;
  if(status)status.textContent='Checking offline files…';
  const controller=new AbortController();activeRequest=controller;
  let result;
  try{result=await request('STATUS',{signal:controller.signal});}
  finally{if(activeRequest===controller)activeRequest=null;}
  if(stopped)return;
  // A stale or malformed worker reply must never advertise offline readiness.
  const {complete,count,total}=result;
  if(typeof complete!=='boolean'||!Number.isSafeInteger(count)||!Number.isSafeInteger(total)||
   count<0||total<0||count>total||complete!==(total>0&&count===total))
   throw Error('Invalid offline status response');
  if(status)status.textContent=result.complete?`Ready offline · ${result.count} files`:`Preparing offline · ${result.count}/${result.total}`;
 };
 const checkForUpdate=async()=>{if(registration)await registration.update();else await register();};
 const lifecycle=observeOfflineLifecycle({window,document,serviceWorker,refresh:updateStatus,checkForUpdate,
  interrupt:()=>activeRequest?.abort(),
  onError:error=>{if(!stopped&&error?.name!=='AbortError'&&status)status.textContent='Offline status temporarily unavailable';}});
 const controls=attachOfflineCheck(status,{verify:lifecycle.verify,checkForUpdate});
 const stop=lifecycle.stop;
 lifecycle.stop=()=>{stopped=true;controls.stop();stop();activeRequest?.abort();};
 // Registration may fail offline or stall during an update. The controlling worker
 // can still verify its installed cache; recovery listeners must already exist.
 void register().then(()=>lifecycle.verify()).catch(()=>{});
 await lifecycle.verify();
 return lifecycle;
}
