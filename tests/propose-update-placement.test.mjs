import test from 'node:test';
import assert from 'node:assert/strict';
import {proposeUpdatePlacement} from '../scripts/propose-update-placement.mjs';
import {classifyUpdateBatch} from '../scripts/classify-update-batch.mjs';
const apps=[
 {app_id:'sea-otter',title:'Sea Otter',sections:[{id:'tools',title:'Tool use',text:'Sea otters use rocks to open shellfish.'}]},
 {app_id:'giant-pacific-octopus',title:'Giant Pacific Octopus',sections:[{id:'camouflage',title:'Camouflage',text:'Octopuses can change skin texture.'}]}
];
test('known section yields review-only proposal',()=>{
 const p=proposeUpdatePlacement('Sea otter tool use.',{valid:true,action:'update-existing',app_id:'sea-otter',section_id:'tools'},null);
 assert.equal(p.proposal_type,'existing-section');
 assert.equal(p.target_section_id,'tools');
 assert.equal(p.published,false);
});
test('unmatched section proposes rather than creates a section',()=>{
 const p=proposeUpdatePlacement('Sea otter habitat.',{valid:true,action:'update-existing',app_id:'sea-otter',section_id:null},null);
 assert.equal(p.proposal_type,'new-section-candidate');
 assert.equal(p.prepared,false);
});
test('announcement is routed for review without silently creating an app',()=>{
 const p=proposeUpdatePlacement('A new aquarium exhibit opens next month.',{valid:true,action:'review-placement'},null);
 assert.equal(p.proposal_type,'aquarium-update-candidate');
 assert.equal(p.published,false);
});
test('scientific subject is not treated as announcement merely because it mentions next month',()=>{
 const p=proposeUpdatePlacement('Sea otters migrate next month.',{valid:true,action:'update-existing',app_id:'sea-otter',section_id:'tools'},null);
 assert.equal(p.proposal_type,'existing-section');
});
test('multi-topic batch retains review proposals and source blocks',()=>{
 const result=classifyUpdateBatch('Sea otter tool use. A new aquarium exhibit opens next month.',apps);
 assert.equal(result.entries.length,2);
 assert.equal(result.entries[1].placement.proposal_type,'aquarium-update-candidate');
 assert.equal(result.entries[0].source_block,result.entries[1].source_block);
 assert.equal(result.published,false);
});
test('exact duplicates are not auto-published',()=>{
 const p=proposeUpdatePlacement('Sea otters use rocks.',{valid:true,action:'update-existing',app_id:'sea-otter',section_id:'tools'},{status:'exact-duplicate'});
 assert.equal(p.action,'review-duplicate');
 assert.equal(p.scientific_verification,'required');
});
