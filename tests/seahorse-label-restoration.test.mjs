import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
test('restored anatomy labels stay on local offline images and preserve approved prose',()=>{
 const h=fs.readFileSync('src/apps/big-bellied-seahorse/index.html','utf8'),e=JSON.parse(fs.readFileSync('docs/verification/seahorse-label-restoration-20261031.json'));
 assert.equal(createHash('sha256').update(h).digest('hex'),e.html_after_sha256);
 const svgs=[...h.matchAll(/<svg\b.*?<\/svg>/g)].map(m=>m[0]);assert.equal(svgs.length,3);
 const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const s of svgs){assert(s.includes('<image href="../'));assert(s.includes('<polyline'));assert(!s.includes('<script'));assert(!s.includes('https:'));}
 const c=h.slice(h.indexOf('<div class="anatomy-comparison"'));for(const labels of Object.values(e.labels))for(const label of labels)assert(c.includes('>'+label+'</text>'));
 const paragraphs=s=>[...s.matchAll(/<p>.*?<\/p>/g)].map(m=>m[0]).filter(p=>!p.includes('Follow the lines'));
 assert.deepEqual(paragraphs(h),paragraphs(e.html_before));
 for(const env of ['developer','tester'])assert.equal(fs.readFileSync(`dist/${env}/apps/big-bellied-seahorse/index.html`,'utf8'),h);
});
