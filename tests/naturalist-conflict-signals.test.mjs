import test from 'node:test';
import assert from 'node:assert/strict';
import {findBatchConflictSignals} from '../scripts/find-batch-conflict-signals.mjs';
import {classifyUpdateBatch} from '../scripts/classify-update-batch.mjs';
test('flags similar statements with differing negation for scientific review',()=>{
 const input=[{text:'Sea otters use tools to open shellfish'},{text:'Sea otters do not use tools to open shellfish'}];
 const result=findBatchConflictSignals(input);
 assert.equal(result.items.length,1);
 assert.equal(result.items[0].compared_with,0);
 assert.equal(result.can_auto_publish,false);
});
test('does not label repeated affirmative statements as conflicts',()=>{
 assert.deepEqual(findBatchConflictSignals([{text:'Sea otters use tools'},{text:'Sea otters use tools'}]).items,[]);
});
test('classification retains review-only conflict flags',()=>{
 const result=classifyUpdateBatch('Sea otters use tools to open shellfish. Sea otters do not use tools to open shellfish.',[]);
 assert.equal(result.valid,true);
 assert.equal(result.entries.length,2);
 assert.equal(result.conflict_signals.length,1);
 assert.ok(result.entries[1].review.flags.includes('possible-scientific-conflict-in-submission'));
 assert.equal(result.published,false);
});

test('contractions do not conceal potential scientific contradictions',()=>{
 const result=findBatchConflictSignals([{text:'Sea otters can open shellfish with tools'},{text:"Sea otters can't open shellfish with tools"}]);
 assert.equal(result.items.length,1);
 assert.equal(result.items[0].signal,'negation-difference-review');
});
test('both sides of potential conflicts are flagged for review',()=>{
 const result=classifyUpdateBatch('Sea otters use tools to open shellfish. Sea otters do not use tools to open shellfish.',[]);
 assert.deepEqual(result.entries[0].conflict_with,[1]);
 assert.deepEqual(result.entries[1].conflict_with,[0]);
 assert.ok(result.entries.every(e=>e.review.flags.includes('possible-scientific-conflict-in-submission')));
});

test('negation differences without shared scientific subject remain unflagged',()=>{
 const result=findBatchConflictSignals([{text:'Sea otters use tools to open shellfish'},{text:'Octopuses do not use tools to open shellfish'}]);
 assert.equal(result.items.length,0);
 assert.equal(result.can_auto_publish,false);
});

test('contracted forms of is not trigger review without asserting a contradiction',()=>{
 const result=findBatchConflictSignals([{text:'A sea otter is active during the day'},{text:"A sea otter isn't active during the day"}]);
 assert.equal(result.items.length,1);
 assert.equal(result.items[0].signal,'negation-difference-review');
 assert.equal(result.can_auto_publish,false);
});

test('curly apostrophes in contractions do not conceal a possible conflict',()=>{
 const result=findBatchConflictSignals([{text:'Sea otters can open shellfish with tools'},{text:'Sea otters can’t open shellfish with tools'}]);
 assert.equal(result.items.length,1);
 assert.equal(result.items[0].requires_scientific_review,true);
 assert.equal(result.can_auto_publish,false);
});
