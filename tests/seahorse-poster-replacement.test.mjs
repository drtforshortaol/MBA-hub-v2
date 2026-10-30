import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p));
test('replacement binds exact supplied image and both displays while preserving scientific paragraphs',()=>{
 const e=read('docs/verification/seahorse-poster-replacement-20261030.json'),m=read('src/apps/big-bellied-seahorse/manifest.json'),c=read('src/shared/media/catalog.json');
 const a=c.assets.find(a=>a.asset_id===e.asset_id);assert.equal(a.permission,'approved');assert.equal(a.sha256,e.sha256);assert.equal(createHash('sha256').update(fs.readFileSync('src/'+a.path)).digest('hex'),e.sha256);
 assert(!c.assets.some(a=>a.asset_id===e.superseded_asset.asset_id));assert(m.media.includes(e.asset_id));assert(m.offline_assets.includes(e.path));
 const delta=read('docs/verification/seahorse-trout-photo-replacement-20261030.json').html_delta;const html=fs.readFileSync('src/apps/big-bellied-seahorse/index.html','utf8').replace(delta.after,delta.before);assert.equal(html.split(e.caption).length,3);assert(!html.includes('Dad Bods of the Sea'));
 assert.equal(createHash('sha256').update(html).digest('hex'),e.html_after_sha256);
 assert.deepEqual([...html.matchAll(/<p>.*?<\/p>/g)].map(x=>x[0]),[...e.html_before.matchAll(/<p>.*?<\/p>/g)].map(x=>x[0]));
 for(const phrase of ['AI-generated','not a species-specific','conceptual','vary by species'])assert(e.caption.includes(phrase));
});
