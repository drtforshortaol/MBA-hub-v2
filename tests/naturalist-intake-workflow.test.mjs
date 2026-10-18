import test from 'node:test';
import assert from 'node:assert/strict';
import {createNaturalistIntake,updateNaturalistDecision,previewNaturalistDrafts,naturalistWorkQueue} from '../scripts/naturalist-intake-workflow.mjs';
test('end-to-end intake retains review gates through draft preview',()=>{
 const intake=createNaturalistIntake('Sea otters use tools.',[]);
 assert.equal(intake.valid,true);
 assert.equal(intake.progress.reason,'review-incomplete');
 assert.equal(naturalistWorkQueue(intake).items.length,0);
 let reviewed=updateNaturalistDecision(intake,0,{scientific_status:'verified',editorial_status:'approved',proposed_action:'new-content'});
 assert.equal(reviewed.valid,true);
 assert.equal(intake.decisions[0].scientific_status,'pending');
 assert.equal(reviewed.progress.reason,'review-complete');
 const queue=naturalistWorkQueue(reviewed);
 assert.equal(queue.items.length,1);
 const drafts=previewNaturalistDrafts(reviewed,[]);
 assert.equal(drafts.items[0].status,'placement-review');
 assert.equal(drafts.published,false);
 assert.equal(drafts.prepared,false);
});
test('workflow rejects invalid review edits and missing intake',()=>{
 const intake=createNaturalistIntake('Sea otters use tools.',[]);
 assert.equal(updateNaturalistDecision(intake,0,{published:true}).valid,false);
 assert.equal(updateNaturalistDecision(intake,100,{proposed_action:'new-content'}).valid,false);
 assert.equal(previewNaturalistDrafts(null,[]).valid,false);
 assert.equal(createNaturalistIntake('',[]).valid,false);
});


test('reviewed Naturalist draft refuses a catalog version change after classification',()=>{
 const apps=[{app_id:'sea-otter',title:'Sea Otter',version:'1.0',sections:[{id:'feeding',title:'Feeding',text:'Old feeding notes.'}]}];
 const intake=createNaturalistIntake('Sea otter feeding behavior.',apps);
 assert.equal(intake.valid,true);
 assert.equal(intake.classification.entries[0].reviewed_app_version,'1.0');
 const reviewed=updateNaturalistDecision(intake,0,{scientific_status:'verified',editorial_status:'approved',proposed_action:'update-existing'});
 const changed=structuredClone(apps);changed[0].version='2.0';
 const result=previewNaturalistDrafts(reviewed,changed,{0:'Reviewed replacement text.'});
 assert.equal(result.valid,true);
 assert.equal(result.items[0].status,'routing-review');
 assert.equal(result.prepared,false);
 assert.equal(result.published,false);
});


test('Naturalist reviewed draft blocks silent edits to section text or metadata without version bump',()=>{
 const apps=[{app_id:'sea-otter',title:'Sea Otter',version:'1.0',sections:[{id:'feeding',title:'Feeding',caption:'Original caption',text:'Original feeding notes.'}]}];
 const intake=createNaturalistIntake('Sea otter feeding behavior.',apps);
 assert.equal(intake.valid,true);
 assert.equal(typeof intake.classification.entries[0].reviewed_section_snapshot,'string');
 const reviewed=updateNaturalistDecision(intake,0,{scientific_status:'verified',editorial_status:'approved',proposed_action:'update-existing'});
 for(const field of ['text','title','caption']){
  const changed=structuredClone(apps);
  changed[0].sections[0][field]+=' changed';
  const result=previewNaturalistDrafts(reviewed,changed,{0:'Replacement'});
  assert.equal(result.items[0].status,'routing-review',field);
  assert.equal(result.prepared,false);
  assert.equal(result.published,false);
 }
});


test('Naturalist review snapshot also guards additional section metadata',()=>{
 const apps=[{app_id:'sea-otter',title:'Sea Otter',version:'1.0',sections:[{id:'feeding',title:'Feeding',text:'Original feeding notes.',media:{alt:'Feeding photo'},tags:['feeding']}]}];
 const intake=createNaturalistIntake('Sea otter feeding behavior.',apps);
 assert.equal(intake.valid,true);
 const reviewed=updateNaturalistDecision(intake,0,{scientific_status:'verified',editorial_status:'approved',proposed_action:'update-existing'});
 for(const change of [section=>section.media.alt='Changed alt',section=>section.tags.push('new')]){
  const changed=structuredClone(apps);
  change(changed[0].sections[0]);
  const preview=previewNaturalistDrafts(reviewed,changed,{0:'Replacement'});
  assert.equal(preview.items[0].status,'routing-review');
  assert.equal(preview.prepared,false);
  assert.equal(preview.published,false);
 }
});


test('Naturalist draft preparation rejects tampered classified source while preserving valid source',()=>{
 const apps=[{app_id:'giant-pacific-octopus',version:'1',title:'Giant Pacific Octopus',sections:[{id:'camouflage',title:'Camouflage',text:'Old',aliases:['color']}],offline_assets:[]}];
 const intake=createNaturalistIntake('Update giant Pacific octopus camouflage',apps);
 assert.equal(intake.classification.entries[0].route.section_id,'camouflage');
 const approved=updateNaturalistDecision(intake,0,{scientific_status:'verified',editorial_status:'approved',proposed_action:'update-existing'});
 const ready=previewNaturalistDrafts(approved,apps,{0:'Scientifically reviewed content'});
 assert.equal(ready.items[0].status,'draft-ready');
 assert.equal(ready.prepared,true);
 assert.equal(ready.published,false);
 assert.equal(ready.items[0].result.proposal.proposed_manifest.sections[0].text,'Scientifically reviewed content');
 for(const field of ['text','source_block']){
  const changed=structuredClone(approved);
  changed.classification.entries[0][field]='Tampered text';
  const result=previewNaturalistDrafts(changed,apps,{0:'Scientifically reviewed content'});
  assert.equal(result.items[0].status,'blocked-review',field);
  assert.equal(result.prepared,false);
  assert.equal(result.published,false);
 }
});
