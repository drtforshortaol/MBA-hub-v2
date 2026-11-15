import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAppOwnership} from '../scripts/age/ownership.mjs';
const app={app_id:'el-nino',owner:'el-nino',entry_point:'apps/el-nino/index.html',offline_assets:['apps/el-nino/index.html','shared/rcl/card-search.js']};
test('AGE-001 permits owned app and shared contract assets',()=>assert.deepEqual(validateAppOwnership([app]),[]));
test('AGE-001 blocks app ownership escape',()=>{
 const bad={...app,owner:'platform',entry_point:'apps/another/index.html',offline_assets:['core/hub.js','apps/another/index.html']};
 assert.ok(validateAppOwnership([bad]).length>=3);
});
