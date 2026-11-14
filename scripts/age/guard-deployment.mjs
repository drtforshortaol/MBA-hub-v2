import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// AGE-004: Deployment may publish validated artifacts, but may not rewrite
// application registration or executable Hub source.
export function auditDeploymentWorkflow(source, name='workflow') {
 const failures=[];
 const checks=[
  [/\b(?:hub|core)\.write_text\s*\(/, 'deployment writes Hub core source'],
  [/\b(?:hub|core)\.write_bytes\s*\(/, 'deployment writes Hub core binary'],
  [/\b(?:code|javascript)\s*=\s*(?:code|javascript)\.replace\s*\(/, 'deployment rewrites application JavaScript'],
  [/\b(?:elNino|nearbyDining)\s*=\s*\{/, 'deployment defines application inside build script'],
  [/\b(?:sed\s+-i|perl\s+-pi)\b[^\n]*(?:core\/hub\.js|registry\.json)/, 'deployment patches core or registry in place'],
  [/\b(?:core\/hub\.js|registry\.json)[^\n]*\.write_text\s*\(/, 'deployment writes authoritative app registry or Hub core'],
 ];
 for(const [pattern,reason] of checks) if(pattern.test(source)) failures.push(`${name}: ${reason}`);
 return failures;
}
export function auditDeploymentFiles(files) {
 return files.flatMap(file=>auditDeploymentWorkflow(fs.readFileSync(file,'utf8'),file));
}
const invoked=process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
 const files=process.argv.slice(2);
 if(!files.length){console.error('Usage: node scripts/age/guard-deployment.mjs <workflow.yml> [...]');process.exitCode=2;}
 else{
  const failures=auditDeploymentFiles(files);
  if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
  else console.log('AGE-004 deployment boundary: PASS');
 }
}
