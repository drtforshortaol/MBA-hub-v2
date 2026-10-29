import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {reviewNaturalistOwnerSource} from '../scripts/migration/review-naturalist-owner-source.mjs';
const source=fs.readFileSync(new URL('../src/apps/naturalist-field-notes/october-2026-note.js',import.meta.url),'utf8');
function changed(edit){const context=vm.createContext({FIELD_NOTES:[]});vm.runInContext(source,context);const note=JSON.parse(JSON.stringify(context.FIELD_NOTES[0]));edit(note);return 'FIELD_NOTES.push('+JSON.stringify(note)+');';}

test('owner source preserves all 38 source rows as 39 species while retaining the missing-photo finding',()=>{
 const result=reviewNaturalistOwnerSource();
 assert.equal(result.complete_bay_watch,true);assert.equal(result.historical_context_restored,true);
 assert.equal(result.source_photo_items,5);assert.equal(result.current_photo_items,4);
 assert.deepEqual(result.unresolved_photo_files,['MZD_5048.JPG']);
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

test('a different gray-whale photo cannot stand in for the absent source attachment',()=>{
 const script=changed(n=>n.observations.find(o=>o.title.startsWith('Historical gray-whale')).photos=[{src:'../another-gray-whale.jpeg',caption:'Replacement'}]);
 assert.throws(()=>reviewNaturalistOwnerSource({scriptOverride:script}),/cannot be silently replaced/);
});
