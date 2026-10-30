import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {assessRepositoryReadiness} from '../scripts/assess-release-readiness.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));const sha=b=>createHash('sha256').update(b).digest('hex');
test('approved owner photograph and public-domain trout replace only the blocked comparison',()=>{
 const e=read('docs/verification/seahorse-trout-photo-replacement-20261030.json'),c=read('src/shared/media/catalog.json'),m=read('src/apps/big-bellied-seahorse/manifest.json');
 assert.equal(e.authorization.approval,'Proceed');assert.equal(e.images_edited,false);assert.equal(e.release_authorized,false);
 for(const r of e.assets){const a=c.assets.find(a=>a.asset_id===r.asset_id);assert(a);assert.equal(a.permission,r.permission);assert.equal(sha(fs.readFileSync('src/'+r.path)),r.sha256);assert.equal(a.sha256,r.sha256);assert(m.media.includes(a.asset_id));assert(m.offline_assets.includes(a.path));}
 assert(!c.assets.some(a=>a.asset_id===e.superseded_asset.asset_id));
 const h=read('docs/verification/seahorse-approved-integration-20261030.json').html_before;assert.equal(sha(h),e.html_delta.current_html_sha256);assert.equal(sha(h.replace(e.html_delta.after,e.html_delta.before)),e.html_delta.baseline_html_sha256);
 for(const s of ['Photo: Glenn A. Takenaga','Public domain','Duane Raver','not to the same scale','Smaller structures obscured'])assert(h.includes(s));
 const r=assessRepositoryReadiness();assert.equal(r.blockers.filter(b=>b.category==='media-review-required').length,0);assert.equal(r.blockers.filter(b=>b.category==='operational-gate').length,5);assert.equal(r.blockers.length,5);assert.equal(r.releaseEligible,false);
});
