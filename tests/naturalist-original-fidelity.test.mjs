import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {reviewNaturalistOriginal} from '../scripts/migration/review-naturalist-original-fidelity.mjs';
const project=fileURLToPath(new URL('../',import.meta.url));const root=path.resolve(process.env.NATURALIST_FIDELITY_ROOT||project);
const directory=path.join(root,'src/apps/naturalist-field-notes');const app=fs.readFileSync(path.join(directory,'app.js'),'utf8');

test('full original Naturalist content and runtime reproduce while presentation/additions remain explicit',async()=>{
 const r=await reviewNaturalistOriginal({root});
 assert.equal(r.current_byte_guard,true);assert.equal(r.original_notes,24);assert.equal(r.original_qa,38);assert.equal(r.original_resources,8);
 assert.equal(r.complete_issue_trees,24);assert.equal(r.bound_original_issue_buttons,24);assert.equal(r.actual_full_startup_note_queries,24);assert.equal(r.complete_rendered_blocks.length,5);assert.equal(r.static_pages,3);
 assert.equal(r.complete_original_CSS,true);assert.equal(r.complete_data_after_media_relocation,true);assert.equal(r.original_media_relocations,118);assert.equal(r.registered_original_offline_media,119);
 assert.equal(r.source_derived_inline_QA_cards,38);assert.equal(r.complete_home_equal,false);assert.equal(r.complete_home_equal_outside_QA,true);assert.equal(r.presentation_review_required.length,2);
 assert.equal(r.original_query_destinations.length,24);assert.ok(r.search_cases>=29);assert.ok(r.actual_species_letter_toggles>5);
 assert.deepEqual(Object.keys(r.excluded_new_material.files).sort(),['october-2026-08-14.html','october-2026-note.js']);assert.equal(r.excluded_new_material.photos.length,5);assert.equal(r.excluded_new_material.query_destinations.length,1);
 assert.equal(r.excluded_new_material.executed_or_approved,false);for(const photo of r.excluded_new_material.photos)assert.equal(photo.permission,photo.path==='apps/IMG_4210.jpeg'?'licensed':'approved','scoped original-excluded image permission '+photo.path);
 assert.equal(r.whole_app_inheritance,false);assert.equal(r.approval_granted,false);
});

test('byte guards reject new runtime or changed October content without granting approval',async()=>{
 await assert.rejects(reviewNaturalistOriginal({root,overrides:{'app.js':app+'\n// unexpected'}}),/unreviewed app runtime bytes/);
 const addition=fs.readFileSync(path.join(directory,'october-2026-note.js'),'utf8');
 await assert.rejects(reviewNaturalistOriginal({root,overrides:{'october-2026-note.js':addition+'\n// changed'}}),/current bytes october-2026-note.js/);
});

for(const [label,before,after,error] of [
 ['photo attributes','loading="lazy"','loading="eager"',/entire original rendered block|complete source-derived inline Q&A answer/],
 ['inline Q&A answer','esc(q.short||"")','esc("Changed answer")',/complete source-derived inline Q&A answer/],
 ['inline Q&A structure','class="nested qna-direct"','class="nested changed-qna"',/Expected values to be strictly equal/],
 ['issue observation heading','<h3>${esc(n.title)}</h3>','<h4>${esc(n.title)}</h4>',/complete original issue tree/],
 ['bound issue interaction','b.onclick=()=>openIssue(b.dataset.id)','b.onclick=()=>{}',/complete original issue tree/]
])test('complete parsed output detects '+label+' change independently of bytes',async()=>{
 assert(app.includes(before),'mutation precondition');await assert.rejects(reviewNaturalistOriginal({root,verifyBytes:false,overrides:{'app.js':app.replace(before,after)}}),error);
});

test('full document language, stylesheet and authored data changes fail independently of bytes',async()=>{
 const html=fs.readFileSync(path.join(directory,'index.html'),'utf8');assert(html.includes('lang="en"'));
 await assert.rejects(reviewNaturalistOriginal({root,verifyBytes:false,overrides:{'index.html':html.replace('lang="en"','lang="es"')}}),/complete normalized static page index.html/);
 const css=fs.readFileSync(path.join(directory,'styles.css'),'utf8');await assert.rejects(reviewNaturalistOriginal({root,verifyBytes:false,overrides:{'styles.css':css+'\n.card{display:none}'}}),/complete original CSS/);
 const data=fs.readFileSync(path.join(directory,'data.js'),'utf8');assert(data.includes('FIELD_NOTES'));await assert.rejects(reviewNaturalistOriginal({root,verifyBytes:false,overrides:{'data.js':data.replace('FIELD_NOTES=[','FIELD_NOTES=[{id:"new-unreviewed"},')}}),/source object keys/);
});

test('symlinked owning app resources are rejected before inherited scope is assessed',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'naturalist-fidelity-'));
 try{fs.mkdirSync(path.join(temp,'src/apps'),{recursive:true});fs.symlinkSync(directory,path.join(temp,'src/apps/naturalist-field-notes'));await assert.rejects(reviewNaturalistOriginal({root:temp}),/symlink/);}finally{fs.rmSync(temp,{recursive:true,force:true});}
});
