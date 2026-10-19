/** Add a safe manual check beside the Hub's live offline status. */
export function attachOfflineCheck(status,{verify,checkForUpdate,isOnline=()=>navigator.onLine!==false}){
 const document=status?.ownerDocument;
 if(!document||!status.parentNode)return {stop(){}};
 const button=document.createElement('button');
 button.type='button';button.className='open-app';button.textContent='Check offline files';
 if(status.id)button.setAttribute('aria-controls',status.id);
 let running=false,stopped=false;
 const check=async()=>{
  if(running||stopped)return;
  running=true;button.disabled=true;button.textContent='Checking offline files…';
  // Update discovery may stall offline. It must not block cache verification or
  // activate a waiting worker, clear storage, or prevent a later manual check.
  if(isOnline())void Promise.resolve().then(checkForUpdate).catch(()=>{});
  try{await verify();}finally{
   running=false;
   if(!stopped){button.disabled=false;button.textContent='Check offline files';}
  }
 };
 const click=()=>{void check().catch(()=>{});};
 button.addEventListener('click',click);status.after(button);
 return {stop(){stopped=true;button.removeEventListener('click',click);button.remove();}};
}
