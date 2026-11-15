import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('canonical builder packages orange identity only for developer',()=>{
 const developer='dist/developer/',tester='dist/tester/';
 const manifest=JSON.parse(fs.readFileSync(developer+'manifest.webmanifest','utf8'));
 assert.equal(manifest.name,'MBA Hub DEV');
 assert.equal(manifest.theme_color,'#a64b0b');
 assert.equal(JSON.parse(fs.readFileSync(developer+'environment.json','utf8')).namespace,'mba-v2-developer');
 const css=fs.readFileSync(developer+'core/hub.css','utf8');
 const icon=fs.readFileSync(developer+'icon.svg','utf8');
 const install=fs.readFileSync(developer+'install.html','utf8');
 assert.ok(css.includes('AGE-governed orange developer identity'));
 assert.ok(icon.includes('#a64b0b'));
 assert.ok(install.includes('MBA-hub-v2-dev%2F'),'Developer install QR must point to orange');
 assert.ok(!install.includes('MBA-hub-v2-test%2F'),'Developer install QR must not point to tester');
 assert.ok(!install.includes('V2 is still a tester.'));
 assert.ok(!fs.readFileSync(tester+'icon.svg','utf8').includes('#a64b0b'));
 assert.ok(!fs.readFileSync(tester+'core/hub.css','utf8').includes('AGE-governed orange developer identity'));
 assert.notEqual(JSON.parse(fs.readFileSync(tester+'manifest.webmanifest','utf8')).name,'MBA Hub DEV');
 const registry=JSON.parse(fs.readFileSync(developer+'registry.json','utf8'));
 assert.equal(registry.apps.filter(a=>a.app_id==='el-nino').length,1);
});
