import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('Nearby Dining remains a canonical Volunteer Tools component',()=>{
 const m=JSON.parse(fs.readFileSync('src/apps/nearby-dining/manifest.json','utf8'));
 assert.equal(m.category,'volunteer-tools');
 assert.equal(m.owner,'nearby-dining');
 assert.equal(m.entry_point,'apps/nearby-dining/index.html');
 const index=fs.readFileSync('src/apps/nearby-dining/index.html','utf8');
 assert.ok(index.includes('https://drtforshortaol.github.io/MBA-nearby-dining/'));
 assert.ok(index.includes('../../index.html?home=1'));
 const apps=JSON.parse(fs.readFileSync('dist/developer/registry.json','utf8')).apps;
 assert.equal(apps.filter(a=>a.app_id==='nearby-dining').length,1);
});
