import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const sha=b=>createHash('sha256').update(b).digest('hex');
export function privacySnapshot(root='.'){
 const files=[];const add=p=>{const full=path.join(root,p),stat=fs.lstatSync(full);if(stat.isSymbolicLink())throw Error('Privacy snapshot rejects symlink: '+p);if(stat.isDirectory())for(const child of fs.readdirSync(full).sort())add(p+'/'+child);else if(stat.isFile()&&p!=='config/privacy-review.json'&&!(p.startsWith('scripts/')&&p.split('/').includes('__pycache__')&&p.endsWith('.pyc')))files.push(p);};
 for(const p of ['src','config','scripts','package.json','docs/GUIDE_CONTENT_RESTORED.md'])add(p);
 const resources=files.sort().map(p=>{const b=fs.readFileSync(path.join(root,p));return {path:p,bytes:b.length,sha256:sha(b)};});
 const automaticExternalResources=[],sensitiveBrowserAPIs=[],storageFiles=[],networkFiles=[];
 for(const p of files.filter(p=>p.startsWith('src/')&&/\.(?:html|js|css|svg)$/.test(p))){const s=fs.readFileSync(path.join(root,p),'utf8');
  for(const m of s.matchAll(/(?:\b(?:src|srcset|poster|action)\s*=\s*["']|url\(\s*["']?)(https?:\/\/|\/\/)([^"'\s)>]+)/gi))automaticExternalResources.push({path:p,resource:m[1]+m[2]});
  for(const m of s.matchAll(/\b(?:sendBeacon|WebSocket|XMLHttpRequest|getUserMedia|geolocation|document\.cookie|navigator\.credentials)\b/g))sensitiveBrowserAPIs.push({path:p,api:m[0]});
  if(/\b(?:localStorage|sessionStorage|indexedDB)\b/.test(s))storageFiles.push(p);
  if(/\bfetch\s*\(/.test(s))networkFiles.push(p);
 }
 return {schema_version:1,scope:'Bounded static inventory and resource/API triage; manual review is recorded separately',snapshot_sha256:sha(JSON.stringify(resources)),resources,automaticExternalResources,sensitiveBrowserAPIs,storageFiles:storageFiles.sort(),networkFiles:networkFiles.sort()};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const snapshot=privacySnapshot();
 if(process.argv.includes('--write-reviewed-binding')){
  const reviewPath='config/privacy-review.json';
  const review=JSON.parse(fs.readFileSync(reviewPath,'utf8'));
  if(review.status!=='reviewed'||review.release_authorized!==false)throw Error('Review status or release authorization changed: manual review required');
  const old=new Map(review.snapshot.resources.map(item=>[item.path,item]));
  const changed=snapshot.resources.filter(item=>old.get(item.path)?.sha256!==item.sha256||old.get(item.path)?.bytes!==item.bytes).map(item=>item.path);
  const removed=review.snapshot.resources.filter(item=>!snapshot.resources.some(current=>current.path===item.path)).map(item=>item.path);
  const permitted=['scripts/build.mjs','src/core/developer.js','scripts/audit-privacy-snapshot.mjs'];
  if(removed.length||changed.length!==3||changed.some(item=>!permitted.includes(item))||snapshot.automaticExternalResources.length||snapshot.sensitiveBrowserAPIs.length)throw Error('Unexpected review delta; do not auto-approve: '+JSON.stringify({changed,removed}));
  review.snapshot=snapshot;
  review.snapshot_sha256=snapshot.snapshot_sha256;
  review.reviewed_on='2026-11-02';
  review.scope+='; developer-only five-tap shortcut loading and error feedback reviewed November 2; no change to guide distribution authorization';
  fs.writeFileSync(reviewPath,JSON.stringify(review,null,2)+'\n');
  console.log('Reviewed developer-only privacy binding updated:',snapshot.snapshot_sha256);
 }else console.log(JSON.stringify(snapshot,null,2));
}
