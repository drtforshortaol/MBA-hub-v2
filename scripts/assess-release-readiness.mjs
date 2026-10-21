import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {releaseErrors} from './build.mjs';
import {verifyReviewEvidence} from './verify-review-evidence.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const actions={
 migrationComplete:'Complete the remaining V1 application migrations.',
 ownerApproved:'Obtain explicit owner authorization for release.',
 pilotPassed:'Record the additional-guide pilot result.',
 deviceOfflinePassed:'Complete and record the required physical-device offline acceptance.',
 rollbackDevicePassed:'Complete and record physical-device rollback acceptance.',
 privacyReviewed:'Complete and record the privacy review.'
};

// A read-only view of existing gates. This never writes approvals or publishes.
export function assessReleaseReadiness({platform,apps,media,inventory,qaEvidence,technicalErrors=null,expectedCommit=null}){
 const blocked=releaseErrors(platform,apps,media,inventory);
 const blockers=blocked.map(reason=>{
  const [kind,id]=reason.split(': ');
  const action=kind==='release gate'?actions[id]:kind==='unmigrated'?'Migrate and validate this application.':kind==='content review pending'?'Obtain the required scientific/editorial content review.':'Resolve the recorded media permission review.';
  return {reason,source:kind==='release gate'?'config/platform.json':kind==='unmigrated'?'config/v1-inventory.json':kind==='content review pending'?`src/apps/${id}/manifest.json`:'src/shared/media/catalog.json',action};
 });
 return {
  schema_version:1,scope:'Existing release gates and recorded evidence only; no approval, publication or deployment',
  platformVersion:platform.version,stage:platform.releaseStage,apps:apps.length,
  releaseEligible:blocked.length===0,blockers,
  recordedQA:{source:'config/qa-evidence.json',recordedOn:qaEvidence.recorded_on,
   pending:Object.entries(qaEvidence.evidence).filter(([,entry])=>entry.status!=='verified').map(([id,entry])=>({id,...entry})),
   scope:'Historical records; representative iPhone acceptance does not establish full release acceptance.'},
  technicalEvidence:{status:technicalErrors===null?'not-provided':technicalErrors.length?'failed':'verified',expectedCommit,
   errors:technicalErrors??[],scope:'HTTP/offline evidence bound to the supplied generated releases and checkout; independent of release approval.'}
 };
}

export function assessRepositoryReadiness({evidenceDirectory=null,expectedCommit=null}={}){
 if((evidenceDirectory===null)!==(expectedCommit===null))throw Error('Provide both --evidence-dir and --expected-commit, or neither');
 if(expectedCommit!==null&&!/^[a-f0-9]{40}$/.test(expectedCommit))throw Error('Expected checkout commit must be 40 lowercase hexadecimal characters');
 const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
 const apps=fs.readdirSync(path.join(root,'src/apps'),{withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=>read(`src/apps/${entry.name}/manifest.json`)).sort((a,b)=>a.app_id.localeCompare(b.app_id));
 return assessReleaseReadiness({platform:read('config/platform.json'),apps,media:read('src/shared/media/catalog.json'),inventory:read('config/v1-inventory.json'),qaEvidence:read('config/qa-evidence.json'),
  technicalErrors:evidenceDirectory===null?null:verifyReviewEvidence(path.resolve(evidenceDirectory),expectedCommit),expectedCommit});
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2),options={};
  for(let i=0;i<args.length;i+=2){if(!['--evidence-dir','--expected-commit'].includes(args[i])||!args[i+1]||Object.hasOwn(options,args[i]))throw Error('Usage: node scripts/assess-release-readiness.mjs [--evidence-dir PATH --expected-commit SHA]');options[args[i]]=args[i+1];}
  const report=assessRepositoryReadiness({evidenceDirectory:options['--evidence-dir']??null,expectedCommit:options['--expected-commit']??null});
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  // Blocked releases are expected during development; malformed/stale supplied
  // verification evidence is a command failure and cannot be presented as PASS.
  if(report.technicalEvidence.status==='failed')process.exitCode=1;
 }catch(error){console.error(error.message);process.exitCode=1;}
}
