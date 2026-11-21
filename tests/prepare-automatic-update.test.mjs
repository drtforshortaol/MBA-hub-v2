import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareAutomaticUpdate} from '../scripts/prepare-automatic-update.mjs';
const apps=[{app_id:'giant-pacific-octopus',version:'1',title:'Giant Pacific Octopus',sections:[{id:'camouflage',title:'Camouflage',text:'Old',aliases:['color']}],offline_assets:[]}];
test('routes and prepares validated text-only proposal without mutating original',()=>{
 const before=structuredClone(apps);
 const r=prepareAutomaticUpdate('Update giant Pacific octopus camouflage',apps,{replacementText:'Verified new content'});
 assert.equal(r.action,'update-existing');assert.equal(r.prepared,true);
 assert.equal(r.proposal.proposed_manifest.sections[0].text,'Verified new content');
 assert.equal(r.published,false);assert.deepEqual(apps,before);
});
test('requires supplied verified text rather than inventing content',()=>{
 const r=prepareAutomaticUpdate('Update giant Pacific octopus camouflage',apps);
 assert.equal(r.action,'review-content');assert.equal(r.prepared,false);
});
test('ambiguous destination does not produce a proposal',()=>{
 const r=prepareAutomaticUpdate('Add ocean current information',apps,{replacementText:'New'});
 assert.equal(r.action,'review-placement');assert.equal(r.proposal_type,'new-application-candidate');assert.equal(r.prepared,false);
});

test('matching app without matching section creates a review-only new-section candidate',()=>{
 const r=prepareAutomaticUpdate('Add giant Pacific octopus feeding behavior',apps,{replacementText:'Proposed text'});
 assert.equal(r.action,'propose-new-section');assert.equal(r.proposal_type,'new-section');assert.equal(r.target_app_id,'giant-pacific-octopus');assert.equal(r.prepared,false);assert.equal(r.published,false);
});
