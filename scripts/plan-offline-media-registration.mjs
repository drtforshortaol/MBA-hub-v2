import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {safeLocalPath} from './build.mjs';

// Read-only planning: registered media supplies paths; caller owns any edits.
export function planOfflineMediaRegistration(context={}){
 const {apps,media,exists}=context??{};
 const catalog=new Map(),ambiguous=new Set(),errors=[],plans=[];
 const result=()=>({valid:errors.length===0,writePerformed:false,apps:plans.length,additions:plans.reduce((sum,plan)=>sum+plan.additions.length,0),plans,errors});
 if(!Array.isArray(apps))errors.push('registration input: apps must be an array');
 if(!Array.isArray(media?.assets))errors.push('media catalog: assets must be an array');
 if(typeof exists!=='function')errors.push('registration input: exists must be a function');
 if(errors.length)return result();
 for(const asset of media.assets){
  if(!asset||typeof asset.asset_id!=='string'||!asset.asset_id.trim()){
   errors.push('media catalog: invalid asset ID');continue;
  }
  if(catalog.has(asset.asset_id)||ambiguous.has(asset.asset_id)){
   errors.push(`media catalog: duplicate asset ID ${asset.asset_id}`);
   ambiguous.add(asset.asset_id);catalog.delete(asset.asset_id);continue;
  }
  catalog.set(asset.asset_id,asset);
  if(typeof asset.offline!=='boolean')errors.push(`media catalog: invalid offline intent ${asset.asset_id}`);
 }
 for(const app of apps){
  if(!app||typeof app.app_id!=='string'||!app.app_id.trim()){
   errors.push('registration input: invalid app ID');continue;
  }
  const appErrors=[];
  if(!Array.isArray(app.media)||app.media.some(id=>typeof id!=='string'||!id.trim()))appErrors.push(`${app.app_id}: invalid media references`);
  if(!Array.isArray(app.offline_assets)||app.offline_assets.some(asset=>!safeLocalPath(asset)))appErrors.push(`${app.app_id}: invalid offline asset paths`);
  if(appErrors.length){errors.push(...appErrors);continue;}
  const registered=new Set(app.offline_assets),additions=[];
  for(const id of app.media){
   if(ambiguous.has(id))continue; // Never propose a path from a conflicting catalog record.
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
 return result();
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
