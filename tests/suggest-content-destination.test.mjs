import test from 'node:test';
import assert from 'node:assert/strict';
import {suggestContentDestination} from '../scripts/suggest-content-destination.mjs';
const apps=[{app_id:'giant-pacific-octopus',title:'Giant Pacific Octopus',sections:[{id:'camouflage',title:'Camouflage and adaptations'}]},{app_id:'ray',title:'Ray',sections:[{id:'habitat',title:'Habitat'}]}];
test('routes an unambiguous natural-language update to existing app and section',()=>{
 const r=suggestContentDestination('Add giant Pacific octopus camouflage information',apps);
 assert.equal(r.action,'update-existing');assert.equal(r.app_id,'giant-pacific-octopus');assert.equal(r.section_id,'camouflage');assert.equal(r.published,false);
});
test('does not invent a new app for ambiguous updates',()=>{
 const r=suggestContentDestination('Add information about ocean currents',apps);
 assert.equal(r.action,'review-placement');assert.equal(r.requires_review,true);
});
test('rejects missing update and catalog',()=>{
 assert.equal(suggestContentDestination('',apps).valid,false);
 assert.equal(suggestContentDestination('octopus',null).valid,false);
});
