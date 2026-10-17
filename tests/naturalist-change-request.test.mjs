import test from 'node:test';
import assert from 'node:assert/strict';
import {naturalistChangeRequest} from '../src/core/naturalist-change-request.js';
import {validateChangeRequest} from '../scripts/change-request-validation.mjs';
const app={app_id:'otters',version:'1.0.0',title:'Otters',sections:[{id:'facts',title:'Facts',text:'Existing text'}],offline_assets:[]};
const draft={schema_version:1,kind:'mba-v2-local-content-draft',app_id:'otters',app_version:'1.0.0',title:'Otters',description:'Reviewed Naturalist statement',section_edits:[{id:'facts',title:'Facts',caption:'',text:'Updated text'}],photo_notes:[]};
test('Naturalist drafts convert to canonical change requests',()=>{
 const result=naturalistChangeRequest(draft,app);
 assert.equal(result.valid,true);
 assert.equal(validateChangeRequest(result.request,[app]).valid,true);
 assert.equal(result.published,false);
 assert.equal(result.can_auto_publish,false);
});
test('Naturalist draft conversion rejects unknown section and version',()=>{
 assert.equal(naturalistChangeRequest({...draft,app_version:'9.0.0'},app).valid,false);
 assert.equal(naturalistChangeRequest({...draft,section_edits:[{id:'unknown',title:'Wrong',caption:'',text:'No'}]},app).valid,false);
 assert.equal(naturalistChangeRequest({...draft,section_edits:[]},app).valid,false);
});
