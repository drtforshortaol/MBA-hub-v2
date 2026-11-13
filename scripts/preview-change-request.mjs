import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareChangeRequest} from './prepare-change-request.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function previewFile(filename){
 const request=JSON.parse(fs.readFileSync(filename,'utf8'));
 if(typeof request.app_id!=='string'||!request.app_id.match(/^[a-z0-9-]+$/))return {valid:false,errors:['invalid application identifier']};
 const manifestPath=path.join(root,'src','apps',request.app_id,'manifest.json');
 if(!fs.existsSync(manifestPath))return {valid:false,errors:['application manifest not found']};
 const app=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 return prepareChangeRequest(request,app);
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(process.argv.length!==3){console.error('Usage: node scripts/preview-change-request.mjs <request.json>');process.exitCode=2;}
 else try{
  const result=previewFile(process.argv[2]);
  console.log(JSON.stringify(result,null,2));
  if(!result.valid)process.exitCode=1;
 }catch(error){console.error('Unable to preview change request:',error.message);process.exitCode=1;}
}
