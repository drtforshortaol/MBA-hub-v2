import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('public guide content matches the owner-authorized complete source',()=>{
 for(const id of ['information-center','mba-leadership','naturalist-field-notes','aquarium-library-explorer']){
  for(const name of fs.readdirSync(`src/apps/${id}`)){
   const path=`apps/${id}/${name}`;if(!fs.statSync(`src/${path}`).isFile())continue;
   assert.deepEqual(fs.readFileSync(`dist/tester/${path}`),fs.readFileSync(`src/${path}`),path);
  }
 }
 const registry=JSON.parse(fs.readFileSync('dist/tester/registry.json'));
 for(const id of ['information-center','mba-leadership','naturalist-field-notes','aquarium-library-explorer']){
  const original=JSON.parse(fs.readFileSync(`src/apps/${id}/manifest.json`));
  assert.deepEqual(registry.apps.find(a=>a.app_id===id).sections,original.sections);
 }
});
test('full public guide content keeps tester developer restrictions',()=>{
 const report=JSON.parse(fs.readFileSync('dist/tester/public-review.json'));
 assert.equal(report.publication,'owner-authorized-guide-collection');
 assert.deepEqual(report.withheldApps,[]);assert.equal(report.libraryPersonalFieldsRemoved,0);
 assert(!fs.existsSync('dist/tester/core/developer.js'));
});
