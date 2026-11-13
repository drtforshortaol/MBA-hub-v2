import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {reviewNaturalistOwnerSource} from '../scripts/migration/review-naturalist-owner-source.mjs';
const source=fs.readFileSync(new URL('../src/apps/naturalist-field-notes/october-2026-note.js',import.meta.url),'utf8');
function changed(edit){const context=vm.createContext({FIELD_NOTES:[]});vm.runInContext(source,context);const note=JSON.parse(JSON.stringify(context.FIELD_NOTES[0]));edit(note);return 'FIELD_NOTES.push('+JSON.stringify(note)+');';}

test('owner source preserves all 38 source rows as 39 species and the supplied historical photo without granting rights',()=>{
 const result=reviewNaturalistOwnerSource();
 assert.equal(result.complete_bay_watch,true);assert.equal(result.historical_context_restored,true);
 assert.equal(result.source_photo_items,5);assert.equal(result.current_photo_items,5);
 assert.deepEqual(result.unresolved_photo_files,[]);
 assert.equal(result.attachment_identity_verified,false);assert.equal(result.approval_granted,false);
 assert.equal(result.source_email_date_verified,false);
});

test('missing species, previous-week additions or changed pod identifiers fail source reconciliation',()=>{
 for(const edit of [n=>n.bay.splice(n.bay.indexOf('Ancient murrelets'),1),n=>n.bay.push('Manx shearwater'),n=>n.bay[1]=n.bay[1].replace('CA39As','CA216C')]){
  assert.throws(()=>reviewNaturalistOwnerSource({scriptOverride:changed(edit)}),/complete source-derived species and pod inventory/);
 }
});

test('unconfirmed email date and historical-context omissions cannot pass the source audit',()=>{
 assert.throws(()=>reviewNaturalistOwnerSource({scriptOverride:changed(n=>n.date='October 15, 2026')}),/invented email timestamp/);
 assert.throws(()=>reviewNaturalistOwnerSource({scriptOverride:changed(n=>n.observations=n.observations.filter(o=>!o.title.startsWith('Historical gray-whale')))}),/historical source observation/);
});

test('a different gray-whale photo cannot stand in for the owner-supplied upload',()=>{
 const script=changed(n=>n.observations.find(o=>o.title.startsWith('Historical gray-whale')).photos=[{src:'../another-gray-whale.jpeg',caption:'Replacement'}]);
 assert.throws(()=>reviewNaturalistOwnerSource({scriptOverride:script}),/exact owner-supplied historical photo placement/);
});

const html=fs.readFileSync(new URL('../src/apps/naturalist-field-notes/october-2026-08-14.html',import.meta.url),'utf8');
test('offline summary retains historical timing and uses the supplied image without substitutes',()=>{
 const result=reviewNaturalistOwnerSource();
 assert.equal(result.standalone_historical_context_matches,true);
 assert.equal(result.standalone_uploaded_photo_matches,true);
 assert.throws(()=>reviewNaturalistOwnerSource({htmlOverride:html.replace('in March, two years earlier','this week')}),/same historical context/);
 assert.throws(()=>reviewNaturalistOwnerSource({htmlOverride:html.replace('not an October 8–14 sighting.</p>','not an October 8–14 sighting.</p><img src="replacement.jpg">')}),/uses only the supplied historical photo/);
 assert.throws(()=>reviewNaturalistOwnerSource({htmlOverride:html.replace('Naturalist Update • October 8–14, 2026','Naturalist Update • October 15, 2026')}),/observation period/);
});

test('same-sized altered upload bytes fail the source audit',()=>{
 const bytes=fs.readFileSync(new URL('../src/shared/media/asset-df392914e6cf5502--big-sur-gray-whale.jpeg',import.meta.url));
 bytes[bytes.length-10]^=1;
 assert.throws(()=>reviewNaturalistOwnerSource({photoBytesOverride:bytes}),/exact uploaded photo bytes/);
});
