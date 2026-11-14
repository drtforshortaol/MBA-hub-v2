import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('blue Guide preserves approved channel identity and offline URL',()=>{
 const prefix='dist/tester/';
 const manifest=JSON.parse(fs.readFileSync(prefix+'manifest.webmanifest','utf8'));
 const environment=JSON.parse(fs.readFileSync(prefix+'environment.json','utf8'));
 const install=fs.readFileSync(prefix+'install.html','utf8');
 assert.equal(manifest.name,'MBA Hub V2');
 assert.equal(manifest.theme_color,'#123e50');
 assert.equal(environment.environment,'tester');
 assert.equal(environment.namespace,'mba-v2-tester');
 assert.equal(environment.developer,false);
 assert.ok(install.includes('MBA-hub-v2%2F'),'Blue Guide QR must point to blue');
 assert.ok(!install.includes('MBA-hub-v2-test%2F'),'Old tester QR URL remains');
 assert.ok(!install.includes('MBA-hub-v2-dev%2F'),'Orange QR URL leaked into blue');
 assert.ok(fs.readFileSync(prefix+'icon.svg','utf8').includes('#123e50'));
 assert.ok(!fs.existsSync(prefix+'core/developer.js'));
 const apps=JSON.parse(fs.readFileSync(prefix+'registry.json','utf8')).apps;
 for(const [id,category] of [['el-nino','concepts'],['nearby-dining','volunteer-tools']]){
  const matches=apps.filter(a=>a.app_id===id);
  assert.equal(matches.length,1,id+' registered exactly once');
  assert.equal(matches[0].category,category);
 }
});
