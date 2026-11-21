import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {safeLocalPath} from './build.mjs';
import {auditRepositoryMedia} from './audit-local-media-coverage.mjs';
import {assessMediaRegistration} from './verify-media-registration.mjs';
import {checkedReviewOutputPath} from './review-output-path.mjs';

const order=(a,b)=>a<b?-1:a>b?1:0;
const dense=values=>Array.isArray(values)&&Array.from({length:values.length},(_,i)=>Object.hasOwn(values,i)).every(Boolean);
const text=(value,name)=>{if(typeof value!=='string'||!value.trim())throw Error('Malformed media review '+name);return value;};
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function checkedRoot(root){
 const resolved=path.resolve(root);
 if(fs.realpathSync(resolved)!==resolved||!fs.lstatSync(resolved).isDirectory())throw Error('Symlink or invalid review root');
 return resolved;
}
function sourceFile(root,relative){
 if(!safeLocalPath(relative))throw Error('Unsafe media review path: '+relative);
 let current=root;
 for(const [index,part] of relative.split('/').entries()){
  current=path.join(current,part);const stat=fs.lstatSync(current);
  if(stat.isSymbolicLink())throw Error('Symlink prohibited in media review: '+relative);
  if(index<relative.split('/').length-1?!stat.isDirectory():!stat.isFile())throw Error('Not a regular media review file: '+relative);
 }
 return current;
}
const json=(root,relative)=>JSON.parse(fs.readFileSync(sourceFile(root,relative),'utf8'));

