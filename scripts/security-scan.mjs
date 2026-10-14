import fs from 'node:fs';
import path from 'node:path';
const roots=['src','dist/developer','dist/tester'];
const extensions=new Set(['.html','.js','.mjs','.json','.svg','.css','.webmanifest']);
const findings=[];
const rules=[
 ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
 ['github-token',/gh[pousr]_[A-Za-z0-9_]{30,}/g],
 ['github-fine-grained-token',/github_pat_[A-Za-z0-9_]{30,}/g],
 ['aws-access-key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
 ['google-api-key',/\bAIza[0-9A-Za-z_-]{35}\b/g],
 ['credential-assignment',/\b(?:api[_-]?key|secret|access[_-]?token|password)\s*[:=]\s*['"`][^'"`\s]{12,}['"`]/gi],
 ['document-write',/\bdocument\.write(?:ln)?\s*\(/g],
 ['eval',/\b(?:eval|Function)\s*\(/g],
 ['string-timer',/\bset(?:Timeout|Interval)\s*\(\s*['"`]/g],
 ['html-sink',/\b(?:innerHTML|outerHTML|insertAdjacentHTML)\s*(?:=|\()/g]
];
function walk(dir){
 if(!fs.existsSync(dir))return;
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,item.name);
  if(item.isSymbolicLink())continue;
  if(item.isDirectory()){walk(file);continue;}
  if(!extensions.has(path.extname(file)))continue;
  const body=fs.readFileSync(file,'utf8');
  for(const [rule,pattern] of rules){
   pattern.lastIndex=0;
   for(const match of body.matchAll(pattern)){
    const line=body.slice(0,match.index).split('\n').length;
    findings.push({file,line,rule});
   }
  }
 }
}
for(const root of roots)walk(root);
if(findings.length){for(const f of findings)console.error(`${f.file}:${f.line} [${f.rule}]`);process.exitCode=1;}
else console.log('Security scan passed: no matched credential or unsafe DOM patterns.');
