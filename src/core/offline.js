import {observeOfflineLifecycle} from './offline-lifecycle.js';
export async function initializeOffline(status){
 if(!('serviceWorker' in navigator)){if(status)status.textContent='Offline storage unavailable';return;}
 try{
  const root=new URL('../',import.meta.url);const registration=await navigator.serviceWorker.register(new URL('sw.js',root),{scope:root.pathname,updateViaCache:'none'});
  const ready=await navigator.serviceWorker.ready;
  const updateStatus=async()=>{if(status)status.textContent='Checking offline files…';const {request}=await import('./worker-channel.js');const result=await request('STATUS');if(status)status.textContent=result.complete?`Ready offline · ${result.count} files`:`Preparing offline · ${result.count}/${result.total}`;};
  const lifecycle=observeOfflineLifecycle({window,document,serviceWorker:navigator.serviceWorker,refresh:updateStatus,checkForUpdate:()=>registration.update(),onError:()=>{if(status)status.textContent='Offline status temporarily unavailable';}});
  await lifecycle.verify();registration.update().catch(()=>{});
  return ready;
 }catch(e){if(status)status.textContent='Offline preparation needs another online visit';console.error(e);}
}
