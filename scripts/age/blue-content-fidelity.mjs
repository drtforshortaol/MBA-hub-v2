// AGE-008: Audit actual blue production source against a proposed canonical release.
// Report evidence only. Never auto-approve, edit approved source, or deploy.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const sha=contents=>createHash('sha256').update(contents).digest('hex');
function inventory(root){
 const dir=path.join(root,'src/apps');
 const manifests=new Map();
 for(const ent of fs.readdirSync(dir,{withFileTypes:true}).filter(x=>x.isDirectory())){
  const file=path.join(dir,ent.name,'manifest.json');
  if(fs.existsSync(file)){
   const obj=JSON.parse(fs.readFileSync(file,'utf8'));
   if(manifests.has(obj.app_id))throw Error('Duplicate manifest ID '+obj.app_id);
   manifests.set(obj.app_id,obj);
  }
 }
 return manifests;
}
function files(root){
 const all=new Map();
 const scan=(dir,prefix='')=>{
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
   const relative=prefix?prefix+'/'+ent.name:ent.name;
   if(ent.isDirectory())scan(path.join(dir,ent.name),relative);
   else if(ent.isFile())all.set(relative,sha(fs.readFileSync(path.join(dir,ent.name))));
  }
 };
 scan(path.join(root,'src'),'src');
 return all;
}
export function assessProductionContent(baselineRoot,candidateRoot){
 const baseline=inventory(baselineRoot),candidate=inventory(candidateRoot);
 const before=files(baselineRoot),after=files(candidateRoot),apps=[],unexplained=[];
 const policyPath=path.join(candidateRoot,'config/age-source-relocations.json');
 const policy=fs.existsSync(policyPath)?JSON.parse(fs.readFileSync(policyPath,'utf8')):null;
 const baselineCatalogPath=path.join(baselineRoot,'src/shared/media/catalog.json');
 const candidateCatalogPath=path.join(candidateRoot,'src/shared/media/catalog.json');
 const oldCatalog=JSON.parse(fs.readFileSync(baselineCatalogPath,'utf8'));
 const newCatalog=JSON.parse(fs.readFileSync(candidateCatalogPath,'utf8'));
 const relocated=new Map(),verifiedRelocations=[],rejectedRelocations=[],claimedDestinations=new Set();
 if(policy){
  if(policy.schema_version!==1||policy.blue_baseline_sha!=='40e1826166f0ea61f406e1193390272029428734')
   unexplained.push({kind:'relocation-policy-invalid'});
  for(const spec of policy.relocations||[]){
   const source=String(spec.from||''),destination=String(spec.to||''),id=String(spec.app_id||'');
   const expectedPrefix='src/apps/'+id+'/images/';
   const prior=baseline.get(id),next=candidate.get(id);
   const oldMedia=(oldCatalog.assets||[]).find(a=>a.asset_id===spec.asset_id);
   const newMedia=(newCatalog.assets||[]).find(a=>a.asset_id===spec.asset_id);
   const validPath=/^src\/apps\/[A-Za-z0-9_.-]+$/.test(source)&&
    destination.startsWith(expectedPrefix)&&!destination.includes('..')&&!claimedDestinations.has(destination);
   const exactBytes=before.has(source)&&after.has(destination)&&before.get(source)===after.get(destination);
   const oldRegistered=Boolean(prior?.offline_assets?.includes(source.slice(4))&&
    prior?.media?.includes(spec.asset_id)&&oldMedia?.path===source.slice(4));
   const newRegistered=Boolean(next?.offline_assets?.includes(destination.slice(4))&&
    next?.media?.includes(spec.asset_id)&&newMedia?.path===destination.slice(4));
   const permissions=Boolean(oldMedia&&newMedia&&oldMedia.permission===newMedia.permission&&
    oldMedia.credit===newMedia.credit&&JSON.stringify(oldMedia.permission_scope||null)===
    JSON.stringify(newMedia.permission_scope||null)&&JSON.stringify(oldMedia.license||null)===
    JSON.stringify(newMedia.license||null));
   if(validPath&&exactBytes&&oldRegistered&&newRegistered&&permissions){
    claimedDestinations.add(destination);
    relocated.set(source,destination);
    verifiedRelocations.push({from:source,to:destination,sha256:before.get(source),app_id:id,asset_id:spec.asset_id});
   }else{
    const issue={kind:'unverified-asset-relocation',from:source,to:destination,app_id:id,
      checks:{validPath,exactBytes,oldRegistered,newRegistered,permissions}};
    rejectedRelocations.push(issue);
    unexplained.push(issue);
   }
  }
 }
 for(const [id,prior] of baseline){
  const next=candidate.get(id);
  if(!next){unexplained.push({app_id:id,kind:'missing-production-application'});continue;}
  const priorSections=prior.sections||[],nextSections=next.sections||[];
  const key=section=>String(section.id||section.title||'');
  const nextBySection=new Map(nextSections.map(s=>[key(s),s]));
  const sectionMissing=priorSections.filter(s=>!nextBySection.has(key(s))).map(s=>({id:key(s),title:s.title||''}));
  const sectionAltered=priorSections.filter(s=>nextBySection.has(key(s))&&JSON.stringify(s)!==JSON.stringify(nextBySection.get(key(s)))).map(s=>({id:key(s),title:s.title||''}));
  const missingMedia=(prior.media||[]).filter(x=>!(next.media||[]).includes(x));
  const missingAssets=(prior.offline_assets||[]).filter(x=>!((next.offline_assets||[]).includes(x)||
   (relocated.has('src/'+x)&&(next.offline_assets||[]).includes(relocated.get('src/'+x).slice(4))));
  const omittedFiles=missingAssets.filter(asset=>!after.has('src/'+asset));
  const removedListing=prior.listed!==false&&next.listed===false;
  const app={app_id:id,baseline_version:prior.version,candidate_version:next.version,
    baseline_sections:priorSections.length,candidate_sections:nextSections.length,
    missing_sections:sectionMissing,altered_sections:sectionAltered,
    missing_media_ids:missingMedia,missing_offline_asset_paths:missingAssets,
    missing_offline_asset_files:omittedFiles,removed_listing:removedListing};
  if(sectionMissing.length||sectionAltered.length||missingMedia.length||missingAssets.length||removedListing)apps.push(app);
  if(sectionMissing.length)unexplained.push({app_id:id,kind:'lost-sections',count:sectionMissing.length});
  if(sectionAltered.length)unexplained.push({app_id:id,kind:'changed-sections-needs-review',count:sectionAltered.length});
  if(missingMedia.length)unexplained.push({app_id:id,kind:'missing-media',count:missingMedia.length});
  if(missingAssets.length)unexplained.push({app_id:id,kind:'missing-offline-assets',count:missingAssets.length});
  if(removedListing)unexplained.push({app_id:id,kind:'hidden-production-app'});
 }
 const missingSourcePaths=[...before].filter(([name])=>!after.has(name)&&!relocated.has(name)).map(([name,hash])=>({path:name,sha256:hash}));
 const changedSourcePaths=[...before].filter(([name,hash])=>after.has(name)&&after.get(name)!==hash).map(([name])=>name);
 return {schema_version:1,baseline_source:'40e1826166f0ea61f406e1193390272029428734',
  source_of_truth:'src/apps/*/manifest.json',baseline_app_count:baseline.size,candidate_app_count:candidate.size,
  baseline_source_file_count:before.size,candidate_source_file_count:after.size,
  app_differences:apps,verified_relocations:verifiedRelocations,rejected_relocations:rejectedRelocations,
  missing_source_files:missingSourcePaths,
  changed_source_files:changedSourcePaths,blockers:unexplained,
  release_eligible:unexplained.length===0&&missingSourcePaths.length===0};
}
const invocation=process.argv[1]&&path.resolve(process.argv[1])===new URL(import.meta.url).pathname;
if(invocation){
 const [baseline,candidate='.',output='verification/age-008-blue-content-delta.json']=process.argv.slice(2).filter(x=>x!=='--strict');
 if(!baseline)throw Error('Usage: node scripts/age/blue-content-fidelity.mjs <baseline-root> [candidate-root] [output.json] [--strict]');
 const result=assessProductionContent(path.resolve(baseline),path.resolve(candidate));
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log('AGE-008 blue content fidelity:',JSON.stringify({apps:[result.baseline_app_count,result.candidate_app_count],appDifferences:result.app_differences.length,missingSourceFiles:result.missing_source_files.length,changedSourceFiles:result.changed_source_files.length,blockers:result.blockers.length,releaseEligible:result.release_eligible}));
 if(process.argv.includes('--strict')&&!result.release_eligible)process.exitCode=1;
}
