import test from 'node:test';
import assert from 'node:assert/strict';
import {validateChangeRequest} from '../scripts/change-request-validation.mjs';
const apps=[{app_id:'ray',version:'1.0.0'}];
const valid=()=>({schema_version:1,kind:'mba-v2-content-change-request',app_id:'ray',app_version:'1.0.0',description:'Update overview'});
test('accepts well-formed change request for current app version',()=>assert.equal(validateChangeRequest(valid(),apps).valid,true));
test('rejects unknown application and stale version',()=>{const r=validateChangeRequest({...valid(),app_id:'other',app_version:'0.1.0'},apps);assert.equal(r.valid,false);assert(r.errors.includes('unknown application ID'));});
test('rejects empty or excessive description',()=>{for(const description of ['', ' '.repeat(4),'x'.repeat(4001)])assert.equal(validateChangeRequest({...valid(),description},apps).valid,false);});
test('rejects incorrect schema or request type',()=>assert.equal(validateChangeRequest({...valid(),schema_version:2,kind:'release'},apps).valid,false));
test('rejects non-object requests',()=>assert.equal(validateChangeRequest(null,apps).valid,false));

test('validates controlled section edit requests and permanent IDs',()=>{
 const registry=[{app_id:'ray',version:'1.0.0',sections:[{id:'habitat',title:'Habitat'}]}];
 const request={...valid(),proposed_title:'Rays',section_edits:[{id:'habitat',title:'Habitat',caption:'Coastal waters'}]};
 assert.equal(validateChangeRequest(request,registry).valid,true);
 assert.equal(validateChangeRequest({...request,section_edits:[{id:'unknown',title:'New',caption:''}]},registry).valid,false);
 assert.equal(validateChangeRequest({...request,section_edits:[request.section_edits[0],request.section_edits[0]]},registry).valid,false);
 assert.equal(validateChangeRequest({...request,section_edits:[{...request.section_edits[0],published:true}]},registry).valid,false);
 assert.equal(validateChangeRequest({...request,proposed_title:' '},registry).valid,false);
 assert.equal(validateChangeRequest({...request,release:true},registry).valid,false);
});

test('body text validation for exported changes',()=>{
 const registry=[{app_id:'ray',version:'1.0.0',sections:[{id:'habitat',title:'Habitat'}]}];
 const request={...valid(),section_edits:[{id:'habitat',title:'Habitat',text:'Updated',caption:''}]};
 assert.equal(validateChangeRequest(request,registry).valid,true);
 request.section_edits[0].text='x'.repeat(12001);
 assert.equal(validateChangeRequest(request,registry).valid,false);
 request.section_edits[0].text='Valid';
 request.section_edits[0].id='other';
 assert.equal(validateChangeRequest(request,registry).valid,false);
});

test('photo notes must reference registered image assets',()=>{
 const registry=[{app_id:'ray',version:'1.0.0',offline_assets:['apps/ray/photo.jpg']}];
 const request={...valid(),photo_notes:[{asset:'apps/ray/photo.jpg',caption:'Ray',alt_text:'Swimming ray'}]};
 assert.equal(validateChangeRequest(request,registry).valid,true);
 assert.equal(validateChangeRequest({...request,photo_notes:[{...request.photo_notes[0],asset:'other.jpg'}]},registry).valid,false);
 assert.equal(validateChangeRequest({...request,photo_notes:[{...request.photo_notes[0],delete:true}]},registry).valid,false);
 assert.equal(validateChangeRequest({...request,photo_notes:[request.photo_notes[0],request.photo_notes[0]]},registry).valid,false);
});
