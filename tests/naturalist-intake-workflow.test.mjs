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
