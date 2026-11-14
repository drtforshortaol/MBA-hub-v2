import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ids=apps=>apps.map(a=>a.app_id);
const duplicate=items=>items.filter((value,index)=>items.indexOf(value)!==index);
export function validateChannelRegistry({manifests,orange,blue,policy}){
 const errors=[],source=new Map(manifests.map(x=>[x.app_id,x]));
 const orangeMap=new Map(orange.map(x=>[x.app_id,x])),blueMap=new Map(blue.map(x=>[x.app_id,x]));
 const developmentOnly=new Set(policy.development_only_app_ids),retired=new Set(policy.approved_retirements.map(x=>x.app_id));
 if(policy.authority!=='src/apps/*/manifest.json')errors.push('AGE-005: noncanonical registry authority');
 for(const [channel,entries] of [['canonical',manifests],['orange',orange],['blue',blue]]){
  for(const id of duplicate(ids(entries)))errors.push('AGE-005: duplicate '+channel+' app '+id);
  for(const entry of entries){
   const canonical=source.get(entry.app_id);
   if(!canonical){errors.push('AGE-005: rogue '+channel+' app '+entry.app_id);continue;}
   for(const key of ['app_id','title','category','entry_point','owner','version'])
    if(entry[key]!==canonical[key])errors.push('AGE-005: divergent '+channel+' contract '+entry.app_id+'.'+key);
  }
 }
 for(const canonical of manifests){
  if(!orangeMap.has(canonical.app_id))errors.push('AGE-006: canonical app missing from orange '+canonical.app_id);
  if(developmentOnly.has(canonical.app_id)){
   if(blueMap.has(canonical.app_id))errors.push('AGE-006: development-only app appears in blue '+canonical.app_id);
  }else if(!blueMap.has(canonical.app_id)&&!retired.has(canonical.app_id)){
   errors.push('AGE-006: unexplained blue omission '+canonical.app_id);
  }
 }
 for(const id of policy.blue_required_apps){
  if(!source.has(id))errors.push('AGE-007: existing production app missing from canonical registry '+id);
  if(!blueMap.has(id)&&!retired.has(id))errors.push('AGE-007: existing production app removed '+id);
  if(!orangeMap.has(id))errors.push('AGE-006: existing blue app missing from orange '+id);
 }
 for(const record of policy.approved_retirements){
  if(!policy.blue_required_apps.includes(record.app_id)||record.approved!==true||!record.approved_by||!record.approved_on||!record.reason)
   errors.push('AGE-007: retirement requires explicit owner-approved record '+record.app_id);
 }
 for(const id of developmentOnly)if(!source.has(id))errors.push('AGE-006: development-only ID is not canonical '+id);
 if(new Set(policy.blue_required_apps).size!==policy.blue_required_apps.length)errors.push('AGE-007: duplicate baseline IDs');
 return errors;
}
export function inspectCurrentBuild(){
 const policy=read('config/age-channel-policy.json');
 const manifests=fs.readdirSync(path.join(root,'src/apps'),{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>read('src/apps/'+e.name+'/manifest.json'));
 const orange=read('dist/developer/registry.json').apps;
 const blue=read('dist/tester/registry.json').apps;
 return validateChannelRegistry({manifests,orange,blue,policy});
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const failures=inspectCurrentBuild();
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
 else console.log('AGE-005/006/007: canonical registry, channel parity, production preservation PASS');
}
