import test from 'node:test';
import assert from 'node:assert/strict';
import {newReviewDecisions} from '../src/core/naturalist-review-state.js';
import {prepareReviewedNaturalistActions} from '../scripts/prepare-reviewed-naturalist-actions.mjs';
const entries=[{index:0,text:'Seahorse exhibit information',duplicate_of:null,conflict_with:[],placement:{proposal_type:'existing-section'}},{index:1,text:'Seahorse new story',duplicate_of:0,conflict_with:[],placement:{proposal_type:'new-section'}}];
function approved(){const decisions=newReviewDecisions(entries);for(const d of decisions){d.scientific_status='verified';d.editorial_status='approved';d.proposed_action='update-existing';}return decisions;}
test('reviewed Naturalist intake cannot bypass duplicate or scientific conflict gates',()=>{
 const classified={valid:true,entries};
 const result=prepareReviewedNaturalistActions(classified,approved(),[]);
 assert.equal(result.valid,true);
 assert.equal(result.prepared,false);
 assert.equal(result.published,false);
 assert.equal(result.can_auto_publish,false);
 assert.equal(result.items[0].status,'blocked-review');
 assert.equal(result.items[1].status,'blocked-review');
 const conflicted=structuredClone(entries);conflicted[0].conflict_with=[1];
 assert.equal(prepareReviewedNaturalistActions({valid:true,entries:conflicted},approved(),[],{0:'Replacement'}).items[0].status,'blocked-review');
});
test('new-content action remains a placement proposal and never publishes',()=>{
 const decisions=approved();decisions[0].proposed_action='new-content';decisions[1].proposed_action='no-change';
 const result=prepareReviewedNaturalistActions({valid:true,entries},decisions,[]);
 assert.equal(result.items.length,1);
 assert.equal(result.items[0].status,'blocked-review');
 assert.equal(result.prepared,false);
});
test('invalid review decisions and intake fail closed',()=>{
 assert.equal(prepareReviewedNaturalistActions({valid:true,entries},[],[]).valid,false);
 assert.equal(prepareReviewedNaturalistActions(null,[],[]).valid,false);
});

test('draft requires a matching classified section route',()=>{
 const d=approved();d[1].proposed_action='no-change';
 const r=prepareReviewedNaturalistActions({valid:true,entries},d,[],{0:'Replacement'});
 assert.equal(r.items[0].status,'blocked-review');
 assert.equal(r.prepared,false);
});

test('unrouted approved Naturalist actions remain in routing review',()=>{
 const isolated=[{index:0,text:'Unrelated animal information',duplicate_of:null,conflict_with:[],placement:{proposal_type:'existing-section'}}];
 const decisions=newReviewDecisions(isolated);
 decisions[0].scientific_status='verified';
 decisions[0].editorial_status='approved';
 decisions[0].proposed_action='update-existing';
 const missing=prepareReviewedNaturalistActions({valid:true,entries:isolated},decisions,[]);
 assert.equal(missing.items[0].status,'routing-review');
 const routed=prepareReviewedNaturalistActions({valid:true,entries:isolated},decisions,[],{0:'Replacement'});
 assert.equal(routed.items[0].status,'routing-review');
 decisions[0].proposed_action='new-content';
 assert.equal(prepareReviewedNaturalistActions({valid:true,entries:isolated},decisions,[]).items[0].status,'placement-review');
});


test('approved update action cannot override a new-content classifier route',()=>{
 const records=[{index:0,text:'Sea otter feeding',duplicate_of:null,conflict_with:[],route:{action:'review-placement'},placement:{proposal_type:'new-section'}}];
 const decisions=newReviewDecisions(records);
 Object.assign(decisions[0],{scientific_status:'verified',editorial_status:'approved',proposed_action:'update-existing'});
 const result=prepareReviewedNaturalistActions({valid:true,entries:records},decisions,[],{0:'Replacement'});
 assert.equal(result.items[0].status,'routing-review');
 assert.equal(result.prepared,false);
 assert.equal(result.published,false);
});

test('draft preparation rejects invalid replacement collections',()=>{
 const records=[{index:0,text:'Sea otter feeding',duplicate_of:null,conflict_with:[]}];
 const decisions=newReviewDecisions(records);
 for(const replacements of [null,[],42,'replacement']){
  const result=prepareReviewedNaturalistActions({valid:true,entries:records},decisions,[],replacements);
  assert.equal(result.valid,false);
  assert.equal(result.published,false);
 }
});


test('approved update cannot draft from an unbound synthetic classification',()=>{
 const app={app_id:'sea-otter',version:'1.0',sections:[{id:'feeding',title:'Feeding',text:'Existing feeding content'}]};
 const entry={index:0,text:'Sea otter feeding behavior.',duplicate_of:null,conflict_with:[],route:{action:'update-existing',app_id:'sea-otter',section_id:'feeding'}};
 const decisions=newReviewDecisions([entry]);
 Object.assign(decisions[0],{scientific_status:'verified',editorial_status:'approved',proposed_action:'update-existing'});
 for(const extra of [{},{reviewed_app_version:'1.0'},{reviewed_section_snapshot:JSON.stringify(app.sections[0])}]){
  const result=prepareReviewedNaturalistActions({valid:true,entries:[{...entry,...extra}]},decisions,[app],{0:'Replacement'});
  assert.equal(result.items[0].status,'routing-review');
  assert.equal(result.prepared,false);
  assert.equal(result.published,false);
 }
});


test('reviewed existing-content action refuses catalog identifier collisions',()=>{
 const app={app_id:'sea-otter',version:'1.0',sections:[{id:'feeding',title:'Feeding',text:'Existing feeding content'}]};
 const entry={index:0,text:'Sea otter feeding behavior.',duplicate_of:null,conflict_with:[],route:{action:'update-existing',app_id:'sea-otter',section_id:'feeding'},reviewed_app_version:'1.0',reviewed_section_snapshot:JSON.stringify(app.sections[0])};
 const decisions=newReviewDecisions([entry]);
 Object.assign(decisions[0],{scientific_status:'verified',editorial_status:'approved',proposed_action:'update-existing'});
 const duplicateApps=[app,structuredClone(app)];
 const duplicateSections=[{...app,sections:[app.sections[0],{...app.sections[0],text:'Different content'}]}];
 for(const catalog of [duplicateApps,duplicateSections]){
  const result=prepareReviewedNaturalistActions({valid:true,entries:[entry]},decisions,catalog,{0:'Replacement'});
  assert.equal(result.items[0].status,'routing-review');
  assert.equal(result.prepared,false);
  assert.equal(result.published,false);
 }
});
