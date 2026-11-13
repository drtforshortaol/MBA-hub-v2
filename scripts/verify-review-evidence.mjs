import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {OFFLINE_SCENARIOS} from './verify-offline-navigation.mjs';

// These reports establish simulated/HTTP evidence only, never device or release approval.
export function verifyReviewEvidence(directory,expectedCommit){
 const errors=[];
 if(!/^[a-f0-9]{40}$/.test(expectedCommit||''))return ['Invalid expected checkout commit'];
 const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
 try{
  if(fs.readFileSync(path.join(directory,'SOURCE-COMMIT.txt'),'utf8').trim()!==expectedCommit)errors.push('Checkout provenance mismatch');
  for(const environment of ['developer','tester']){
   const release=read(`${environment}/release.json`);
   const registry=read(`${environment}/registry.json`),search=read(`${environment}/search-index.json`),media=read(`${environment}/shared/media/catalog.json`);
   if(registry.environment!==environment||!Array.isArray(registry.apps)||!registry.apps.length||!Array.isArray(search))throw Error(`${environment}: invalid generated coverage metadata`);
   if(!Array.isArray(media?.assets))throw Error(`${environment}: invalid generated media metadata`);
   const catalog=new Map(media.assets.map(asset=>[asset.asset_id,asset]));
   const expectedHttpApps=new Map(registry.apps.map(app=>{
    const assets=app.media.map(id=>catalog.get(id));
    if(assets.some(asset=>!asset))throw Error(`${environment}: unresolved generated app media`);
    return [app.app_id,{entry:app.entry_point,offline:app.offline_assets.length,media:assets.length,offlineMedia:assets.filter(asset=>asset.offline).length,resources:new Set([app.entry_point,...app.offline_assets,...assets.filter(asset=>asset.offline).map(asset=>asset.path)]).size}];
   }));
   const expectedApps=new Map(registry.apps.map(app=>{
    const targets=new Set([app.entry_point,...search.filter(entry=>entry.app_id===app.app_id).map(entry=>entry.url)]);
    if(app.entry_point.endsWith('/index.html'))targets.add(app.entry_point.slice(0,-'index.html'.length));
    return [app.app_id,targets.size];
   }));
   if(release.environment!==environment||!/^[a-f0-9]{16}$/.test(release.release)||!Array.isArray(release.resources)||!release.resources.length)errors.push(`${environment}: invalid generated release`);
   for(const [file,scenario] of [[`${environment}-http-report.json`,null],...OFFLINE_SCENARIOS.map(s=>[`offline-reports/${environment}-${s.file}.json`,s.name])]){
    const report=read(file);
    if(report.passed!==true||report.environment!==environment||report.release!==release.release||!Array.isArray(report.errors)||report.errors.length)errors.push(`${file}: failed or stale release evidence`);
    if(scenario&&(report.scenario!==scenario||report.offlineNetworkAttempts!==0||!Array.isArray(report.apps)||report.apps.length!==expectedApps.size||new Set(report.apps.map(app=>app?.app_id)).size!==expectedApps.size||!report.apps.every(app=>app&&app.passed===true&&Number.isSafeInteger(app.expected)&&Number.isSafeInteger(app.verified)&&app.verified===app.expected&&app.expected===expectedApps.get(app.app_id)&&Array.isArray(app.errors)&&app.errors.length===0)))errors.push(`${file}: incomplete offline scenario`);
    if(scenario&&(!Number.isSafeInteger(report.resources?.expected)||report.resources.expected!==release.resources?.length||report.resources.expected<=0||!Number.isSafeInteger(report.resources?.verified)||report.resources.verified!==report.resources.expected||!Array.isArray(report.resources?.errors)||report.resources.errors.length))errors.push(`${file}: incomplete offline resource evidence`);
    if(scenario?.includes('inventory')&&(!report.recovery||((scenario.startsWith('corrupt-')||scenario.startsWith('forged-'))?report.recovery.initialErrorCode!=='OFFLINE_INVENTORY_INVALID':(report.recovery.initialComplete!==false||report.recovery.initialCount!==0||report.recovery.initialTotal!==0))||report.recovery.interrupted!==(scenario==='interrupted-inventory-recovery')||report.recovery.complete!==true||report.recovery.count!==release.resources.length||report.recovery.total!==release.resources.length||report.recovery.retainedDataPreserved!==true||report.recovery.cacheDeletions!==0||report.recovery.activations!==0))errors.push(`${file}: incomplete inventory recovery evidence`);
    if(OFFLINE_SCENARIOS.find(s=>s.name===scenario)?.options.refreshPage&&(!report.refreshPage||!Array.isArray(report.refreshPage.commands)||report.refreshPage.commands.join(',')!=='STATUS,RECOVER_OFFLINE'||report.refreshPage.navigations!==1||report.refreshPage.channelsClosed!==true||report.refreshPage.timersCleared!==true))errors.push(`${file}: incomplete refresh page recovery evidence`);
    if(!scenario&&(!Array.isArray(report.apps)||report.apps.length!==expectedHttpApps.size||new Set(report.apps.map(app=>app?.app_id)).size!==expectedHttpApps.size||!report.apps.every(app=>{
     const expected=expectedHttpApps.get(app?.app_id);
     return expected&&app.passed===true&&app.entry_point===expected.entry&&app.declaredOfflineResources===expected.offline&&app.declaredMedia===expected.media&&app.offlineMedia===expected.offlineMedia&&app.verifiedResources===expected.resources&&Array.isArray(app.missingResources)&&app.missingResources.length===0;
    })))errors.push(`${file}: incomplete HTTP application coverage`);
    if(!scenario&&(report.expectedRelease!==release.release||!Number.isSafeInteger(report.resources?.expected)||report.resources.expected<=0||report.resources.expected!==release.resources?.length||!Number.isSafeInteger(report.resources?.verified)||report.resources.verified!==report.resources.expected))errors.push(`${file}: incomplete HTTP evidence`);
   }
  }
 }catch(error){errors.push(error.message);}
 return errors;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const errors=verifyReviewEvidence(process.argv[2]||'dist',process.argv[3]);
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Review evidence release and checkout binding: PASS');
}
