import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateChangeRequest} from './change-request-validation.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function inspectChangeRequestFile(filename,{readFile=fs.readFileSync,apps}={}){
 const errors=[];
 let request;
 try{request=JSON.parse(readFile(filename,'utf8'));}catch(e){return {valid:false,errors:['invalid or unreadable JSON request: '+e.message]};}
 const result=validateChangeRequest(request,apps||[]);
 return {valid:result.valid,errors:result.errors,app_id:request?.app_id??null,app_version:request?.app_version??null};
}
export function loadApps(){
 const directory=path.join(root,'src/apps');
 return fs.readdirSync(directory,{withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=>JSON.parse(fs.readFileSync(path.join(directory,entry.name,'manifest.json'),'utf8')));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 if(process.argv.length!==3){console.error('Usage: node scripts/check-change-request.mjs <request.json>');process.exitCode=2;}
 else{try{const result=inspectChangeRequestFile(process.argv[2],{apps:loadApps()});console.log(JSON.stringify(result,null,2));if(!result.valid)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}}
}
