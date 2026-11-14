import fs from 'node:fs';
import path from 'node:path';

/**
 * AGE-004: deployment workflows must not rewrite application behavior.
 * Scans tracked workflow source; no dependency on GitHub Actions runtime.
 */
export function auditDeploymentWorkflow(source, name='workflow') {
 const failures=[];
 const checks=[
  [/core\/hub\.js/, 'deployment references mutable Hub core JavaScript'],
  [/code\s*=\s*code\.replace\s*\(/, 'deployment rewrites JavaScript application registration'],
  [/hub\.write_text\s*\(/, 'deployment writes Hub core source'],
  [/const\s+elNino\s*=\s*\{/, 'deployment injects application definition'],
 ];
 for(const [pattern,reason] of checks) if(pattern.test(source)) failures.push(`${name}: ${reason}`);
 return failures;
}
export function auditDeploymentFiles(files) {
 return files.flatMap(file=>auditDeploymentWorkflow(fs.readFileSync(file,'utf8'),file));
}
if(process.argv[1] && path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)){
 const failures=auditDeploymentFiles(process.argv.slice(2));
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
 else console.log('AGE-004 deployment boundary: PASS');
}
