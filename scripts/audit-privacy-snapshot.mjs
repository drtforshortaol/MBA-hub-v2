import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const sha=b=>createHash('sha256').update(b).digest('hex');
export function privacySnapshot(root='.'){
 const files=[];const add=p=>{const full=path.join(root,p),stat=fs.lstatSync(full);if(stat.isSymbolicLink())throw Error('Privacy snapshot rejects symlink: '+p);if(stat.isDirectory())for(const child of fs.readdirSync(full).sort())add(p+'/'+child);else if(stat.isFile()&&p!=='config/privacy-review.json')files.push(p);};
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
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(privacySnapshot(),null,2));
