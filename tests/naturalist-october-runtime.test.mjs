import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reviewNaturalistOctober} from '../scripts/migration/review-naturalist-october-runtime.mjs';
const source=fs.readFileSync(new URL('../src/apps/naturalist-field-notes/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/apps/naturalist-field-notes/index.html',import.meta.url),'utf8');

test('current October script participates in startup, Home, article, search and Back',()=>{
 const r=reviewNaturalistOctober();
 const recorded=JSON.parse(fs.readFileSync(new URL('../docs/verification/naturalist-october-runtime-20261029.json',import.meta.url),'utf8'));
 assert.deepEqual(r,recorded,'current full-runtime report must match the reviewed byte-bound checkpoint');
 assert.equal(r.current_notes,25);assert.equal(r.current_QA,41);
 assert.equal(r.authored_october_fields,true);assert.equal(r.direct_query_startup,true);
 assert.equal(r.bound_issue_and_back,true);assert.equal(r.search_cases,3);
 assert.equal(r.october_photos,4);assert.equal(r.october_source_buttons,7);
 assert.equal(r.approval_granted,false);assert.equal(r.whole_app_inheritance,false);
 assert.deepEqual(r.current_classic_script_order,['data.js','october-2026-note.js','app.js']);
 assert.equal(Object.keys(r.current_inventory).length,5);
});

test('missing or reordered October additive load fails independently of data shape tests',()=>{
 assert.throws(()=>reviewNaturalistOctober({overrides:{'index.html':html.replace('<script src="october-2026-note.js"></script>','')}}),/current classic script loading order/);
});

for(const [label,before,after,error] of [
 ['observation body','${esc(n.text)}','October observation omitted',/October observation body/],
 ['photo caption','${esc(p.caption||\'\')}','Caption removed',/pending photo captions preserved/],
 ['Bay Watch entries','${esc(x)}</div>`).join("")}</div></details>`','Sightings omitted</div>`).join("")}</div></details>`',/complete October Bay Watch/],
 ['direct note startup','if(directNote&&FIELD_NOTES.some(n=>n.id===directNote))openIssue(directNote);','',/October article rendered/]
])test('current rendered October check rejects '+label+' loss',()=>{
 assert(source.includes(before),'mutation precondition '+label);
 assert.throws(()=>reviewNaturalistOctober({overrides:{'app.js':source.replace(before,after)}}),error);
});
