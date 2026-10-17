import test from 'node:test';
import assert from 'node:assert/strict';
import {assessExistingContent} from '../scripts/assess-existing-content.mjs';
import {classifyUpdateBatch} from '../scripts/classify-update-batch.mjs';
const app={app_id:'sea-otter',title:'Sea Otter',sections:[{id:'tools',title:'Tool use',text:'Sea otters use rocks to open shellfish.'}]};
test('exact duplicate is flagged without any publication',()=>{
 const r=assessExistingContent('Sea otters use rocks to open shellfish.',app,{sectionId:'tools'});
 assert.equal(r.status,'exact-duplicate');assert.equal(r.published,false);
});
test('overlap is not mislabeled as a scientifically verified contradiction',()=>{
 const r=assessExistingContent('Sea otters use rocks to open clams.',app);
 assert.equal(r.contradiction_check,'not-performed');assert.equal(r.scientific_verification,'required');
});
test('intake carries overlap assessment for matching applications',()=>{
 const r=classifyUpdateBatch('Sea otter tool use rocks to open shellfish.',[app]);
 assert.equal(r.entries[0].route.app_id,'sea-otter');assert.equal(r.entries[0].existing_content.valid,true);
});

test('punctuation-only changes are still duplicates',()=>{
 const r=assessExistingContent('Sea otters use rocks to open shellfish!',app);
 assert.equal(r.status,'exact-duplicate');
 assert.equal(r.scientific_verification,'required');
 assert.equal(r.published,false);
});

test('negation difference is a review signal, never a verified contradiction',()=>{
 const result=assessExistingContent('Sea otters do not use rocks to open shellfish.',app);
 assert.equal(result.potential_conflict_signal,'negation-difference-review');
 assert.equal(result.contradiction_check,'not-performed');
 assert.equal(result.published,false);
});
test('exact match outside selected section reports actual section',()=>{
 const sample={...app,sections:[{id:'other',title:'Other',text:'Unrelated.'},...app.sections]};
 const result=assessExistingContent('Sea otters use rocks to open shellfish.',sample,{sectionId:'other'});
 assert.equal(result.status,'exact-duplicate');
 assert.equal(result.match.section_id,'tools');
});