// This packet prepares decisions; no permission label, evidence or approval is
// inferred or written. Every item is bound to live manifest/catalog/media bytes.
export function preparePendingMediaReview(root){
 root=checkedRoot(root);
 const audit=auditRepositoryMedia(root),registration=assessMediaRegistration(audit);
 if(!registration.registrationValid)throw Error('Technical media findings must be resolved before preparing rights review');
 const catalog=json(root,'src/shared/media/catalog.json');
 if(!dense(catalog.assets))throw Error('Malformed media review catalog');
 const catalogById=new Map(catalog.assets.map(asset=>[asset.asset_id,asset]));
 const items=[];
 const recordedStates=new Set(['owner-approved-v1','approved','licensed','public-domain']);
 for(const finding of audit.resources.filter(row=>row.issues.includes('permission-evidence-missing'))){
  const manifest=json(root,'src/apps/'+finding.app_id+'/manifest.json');
  if(manifest.app_id!==finding.app_id||!dense(manifest.media)||!dense(manifest.offline_assets))throw Error('Malformed media review manifest');
  const selected=finding.catalog_ids.filter(id=>manifest.media.includes(id)).sort(order);
  if(!selected.length)throw Error('Missing selected media review record');
  for(const id of selected){
   const asset=catalogById.get(id);
   if(!asset||asset.path!==finding.path||!safeLocalPath(asset.path))throw Error('Malformed media review record path');
   if(recordedStates.has(asset.permission)&&typeof asset.permission_evidence==='string'&&asset.permission_evidence.trim())continue;
   for(const field of ['asset_id','owner','permission','alt','credit','source_repository','source_commit','source_path'])text(asset[field],field);
   if(!/^[a-f0-9]{64}$/.test(asset.sha256||''))throw Error('Malformed media review sha256');
   if(!/^[a-f0-9]{40}$/.test(asset.source_commit))throw Error('Malformed media review source_commit');
   if(asset.permission_evidence!==undefined&&typeof asset.permission_evidence!=='string')throw Error('Malformed media review permission_evidence');
   if(!dense(asset.uses)||asset.uses.some(use=>!use||typeof use.app_id!=='string'||typeof use.source_path!=='string')||!asset.uses.some(use=>use.app_id===finding.app_id))throw Error('Malformed media review uses');
   const source=sourceFile(root,'src/'+asset.path),bytes=fs.readFileSync(source);
   const sha256=createHash('sha256').update(bytes).digest('hex');
   if(sha256!==asset.sha256)throw Error('Media review hash mismatch: '+asset.path);
   const evidence=asset.permission_evidence||'';
   items.push({app_id:finding.app_id,app_title:text(manifest.title,'app_title'),
    app_owner:text(manifest.owner,'app_owner'),asset_id:id,path:asset.path,
    catalog_custodian:asset.owner,copyright_owner:'Not established by this packet',
    alt:asset.alt,recorded_credit:asset.credit,
    source:{repository:asset.source_repository,commit:asset.source_commit,path:asset.source_path,
     uses:asset.uses.map(use=>({app_id:use.app_id,source_path:use.source_path})).sort((a,b)=>order(a.app_id+'\0'+a.source_path,b.app_id+'\0'+b.source_path))},
    recorded_permission:asset.permission,recorded_permission_evidence:evidence,
    sha256,bytes:bytes.length,catalog_hash_matches:true,
    registration:{cataloged:true,app_media_registered:true,offline_registered:manifest.offline_assets.includes(asset.path)},
    review_status:'pending',missing_evidence:[
     ...(!evidence.trim()?['Attach verifiable permission or license evidence for this exact image.']:[]),
     'Identify the copyright holder or authorized licensor; the catalog custodian is not proof of ownership.',
     'Document the permitted audience, distribution, modification and attribution terms.',
     'Have an authorized reviewer record the permission decision through the existing approval process.'
    ]});
  }
 }
 items.sort((a,b)=>order(a.app_id+'\0'+a.path+'\0'+a.asset_id,b.app_id+'\0'+b.path+'\0'+b.asset_id));
 return {schema_version:1,scope:'Pending media review preparation only; no permission, copyright ownership or publication approval',
  sourceWritePerformed:false,registrationValid:true,permissionReviewComplete:registration.permissionReviewComplete,
  pending_items:items.length,items};
}
function localLink(root,htmlFile,relative,assetBase,sha256){
 let target=sourceFile(root,'src/'+relative);
 if(assetBase!==undefined){
  const base=assetBase.replace(/\/$/,'');
  if(!safeLocalPath(base))throw Error('Unsafe review asset base');
  const built=path.join(path.dirname(htmlFile),base,relative),builtRelative=path.relative(root,built).split(path.sep).join('/');
  target=sourceFile(root,builtRelative);
  if(createHash('sha256').update(fs.readFileSync(target)).digest('hex')!==sha256)throw Error('Preview media hash mismatch: '+relative);
 }
 const link=path.relative(path.dirname(htmlFile),target).split(path.sep).map(part=>encodeURIComponent(part)).join('/');
 if(!link||path.isAbsolute(link)||/^[a-z][a-z\d+.-]*:/i.test(link)||link.startsWith('//'))throw Error('Unsafe review preview link');
 return link.startsWith('.')?link:'./'+link;
}
export function renderPendingMediaReview(packet,{root,htmlFile,assetBase}){
 root=checkedRoot(root);htmlFile=path.resolve(htmlFile);
 if(packet?.schema_version!==1||!dense(packet.items)||packet.pending_items!==packet.items.length)throw Error('Malformed media review packet');
 const cards=packet.items.map(item=>{
  if(!item||!safeLocalPath(item.path)||item.review_status!=='pending'||!dense(item.missing_evidence))throw Error('Malformed review item');
  if(createHash('sha256').update(fs.readFileSync(sourceFile(root,'src/'+item.path))).digest('hex')!==item.sha256)throw Error('Media review hash mismatch: '+item.path);
  const link=escapeHTML(localLink(root,htmlFile,item.path,assetBase,item.sha256)),esc=escapeHTML;
  const preview=/\.(?:jpe?g|png|gif|webp|avif|ico)$/i.test(item.path)?'<img loading="lazy" src="'+link+'" alt="'+esc(item.alt)+'">':'<p>Preview unavailable for this file type.</p>';
  return '<article>'+preview+'<h2>'+esc(item.app_title)+'</h2><p><strong>Pending review — no permission granted</strong></p><dl>'+[
   ['Asset',item.asset_id],['Current path',item.path],['App owner (recorded)',item.app_owner],['Catalog custodian (recorded)',item.catalog_custodian],
   ['Copyright owner',item.copyright_owner],['Source repository',item.source.repository],['Source commit',item.source.commit],['Source path',item.source.path],
   ['Recorded credit',item.recorded_credit],['Recorded permission',item.recorded_permission],['Recorded evidence',item.recorded_permission_evidence||'Missing'],
   ['SHA-256',item.sha256],['Bytes',item.bytes],['Registration / offline',JSON.stringify(item.registration)]
  ].map(([label,value])=>'<dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd>').join('')+'</dl><h3>Evidence to supply</h3><ul>'+item.missing_evidence.map(action=>'<li>'+esc(action)+'</li>').join('')+'</ul><p><a href="'+link+'">Open local source image</a></p></article>';
 }).join('');
 return '<!doctype html>\n<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src \'self\' file:; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'"><title>Pending media permission review</title><style>body{font:16px system-ui,sans-serif;margin:2rem;background:#f5f6f8;color:#18242b}header{max-width:80rem;margin:auto}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem;max-width:100rem;margin:auto}article{padding:1.5rem;background:white;border:1px solid #ccd4da;border-radius:.5rem;min-width:0}img{width:100%;height:260px;object-fit:contain;background:#edf1f3}dt{font-weight:700;margin-top:.65rem}dd{margin:0;overflow-wrap:anywhere}li{margin:.5rem 0}a{color:#124b77}</style><header><h1>Pending media permission review</h1><p>'+escapeHTML(packet.pending_items)+' items. This read-only packet does not establish copyright ownership or grant permission. Review the exact image and supply the listed evidence through the existing approval process.</p></header><main>'+cards+'</main></html>\n';
}
export function writePendingMediaReview({root,report,html,assetBase}){
 root=checkedRoot(root);
 const reportFile=checkedReviewOutputPath(root,report,'.json'),htmlFile=checkedReviewOutputPath(root,html,'.html');
 const packet=preparePendingMediaReview(root),rendered=renderPendingMediaReview(packet,{root,htmlFile,assetBase});
 for(const filename of [reportFile,htmlFile]){fs.mkdirSync(path.dirname(filename),{recursive:true});checkedReviewOutputPath(root,filename,path.extname(filename));}
 fs.writeFileSync(reportFile,JSON.stringify(packet,null,2)+'\n');fs.writeFileSync(htmlFile,rendered);
 return {pending_items:packet.pending_items,permissionReviewComplete:packet.permissionReviewComplete,sourceWritePerformed:false,report:reportFile,html:htmlFile};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2),options={root:path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')};
  for(let i=0;i<args.length;i+=2){const key={'--root':'root','--report':'report','--html':'html','--asset-base':'assetBase'}[args[i]];if(!key||!args[i+1]||Object.hasOwn(options,key)&&key!=='root')throw Error('Usage: prepare-pending-media-review.mjs [--root repository] --report packet.json --html contact-sheet.html [--asset-base developer/]');options[key]=args[i+1];}
  if(!options.report||!options.html)throw Error('Both --report and --html are required');
  console.log(JSON.stringify(writePendingMediaReview(options),null,2));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
