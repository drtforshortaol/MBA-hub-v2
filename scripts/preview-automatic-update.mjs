import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareAutomaticUpdate} from './prepare-automatic-update.mjs';
import {classifyUpdateBatch} from './classify-update-batch.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Read-only catalog derived from existing manifests, never inferred from filenames alone.
export function loadApplicationCatalog(){
 const dir=path.join(root,'src','apps');
 const apps=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(!entry.isDirectory()||!/^[a-z0-9-]+$/.test(entry.name))continue;
  const file=path.join(dir,entry.name,'manifest.json');
  if(!fs.existsSync(file))continue;
  const app=JSON.parse(fs.readFileSync(file,'utf8'));
  if(app.app_id===entry.name)apps.push(app);
 }
 return apps.sort((a,b)=>a.app_id.localeCompare(b.app_id));
}
export function previewUpdateBatch(update){return classifyUpdateBatch(update,loadApplicationCatalog());}
export function previewAutomaticUpdate(update,{replacementText}={}){
 return prepareAutomaticUpdate(update,loadApplicationCatalog(),{replacementText});
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(process.argv.length<3||process.argv.length>4){console.error('Usage: node scripts/preview-automatic-update.mjs <update text> [verified replacement text]');process.exitCode=2;}
 else try{const result=previewAutomaticUpdate(process.argv[2],{replacementText:process.argv[3]});console.log(JSON.stringify(result,null,2));if(!result.valid||result.proposal?.valid===false)process.exitCode=1;}
 catch(error){console.error('Unable to preview automatic update:',error.message);process.exitCode=1;}
}
