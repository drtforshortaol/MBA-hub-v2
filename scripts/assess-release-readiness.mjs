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
export function assessReleaseReadiness({platform,apps,media,inventory,qaEvidence,migrationProvenance=null,inheritanceEvidence=null,sourceRoot=path.join(root,'src'),technicalErrors=null,expectedCommit=null}){
 const blocked=releaseErrors(platform,apps,media,inventory,{provenance:migrationProvenance,evidence:inheritanceEvidence,sourceRoot});
 const blockers=blocked.map(reason=>{
  const [kind,id]=reason.split(': ');
  const app=apps.find(app=>app.app_id===id);
  const records=Array.isArray(migrationProvenance?.apps)?migrationProvenance.apps.filter(record=>record?.app_id===id):[];
  // Matching provenance identifies a reconciliation candidate, never proves
  // unchanged content or grants an inherited scientific/publication approval.
  const inheritedCandidate=kind==='content review pending'&&records.length===1&&
   typeof app?.source_repository==='string'&&!!app.source_repository&&/^[a-f0-9]{40}$/.test(app.source_commit||'')&&
   records[0].source_repository===app.source_repository&&records[0].source_commit===app.source_commit;
  const category=kind==='content review pending'?(inheritedCandidate?'inherited-approval-reconciliation':'content-review-required'):kind==='release gate'?'operational-gate':kind==='unmigrated'?'migration-required':'media-review-required';
  const action=kind==='release gate'?actions[id]:kind==='unmigrated'?'Migrate and validate this application.':kind==='content review pending'?(inheritedCandidate?'Verify unchanged content against pinned migration provenance, then reconcile the existing inherited V1 approval record. Review new or materially altered content separately.':'Obtain the required scientific/editorial content review; inherited approval is not established by matching migration provenance.'):'Resolve the recorded media permission review.';
  return {reason,category,source:kind==='release gate'?'config/platform.json':kind==='unmigrated'?'config/v1-inventory.json':kind==='content review pending'?`src/apps/${id}/manifest.json`:'src/shared/media/catalog.json',action};
 });
 return {
  schema_version:1,scope:'Existing release gates and recorded evidence only; no approval, publication or deployment',
  platformVersion:platform.version,stage:platform.releaseStage,apps:apps.length,
  releaseEligible:blocked.length===0,blockers,
  approvalReconciliation:{authorizationSource:'docs/GUIDE_CONTENT_RESTORED.md',provenanceSource:'config/migration-provenance.json',
   inheritedCandidates:blockers.filter(item=>item.category==='inherited-approval-reconciliation').length,
   contentReviewsRequired:blockers.filter(item=>item.category==='content-review-required').length,
   scope:'Read-only triage. Matching source provenance does not establish content fidelity, resolve a blocker or grant approval.'},
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
 return assessReleaseReadiness({platform:read('config/platform.json'),apps,media:read('src/shared/media/catalog.json'),inventory:read('config/v1-inventory.json'),qaEvidence:read('config/qa-evidence.json'),migrationProvenance:read('config/migration-provenance.json'),inheritanceEvidence:fs.existsSync(path.join(root,'config/inherited-v1-fidelity.json'))?read('config/inherited-v1-fidelity.json'):null,sourceRoot:path.join(root,'src'),
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
