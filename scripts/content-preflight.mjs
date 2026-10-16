import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {safeLocalPath,validate} from './build.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const appsDir=path.join(root,'src/apps');

export function inspectRegistration({apps,categories,media,knowledge,exists,appId}){
 const errors=validate({apps,categories,media,knowledge,exists});
 const app=apps.find(a=>a.app_id===appId);
 if(!app)errors.push('unknown app: '+appId);
 if(app){
  const assets=new Map(media.assets.map(a=>[a.asset_id,a]));
  for(const id of app.media){
   const asset=assets.get(id);
   if(!asset)continue; // validate() reports missing IDs
   if(asset.offline===true&&!app.offline_assets.includes(asset.path))
    errors.push('offline media not registered: '+id+' ('+asset.path+')');
  }
  for(const s of app.sections)if(!s.id||!s.title)errors.push('invalid section in '+appId);
  if(!safeLocalPath(app.entry_point))errors.push('unsafe entry point '+appId);
 }
 return {app_id:appId,ready:errors.length===0,errors};
}

export function inspectRepository(appId){
 const apps=fs.readdirSync(appsDir,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>read('src/apps/'+d.name+'/manifest.json'));
 return inspectRegistration({
  apps,categories:read('config/categories.json'),media:read('src/shared/media/catalog.json'),
  knowledge:read('src/shared/knowledge.json'),appId,
  exists:p=>safeLocalPath(p)&&fs.existsSync(path.join(root,'src',p))
 });
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length!==2||args[0]!=='--app'||!args[1]){
  console.error('Usage: node scripts/content-preflight.mjs --app <permanent-app-id>');
  process.exitCode=2;
 }else{
  try{
   const result=inspectRepository(args[1]);
   console.log(JSON.stringify(result,null,2));
   if(!result.ready)process.exitCode=1;
  }catch(e){console.error(e.message);process.exitCode=1;}
 }
}
