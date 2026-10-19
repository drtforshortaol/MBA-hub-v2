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
   if(release.environment!==environment||!/^[a-f0-9]{16}$/.test(release.release))errors.push(`${environment}: invalid generated release`);
   for(const [file,scenario] of [[`${environment}-http-report.json`,null],[`offline-reports/${environment}-offline-navigation.json`,'prepared-navigation'],[`offline-reports/${environment}-offline-recovery.json`,'corrupted-entry-recovery']]){
    const report=read(file);
    if(report.passed!==true||report.environment!==environment||report.release!==release.release||!Array.isArray(report.errors)||report.errors.length)errors.push(`${file}: failed or stale release evidence`);
    if(scenario&&(report.scenario!==scenario||report.offlineNetworkAttempts!==0||!report.apps?.length||!report.apps.every(app=>app.passed===true&&app.verified===app.expected&&app.expected>0)))errors.push(`${file}: incomplete offline scenario`);
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
