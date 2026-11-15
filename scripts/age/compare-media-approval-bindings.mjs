// Produce review evidence for an append-only app media registration.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {inheritedApprovalSupported,inheritedContentDigest,ownerTextApprovalSupported} from '../public-review.mjs';

const [baselineArg,candidateArg,appId]=process.argv.slice(2);
if(!baselineArg||!candidateArg||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(appId||'')){
 throw Error('Usage: node scripts/age/compare-media-approval-bindings.mjs BASELINE CANDIDATE APP_ID');
}
const baseline=path.resolve(baselineArg),candidate=path.resolve(candidateArg);
const catalogPath='shared/media/catalog.json';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const manifests=root=>new Map(fs.readdirSync(path.join(root,'apps'),{withFileTypes:true})
 .filter(entry=>entry.isDirectory())
 .map(entry=>[entry.name,read(path.join(root,'apps',entry.name,'manifest.json'))]));
const original=read(path.join(baseline,'src',catalogPath));
const current=read(path.join(candidate,'src',catalogPath));
const additions=current.assets.slice(original.assets.length);
if(!isDeepStrictEqual({...current,assets:current.assets.slice(0,original.assets.length)},original)){
 throw Error('Reviewed catalog records or metadata changed');
}
const priorIds=new Set(original.assets.map(asset=>asset.asset_id));
const addedIds=new Set(additions.map(asset=>asset.asset_id));
if(!additions.length||addedIds.size!==additions.length||additions.some(asset=>
 priorIds.has(asset.asset_id)||asset.owner!==appId||asset.permission!=='review-required'||
 asset.permission_evidence||!asset.path.startsWith('apps/'+appId+'/')||
 !asset.uses?.length||asset.uses.some(use=>use.app_id!==appId))){
 throw Error('Additions must be unique pending assets owned and used by the selected app');
}
for(const name of ['migration-provenance.json','inherited-v1-fidelity.json','owner-text-reviews.json']){
 const file=path.join('config',name);
 if(!fs.readFileSync(path.join(baseline,file)).equals(fs.readFileSync(path.join(candidate,file)))){
  throw Error('Approval evidence changed: '+name);
 }
}
const options={
 provenance:read(path.join(baseline,'config/migration-provenance.json')),
 evidence:read(path.join(baseline,'config/inherited-v1-fidelity.json')),
 ownerTextEvidence:read(path.join(baseline,'config/owner-text-reviews.json'))
};
const before=manifests(path.join(baseline,'src')),after=manifests(path.join(candidate,'src'));
if(!after.has(appId)||additions.some(asset=>!after.get(appId).media.includes(asset.asset_id)||
 !after.get(appId).offline_assets.includes(asset.path))){
 throw Error('Selected app must register every addition as offline media');
}
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'mba-media-approval-'));
try{
 const candidateRoot=path.join(candidate,'src');
 fs.cpSync(candidateRoot,temporary,{recursive:true});
 fs.copyFileSync(path.join(baseline,'src',catalogPath),path.join(temporary,catalogPath));
 const records=[];
 for(const [id,app] of before){
  const baselineOptions={...options,sourceRoot:path.join(baseline,'src')};
  const inherited=inheritedApprovalSupported(app,baselineOptions);
  const ownerText=ownerTextApprovalSupported(app,baselineOptions);
  if(!inherited&&!ownerText)continue;
  const next=after.get(id);
  const previousSha256=inheritedContentDigest(app,baselineOptions);
  if(!next||inheritedContentDigest(next,{sourceRoot:temporary})!==previousSha256){
   throw Error('Previously reviewed app or dependency changed: '+id);
  }
  records.push({app_id:id,scope:inherited?'inherited':'owner-text',previous_sha256:previousSha256,
   candidate_sha256:inheritedContentDigest(next,{sourceRoot:candidateRoot})});
 }
 console.log(JSON.stringify({status:'review-required',app_id:appId,added_media_ids:[...addedIds],records},null,2));
}finally{
 fs.rmSync(temporary,{recursive:true,force:true});
}
