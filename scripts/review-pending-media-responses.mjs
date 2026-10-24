import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {safeLocalPath} from './build.mjs';
import {preparePendingMediaReview} from './prepare-pending-media-review.mjs';

const channels=new Set(['internal-development','private-hub','public-tester','public-web']);
const evidenceText=['rights_holder','permission_basis','licensor_authority','grant_scope','attribution_requirements','restrictions','submitted_by'];
const scopeText=['audience','modification_plan','attribution_plan'];
const dense=a=>Array.isArray(a)&&Array.from({length:a.length},(_,i)=>Object.hasOwn(a,i)).every(Boolean);
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const sha=value=>createHash('sha256').update(value).digest('hex');
function shape(value,keys,label){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(value,key)))throw Error('Malformed '+label);
}
function identity(item){return {app_id:item.app_id,asset_id:item.asset_id,path:item.path,sha256:item.sha256,bytes:item.bytes,source:item.source};}
function current(root){
 const packet=preparePendingMediaReview(root);
 return {packet,packet_sha256:sha(JSON.stringify(canonical(packet)))};
}
export function createMediaReviewResponseTemplate(root){
 const {packet,packet_sha256}=current(root);
 return {schema_version:1,purpose:'evidence-submission-only',packet_sha256,
  responses:packet.items.map(item=>({response_id:item.app_id+':'+item.asset_id,identity:identity(item),
   scope:{audience:'',distribution_channels:[],modification_plan:'',attribution_plan:''},
   evidence:{rights_holder:'',permission_basis:'',licensor_authority:'',grant_scope:'',attribution_requirements:'',restrictions:'',submitted_by:'',files:[]}}))};
}
function evidenceFile(root,relative){
 if(typeof root!=='string'||!safeLocalPath(relative))throw Error('Unsafe evidence path');
 root=path.resolve(root);
 if(fs.realpathSync(root)!==root||!fs.lstatSync(root).isDirectory())throw Error('Symlink or invalid evidence root');
 let filename=root;const parts=relative.split('/');
 for(const [index,part] of parts.entries()){
  filename=path.join(filename,part);const stat=fs.lstatSync(filename);
  if(stat.isSymbolicLink())throw Error('Symlink prohibited in evidence path');
  if(index<parts.length-1?!stat.isDirectory():!stat.isFile())throw Error('Evidence must be a regular file');
 }
 return fs.readFileSync(filename);
}
// Completeness and identity checks prepare a human decision. Submitted claims
// and attached documents are not automatically adjudicated as valid permission.
export function validateMediaReviewResponses(root,responses,{evidenceRoot}={}){
 shape(responses,['schema_version','purpose','packet_sha256','responses'],'response document');
 if(responses.schema_version!==1||responses.purpose!=='evidence-submission-only'||!dense(responses.responses))throw Error('Malformed response document');
 const {packet,packet_sha256}=current(root);
 if(responses.packet_sha256!==packet_sha256)throw Error('Stale media review packet identity');
 const expected=new Map(packet.items.map(item=>[item.app_id+':'+item.asset_id,item])),submitted=new Map();
 for(const response of responses.responses){
  shape(response,['response_id','identity','scope','evidence'],'response item');
  if(typeof response.response_id!=='string'||!expected.has(response.response_id))throw Error('Unknown media review response');
  if(submitted.has(response.response_id))throw Error('Duplicate media review response');
  shape(response.identity,['app_id','asset_id','path','sha256','bytes','source'],'image identity');
  shape(response.identity.source,['repository','commit','path','uses'],'source identity');
  if(!dense(response.identity.source.uses))throw Error('Malformed source uses');
  if(JSON.stringify(canonical(response.identity))!==JSON.stringify(canonical(identity(expected.get(response.response_id)))))throw Error('Stale media review image identity');
  shape(response.scope,[...scopeText,'distribution_channels'],'response scope');
  shape(response.evidence,[...evidenceText,'files'],'response evidence');
  for(const key of scopeText)if(typeof response.scope[key]!=='string')throw Error('Malformed scope field: '+key);
  for(const key of evidenceText)if(typeof response.evidence[key]!=='string')throw Error('Malformed evidence field: '+key);
  const uses=response.scope.distribution_channels;
  if(!dense(uses)||uses.some(channel=>!channels.has(channel))||new Set(uses).size!==uses.length)throw Error('Malformed distribution scope');
  if(!dense(response.evidence.files))throw Error('Malformed evidence files');
  const paths=new Set(),verified=[];
  for(const file of response.evidence.files){
   shape(file,['path','sha256'],'evidence file');
   if(!safeLocalPath(file.path)||typeof file.sha256!=='string'||!/^[a-f0-9]{64}$/.test(file.sha256))throw Error('Unsafe evidence path or malformed hash');
   if(paths.has(file.path))throw Error('Duplicate evidence file');paths.add(file.path);
   const bytes=evidenceFile(evidenceRoot,file.path);
   if(!bytes.length)throw Error('Empty evidence file');
   if(sha(bytes)!==file.sha256)throw Error('Evidence hash mismatch');
   verified.push({path:file.path,sha256:file.sha256,bytes:bytes.length});
  }
  submitted.set(response.response_id,{response,verified});
 }
 const items=packet.items.map(item=>{
  const response_id=item.app_id+':'+item.asset_id,entry=submitted.get(response_id),missing_fields=[];
  if(!entry)missing_fields.push('response');
  else{
   for(const key of scopeText)if(!entry.response.scope[key].trim())missing_fields.push('scope.'+key);
   if(!entry.response.scope.distribution_channels.length)missing_fields.push('scope.distribution_channels');
   for(const key of evidenceText)if(!entry.response.evidence[key].trim())missing_fields.push('evidence.'+key);
   if(!entry.verified.length)missing_fields.push('evidence.files');
  }
  return {response_id,identity:identity(item),status:missing_fields.length?'pending':'ready_for_human_review',
   ready_for_human_review:missing_fields.length===0,permission_granted:false,missing_fields,
   submitted_scope:entry?.response.scope||null,submitted_evidence:entry?.response.evidence||null,
   verified_evidence_files:entry?.verified||[]};
 });
 return {schema_version:1,scope:'Evidence package completeness only; submitted claims require authorized human adjudication',
  packet_sha256,sourceWritePerformed:false,permission_granted:false,publication_authorized:false,
  ready_for_human_review:items.every(item=>item.ready_for_human_review),pending_items:items.filter(item=>!item.ready_for_human_review).length,items};
}
function readResponseFile(filename){
 const absolute=path.resolve(filename),root=path.dirname(absolute);
 return JSON.parse(evidenceFile(root,path.basename(absolute)).toString('utf8'));
}
function writeJSON(root,filename,value){
 const target=path.resolve(filename),relative=path.relative(path.join(path.resolve(root),'src'),target);
 if(path.extname(target)!=='.json'||relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative)))throw Error('Unsafe response output path');
 const check=()=>{
  let cursor=path.parse(target).root;
  for(const part of target.slice(cursor.length).split(path.sep)){
   cursor=path.join(cursor,part);let stat;try{stat=fs.lstatSync(cursor);}catch(error){if(error.code==='ENOENT')break;throw error;}
   if(stat.isSymbolicLink())throw Error('Symlink prohibited in response output');
  }
 };
 check();fs.mkdirSync(path.dirname(target),{recursive:true});check();fs.writeFileSync(target,JSON.stringify(value,null,2)+'\n');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2),options={root:path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')},seen=new Set();
  for(let i=0;i<args.length;i+=2){
   const key={'--root':'root','--template':'template','--responses':'responses','--evidence-root':'evidenceRoot','--report':'report'}[args[i]];
   if(!key||!args[i+1]||seen.has(key))throw Error('Usage: review-pending-media-responses.mjs [--root repository] [--template blank.json] [--responses filled.json --evidence-root directory --report validation.json]');
   seen.add(key);options[key]=args[i+1];
  }
  if(!options.template&&!options.responses||options.report&&!options.responses||options.evidenceRoot&&!options.responses)throw Error('Template or responses required; report/evidence-root requires responses');
  const paths=[options.template,options.responses,options.report].filter(Boolean).map(p=>path.resolve(p));
  if(new Set(paths).size!==paths.length)throw Error('Response input/output paths must differ');
  const template=createMediaReviewResponseTemplate(options.root);
  const supplied=options.responses?readResponseFile(options.responses):null,evidenceRoot=options.responses?(options.evidenceRoot||path.dirname(path.resolve(options.responses))):null;
  const result=supplied?validateMediaReviewResponses(options.root,supplied,{evidenceRoot}):null;
  const evidencePaths=new Set(result?.items.flatMap(item=>item.verified_evidence_files.map(file=>path.resolve(evidenceRoot,file.path)))||[]);
  for(const output of [options.template,options.report].filter(Boolean))if(evidencePaths.has(path.resolve(output)))throw Error('Response output cannot overwrite evidence');
  if(options.template)writeJSON(options.root,options.template,template);
  if(options.report)writeJSON(options.root,options.report,result);
  console.log(JSON.stringify(result||{schema_version:1,sourceWritePerformed:false,permission_granted:false,ready_for_human_review:false,pending_items:template.responses.length,template:options.template},null,2));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
