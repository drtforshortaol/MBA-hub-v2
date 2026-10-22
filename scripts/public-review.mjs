import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const readOptional=file=>fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
// Evidence contract (config/inherited-v1-fidelity.json): schema_version:1, apps:[{
// app_id, source_repository, source_commit, status:'reviewed-unchanged-v1',
// authorization_reference:'docs/GUIDE_CONTENT_RESTORED.md', review_reference,
// content_sha256 }]. A review_reference identifies an actual reviewed-differences
// record; neither provenance nor the static-text audit can supply this decision.
// Absence/staleness leaves current-app reconciliation pending. Existing owner
// authorization for identical V1 material remains valid; do not request it again.
// A digest binds reviewed evidence to bytes; calculating it does not grant approval.
// Include the manifest, app directory, offline dependencies and shared content.
export function inheritedContentDigest(app,{sourceRoot='src'}={}){
 const names=new Set(['shared/media/catalog.json','shared/knowledge.json']);
 const add=name=>{
  if(typeof name!=='string'||path.isAbsolute(name)||name.split(/[\\/]/).some(part=>part==='..'||part==='')||name.includes('\\'))throw Error('Unsafe inherited-content path');
  const target=path.join(sourceRoot,name),stat=fs.lstatSync(target);
  if(stat.isSymbolicLink())throw Error('Inherited-content symlink is unsupported');
  if(stat.isDirectory())for(const child of fs.readdirSync(target))add(`${name}/${child}`);
  else if(stat.isFile())names.add(name);
  else throw Error('Unsupported inherited-content resource');
 };
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app.app_id))throw Error('Unsafe inherited-content app ID');
 add(`apps/${app.app_id}`);
 for(const name of app.offline_assets||[])add(name);
 const catalog=JSON.parse(fs.readFileSync(path.join(sourceRoot,'shared/media/catalog.json'),'utf8'));
 for(const id of app.media||[]){
  const assets=catalog.assets?.filter(asset=>asset.asset_id===id)||[];
  if(assets.length!==1)throw Error('Unresolved inherited-content media');
  add(assets[0].path);
 }
 const inventory=[...names].sort().map(name=>{
  const bytes=fs.readFileSync(path.join(sourceRoot,name));return {path:name,bytes:bytes.length,sha256:hash(bytes)};
 });
 // Bind even a caller-provided manifest to prevent stale manifest inheritance.
 return hash(JSON.stringify({manifest:app,resources:inventory}));
}

export function inheritedApprovalSupported(app,{provenance,evidence,sourceRoot='src'}={}){
 if(!app.source_repository||!app.source_commit||evidence?.schema_version!==1||!Array.isArray(evidence.apps))return false;
 const origins=provenance?.apps?.filter(row=>row.app_id===app.app_id)||[];
 const records=evidence.apps.filter(row=>row.app_id===app.app_id);
 if(origins.length!==1||records.length!==1)return false;
 const origin=origins[0],record=records[0];
 if(origin.source_repository!==app.source_repository||origin.source_commit!==app.source_commit||
    record.source_repository!==app.source_repository||record.source_commit!==app.source_commit||
    record.status!=='reviewed-unchanged-v1'||record.authorization_reference!=='docs/GUIDE_CONTENT_RESTORED.md'||
    typeof record.review_reference!=='string'||!record.review_reference.trim()||
    !/^[a-f0-9]{64}$/.test(record.content_sha256||''))return false;
 try{return record.content_sha256===inheritedContentDigest(app,{sourceRoot});}catch{return false;}
}

// Guide distribution and tester isolation are separate from final release approval.
export function preparePublicReview(out,input,options={}){
 const context={sourceRoot:options.sourceRoot||'src',
  provenance:options.provenance===undefined?readOptional('config/migration-provenance.json'):options.provenance,
  evidence:options.evidence===undefined?readOptional('config/inherited-v1-fidelity.json'):options.evidence};
 const apps=structuredClone(input),inherited=[],pending=[];
 for(const app of apps){
  if(!['pending','inherited-v1-approved'].includes(app.publication_review))continue;
  if(inheritedApprovalSupported(app,context)){
   app.publication_review='inherited-v1-approved';inherited.push(app.app_id);
  }else{
   app.publication_review='pending';pending.push(app.app_id);
  }
 }
 fs.writeFileSync(`${out}/public-review.json`,JSON.stringify({
  publication:'owner-authorized-guide-collection',authorizationDate:'2026-10-12',
  scope:'Unchanged V1 authorization only; new/changed content remains pending; no production approval',
  libraryPersonalFieldsRemoved:0,operationalItemsRemoved:0,withheldApps:[],
  restored:['information-center','mba-leadership','naturalist-field-notes','aquarium-library-explorer'],
  inheritedApproval:{evidenceContract:'config/inherited-v1-fidelity.json',verifiedApps:inherited,pendingApps:pending}
 },null,2));
 return apps;
}
