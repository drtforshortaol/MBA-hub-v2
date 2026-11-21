import test from 'node:test';
import assert from 'node:assert/strict';
import {assessNaturalistReviewGates} from '../scripts/assess-naturalist-review-gates.mjs';
import {classifyUpdateBatch} from '../scripts/classify-update-batch.mjs';
const route={valid:true,action:'update-existing',app_id:'sea-otter',section_id:'tools'};
test('unresolved placement is always flagged and cannot publish',()=>{
 const r=assessNaturalistReviewGates({route:{action:'review-placement'},placement:{}});
 assert.ok(r.flags.includes('placement-unresolved'));
 assert.equal(r.can_auto_publish,false);
});
test('duplicate and scientific conflict remain separate review flags',()=>{
 const r=assessNaturalistReviewGates({route,existing_content:{status:'exact-duplicate',potential_conflict_signal:'negation-difference-review'}});
 assert.ok(r.flags.includes('duplicate-existing-content'));
 assert.ok(r.flags.includes('possible-scientific-conflict'));
 assert.equal(r.scientific_verification,'required');
});
test('batch entries contain review gates without publication',()=>{
 const r=classifyUpdateBatch('Sea otter tool use.',[{app_id:'sea-otter',title:'Sea Otter',sections:[{id:'tools',title:'Tool use'}]}]);
 assert.equal(r.entries[0].review.approval_state,'pending');
 assert.equal(r.entries[0].review.can_auto_publish,false);
 assert.equal(r.published,false);
});
test('sentence boundaries are explicitly marked for review',()=>{
 const r=assessNaturalistReviewGates({route,extraction:'sentence-boundary'});
 assert.ok(r.flags.includes('statement-boundary-review'));
});
