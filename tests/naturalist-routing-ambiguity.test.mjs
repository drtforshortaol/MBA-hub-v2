import test from 'node:test';
import assert from 'node:assert/strict';
import {suggestContentDestination} from '../scripts/suggest-content-destination.mjs';
import {classifyUpdateBatch} from '../scripts/classify-update-batch.mjs';

test('equally matching apps require human placement even when section scores differ',()=>{
 const apps=[
  {app_id:'otter-guide',title:'Otter Guide',sections:[{id:'feeding',title:'Feeding'}]},
  {app_id:'otter-guide-extra',title:'Otter Guide',sections:[{id:'habitat',title:'Habitat'}]}
 ];
 const route=suggestContentDestination('Otter guide feeding behavior',apps);
 assert.equal(route.action,'review-placement');
 assert.equal(route.requires_review,true);
});
test('equally matching sections never choose an arbitrary section',()=>{
 const apps=[{app_id:'sea-otter',title:'Sea Otter',sections:[
  {id:'feeding-one',title:'Feeding'},
  {id:'feeding-two',title:'Feeding'}
 ]}];
 const route=suggestContentDestination('Sea otter feeding',apps);
 assert.equal(route.action,'update-existing');
 assert.equal(route.section_id,null);
 assert.equal(route.requires_review,true);
});
test('unambiguous app and section remain available as proposals',()=>{
 const apps=[{app_id:'sea-otter',title:'Sea Otter',sections:[{id:'feeding',title:'Feeding'},{id:'habitat',title:'Habitat'}]}];
 const route=suggestContentDestination('Sea otter feeding',apps);
 assert.equal(route.app_id,'sea-otter');
 assert.equal(route.section_id,'feeding');
 assert.equal(route.published,false);
});
test('unresolved section is flagged by full review pipeline',()=>{
 const apps=[{app_id:'sea-otter',title:'Sea Otter',sections:[{id:'feeding-one',title:'Feeding'},{id:'feeding-two',title:'Feeding'}]}];
 const result=classifyUpdateBatch('Sea otter feeding.',apps);
 assert.equal(result.valid,true);
 assert.ok(result.entries[0].review.flags.includes('section-unresolved'));
 assert.equal(result.published,false);
});
