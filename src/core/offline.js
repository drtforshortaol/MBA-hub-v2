export async function initializeOffline(status){
 if(!('serviceWorker' in navigator)){if(status)status.textContent='Offline storage unavailable';return;}
 try{
  const root=new URL('../',import.meta.url);const registration=await navigator.serviceWorker.register(new URL('sw.js',root),{scope:root.pathname,updateViaCache:'none'});
  const ready=await navigator.serviceWorker.ready;
  const updateStatus=async()=>{const {request}=await import('./worker-channel.js');const result=await request('STATUS');if(status)status.textContent=result.complete?`Ready offline · ${result.count} files`:`Preparing offline · ${result.count}/${result.total}`;};
  navigator.serviceWorker.addEventListener('controllerchange',()=>updateStatus().catch(()=>{}));
  await updateStatus();registration.update().catch(()=>{});
  window.addEventListener('online',()=>registration.update().catch(()=>{}));
  return ready;
 }catch(e){if(status)status.textContent='Offline preparation needs another online visit';console.error(e);}
}
