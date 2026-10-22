import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {safeLocalPath} from './build.mjs';

const mediaExtension=/\.(?:avif|gif|jpe?g|png|svg|webp|ico|mp3|mp4|m4a|ogg|wav|webm)$/i;
const recordedPermissionStates=new Set(['owner-approved-v1','approved','licensed','public-domain']);
const mediaKey=/(?:\b(?:src|image|img|poster|audio|video|url)\s*[:=]\s*|["'](?:src|image|img|poster|audio|video|url)["']\s*:\s*)$/i;
const decodeHTML=s=>s.replace(/&amp;/g,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));

// A bounded literal scanner: skip comments, never execute JavaScript or templates.
function scriptReferences(text){
 const result=[];
 for(let i=0;i<text.length;i++){
  if(text.startsWith('//',i)){const end=text.indexOf('\n',i);i=end<0?text.length:end;continue;}
  if(text.startsWith('/*',i)){const end=text.indexOf('*/',i+2);i=end<0?text.length:end+1;continue;}
  const quote=text[i];if(!['"',"'",'`'].includes(quote))continue;
  const start=i;let raw='';
  for(i++;i<text.length;i++){if(text[i]==='\\'){raw+=text[i]+(text[++i]??'');continue;}if(text[i]===quote)break;raw+=text[i];}
  if(quote==='`'&&raw.includes('${'))continue;
  if(mediaKey.test(text.slice(Math.max(0,start-80),start))&&!raw.includes('\\'))result.push({url:raw,kind:'script-media-property'});
 }
 return result;
}
export function extractMediaReferences(file,text){
 if(typeof text!=='string')throw Error('Media source must be text');
 const refs=[];
 const css=s=>{for(const m of s.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/gi))refs.push({url:m[1]??m[2]??m[3],kind:'css-url'});};
 if(/\.html?$/i.test(file)){
  const clean=text.replace(/<!--[\s\S]*?-->/g,'');
  const markup=clean.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'');
  for(const tag of markup.matchAll(/<(img|audio|video|source|a|link)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)){
   for(const attr of tag[0].matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)){
    if(!['src','poster','href','srcset'].includes(attr[1].toLowerCase()))continue;
    const value=decodeHTML(attr[2]??attr[3]??attr[4]);
    if(attr[1].toLowerCase()==='srcset'){
     if(!value.trim().startsWith('data:'))for(const entry of value.split(','))refs.push({url:entry.trim().split(/\s+/)[0],kind:'html-srcset'});
    }else refs.push({url:value,kind:'html-'+attr[1].toLowerCase()});
   }
  }
  for(const script of clean.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi))refs.push(...scriptReferences(script[1]));
  for(const style of markup.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi))css(style[1]);
  for(const tag of markup.matchAll(/<[a-z][\w:-]*\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi))for(const attr of tag[0].matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi))if(attr[1].toLowerCase()==='style')css(decodeHTML(attr[2]??attr[3]??attr[4]));
 }else if(/\.(?:m?js|json)$/i.test(file))refs.push(...scriptReferences(text));
 else if(/\.css$/i.test(file))css(text.replace(/\/\*[\s\S]*?\*\//g,''));
 return refs;
}
export function resolveLocalMedia(source,url){
 if(typeof url!=='string')return {error:'invalid-reference'};
 const clean=url.trim();
 if(!clean||/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(clean))return {ignored:true};
 let resource;try{resource=decodeURIComponent(clean.split(/[?#]/,1)[0]);}catch{return {error:'invalid-encoding'};}
 if(!mediaExtension.test(resource))return {ignored:true};
 if(resource.includes('\\')||/[\x00-\x1f%?#]/.test(resource))return {error:'unsafe-media-path'};
 const target=path.posix.normalize(resource.startsWith('/')?resource.slice(1):path.posix.join(path.posix.dirname(source),resource));
 if(!safeLocalPath(target))return {error:'unsafe-media-path'};
 return {path:target};
}
export function auditLocalMediaCoverage({apps,media,files,exists,platformAssets=['icon.svg']}={}){
 if(!Array.isArray(apps)||!Array.isArray(media?.assets)||!Array.isArray(files)||typeof exists!=='function')throw Error('Expected apps, media.assets, files and exists');
 const paths=new Map(),ids=new Set(),errors=[],rows=new Map(),exemptions=[];
 for(const asset of media.assets){
  if(!asset||typeof asset.asset_id!=='string'||!safeLocalPath(asset.path)||ids.has(asset.asset_id))throw Error('Invalid or duplicate catalog asset');
  ids.add(asset.asset_id);if(!paths.has(asset.path))paths.set(asset.path,[]);paths.get(asset.path).push(asset);
 }
 const owners=new Map();
 for(const app of apps){if(!app||typeof app.app_id!=='string'||!safeLocalPath(app.app_id)||app.app_id.includes('/')||owners.has(app.app_id))throw Error('Invalid or duplicate app ID');owners.set(app.app_id,app);}
 for(const file of files){
  if(!file||!safeLocalPath(file.path)||typeof file.text!=='string')throw Error('Unsafe media audit source');
  const app=owners.get(file.path.split('/')[1]);if(!app||!file.path.startsWith('apps/'+app.app_id+'/'))continue;
  if(!Array.isArray(app.media)||!Array.isArray(app.offline_assets))throw Error('Malformed app declarations: '+app.app_id);
  for(const ref of extractMediaReferences(file.path,file.text)){
   const resolved=resolveLocalMedia(file.path,ref.url);if(resolved.ignored)continue;
   if(resolved.error){errors.push({app_id:app.app_id,source:file.path,reference:ref.url,reason:resolved.error});continue;}
   const key=app.app_id+'\0'+resolved.path;
   if(platformAssets.includes(resolved.path)){if(!exemptions.some(x=>x.app_id===app.app_id&&x.path===resolved.path))exemptions.push({app_id:app.app_id,path:resolved.path,scope:'platform-shell asset; not application content permission evidence'});continue;}
   if(!rows.has(key)){
    const assets=paths.get(resolved.path)||[],issues=[];
    if(!exists(resolved.path))issues.push('missing-local-file');
    if(!assets.length)issues.push('not-in-media-catalog','permission-evidence-missing');
    else{
     const declared=assets.filter(a=>app.media.includes(a.asset_id));
     if(!declared.length)issues.push('not-in-app-media');
     // Every record selected by this app needs evidence. An approved alias at
     // the same path cannot establish permission for an unapproved app record.
     if(!declared.length||!declared.every(a=>recordedPermissionStates.has(a.permission)&&typeof a.permission_evidence==='string'&&!!a.permission_evidence.trim()))issues.push('permission-evidence-missing');
    }
    if(!app.offline_assets.includes(resolved.path))issues.push('not-in-app-offline-assets');
    rows.set(key,{app_id:app.app_id,path:resolved.path,catalog_ids:assets.map(a=>a.asset_id),issues,references:[]});
   }
   const row=rows.get(key);if(!row.references.some(r=>r.source===file.path&&r.reference===ref.url&&r.kind===ref.kind))row.references.push({source:file.path,reference:ref.url,kind:ref.kind});
  }
 }
 const resources=[...rows.values()].sort((a,b)=>(a.app_id+a.path).localeCompare(b.app_id+b.path));
 return {schema_version:1,scope:'Read-only literal media coverage; no permission, content or release approval',writePerformed:false,complete:errors.length===0&&resources.every(r=>!r.issues.length),summary:{apps:apps.length,source_files:files.length,local_resources:resources.length,resources_with_findings:resources.filter(r=>r.issues.length).length,uncataloged_resources:resources.filter(r=>r.issues.includes('not-in-media-catalog')).length},resources,errors,platform_exemptions:exemptions,limitations:['Static HTML media attributes, CSS url() and literal JS/JSON media properties only.','Computed/escaped URLs, dynamic templates, imported shared scripts, JS string markup and runtime network/media behavior are not certified.','Permission labels require recorded evidence but are not independently adjudicated; attribution is not permission.']};
}
export function auditRepositoryMedia(root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')){
 const source=path.join(root,'src'),files=[],apps=[];
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,entry.name);if(entry.isSymbolicLink())throw Error('Symlink prohibited in media audit: '+p);
  if(entry.isDirectory())walk(p);else if(/\.(?:html?|m?js|json|css)$/i.test(entry.name)&&entry.name!=='manifest.json')files.push({path:path.relative(source,p).split(path.sep).join('/'),text:fs.readFileSync(p,'utf8')});
 }}
 for(const d of fs.readdirSync(path.join(source,'apps'),{withFileTypes:true}).filter(d=>d.isDirectory()))apps.push(JSON.parse(fs.readFileSync(path.join(source,'apps',d.name,'manifest.json'),'utf8')));
 walk(path.join(source,'apps'));
 return auditLocalMediaCoverage({apps,media:JSON.parse(fs.readFileSync(path.join(source,'shared/media/catalog.json'),'utf8')),files,exists:p=>{const target=path.join(source,p);return fs.existsSync(target)&&fs.lstatSync(target).isFile()&&!fs.lstatSync(target).isSymbolicLink();}});
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('Usage: node scripts/audit-local-media-coverage.mjs');const report=auditRepositoryMedia();console.log(JSON.stringify(report,null,2));if(!report.complete)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=2;}
}
