import test from 'node:test';
import assert from 'node:assert/strict';
import {suggestContentDestination} from '../scripts/suggest-content-destination.mjs';
const apps=[{app_id:'giant-pacific-octopus',title:'Giant Pacific Octopus',sections:[{id:'camouflage',title:'Camouflage'}]},{app_id:'bat-ray',title:'Bat Ray',sections:[{id:'camouflage',title:'Camouflage'}]}];
test('does not route generic section-only content to arbitrary species',()=>{
 const r=suggestContentDestination('Add camouflage information',apps);
 assert.equal(r.action,'review-placement');
});
test('routes a named species to its existing application',()=>{
 const r=suggestContentDestination('Update giant Pacific octopus camouflage',apps);
 assert.equal(r.action,'update-existing');assert.equal(r.app_id,'giant-pacific-octopus');assert.equal(r.section_id,'camouflage');
});
test('does not route single common species word with insufficient coverage',()=>{
 const r=suggestContentDestination('Octopus news',apps);
 assert.equal(r.action,'review-placement');
});
test('does not create or publish on no-match',()=>{
 const r=suggestContentDestination('Add moon jelly feeding behavior',apps);
 assert.equal(r.action,'review-placement');assert.equal(r.published,false);
});
