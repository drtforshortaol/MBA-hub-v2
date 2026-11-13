import test from 'node:test';
import assert from 'node:assert/strict';
import {assessExistingContent} from '../scripts/assess-existing-content.mjs';

test('exact existing statement is a review-only duplicate',()=>{
 const result=assessExistingContent('Sea otters eat urchins.',{sections:[{id:'diet',text:'Sea otters eat urchins.'}]});
 assert.equal(result.status,'exact-duplicate');
 assert.equal(result.requires_review,true);
 assert.equal(result.published,false);
});

test('negation difference is flagged as a possible conflict, never a scientific verdict',()=>{
 const result=assessExistingContent('Sea otters do not eat urchins.',{sections:[{id:'diet',text:'Sea otters eat urchins.'}]});
 assert.equal(result.potential_conflict_signal,'negation-difference-review');
 assert.equal(result.scientific_verification,'required');
 assert.equal(result.published,false);
});

test('missing content catalog is rejected',()=>{
 const result=assessExistingContent('Sea otters eat urchins.',{});
 assert.equal(result.valid,false);
});
