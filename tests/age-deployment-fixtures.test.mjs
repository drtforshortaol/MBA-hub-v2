import test from 'node:test';
import assert from 'node:assert/strict';
import {auditDeploymentWorkflow} from '../scripts/age/guard-deployment.mjs';

test('AGE-004 detects actual orange style application injection',()=>{
 const workflow=`from pathlib import Path
hub=Path('source/dist/developer/core/hub.js')
code=hub.read_text()
before='[...listedHubApps(registry.apps),nearbyDining]'
after='[...listedHubApps(registry.apps),nearbyDining,elNino]'
code=code.replace(before,after)
marker='const nearbyDining={'
code=code.replace(marker,"const elNino={app_id:'el-nino'};\\n"+marker)
hub.write_text(code)`;
 assert.ok(auditDeploymentWorkflow(workflow,'orange').length>=2);
});
test('AGE-004 allows reading core files for verification',()=>{
 const workflow=`hub=fs.readFileSync('dist/developer/core/hub.js','utf8');
if(!hub.includes('toggleDeveloper')) throw Error('missing');`;
 assert.deepEqual(auditDeploymentWorkflow(workflow),[]);
});
