import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {ownerTextApprovalSupported} from '../scripts/public-review.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));const sha=b=>createHash('sha256').update(b).digest('hex');
test('exact approved facts replace only the retired poster and remain searchable with prior approval intact',()=>{
 const e=read('docs/verification/seahorse-ten-facts-approval-20261030.json'),r=read('docs/verification/seahorse-ten-facts-candidate-20261030.json'),m=read('src/apps/big-bellied-seahorse/manifest.json'),c=read('src/shared/media/catalog.json'),h=read('docs/verification/seahorse-anatomy-key-approval-20261030.json').html_before;
 assert.equal(e.approval,'Approved');assert.equal(e.candidate_sha256,sha(fs.readFileSync('docs/verification/seahorse-ten-facts-candidate-20261030.json')));assert.deepEqual(e.facts,r.facts);assert.equal(e.facts.length,10);assert(ownerTextApprovalSupported(m));
 assert.equal(sha(h),e.html_after_sha256);assert.equal(h.replace(e.html_delta.after,e.html_delta.before),e.html_before);
 const text=h.replaceAll('&amp;','&'),s=m.sections.find(s=>s.id==='Seahorse-close-up');for(const f of e.facts){assert(text.includes(f.text));assert(s.text.includes(f.text));}assert(s.aliases.includes('seahorse facts'));
 assert(!c.assets.some(a=>a.asset_id===e.retired_asset.asset_id));assert(!m.offline_assets.includes(e.retired_asset.path));assert(!fs.existsSync('src/'+e.retired_asset.path));assert(!h.includes('IMG_4213.jpeg'));assert.equal(e.release_authorized,false);
});
