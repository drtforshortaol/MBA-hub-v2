import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {previewFile} from './preview-change-request.mjs';

// Offline, review-only submission packet. Never accesses GitHub or credentials.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function prepareSubmissionPacket(filename){
 const proposal=previewFile(filename);
 if(!proposal.valid)return {valid:false,errors:proposal.errors};
 const manifestPath=path.join('src','apps',proposal.app_id,'manifest.json');
 const current=fs.readFileSync(path.join(root,manifestPath));
 const digest=createHash('sha256').update(current).digest('hex');
 return {schema_version:1,kind:'mba-v2-review-packet',valid:true,
  target_repository:'drtforshortaol/MBA-hub-v2',
  target_branch:'security-review-evo-foundation-20261014',
  base_manifest_sha256:digest,manifest_path:manifestPath,
  app_id:proposal.app_id,app_version:proposal.app_version,
  changes:proposal.changes,proposed_manifest:proposal.proposed_manifest,
  photo_proposals:proposal.photo_proposals,
  requires_review:true,approved:false,committed:false,published:false};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(process.argv.length!==3){console.error('Usage: node scripts/prepare-submission-packet.mjs <request.json>');process.exitCode=2;}
 else try{const result=prepareSubmissionPacket(process.argv[2]);console.log(JSON.stringify(result,null,2));if(!result.valid)process.exitCode=1;}
 catch(error){console.error('Unable to prepare submission packet:',error.message);process.exitCode=1;}
}
