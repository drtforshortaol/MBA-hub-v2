import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto,{webcrypto} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const OFFLINE_SCENARIOS=[
 {name:'prepared-navigation',file:'offline-navigation',options:{}},
 {name:'corrupted-entry-recovery',file:'offline-recovery',options:{recoverFromPrior:true}},
 {name:'inventory-loss-recovery',file:'inventory-recovery',options:{recoverInventory:true}},
 {name:'interrupted-inventory-recovery',file:'interrupted-recovery',options:{recoverInventory:true,interruptRecovery:true}},
 {name:'refresh-page-inventory-recovery',file:'refresh-page-recovery',options:{recoverInventory:true,refreshPage:true}},
 {name:'corrupt-json-inventory-recovery',file:'corrupt-json-recovery',options:{recoverInventory:true,refreshPage:true,corruptInventory:'json'}},
 {name:'forged-inventory-recovery',file:'forged-inventory-recovery',options:{recoverInventory:true,refreshPage:true,corruptInventory:'forged'}}
];

// Real built worker and bundle bytes, simulated CacheStorage and lifecycle events.
// This evidence does not establish browser rendering or physical-device approval.
export async function verifyOfflineNavigation(directory,environment,{recoverFromPrior=false,recoverInventory=false,interruptRecovery=false,refreshPage=false,corruptInventory=null}={}){
 const root=new URL(`https://offline.example/review/${environment}/`);
 const read=name=>fs.readFileSync(path.join(directory,name));
 const release=JSON.parse(read('release.json')),registry=JSON.parse(read('registry.json')),search=JSON.parse(read('search-index.json'));
 const report={schema_version:1,scope:'Simulated worker routing and byte integrity and refresh-script orchestration only; no DOM/rendering, native service-worker lifecycle or device approval',environment,scenario:recoverInventory?(corruptInventory==='json'?'corrupt-json-inventory-recovery':corruptInventory==='forged'?'forged-inventory-recovery':refreshPage?'refresh-page-inventory-recovery':interruptRecovery?'interrupted-inventory-recovery':'inventory-loss-recovery'):(recoverFromPrior?'corrupted-entry-recovery':'prepared-navigation'),release:release.release,passed:false,resources:{expected:release.resources.length,verified:0,errors:[]},apps:[],errors:[],offlineNetworkAttempts:0,appEntryPoints:new Set(registry.apps.map(app=>app.entry_point)).size,searchTargets:0,navigationTargets:0};
 const handlers={},stores=new Map();let offline=false,interruptAt=0,recoveryFetches=0,cacheDeletions=0,activations=0;
 const caches={async keys(){return [...stores.keys()];},async delete(key){cacheDeletions++;return stores.delete(key);},async open(key){
  if(!stores.has(key)){
   const entries=new Map();stores.set(key,{async put(url,response){entries.set(String(url),response.clone());},async match(url){return entries.get(String(url))?.clone();}});
  }
  return stores.get(key);
 }};
 const self={location:{href:new URL('sw.js',root).href},clients:{async claim(){}},async skipWaiting(){activations++;},addEventListener(type,handler){handlers[type]=handler;}};
 const fetch=async input=>{
  if(offline){report.offlineNetworkAttempts++;throw Error('Network disabled for acceptance');}
  const url=new URL(typeof input==='string'?input:input.url||String(input));
  if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname))throw Error('Out-of-scope resource');
  if(interruptAt&&url.pathname!==new URL('release.json',root).pathname&&++recoveryFetches===interruptAt)throw Error('Simulated interrupted inventory download');
  return new Response(read(url.pathname.slice(root.pathname.length)));
 };
 async function invoke(type,event={}){
  let result;handlers[type]({...event,waitUntil(value){result=value;},respondWith(value){result=value;}});return result;
 }
 try{
  if(release.environment!==environment||registry.environment!==environment)throw Error('Artifact environment mismatch');
  vm.runInNewContext(read('sw.js').toString('utf8'),{self,caches,fetch,Response,URL,crypto:webcrypto},{timeout:1000});
  await invoke('install');await invoke('activate');
  if(recoverFromPrior){
   const prefix=`mba-v2-${environment}:${root.pathname}:`;
   const current=await caches.open(prefix+release.release);
   const priorManifest=structuredClone(release);
   const icon=priorManifest.resources.find(item=>item.url==='icon.svg');
   if(!icon)throw Error('Rollback fixture requires a bundled icon');
   const priorIcon=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><title>Prior acceptance release</title></svg>');
   icon.bytes=priorIcon.length;icon.sha256=crypto.createHash('sha256').update(priorIcon).digest('hex');
   priorManifest.release=crypto.createHash('sha256').update(JSON.stringify(priorManifest.resources)).digest('hex').slice(0,16);
   const prior=await caches.open(prefix+priorManifest.release);
   // Seed a complete compatible rollback bundle, then damage all current app entries.
   for(const item of release.resources){
    const url=new URL(item.url,root).href;
    const response=await current.match(url);
    if(!response)throw Error(`Prepared asset missing: ${item.url}`);
    await prior.put(url,response);
   }
   await prior.put(new URL('icon.svg',root).href,new Response(priorIcon));
   await prior.put(new URL('release.json',root).href,new Response(JSON.stringify(priorManifest)));
   for(const entry of new Set(registry.apps.map(app=>app.entry_point)))
    await current.put(new URL(entry,root).href,new Response('Damaged current application entry'));
  }
  if(recoverInventory){
   const key=`mba-v2-${environment}:${root.pathname}:`+release.release;
   if(corruptInventory){
    const invalid=corruptInventory==='json'?'{invalid JSON':JSON.stringify({...release,resources:release.resources.slice(1)});
    await (await caches.open(key)).put(new URL('release.json',root).href,new Response(invalid));
   }else await caches.delete(key);
   const retained=await caches.open('unrelated-user-data');
   await retained.put('https://offline.example/retained',new Response('Preserved user data'));
   cacheDeletions=0;activations=0;
   async function command(type){
    let reply;
    await invoke('message',{source:{url:new URL('refresh.html',root).href},data:{type},ports:[{postMessage(value){reply=value;}}]});
    if(!reply)throw Error(`No reply to ${type}`);return reply;
   }
   const initial=await command('STATUS');
   if(corruptInventory){if(initial.code!=='OFFLINE_INVENTORY_INVALID'||!initial.error)throw Error('Invalid inventory was not detected');}
   else if(initial.error||initial.complete!==false||initial.count!==0||initial.total!==0)throw Error('Inventory loss was not detected');
   let interrupted=false;
   if(interruptRecovery){
    interruptAt=Math.max(1,Math.floor(release.resources.length/2));
    const failed=await command('RECOVER_OFFLINE');interruptAt=0;
    if(!failed.error?.includes('Simulated interrupted inventory download'))throw Error('Recovery interruption was not detected');
    const partial=await command('STATUS');
    if(partial.error||partial.complete!==false)throw Error('Interrupted inventory falsely marked ready');
    interrupted=true;
   }
   let ready;
   if(refreshPage){
    const status={textContent:''},serviceWorker=new EventTarget(),ports=[],timers=new Map(),navigations=[],commands=[];
    let nextTimer=0;
    class Channel{constructor(){
     this.port1={onmessage:null,onmessageerror:null,closed:false,close(){this.closed=true;}};
     this.port2={closed:false,close(){this.closed=true;},postMessage:data=>this.port1.onmessage?.({data})};
     ports.push(this.port1,this.port2);
    }}
    const active={postMessage(message,transferred){
     commands.push(message.type);
     void invoke('message',{source:{url:new URL('refresh.html',root).href},data:message,ports:[{postMessage(value){
      if(message.type==='RECOVER_OFFLINE')ready=value;
      transferred[0].postMessage(value);
     }}]}).catch(error=>transferred[0].postMessage({error:error.message}));
    }};
    serviceWorker.register=async()=>({update:async()=>{},installing:null,waiting:null,active});
    const script=read('refresh.html').toString('utf8').match(/<script>([\s\S]*?)<\/script>/)?.[1];
    if(!script)throw Error('Generated refresh page script missing');
    const done=vm.runInNewContext(script,{document:{querySelector:()=>status},navigator:{serviceWorker},
     location:{href:new URL('refresh.html',root).href,replace:url=>navigations.push(String(url))},URL,MessageChannel:Channel,fetch,
     setTimeout(fn,delay){const id=++nextTimer;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id)}, {timeout:1000});
    let deadline;
    try{await Promise.race([done,new Promise((_,reject)=>{deadline=setTimeout(()=>reject(Error('Generated refresh page did not finish')),30000);})]);}
    finally{clearTimeout(deadline);}
    if(commands.join(',')!=='STATUS,RECOVER_OFFLINE'||navigations.length!==1||navigations[0]!==new URL('index.html?home=1',root).href||timers.size||ports.some(port=>!port.closed))throw Error('Generated refresh page failed recovery orchestration: '+status.textContent);
    report.refreshPage={commands,navigations:navigations.length,channelsClosed:true,timersCleared:true};
   }else ready=await command('RECOVER_OFFLINE');
   if(ready.error||ready.complete!==true||ready.release!==release.release||ready.total!==release.resources.length||ready.count!==release.resources.length)throw Error('Full inventory recovery readiness mismatch');
   const preserved=await (await retained.match('https://offline.example/retained'))?.text();
   if(preserved!=='Preserved user data'||cacheDeletions||activations)throw Error('Recovery deleted data or activated a worker');
   report.recovery={...(corruptInventory?{initialErrorCode:initial.code}:{initialComplete:false,initialCount:0,initialTotal:0}),interrupted,complete:true,count:ready.count,total:ready.total,retainedDataPreserved:true,cacheDeletions,activations};
  }
  offline=true;
  for(const app of registry.apps){
   const searchTargets=new Set(search.filter(entry=>entry.app_id===app.app_id).map(entry=>entry.url));
   const targets=new Set([app.entry_point,...searchTargets]);
   if(app.entry_point.endsWith('/index.html'))targets.add(app.entry_point.slice(0,-'index.html'.length));
   const expected=release.resources.find(item=>item.url===app.entry_point);
   const result={app_id:app.app_id,searchTargets:searchTargets.size,expected:targets.size,verified:0,errors:[]};
   report.searchTargets+=searchTargets.size;report.navigationTargets+=targets.size;
   for(const target of targets){
    try{
     const response=await invoke('fetch',{request:{method:'GET',url:new URL(target,root).href}});
     if(!response||response.status!==200)throw Error(`HTTP ${response?.status??'not intercepted'}`);
     const bytes=Buffer.from(await response.arrayBuffer());
     if(!expected||bytes.length!==expected.bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==expected.sha256)throw Error('Navigation returned incorrect entry bytes');
     result.verified++;
    }catch(error){result.errors.push(`${target}: ${error.message}`);}
   }
   result.passed=result.errors.length===0;report.apps.push(result);
  }
  // Navigation alone does not establish that images, scripts and styles survive offline.
  // Check every declared resource against the same release's exact bytes.
  for(const item of release.resources){
   try{
    const response=await invoke('fetch',{request:{method:'GET',url:new URL(item.url,root).href}});
    if(!response||response.status!==200)throw Error(`HTTP ${response?.status??'not intercepted'}`);
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length!==item.bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Resource returned incorrect bytes');
    report.resources.verified++;
   }catch(error){report.resources.errors.push(`${item.url}: ${error.message}`);}
  }
  if(!report.apps.length)report.errors.push('No applications verified');
  if(report.offlineNetworkAttempts)report.errors.push(`Offline navigation attempted network ${report.offlineNetworkAttempts} times`);
 }catch(error){report.errors.push(error.message);}
 report.passed=report.errors.length===0&&report.apps.length>0&&report.apps.every(app=>app.passed)&&report.resources.verified===report.resources.expected&&report.resources.errors.length===0;return report;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length!==0&&(args.length!==2||args[0]!=='--report-dir'||!args[1]))throw Error('Usage: node scripts/verify-offline-navigation.mjs [--report-dir PATH]');
 for(const environment of ['developer','tester'])for(const scenario of OFFLINE_SCENARIOS){
  const report=await verifyOfflineNavigation(`dist/${environment}`,environment,scenario.options);
  if(args[1]){fs.mkdirSync(args[1],{recursive:true});fs.writeFileSync(path.join(args[1],`${environment}-${scenario.file}.json`),JSON.stringify(report,null,2)+'\n');}
  console.log(`${environment} ${report.scenario}: ${report.passed?'PASS':'FAIL'} ${report.apps.reduce((n,app)=>n+app.verified,0)}/${report.apps.reduce((n,app)=>n+app.expected,0)} offline navigation targets; ${report.resources.verified}/${report.resources.expected} offline resources (${report.appEntryPoints} app entry URLs; ${report.searchTargets} search targets); release ${report.release}`);
  if(!report.passed){console.error(JSON.stringify(report));process.exitCode=1;}
 }
}
