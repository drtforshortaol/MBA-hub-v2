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
 const id='naturalist-briefing-20261111';
 assert.deepEqual(report.withheldApps,[id]);
 assert.equal(report.libraryPersonalFieldsRemoved,0);
 const manifest=JSON.parse(fs.readFileSync(`src/apps/${id}/manifest.json`));
 const catalog=JSON.parse(fs.readFileSync('src/shared/media/catalog.json'));
 const registry=JSON.parse(fs.readFileSync('dist/tester/registry.json'));
 assert(!registry.apps.some(app=>app.app_id===id));
 assert(!fs.existsSync(`dist/tester/apps/${id}`));
 for(const mediaId of manifest.media){
  const asset=catalog.assets.find(item=>item.asset_id===mediaId);
  assert(fs.existsSync(`dist/developer/${asset.path}`));
  assert(!fs.existsSync(`dist/tester/${asset.path}`));
 }
 assert(!fs.existsSync('dist/tester/core/developer.js'));
});
