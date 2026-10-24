import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {verifyBuildArtifacts} from './verify-build-artifacts.mjs';
const safePath=value=>typeof value==='string'&&value.length>0&&value.split('/').every(part=>/^[A-Za-z0-9_.-]+$/.test(part)&&part!=='.'&&part!=='..');
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');

const javascriptTypes=new Set(['application/ecmascript','application/javascript','application/x-ecmascript','application/x-javascript','text/ecmascript','text/javascript','text/javascript1.0','text/javascript1.1','text/javascript1.2','text/javascript1.3','text/javascript1.4','text/javascript1.5','text/jscript','text/livescript','text/x-ecmascript','text/x-javascript']);

// Validate browser-interpreted resources; JSON fetched as data does not require a MIME gate.
export function deliveryErrors(name,headers){
 const extension=path.posix.extname(name).toLowerCase();
 const allowed=['.js','.mjs'].includes(extension)?javascriptTypes:extension==='.css'?new Set(['text/css']):extension==='.html'?new Set(['text/html']):null;
 if(!allowed)return [];
 const errors=[],mime=(headers.get('content-type')||'').split(';',1)[0].trim().toLowerCase();
 if(!allowed.has(mime))errors.push(`incompatible Content-Type: ${mime||'missing'}`);
 if((headers.get('content-disposition')||'').split(';',1)[0].trim().toLowerCase()==='attachment')errors.push('Content-Disposition attachment prevents browser resource loading');
 return errors;
}

// The application registers its root worker with the preview directory scope.
// A restrictive server header can break registration despite byte-perfect artifacts.
export function workerScopeErrors(headers,workerUrl,scopeUrl){
 const allowed=headers.get('service-worker-allowed');
 if(allowed===null)return [];
 try{
  const worker=new URL(workerUrl),scope=new URL(scopeUrl),maximum=new URL(allowed,worker);
  if(maximum.origin!==worker.origin||scope.origin!==worker.origin||
     /%2f|%5c/i.test(maximum.pathname)||!scope.pathname.startsWith(maximum.pathname))
   return ['Service-Worker-Allowed does not permit preview directory scope'];
  return [];
 }catch{return ['invalid Service-Worker-Allowed scope URL'];}
}

