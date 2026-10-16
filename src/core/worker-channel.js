// A request owns its channel and timer; release both on success or failure.
export async function request(type){
 const registration=await navigator.serviceWorker.ready;
 const worker=navigator.serviceWorker.controller||registration.active;
 if(!worker)throw Error('No active offline worker');
 return new Promise((resolve,reject)=>{
  const channel=new MessageChannel();
  let timer;
  const finish=(error,data)=>{
   clearTimeout(timer);
   channel.port1.onmessage=null;
   channel.port1.onmessageerror=null;
   channel.port1.close();
   channel.port2.close();
   if(error)reject(error);else resolve(data);
  };
  timer=setTimeout(()=>finish(Error('Offline worker timed out')),30000);
  channel.port1.onmessage=event=>{
   const data=event.data;
   if(!data||typeof data!=='object')return finish(Error('Invalid offline worker response'));
   finish(data.error?Error(String(data.error)):null,data);
  };
  channel.port1.onmessageerror=()=>finish(Error('Offline worker response could not be decoded'));
  try{worker.postMessage({type},[channel.port2]);}catch(error){finish(error);}
 });
}
