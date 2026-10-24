import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';import {preparePublicReview} from './public-review.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
export function safeLocalPath(value){
 if(typeof value!=='string'||!value||value.startsWith('/')||value.startsWith('\\\\')||/[?#%\\\\]/.test(value))return false;
 const parts=value.split('/');return parts.every(part=>part&&part!=='.'&&part!=='..'&&/^[a-zA-Z0-9_.-]+$/.test(part));
}
export function validate({apps,categories,media,knowledge,exists,interfaces={interfaces:[{id:'navigation',version:'1.0.0',owner:'platform'}]}}){
 const errors=[], ids=new Set(),entryPoints=new Set(),cats=new Set(categories.map(c=>c.id)), assets=new Map(media.assets.map(a=>[a.asset_id,a])), facts=new Map(knowledge.records.map(k=>[k.id,k]));
 if(cats.size!==categories.length)errors.push('duplicate category');
 for(const c of categories){if(!c.id||!c.title)errors.push('invalid category metadata');}

 if(assets.size!==media.assets.length)errors.push('duplicate media ID');if(facts.size!==knowledge.records.length)errors.push('duplicate knowledge ID');
 for(const a of apps){
  if(ids.has(a.app_id))errors.push(`duplicate app ${a.app_id}`);ids.add(a.app_id);
  if(entryPoints.has(a.entry_point))errors.push(`duplicate entry point ${a.entry_point}`);entryPoints.add(a.entry_point);
  const missingArrays=['offline_assets','sections','media','knowledge','dependencies','cross_links'].filter(field=>!Array.isArray(a[field]));
  for(const field of missingArrays)errors.push(`invalid ${field} in ${a.app_id}`);
  if(missingArrays.length)continue;
  for(const key of ['app_id','title','owner','version','entry_point','type'])if(!a[key])errors.push(`missing ${key}`);
  if(typeof a.entry_point!=='string'||!safeLocalPath(a.entry_point))errors.push(`unsafe entry point ${a.app_id}`);
  if(a.schema_version!==1)errors.push(`invalid schema ${a.app_id}`);
  if(!cats.has(a.category))errors.push(`unknown category ${a.category}`);
  if(!['development','testing','approved','published'].includes(a.status))errors.push(`invalid status ${a.app_id}`);
  if(!['species','field-notes','reference','library','interactive'].includes(a.type))errors.push(`unknown template ${a.type}`);
  if(!Array.isArray(a.offline_assets)||!a.offline_assets.includes(a.entry_point))errors.push(`entry absent from offline bundle ${a.app_id}`);
  for(const p of a.offline_assets)if(!safeLocalPath(p)||!exists(p))errors.push(`missing/unsafe asset ${p}`);
  if(new Set(a.offline_assets).size!==a.offline_assets.length)errors.push(`duplicate offline asset in ${a.app_id}`);
  for(const l of a.cross_links)if(l.app_id===a.app_id&&!l.section_id)errors.push(`unscoped self-link ${a.app_id}`);
  const sections=new Set();for(const s of a.sections){if(sections.has(s.id))errors.push(`duplicate section ${s.id}`);sections.add(s.id);}
  for(const id of a.media)if(!assets.has(id))errors.push(`missing media ${id}`);
  for(const id of a.knowledge)if(!facts.has(id))errors.push(`missing knowledge ${id}`);
 }
 for(const m of media.assets)if(!m.owner||!m.alt||!m.credit||!m.permission||!safeLocalPath(m.path)||!exists(m.path))errors.push(`invalid media ${m.asset_id}`);
 for(const k of knowledge.records)if(!k.owner||!k.version||!k.sections)errors.push(`invalid knowledge ${k.id}`);
 const byId=new Map(apps.map(a=>[a.app_id,a])),graph=new Map();
 const contracts=new Map(interfaces.interfaces.map(i=>[i.id,i]));if(contracts.size!==interfaces.interfaces.length)errors.push('duplicate interface');for(const contract of contracts.values())if(!contract.owner||!contract.version)errors.push('invalid interface '+contract.id);
 for(const a of apps){graph.set(a.app_id,[]);if(!Array.isArray(a.dependencies)||!Array.isArray(a.cross_links))continue;for(const d of a.dependencies){if(contracts.has(d.id)){if(d.version!==contracts.get(d.id).version)errors.push('incompatible interface '+d.id);continue;}const target=byId.get(d.id);if(!target||target.version!==d.version)errors.push(`invalid dependency ${d.id}`);else graph.get(a.app_id).push(d.id);}for(const l of a.cross_links){const target=byId.get(l.app_id);if(!target||(l.section_id&&(!Array.isArray(target.sections)||!target.sections.some(s=>s.id===l.section_id))))errors.push(`dangling cross-link ${l.app_id}`);}}
 const active=new Set(),done=new Set();function visit(id){if(active.has(id)){errors.push(`circular dependency ${id}`);return;}if(done.has(id))return;active.add(id);for(const d of graph.get(id)||[])visit(d);active.delete(id);done.add(id);}for(const id of ids)visit(id);
 return errors;
}
export function releaseErrors(platform,apps,media,inventory){return [...['migrationComplete','ownerApproved','pilotPassed','deviceOfflinePassed','rollbackDevicePassed','privacyReviewed'].filter(k=>!Object.hasOwn(platform,k)||platform[k]!==true).map(k=>`release gate: ${k}`),...inventory.apps.filter(a=>!apps.some(b=>b.app_id===a.id)).map(a=>`unmigrated: ${a.id}`),...apps.filter(a=>!['approved','published'].includes(a.status)&&!(a.source_repository&&a.publication_review==='inherited-v1-approved')).map(a=>`content review pending: ${a.app_id}`),...media.assets.filter(a=>a.permission==='review-required').map(a=>`media permission review: ${a.asset_id}`)];}
export function build(){
 const platform=read('config/platform.json'),categories=read('config/categories.json'),media=read('src/shared/media/catalog.json'),knowledge=read('src/shared/knowledge.json'),inventory=read('config/v1-inventory.json');
 const apps=fs.readdirSync('src/apps',{withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=>read(`src/apps/${entry.name}/manifest.json`)).sort((a,b)=>a.app_id.localeCompare(b.app_id));const interfaces=fs.existsSync('src/shared/interfaces.json')?read('src/shared/interfaces.json'):undefined;const errors=validate({apps,categories,media,knowledge,interfaces,exists:p=>fs.existsSync(`src/${p}`)});if(errors.length)throw Error(errors.join('\n'));
 const environments=process.argv.includes('--published')?['published']:['developer','tester'];if(environments[0]==='published'){const failures=releaseErrors(platform,apps,media,inventory);if(failures.length)throw Error(failures.join('\n'));}
 if(process.argv.includes('--check')){console.log(`Validated ${apps.length} apps and ${categories.length} categories.`);return;}
 for(const environment of environments){
  const out=`dist/${environment}`;fs.rmSync(out,{recursive:true,force:true});fs.cpSync('src',out,{recursive:true});
  if(environment!=='developer')fs.rmSync(`${out}/core/developer.js`,{force:true});
  // Browser-safe review engine is generated from the canonical CLI modules.
  // No duplicate classification implementation is maintained.
  if(environment==='developer'){
   const modules=['extract-update-statements','find-batch-duplicates','find-batch-conflict-signals','suggest-content-destination','assess-existing-content','propose-update-placement','assess-naturalist-review-gates','classify-update-batch','summarize-naturalist-review'];
   const engineDir=`${out}/core/naturalist-engine`;
   fs.mkdirSync(engineDir,{recursive:true});
   for(const name of modules){
    const source=fs.readFileSync(`scripts/${name}.mjs`,'utf8').replace(/from (['"])\.\/([^'"]+)\.mjs\1/g,(_,quote,dependency)=>`from ${quote}./${dependency}.js${quote}`);
    fs.writeFileSync(`${engineDir}/${name}.js`,source);
   }
  }
  const bundleApps=environment==='developer'?apps:preparePublicReview(out,apps);
  const registry={schema_version:1,version:platform.version,environment,categories,apps:bundleApps};
  const put=(p,data)=>fs.writeFileSync(`${out}/${p}`,JSON.stringify(data,null,2));put('registry.json',registry);
  put('environment.json',{environment,version:platform.version,stage:platform.releaseStage,namespace:`mba-v2-${environment}`,developer:environment==='developer'});
  const facts=new Map(knowledge.records.map(r=>[r.id,r]));put('search-index.json',bundleApps.flatMap(a=>{const owned=new Map(a.sections.map(s=>[s.id,s]));for(const id of a.knowledge)for(const section of facts.get(id)?.sections||[])owned.set(section.id,section);return [{app_id:a.app_id,title:a.title,text:a.title,url:a.entry_point},...[...owned.values()].map(s=>({app_id:a.app_id,title:`${a.title} · ${s.title}`,text:[s.title,s.text,...s.aliases||[]].join(' '),url:a.entry_point+(s.query?'?'+new URLSearchParams(s.query).toString():`#${s.id}`)}))];}));
  put('manifest.webmanifest',{id:'./',name:`MBA Hub V2 ${environment}`,short_name:'MBA V2',start_url:'./index.html',scope:'./',display:'standalone',theme_color:'#123e50',background_color:'#f4f7f7',icons:[{src:'icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]});
  // Diagnostics code and maintenance handlers are physically absent from tester artifacts.
  if(environment==='developer')fs.appendFileSync(`${out}/core/hub.js`,"\nimport('./developer.js');\n");
  const files=[];function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else files.push(p.slice(out.length+1));}}walk(out);
  const resources=files.filter(p=>p!=='sw.js').sort().map(url=>({url,sha256:hash(fs.readFileSync(`${out}/${url}`)),bytes:fs.statSync(`${out}/${url}`).size}));
  const release=hash(JSON.stringify(resources)).slice(0,16);put('release.json',{schema_version:1,version:platform.version,environment,release,resources});
  fs.writeFileSync(`${out}/sw.js`,fs.readFileSync('src/sw.js','utf8').replaceAll('__NAMESPACE__',`mba-v2-${environment}`).replaceAll('__RELEASE__',release));
 }
 const catalog=apps.map(a=>`| ${a.title} | ${a.app_id} | ${a.version} | ${a.status} | ${a.owner} |`).join('\n');
 fs.writeFileSync('docs/GENERATED_CATALOG.md',`# Application registry\n\n| App | ID | Version | Status | Owner |\n|---|---|---|---|---|\n${catalog}\n\nDependencies and sections: see generated registry.json.\n`);
 const evidence=read('config/qa-evidence.json');const releaseBlocked=releaseErrors(platform,apps,media,inventory);const report={schema_version:2,generatedAt:new Date().toISOString(),platformVersion:platform.version,stage:platform.releaseStage,apps:apps.length,categories:categories.length,buildValidation:'passed',automatedTests:'run separately by CI',releaseEligible:releaseBlocked.length===0,releaseBlocked,publicationReview:{inheritedV1Content:apps.filter(a=>a.publication_review==='inherited-v1-approved').length,scope:'Inherited V1 content only; do not confuse with production approval'},deviceQA:evidence.evidence.ios_device_qa,qaEvidence:evidence.evidence,qaEvidenceRecordedOn:evidence.recorded_on,explicitOutstanding:['Pilot with additional guides not recorded','Android and Windows physical device tests not recorded','Comprehensive dynamic app/media and 100-200 app performance validation pending']};fs.writeFileSync('docs/BUILD_REPORT.json',JSON.stringify(report,null,2));console.log(JSON.stringify({platformVersion:report.platformVersion,apps:report.apps,categories:report.categories,releaseGateCount:report.releaseBlocked.length,deviceQA:report.deviceQA.status},null,2));
}
if(process.argv[1]===fileURLToPath(import.meta.url))build();
