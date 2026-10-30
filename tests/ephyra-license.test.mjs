import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import vm from 'node:vm';
import {assessRepositoryReadiness} from '../scripts/assess-release-readiness.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
test('publisher license evidence binds the existing cropped ephyra figure and its visible attribution',()=>{
 const r=read('docs/verification/ephyra-figure-license-20261029.json'),catalog=read('src/shared/media/catalog.json'),a=catalog.assets.find(a=>a.asset_id===r.asset_id);
 assert.equal(r.asset_id,'asset-50646c3fe1d0c359');assert.equal(a.permission,'licensed');assert.equal(a.sha256,r.sha256);
 assert.equal(createHash('sha256').update(fs.readFileSync('src/'+r.path)).digest('hex'),r.sha256);
 assert.equal(r.license.id,'CC-BY-4.0');assert.equal(r.license.article_license_href,'http://creativecommons.org/licenses/by/4.0/');
 assert.equal(r.source_article.doi,'10.3389/fmars.2021.714503');assert.equal(r.source_article.illustrator,'Lau López');assert.equal(r.source_article.figure,1);
 assert.equal(r.comparison.existing_JPEG_unchanged,true);assert.equal(r.comparison.byte_identity_with_publisher_file_claimed,false);
 assert.equal(r.license.figure_specific_restrictive_notice_found,false);
 const context=vm.createContext({FIELD_NOTES:[]});vm.runInContext(fs.readFileSync('src/apps/naturalist-field-notes/october-2026-note.js','utf8'),context);
 const p=context.FIELD_NOTES[0].observations.find(o=>o.title==='Moon jelly ephyrae').photos[0];
 assert.deepEqual(JSON.parse(JSON.stringify(context.FIELD_NOTES[0].observations.find(o=>o.title==='Moon jelly ephyrae').links)),r.observation_links_delta.after);
 assert.equal(p.caption,r.visible_caption);assert.equal(p.alt,r.visible_alt);
 for(const phrase of ['cropped','Lau López','2021','CC BY 4.0','https://creativecommons.org/licenses/by/4.0/','https://doi.org/10.3389/fmars.2021.714503'])assert(p.caption.includes(phrase),phrase);
 assert(p.caption.includes('not a moon-jelly species identification'));assert(!p.caption.includes('permission review pending'));
});
test('only the ephyra image leaves the remaining review list, without clearing Seahorse images or release gates',()=>{
 const report=assessRepositoryReadiness();
 assert(!report.blockers.some(b=>b.reason==='media permission review: asset-50646c3fe1d0c359'));
 assert(!report.blockers.some(b=>b.reason==='content review pending: naturalist-field-notes'));
 assert.equal(report.blockers.filter(b=>b.category==='media-review-required').length,2);
 assert.equal(report.blockers.filter(b=>b.category==='operational-gate').length,5);
 assert.equal(report.blockers.length,7);assert.equal(report.releaseEligible,false);
 const pending=read('src/shared/media/catalog.json').assets.filter(a=>a.permission==='review-required');assert.equal(pending.length,2);
 assert(pending.every(a=>a.uses.every(u=>u.app_id==='big-bellied-seahorse')));
});
