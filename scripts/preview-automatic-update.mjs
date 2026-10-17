import {summarizeNaturalistReview} from './summarize-naturalist-review.mjs';
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
// Structured draft packet only: source material and existing manifests remain unchanged.
export function previewNaturalistPacket(update){
 const result=previewUpdateBatch(update);
 if(!result.valid)return result;
 return {schema_version:1,kind:'mba-v2-naturalist-review-packet',original_source:update,review_summary:summarizeNaturalistReview(result.entries),entries:result.entries.map(entry=>({index:entry.index,duplicate_of:entry.duplicate_of,source_text:entry.text,source_block:entry.source_block,extraction:entry.extraction,placement:entry.placement,review:entry.review,existing_content:entry.existing_content,review_required:true})),scientific_verification:'required',requires_review:true,prepared:false,committed:false,published:false};
}
export function previewAutomaticUpdate(update,{replacementText}={}){
 return prepareAutomaticUpdate(update,loadApplicationCatalog(),{replacementText});
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(process.argv.length<3||process.argv.length>4){console.error('Usage: node scripts/preview-automatic-update.mjs <update text> [verified replacement text]');process.exitCode=2;}
 else try{const result=previewAutomaticUpdate(process.argv[2],{replacementText:process.argv[3]});console.log(JSON.stringify(result,null,2));if(!result.valid||result.proposal?.valid===false)process.exitCode=1;}
 catch(error){console.error('Unable to preview automatic update:',error.message);process.exitCode=1;}
}
