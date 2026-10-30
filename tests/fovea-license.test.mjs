import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {assessRepositoryReadiness} from '../scripts/assess-release-readiness.mjs';import {ownerTextApprovalSupported} from '../scripts/public-review.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));const sha=b=>createHash('sha256').update(b).digest('hex');
test('fovea license binds retained crop and required visible attribution without changing scientific paragraphs',()=>{
 const r=read('docs/verification/fovea-figure-license-20261029.json'),catalog=read('src/shared/media/catalog.json'),a=catalog.assets.find(a=>a.asset_id===r.asset_id);
 assert.equal(r.asset_id,'asset-e62b39cc07a542c4');assert.equal(r.source_article.doi,'10.1038/s41598-020-63039-y');assert.equal(r.source_article.figure,'1a');
 assert.equal(r.license.article_href,'http://creativecommons.org/licenses/by/4.0/');assert.equal(r.license.figures_explicitly_included_unless_otherwise_credited,true);assert.equal(r.license.figure_specific_restrictive_notice_found,false);
 assert.equal(a.permission,'licensed');assert.equal(a.sha256,r.sha256);assert.equal(sha(fs.readFileSync('src/'+r.path)),r.sha256);assert.equal(r.comparison.publisher_byte_identity_claimed,false);
 const current=fs.readFileSync('src/apps/big-bellied-seahorse/index.html','utf8');assert(current.includes(r.html_delta.after));assert.equal(current.split(r.html_delta.after).length,2);
 assert.equal(sha(read('docs/verification/seahorse-poster-replacement-20261030.json').html_before.replace(r.html_delta.after,r.html_delta.before)),r.html_delta.baseline_html_sha256);
 for(const text of ['cropped','Potier','2020','CC BY 4.0','https://doi.org/10.1038/s41598-020-63039-y','https://creativecommons.org/licenses/by/4.0/'])assert(r.html_delta.after.includes(text),text);
 assert.equal(read('src/apps/big-bellied-seahorse/manifest.json').publication_review,'owner-approved-text');
 assert(ownerTextApprovalSupported(read('src/apps/naturalist-field-notes/manifest.json')));
});
test('only the fovea permission clears; Seaweek source recovery does not grant its image permission',()=>{
 const catalog=read('src/shared/media/catalog.json'),sea=read('docs/verification/seaweek-anatomy-source-20261029.json');
 assert.equal(sea.status,'review-required');assert.equal(sea.permission_granted,false);assert.equal(sea.contacted,false);
 assert(!catalog.assets.some(a=>a.asset_id==='asset-486b6cdb96375dfb'));assert.equal(read('docs/verification/seahorse-anatomy-key-approval-20261030.json').retired_asset.permission,'review-required');
 const report=assessRepositoryReadiness();assert(!report.blockers.some(b=>b.reason==='media permission review: asset-e62b39cc07a542c4'));
 assert.equal(report.blockers.filter(b=>b.category==='media-review-required').length,0);assert.equal(report.blockers.filter(b=>b.category==='operational-gate').length,5);assert.equal(report.blockers.length,5);assert.equal(report.releaseEligible,false);
});
