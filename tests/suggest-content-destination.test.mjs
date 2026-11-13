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

test('matches an application without inventing a weak section match',()=>{
 const catalog=[{app_id:'sea-slugs-nudibranchs',title:'Sea Slugs Nudibranchs',sections:[{id:'sea-slug-search',title:'Sea Slug Search 2026'}]}];
 const result=suggestContentDestination('Sea slugs nudibranchs are observed on rocks.',catalog);
 assert.equal(result.action,'update-existing');
 assert.equal(result.app_id,'sea-slugs-nudibranchs');
 assert.equal(result.section_id,null);
 assert.equal(result.published,false);
});


test('duplicate application or section identifiers require manual placement review',()=>{
 const duplicateApps=[apps[0],structuredClone(apps[0])];
 const appResult=suggestContentDestination('Giant Pacific octopus camouflage',duplicateApps);
 assert.equal(appResult.action,'review-placement');
 assert.match(appResult.reason,/duplicate application/);
 assert.equal(appResult.published,false);
 const duplicateSections=[{...apps[0],sections:[apps[0].sections[0],{...apps[0].sections[0],title:'Different content'}]}];
 const sectionResult=suggestContentDestination('Giant Pacific octopus camouflage',duplicateSections);
 assert.equal(sectionResult.action,'review-placement');
 assert.match(sectionResult.reason,/duplicate section/);
 assert.equal(sectionResult.published,false);
});
