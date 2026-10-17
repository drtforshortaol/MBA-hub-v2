import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifySubmissionPacket} from './verify-submission-packet.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// This command never writes to GitHub. Approval is an out-of-band human action.
export function stageSubmissionPacket(packet,manifestBytes){
 const result=verifySubmissionPacket(packet,manifestBytes);
 if(!result.valid)return {valid:false,errors:result.errors};
 const next=JSON.stringify(packet.proposed_manifest,null,2)+'\n';
 return {valid:true,requires_review:true,approved:false,committed:false,published:false,
  target_repository:packet.target_repository,target_branch:packet.target_branch,
  manifest_path:packet.manifest_path,base_manifest_sha256:packet.base_manifest_sha256,
  proposed_content:next,changes:packet.changes,photo_proposals:packet.photo_proposals};
}
export function stageFile(filename){
 const packet=JSON.parse(fs.readFileSync(filename,'utf8'));
 // Resolve only under the fixed root, after rejecting path escapes.
 if(!packet||typeof packet.app_id!=='string'||!/^[a-z0-9-]+$/.test(packet.app_id)||packet.manifest_path!==`src/apps/${packet.app_id}/manifest.json`)return {valid:false,errors:['invalid manifest path']};
 const manifestPath=path.join(root,'src','apps',packet.app_id,'manifest.json');
 return stageSubmissionPacket(packet,fs.readFileSync(manifestPath));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(process.argv.length!==3){console.error('Usage: node scripts/stage-submission-packet.mjs <packet.json>');process.exitCode=2;}
 else try{const result=stageFile(process.argv[2]);console.log(JSON.stringify(result,null,2));if(!result.valid)process.exitCode=1;}
 catch(error){console.error('Unable to stage packet:',error.message);process.exitCode=1;}
}
