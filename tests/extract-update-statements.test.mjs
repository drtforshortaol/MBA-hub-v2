import test from 'node:test';
import assert from 'node:assert/strict';
import {extractUpdateStatements} from '../scripts/extract-update-statements.mjs';
import {classifyUpdateBatch} from '../scripts/classify-update-batch.mjs';
test('separates clear sentences without losing original source',()=>{
 const source='Giant Pacific octopuses change skin texture. Sea otters use rocks to open shellfish.';
 const result=extractUpdateStatements(source);
 assert.equal(result.entries.length,2);
 assert.equal(result.entries[0].source_block,source);
 assert.equal(result.entries[1].source_block,source);
 assert.equal(result.published,false);
});
test('preserves ambiguous abbreviations',()=>{
 const result=extractUpdateStatements('Dr. Smith observed otters. Results need review.');
 assert.equal(result.entries.length,1);
});
test('batch classification retains source and never publishes',()=>{
 const result=classifyUpdateBatch('Octopuses change texture. Sea otters use rocks.',[]);
 assert.equal(result.entries.length,2);
 assert.equal(result.entries[1].source_block,'Octopuses change texture. Sea otters use rocks.');
 assert.equal(result.published,false);
});
test('rejects oversized intake',()=>{
 assert.equal(extractUpdateStatements('x'.repeat(60001)).valid,false);
});
