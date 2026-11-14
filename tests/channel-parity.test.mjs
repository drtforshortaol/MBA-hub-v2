import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('blue/tester channel derives from the same canonical app definitions as orange',()=>{
 const developer=JSON.parse(fs.readFileSync('dist/developer/registry.json','utf8'));
 const tester=JSON.parse(fs.readFileSync('dist/tester/registry.json','utf8'));
 const definitions=new Map(developer.apps.map(a=>[a.app_id,a]));
 assert.equal(definitions.size,developer.apps.length,'developer has unique app IDs');
 const unique=new Set();
 for(const app of tester.apps){
  assert.ok(!unique.has(app.app_id),'tester has unique app IDs: '+app.app_id);
  unique.add(app.app_id);
  const source=definitions.get(app.app_id);
  assert.ok(source,'tester must not invent a rogue app: '+app.app_id);
  for(const field of ['app_id','title','category','type','version','entry_point','owner']){
   assert.deepEqual(app[field],source[field],`Channel divergence: ${app.app_id}.${field}`);
  }
 }
 for(const id of ['el-nino','nearby-dining'])assert.ok(unique.has(id),id+' must be visible in both channel registries');
 assert.ok(!unique.has('rcl-component-lab'),'dummy development lab must remain isolated');
});
