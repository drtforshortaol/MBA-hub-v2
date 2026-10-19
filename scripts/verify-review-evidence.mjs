import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// These reports establish simulated/HTTP evidence only, never device or release approval.
export function verifyReviewEvidence(directory,expectedCommit){
 const errors=[];
 if(!/^[a-f0-9]{40}$/.test(expectedCommit||''))return ['Invalid expected checkout commit'];
 const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
 try{
  if(fs.readFileSync(path.join(directory,'SOURCE-COMMIT.txt'),'utf8').trim()!==expectedCommit)errors.push('Checkout provenance mismatch');
  for(const environment of ['developer','tester']){
   const release=read(`${environment}/release.json`);
   const registry=read(`${environment}/registry.json`),search=read(`${environment}/search-index.json`);
   if(registry.environment!==environment||!Array.isArray(registry.apps)||!registry.apps.length||!Array.isArray(search))throw Error(`${environment}: invalid generated coverage metadata`);
   const expectedApps=new Map(registry.apps.map(app=>{
    const targets=new Set([app.entry_point,...search.filter(entry=>entry.app_id===app.app_id).map(entry=>entry.url)]);
    if(app.entry_point.endsWith('/index.html'))targets.add(app.entry_point.slice(0,-'index.html'.length));
    return [app.app_id,targets.size];
   }));
   if(release.environment!==environment||!/^[a-f0-9]{16}$/.test(release.release))errors.push(`${environment}: invalid generated release`);
   for(const [file,scenario] of [[`${environment}-http-report.json`,null],[`offline-reports/${environment}-offline-navigation.json`,'prepared-navigation'],[`offline-reports/${environment}-offline-recovery.json`,'corrupted-entry-recovery']]){
    const report=read(file);
    if(report.passed!==true||report.environment!==environment||report.release!==release.release||!Array.isArray(report.errors)||report.errors.length)errors.push(`${file}: failed or stale release evidence`);
    if(scenario&&(report.scenario!==scenario||report.offlineNetworkAttempts!==0||!Array.isArray(report.apps)||report.apps.length!==expectedApps.size||new Set(report.apps.map(app=>app?.app_id)).size!==expectedApps.size||!report.apps.every(app=>app&&app.passed===true&&Number.isSafeInteger(app.expected)&&Number.isSafeInteger(app.verified)&&app.verified===app.expected&&app.expected===expectedApps.get(app.app_id)&&Array.isArray(app.errors)&&app.errors.length===0)))errors.push(`${file}: incomplete offline scenario`);
    if(!scenario&&(report.expectedRelease!==release.release||!Number.isSafeInteger(report.resources?.expected)||report.resources.expected<=0||!Number.isSafeInteger(report.resources?.verified)||report.resources.verified!==report.resources.expected))errors.push(`${file}: incomplete HTTP evidence`);
   }
  }
 }catch(error){errors.push(error.message);}
 return errors;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const errors=verifyReviewEvidence(process.argv[2]||'dist',process.argv[3]);
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Review evidence release and checkout binding: PASS');
}
