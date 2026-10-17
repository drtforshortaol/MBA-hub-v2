import test from 'node:test';
import assert from 'node:assert/strict';
import {findBatchDuplicates} from '../scripts/find-batch-duplicates.mjs';
import {classifyUpdateBatch} from '../scripts/classify-update-batch.mjs';
test('detects punctuation and case duplicates without publication',()=>{
 const result=findBatchDuplicates([{text:'Sea otters use tools.'},{text:'SEA OTTERS USE TOOLS!'}]);
 assert.equal(result.items[0].duplicate_of,null);
 assert.equal(result.items[1].duplicate_of,0);
 assert.equal(result.published,false);
});
test('distinct statements are not duplicates',()=>{
 const result=findBatchDuplicates([{text:'Sea otters use tools.'},{text:'Octopuses change texture.'}]);
 assert.equal(result.items[1].duplicate_of,null);
});
test('batch duplicate is retained and flagged for review',()=>{
 const result=classifyUpdateBatch('Sea otters use tools.\n\nSea otters use tools!',[]);
 assert.equal(result.entries[1].duplicate_of,0);
 assert.ok(result.entries[1].review.flags.includes('duplicate-in-submission'));
 assert.equal(result.entries[1].review.can_auto_publish,false);
});
test('rejects malformed duplicate input',()=>{
 assert.equal(findBatchDuplicates(null).valid,false);
});
