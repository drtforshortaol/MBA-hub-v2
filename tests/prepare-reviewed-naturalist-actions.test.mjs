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

test('unrelated approved Naturalist actions retain replacement and routing review',()=>{
 const isolated=[{index:0,text:'Unrelated animal information',duplicate_of:null,conflict_with:[],placement:{proposal_type:'existing-section'}}];
 const decisions=newReviewDecisions(isolated);
 decisions[0].scientific_status='verified';
 decisions[0].editorial_status='approved';
 decisions[0].proposed_action='update-existing';
 const missing=prepareReviewedNaturalistActions({valid:true,entries:isolated},decisions,[]);
 assert.equal(missing.items[0].status,'replacement-required');
 const routed=prepareReviewedNaturalistActions({valid:true,entries:isolated},decisions,[],{0:'Replacement'});
 assert.equal(routed.items[0].status,'routing-review');
 decisions[0].proposed_action='new-content';
 assert.equal(prepareReviewedNaturalistActions({valid:true,entries:isolated},decisions,[]).items[0].status,'placement-review');
});
