import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto,{webcrypto} from 'node:crypto';
import {fileURLToPath} from 'node:url';

// Real built worker and bundle bytes, simulated CacheStorage and lifecycle events.
// This evidence does not establish browser rendering or physical-device approval.
export async function verifyOfflineNavigation(directory,environment){
 const root=new URL(`https://offline.example/review/${environment}/`);
 const read=name=>fs.readFileSync(path.join(directory,name));
 const release=JSON.parse(read('release.json')),registry=JSON.parse(read('registry.json')),search=JSON.parse(read('search-index.json'));
 const report={schema_version:1,scope:'Simulated worker routing and byte integrity only; no DOM/rendering, native service-worker lifecycle or device approval',environment,release:release.release,passed:false,apps:[],errors:[],offlineNetworkAttempts:0,appEntryPoints:new Set(registry.apps.map(app=>app.entry_point)).size,searchTargets:0,navigationTargets:0};
 const handlers={},stores=new Map();let offline=false;
 const caches={async keys(){return [...stores.keys()];},async delete(key){return stores.delete(key);},async open(key){
  if(!stores.has(key)){
   const entries=new Map();stores.set(key,{async put(url,response){entries.set(String(url),response.clone());},async match(url){return entries.get(String(url))?.clone();}});
  }
  return stores.get(key);
 }};
 const self={location:{href:new URL('sw.js',root).href},clients:{async claim(){}},async skipWaiting(){},addEventListener(type,handler){handlers[type]=handler;}};
 const fetch=async input=>{
  if(offline){report.offlineNetworkAttempts++;throw Error('Network disabled for acceptance');}
  const url=new URL(typeof input==='string'?input:input.url||String(input));
  if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname))throw Error('Out-of-scope resource');
  return new Response(read(url.pathname.slice(root.pathname.length)));
 };
 async function invoke(type,event={}){
  let result;handlers[type]({...event,waitUntil(value){result=value;},respondWith(value){result=value;}});return result;
 }
 try{
  if(release.environment!==environment||registry.environment!==environment)throw Error('Artifact environment mismatch');
  vm.runInNewContext(read('sw.js').toString('utf8'),{self,caches,fetch,Response,URL,crypto:webcrypto},{timeout:1000});
  await invoke('install');await invoke('activate');offline=true;
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
  if(!report.apps.length)report.errors.push('No applications verified');
  if(report.offlineNetworkAttempts)report.errors.push(`Offline navigation attempted network ${report.offlineNetworkAttempts} times`);
 }catch(error){report.errors.push(error.message);}
 report.passed=report.errors.length===0&&report.apps.length>0&&report.apps.every(app=>app.passed);return report;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length!==0&&(args.length!==2||args[0]!=='--report-dir'||!args[1]))throw Error('Usage: node scripts/verify-offline-navigation.mjs [--report-dir PATH]');
 for(const environment of ['developer','tester']){
  const report=await verifyOfflineNavigation(`dist/${environment}`,environment);
  if(args[1]){fs.mkdirSync(args[1],{recursive:true});fs.writeFileSync(path.join(args[1],`${environment}-offline-navigation.json`),JSON.stringify(report,null,2)+'\n');}
  console.log(`${environment}: ${report.passed?'PASS':'FAIL'} ${report.apps.reduce((n,app)=>n+app.verified,0)}/${report.apps.reduce((n,app)=>n+app.expected,0)} offline navigation targets (${report.appEntryPoints} app entry URLs; ${report.searchTargets} search targets); release ${report.release}`);
  if(!report.passed){console.error(JSON.stringify(report));process.exitCode=1;}
 }
}