// HTTP delivery evidence does not establish browser behavior or device approval.
export async function verifyPreviewHttp(baseUrl,environment,{concurrency=6,timeoutMs=15000,totalTimeoutMs=120000,expectedRelease=null,maxResourceBytes=64*1024*1024,maxTotalBytes=256*1024*1024}={}) {
 const base=new URL(baseUrl);
 if(!['http:','https:'].includes(base.protocol)||base.username||base.password||base.search||base.hash)throw Error('Expected an HTTP(S) directory URL without credentials, query or fragment');
 if(!base.pathname.endsWith('/'))base.pathname+='/';
 if(!['developer','tester'].includes(environment))throw Error('Expected developer or tester environment');
 if(!Number.isInteger(concurrency)||concurrency<1||concurrency>16)throw Error('Concurrency must be between 1 and 16');
 if(![timeoutMs,totalTimeoutMs].every(value=>Number.isSafeInteger(value)&&value>0&&value<=600000))throw Error('Timeouts must be positive milliseconds up to 600000');
 if(expectedRelease!==null&&(typeof expectedRelease!=='string'||!/^[a-f0-9]{16}$/.test(expectedRelease)))throw Error('Expected release must be a 16-character lowercase hexadecimal identifier');
 if(![maxResourceBytes,maxTotalBytes].every(value=>Number.isSafeInteger(value)&&value>0))throw Error('Download budgets must be positive safe-integer byte counts');
 const deadline=AbortSignal.timeout(totalTimeoutMs);
 const report={schema_version:1,scope:'HTTP delivery headers, byte integrity and artifact semantics only; no browser, physical-device, scientific, editorial or release approval',url:base.href,environment,release:null,expectedRelease,passed:false,resources:{expected:0,verified:0,bytes:0},apps:[],errors:[]};
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'mba-http-audit-')),results=new Map();
 async function download(name,expected) {
  try {
   const response=await fetch(new URL(name,base),{redirect:'manual',cache:'no-store',signal:AbortSignal.any([deadline,AbortSignal.timeout(timeoutMs)])});
   if(response.status!==200)throw Error(`HTTP ${response.status}`);
   const limit=expected?expected.bytes:(name==='release.json'?4*1024*1024:2*1024*1024),chunks=[];let size=0;
   for await(const chunk of response.body){size+=chunk.length;if(size>limit)throw Error('response exceeds expected size limit');chunks.push(chunk);}
   const bytes=Buffer.concat(chunks,size);
   if(expected&&(bytes.length!==expected.bytes||sha256(bytes)!==expected.sha256))throw Error('integrity mismatch');
   const compatibility=deliveryErrors(name,response.headers);
   if(name==='sw.js')compatibility.push(...workerScopeErrors(response.headers,new URL(name,base),base));
   const file=path.join(directory,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);
   results.set(name,{passed:compatibility.length===0,bytes:bytes.length});
   report.errors.push(...compatibility.map(error=>`${name}: ${error}`));return bytes;
  }catch(error){results.set(name,{passed:false});report.errors.push(`${name}: ${error.message}`);return null;}
 }
 try {
  const releaseBytes=await download('release.json');if(!releaseBytes)return report;
  let release;try{release=JSON.parse(releaseBytes);}catch{report.errors.push('release.json: invalid JSON');return report;}
  if(!release||release.schema_version!==1||release.environment!==environment||!/^[a-f0-9]{16}$/.test(release.release)||!Array.isArray(release.resources)||!release.resources.length){report.errors.push('release.json: invalid release metadata');return report;}
  report.release=release.release;
  if(expectedRelease!==null&&release.release!==expectedRelease){report.errors.push(`release.json: expected release ${expectedRelease}, received ${release.release}`);return report;}
  const names=new Set();let declaredBytes=0;
  for(const resource of release.resources){
   if(!resource||!safePath(resource.url)||['release.json','sw.js'].includes(resource.url)||names.has(resource.url)||!Number.isSafeInteger(resource.bytes)||resource.bytes<0||!/^[a-f0-9]{64}$/.test(resource.sha256)){report.errors.push('release.json: unsafe or invalid resource declaration');return report;}
   // Validate the entire manifest before starting resource downloads. Metadata is untrusted.
   if(resource.bytes>maxResourceBytes){report.errors.push(`release.json: resource exceeds download budget: ${resource.url}`);return report;}
   if(resource.bytes>maxTotalBytes-declaredBytes){report.errors.push('release.json: resources exceed total download budget');return report;}
   declaredBytes+=resource.bytes;names.add(resource.url);
  }
  report.resources.expected=release.resources.length;let next=0;
  await Promise.all(Array.from({length:Math.min(concurrency,release.resources.length)},async()=>{while(next<release.resources.length){const resource=release.resources[next++];await download(resource.url,resource);}}));
  await download('sw.js');
  report.resources.verified=release.resources.filter(item=>results.get(item.url)?.passed).length;
  report.resources.bytes=release.resources.reduce((sum,item)=>sum+(results.get(item.url)?.passed?item.bytes:0),0);
  report.errors.push(...verifyBuildArtifacts(directory,environment).map(error=>`artifact: ${error}`));
  try {
   const registry=JSON.parse(fs.readFileSync(path.join(directory,'registry.json'),'utf8')),catalog=JSON.parse(fs.readFileSync(path.join(directory,'shared/media/catalog.json'),'utf8'));
   const media=new Map(catalog.assets.map(asset=>[asset.asset_id,asset]));
   report.apps=registry.apps.map(app=>{
    const assets=(app.media||[]).map(id=>media.get(id));
    const required=[...new Set([app.entry_point,...app.offline_assets,...assets.filter(asset=>asset?.offline).map(asset=>asset.path)])];
    const missing=required.filter(name=>!results.get(name)?.passed);
    return {app_id:app.app_id,entry_point:app.entry_point,declaredOfflineResources:app.offline_assets.length,declaredMedia:assets.length,offlineMedia:assets.filter(asset=>asset?.offline).length,verifiedResources:required.length-missing.length,missingResources:missing,passed:missing.length===0&&assets.every(Boolean),physicalTesting:'not assessed'};
   });
  }catch{report.errors.push('coverage: unavailable or malformed registry/media metadata');}
  report.errors.sort();report.passed=report.errors.length===0;return report;
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),options={};
 for(let index=0;index<args.length;index+=2){if(!['--url','--environment','--report','--expected-release'].includes(args[index])||!args[index+1])throw Error('Usage: node scripts/verify-preview-http.mjs --url URL --environment tester|developer [--report PATH] [--expected-release ID]');options[args[index]]=args[index+1];}
 if(!options['--url']||!options['--environment'])throw Error('Provide --url and --environment');
 const report=await verifyPreviewHttp(options['--url'],options['--environment'],{expectedRelease:options['--expected-release']??null}),json=JSON.stringify(report,null,2)+'\n';
 if(options['--report'])fs.writeFileSync(options['--report'],json);process.stdout.write(json);if(!report.passed)process.exitCode=1;
}
