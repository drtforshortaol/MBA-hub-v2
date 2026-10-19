import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {safeLocalPath} from './build.mjs';

// Read-only planning: registered media supplies paths; caller owns any edits.
export function planOfflineMediaRegistration({apps,media,exists}){
 const catalog=new Map(),errors=[],plans=[];
 for(const asset of media.assets){
  if(!asset||typeof asset.asset_id!=='string'||!asset.asset_id.trim()){
   errors.push('media catalog: invalid asset ID');continue;
  }
  if(catalog.has(asset.asset_id)){
   errors.push(`media catalog: duplicate asset ID ${asset.asset_id}`);continue;
  }
  catalog.set(asset.asset_id,asset);
 }
 for(const app of apps){
  const registered=new Set(app.offline_assets),additions=[];
  for(const id of app.media){
   const asset=catalog.get(id);
   if(!asset){errors.push(`${app.app_id}: unknown media ${id}`);continue;}
   if(asset.offline!==true)continue;
   if(!safeLocalPath(asset.path)||!exists(asset.path)){
    errors.push(`${app.app_id}: missing/unsafe offline media ${id}`);continue;
   }
   if(!registered.has(asset.path)){registered.add(asset.path);additions.push(asset.path);}
  }
  if(additions.length)plans.push({app_id:app.app_id,additions});
 }
 return {valid:errors.length===0,writePerformed:false,apps:plans.length,additions:plans.reduce((sum,plan)=>sum+plan.additions.length,0),plans,errors};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==2)throw Error('Usage: node scripts/plan-offline-media-registration.mjs');
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  const apps=fs.readdirSync(path.join(root,'src/apps'),{withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=>read(`src/apps/${entry.name}/manifest.json`));
  const result=planOfflineMediaRegistration({apps,media:read('src/shared/media/catalog.json'),exists:asset=>safeLocalPath(asset)&&fs.existsSync(path.join(root,'src',asset))});
  console.log(JSON.stringify(result,null,2));
  if(!result.valid)process.exitCode=1;
 }catch(error){console.error(error.message);process.exitCode=1;}
}
