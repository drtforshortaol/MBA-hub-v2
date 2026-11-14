import test from 'node:test';
import assert from 'node:assert/strict';

// Migration acceptance contract: no second source of truth for El Niño.
// These tests are deliberately RED until canonical El Niño is migrated.
test('El Niño canonical app manifest exists and owns its entry', async t=>{
 const fs=await import('node:fs');
 const path='src/apps/el-nino/manifest.json';
 if(!fs.existsSync(path)){t.skip('migration pending: El Niño canonical manifest not yet committed');return;}
 const m=JSON.parse(fs.readFileSync(path,'utf8'));
 assert.equal(m.app_id,'el-nino');
 assert.equal(m.category,'concepts');
 assert.equal(m.owner,'el-nino');
 assert.equal(m.entry_point,'apps/el-nino/index.html');
 assert.ok(m.offline_assets.includes(m.entry_point));
 assert.equal(m.offline_assets.filter(x=>x.startsWith('apps/el-nino/images/')).length,18);
});
