import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareChangeRequest} from '../scripts/prepare-change-request.mjs';
const app={app_id:'ray',version:'1',title:'Ray',sections:[{id:'habitat',title:'Habitat',text:'Old',aliases:['coast']}],offline_assets:['apps/ray/photo.jpg'],status:'development'};
const request=()=>({schema_version:1,kind:'mba-v2-content-change-request',app_id:'ray',app_version:'1',description:'Review',proposed_title:'Rays',section_edits:[{id:'habitat',title:'Habitat',text:'New',caption:'Info'}],photo_notes:[{asset:'apps/ray/photo.jpg',caption:'A ray',alt_text:'Ray swimming'}]});
test('review proposal does not mutate original manifest or image assets',()=>{
 const original=structuredClone(app),r=prepareChangeRequest(request(),app);
 assert.equal(r.valid,true);assert.equal(r.proposed_manifest.title,'Rays');
 assert.equal(r.proposed_manifest.sections[0].text,'New');
 assert.deepEqual(app,original);assert.deepEqual(r.proposed_manifest.offline_assets,app.offline_assets);
 assert.equal(r.published,false);assert.equal(r.requires_review,true);
 assert.deepEqual(r.photo_proposals,request().photo_notes);
});
test('stale version and unknown section reject proposal',()=>{
 assert.equal(prepareChangeRequest({...request(),app_version:'0'},app).valid,false);
 assert.equal(prepareChangeRequest({...request(),section_edits:[{id:'unknown',title:'X',caption:''}]},app).valid,false);
});
test('unchanged sections retain stable aliases and metadata',()=>{
 const r=prepareChangeRequest({...request(),section_edits:[]},app);
 assert.deepEqual(r.proposed_manifest.sections,app.sections);
 assert.equal(r.proposed_manifest.status,'development');
});
