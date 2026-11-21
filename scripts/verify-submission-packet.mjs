import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';

export const AUTHORIZED_REPOSITORY='drtforshortaol/MBA-hub-v2';
export const AUTHORIZED_BRANCH='security-review-evo-foundation-20261014';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

// Read-only verification: caller must separately authorize any GitHub write.
export function verifySubmissionPacket(packet,manifestBytes,{repository=AUTHORIZED_REPOSITORY,branch=AUTHORIZED_BRANCH}={}){
 const errors=[];
 if(!packet||typeof packet!=='object'||Array.isArray(packet))return {valid:false,errors:['invalid packet']};
 if(packet.schema_version!==1||packet.kind!=='mba-v2-review-packet')errors.push('unsupported packet');
 if(repository!==AUTHORIZED_REPOSITORY||branch!==AUTHORIZED_BRANCH||packet.target_repository!==repository||packet.target_branch!==branch)errors.push('unauthorized target');
 if(!/^[a-z0-9-]+$/.test(packet.app_id??'')||packet.manifest_path!==`src/apps/${packet.app_id}/manifest.json`)errors.push('invalid manifest path');
 if(!Buffer.isBuffer(manifestBytes)&&typeof manifestBytes!=='string')errors.push('missing manifest bytes');
 else if(packet.base_manifest_sha256!==sha256(manifestBytes))errors.push('stale or modified manifest');
 if(packet.requires_review!==true||packet.approved!==false||packet.committed!==false||packet.published!==false)errors.push('review gate violated');
 if(!Array.isArray(packet.changes)||!Array.isArray(packet.photo_proposals)||!packet.proposed_manifest||typeof packet.proposed_manifest!=='object')errors.push('invalid proposal');
 else if(packet.proposed_manifest.app_id!==packet.app_id||packet.proposed_manifest.version!==packet.app_version)errors.push('protected identifiers changed');
 else if(typeof manifestBytes==='string'||Buffer.isBuffer(manifestBytes)){
  try{
   const original=JSON.parse(manifestBytes.toString());
   if(original.app_id!==packet.app_id||original.version!==packet.app_version)errors.push('base identifiers mismatch');
   const allowed=new Set(['title','sections']);
   for(const key of new Set([...Object.keys(original),...Object.keys(packet.proposed_manifest)])){
    if(!allowed.has(key)&&!isDeepStrictEqual(original[key],packet.proposed_manifest[key]))errors.push('protected manifest field changed: '+key);
   }
   if(!Array.isArray(original.sections)||!Array.isArray(packet.proposed_manifest.sections)||original.sections.length!==packet.proposed_manifest.sections.length)errors.push('section structure changed');
   else for(let i=0;i<original.sections.length;i++){
    const before=original.sections[i],after=packet.proposed_manifest.sections[i];
    if(before.id!==after.id)errors.push('section identifier changed');
    for(const key of new Set([...Object.keys(before),...Object.keys(after)]))if(!['title','text','caption'].includes(key)&&!isDeepStrictEqual(before[key],after[key]))errors.push('protected section field changed: '+key);
   }
  }catch{errors.push('invalid base manifest JSON');}
 }
 return {valid:errors.length===0,errors};
}
