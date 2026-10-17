import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyUpdateBatch} from '../scripts/classify-update-batch.mjs';
const apps=[{app_id:'giant-pacific-octopus',title:'Giant Pacific Octopus',sections:[{id:'camouflage',title:'Camouflage'}]},{app_id:'sea-otter',title:'Sea Otter',sections:[{id:'tools',title:'Tool use'}]}];
test('separates independent paragraphs into review-only routes',()=>{
 const r=classifyUpdateBatch('Giant Pacific octopus camouflage.\\n\\nSea otter tool use.',apps);
 assert.equal(r.entries.length,2);assert.equal(r.entries[0].route.app_id,'giant-pacific-octopus');assert.equal(r.entries[1].route.app_id,'sea-otter');assert.equal(r.published,false);
});
test('does not assume every sentence is an independent fact',()=>{
 const r=classifyUpdateBatch('Giant Pacific octopus camouflage. It changes texture.',apps);
 assert.equal(r.entries.length,1);
});
test('rejects invalid and oversized intake',()=>{
 assert.equal(classifyUpdateBatch('',apps).valid,false);
 assert.equal(classifyUpdateBatch('a'.repeat(60001),apps).valid,false);
});
