#!/usr/bin/env node
// Register El Niño's existing local illustrations without rewriting prior catalog entries.
// Run with --write in a checkout that contains the actual image bytes.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalogFile=path.join(root,'src/shared/media/catalog.json');
const manifestFile=path.join(root,'src/apps/el-nino/manifest.json');
const catalog=JSON.parse(fs.readFileSync(catalogFile,'utf8'));
const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
if(manifest.app_id!=='el-nino'||!Array.isArray(catalog.assets)||!Array.isArray(manifest.media)||!Array.isArray(manifest.offline_assets))throw Error('Invalid media registration inputs');
const additions=[];
for(let n=1;n<=18;n++){
 const name='slide-'+String(n).padStart(2,'0')+'.jpg';
 const relative='apps/el-nino/images/'+name;
 const filename=path.join(root,'src',relative);
 const stat=fs.lstatSync(filename);
 if(!stat.isFile()||stat.isSymbolicLink())throw Error('Missing regular illustration: '+relative);
 if(!manifest.offline_assets.includes(relative))throw Error('Missing offline registration: '+relative);
 const sha256=createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
 const id='el-nino-'+name.slice(0,-4);
 const matching=catalog.assets.filter(asset=>asset.asset_id===id||asset.path===relative);
 if(matching.length>1)throw Error('Conflicting media registration: '+relative);
 if(matching.length){
  const existing=matching[0];
  if(existing.asset_id!==id||existing.path!==relative||existing.sha256!==sha256||!manifest.media.includes(id))throw Error('Existing media registration mismatch: '+relative);
  continue;
 }
 additions.push({asset_id:id,path:relative,owner:'el-nino',alt:'El Niño educational illustration '+n,credit:'El Niño application illustration',permission:'review-required',offline:true,sha256,source_repository:'drtforshortaol/MBA-hub-v2',source_commit:'0000000000000000000000000000000000000000',source_path:'src/'+relative,uses:[{app_id:'el-nino',source_path:relative}]});
}
if(process.argv.length!==2&&!(process.argv.length===3&&process.argv[2]==='--write'))throw Error('Usage: node scripts/register-el-nino-media.mjs [--write]');
if(process.argv[2]==='--write'&&additions.length){
 const nextCatalog={...catalog,assets:[...catalog.assets,...additions]};
 const nextManifest={...manifest,media:[...manifest.media,...additions.map(asset=>asset.asset_id)]};
 fs.writeFileSync(catalogFile,JSON.stringify(nextCatalog,null,2)+'\n');
 fs.writeFileSync(manifestFile,JSON.stringify(nextManifest,null,2)+'\n');
}
console.log(JSON.stringify({writePerformed:process.argv[2]==='--write',alreadyRegistered:18-additions.length,additions:additions.length,priorCatalogEntriesPreserved:catalog.assets.length},null,2));
