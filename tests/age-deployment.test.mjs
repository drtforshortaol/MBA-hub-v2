import test from 'node:test';
import assert from 'node:assert/strict';
import {auditDeploymentWorkflow} from '../scripts/age/guard-deployment.mjs';

test('AGE-004 rejects deployment-time Hub JavaScript registration injection',()=>{
 const bad="hub=root/'core/hub.js'\ncode=hub.read_text()\ncode=code.replace(before,after)\nhub.write_text(code)";
 const violations=auditDeploymentWorkflow(bad,'orange');
 assert.ok(violations.length>=2);
});
test('AGE-004 accepts a declarative artifact publishing workflow',()=>{
 const good="name: Publish\nsteps:\n - run: npm run build\n - uses: actions/upload-pages-artifact@v3";
 assert.deepEqual(auditDeploymentWorkflow(good),[]);
});
