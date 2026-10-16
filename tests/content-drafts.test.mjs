import test from 'node:test';
import assert from 'node:assert/strict';
import {createDraft,validateDraft,loadDraft,saveDraft,draftKey} from '../src/core/content-drafts.js';
const app={app_id:'ray',version:'1.2',title:'Ray'};
function storage(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
test('local draft creation, save and reload',()=>{const s=storage(),d=createDraft(app);d.title='Updated Ray';assert.equal(saveDraft(s,'dev',app,d).valid,true);assert.equal(loadDraft(s,'dev',app).title,'Updated Ray');assert.equal(loadDraft(s,'other',app),null);assert.ok(draftKey('dev','ray').includes('ray'));});
test('protected fields and identity changes rejected',()=>{const d=createDraft(app);d.app_id='other';assert.equal(validateDraft(d,app).valid,false);d.app_id='ray';d.sections=[];assert.equal(validateDraft(d,app).valid,false);});
test('invalid and stale drafts never load',()=>{const s=storage(),d=createDraft(app);s.setItem(draftKey('dev','ray'),'{');assert.equal(loadDraft(s,'dev',app),null);s.setItem(draftKey('dev','ray'),JSON.stringify(d));assert.equal(loadDraft(s,'dev',{...app,version:'2'}),null);});
test('draft title and description bounds',()=>{const d=createDraft(app);d.title=' ';assert.equal(validateDraft(d,app).valid,false);d.title='ok';d.description='x'.repeat(4001);assert.equal(validateDraft(d,app).valid,false);});

test('section edits preserve permanent IDs and validate captions',()=>{
 const withSections={...app,sections:[{id:'habitat',title:'Habitat'},{id:'feeding',title:'Feeding'}]};
 const d=createDraft(withSections);
 d.section_edits=[{id:'habitat',title:'Where rays live',caption:'Coastal waters'}];
 assert.equal(validateDraft(d,withSections).valid,true);
 d.section_edits.push({id:'habitat',title:'Duplicate',caption:''});
 assert.equal(validateDraft(d,withSections).valid,false);
 d.section_edits=[{id:'invented',title:'Unknown',caption:''}];
 assert.equal(validateDraft(d,withSections).valid,false);
 d.section_edits=[{id:'habitat',title:'Valid',caption:'x'.repeat(2001)}];
 assert.equal(validateDraft(d,withSections).valid,false);
 d.section_edits=[{id:'habitat',title:'Valid',caption:'',published:true}];
 assert.equal(validateDraft(d,withSections).valid,false);
});

test('body text remains bounded and scoped to registered sections',()=>{
 const withSections={...app,sections:[{id:'habitat',title:'Habitat',text:'Existing'}]};
 const draft=createDraft(withSections);
 draft.section_edits=[{id:'habitat',title:'Habitat',text:'Updated description',caption:''}];
 assert.equal(validateDraft(draft,withSections).valid,true);
 draft.section_edits[0].text='x'.repeat(12001);
 assert.equal(validateDraft(draft,withSections).valid,false);
 draft.section_edits[0].text={unsafe:true};
 assert.equal(validateDraft(draft,withSections).valid,false);
});
