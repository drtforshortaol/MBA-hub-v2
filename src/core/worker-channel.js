// A request owns one deadline, including registration readiness, and releases its ports.
export function request(type){
 return new Promise((resolve,reject)=>{
  let channel;
  let settled=false;
  const finish=(error,data)=>{
   if(settled)return;
   settled=true;
   clearTimeout(timer);
   if(channel){
    channel.port1.onmessage=null;
    channel.port1.onmessageerror=null;
    channel.port1.close();
    channel.port2.close();
   }
   if(error)reject(error);else resolve(data);
  };
  const timer=setTimeout(()=>finish(Error('Offline worker timed out')),30000);
  const send=worker=>{
   if(settled)return;
   if(!worker)return finish(Error('No active offline worker'));
   try{
    channel=new MessageChannel();
    channel.port1.onmessage=event=>{
     const data=event.data;
     if(!data||typeof data!=='object')return finish(Error('Invalid offline worker response'));
     finish(data.error?Error(String(data.error)):null,data);
    };
    channel.port1.onmessageerror=()=>finish(Error('Offline worker response could not be decoded'));
    worker.postMessage({type},[channel.port2]);
   }catch(error){finish(error);}
  };
  try{
   const serviceWorker=navigator.serviceWorker;
   if(!serviceWorker)return finish(Error('Offline workers are unavailable'));
   if(serviceWorker.controller)send(serviceWorker.controller);
   else Promise.resolve(serviceWorker.ready).then(registration=>send(serviceWorker.controller||registration.active),error=>finish(error));
  }catch(error){finish(error);}
 });
}
