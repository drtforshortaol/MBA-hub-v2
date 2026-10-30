import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {ownerTextApprovalSupported} from '../scripts/public-review.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
test('integrated Seahorse reproduces exact approved sections and preserves all media markup',()=>{
 const e=read('docs/verification/seahorse-approved-integration-20261030.json'),m=read('src/apps/big-bellied-seahorse/manifest.json'),h=read('docs/verification/seahorse-ten-facts-approval-20261030.json').html_before;
 assert.deepEqual(m.sections.slice(0,10),e.approved_sections);assert(ownerTextApprovalSupported(m));assert.equal(createHash('sha256').update(h).digest('hex'),e.html_after_sha256);
 assert.deepEqual([...h.matchAll(/<figure>.*?<\/figure>/g)].map(x=>x[0]),[...e.html_before.matchAll(/<figure>.*?<\/figure>/g)].map(x=>x[0]));
 for(const section of m.sections.slice(0,10)){const start=h.indexOf('<details id="'+section.id+'">');assert(start>=0);const p=h.slice(start).match(/<p>(.*?)<\/p>/)[1].replace(/<[^>]*>/g,'').replaceAll('&amp;','&');assert.equal(p,section.text);}
 assert(h.includes(e.notice));assert.equal(e.release_authorized,false);
 const altered=structuredClone(m);altered.sections[0].text+=' unapproved';assert.equal(ownerTextApprovalSupported(altered),false);
});
