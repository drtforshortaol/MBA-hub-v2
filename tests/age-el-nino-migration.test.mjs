import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const root='src/apps/el-nino/';
test('El Niño is a canonical Concepts application with 18 original offline illustrations',()=>{
 const m=JSON.parse(fs.readFileSync(root+'manifest.json','utf8'));
 assert.equal(m.app_id,'el-nino');
 assert.equal(m.category,'concepts');
 assert.equal(m.owner,'el-nino');
 assert.equal(m.entry_point,'apps/el-nino/index.html');
 assert.equal(m.listed,true);
 assert.ok(m.offline_assets.includes(m.entry_point));
 const images=m.offline_assets.filter(x=>x.startsWith('apps/el-nino/images/'));
 assert.equal(images.length,18);
 const expected=['f0d9432ba4ebc2efe1101a7cffd7ce1f3c285a99','a09a2171f9d0a5e16745224cb33a3b135d9cbe54','bfb77f1c975439ab924db9276b7ff2700ad7a2de','93707c03d204a89a99f2c9847d7bc78f741367d5','1d8af4b2801eba66b2bf9a1e4ba057e1bfe6eef5','30fa4bf3915596fbe40eb9f0c06b3a6c3307ee61','4a159f67c3d22f1812126def822d9dc2b0416815','fb900894fb8d38621cd83b7727bce6eeab94bd37','d8259c120f57f04aefcc039a88ba105ca1d739ab','5919d7a63e5ac404b539df4fc3831420501069a7','9a41d6e6282825325f0f91d7cc417dc429405f3f','1255977886c241add0e4101fdc285cbf4a0c67f2','d099baf88cba806bdc7232227b428b2f72a46a6f','4b536f7989a2782c81509d8dbf88b118ef82b533','158d4f574e64923ea6ee1eed22fcbc9ab997e304','0e8d277d71cd5293073c99ef57f111867c12dec6','ecdcacd9b6f9ac015d77434259416f0ea0d0330a','becee3a78d0ed6d269bf58b2fdd719d7900504a0'];
 for(let i=0;i<18;i++){
  const asset=`apps/el-nino/images/slide-${String(i+1).padStart(2,'0')}.jpg`;
  assert.ok(images.includes(asset),asset);
  const bytes=fs.readFileSync('src/'+asset);
  const gitBlob=crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  assert.equal(gitBlob,expected[i],asset+' differs from original source');
 }
 const html=fs.readFileSync(root+'index.html','utf8');
 for(let i=1;i<=18;i++)assert.ok(html.includes(`slide-${String(i).padStart(2,'0')}.jpg`));
 assert.ok(html.includes("new URL('../../index.html',location.href).href"));
});
