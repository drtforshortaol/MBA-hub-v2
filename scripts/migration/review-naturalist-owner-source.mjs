// Reconcile the owner's pasted weekly source with the active October record.
// This verifies source transcription, not scientific truth or image permissions.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const packageRoot=fileURLToPath(new URL('../../',import.meta.url));
const evidencePath='docs/verification/naturalist-october-owner-source-20261029.json';
const evidenceSHA='b2cbba54e814482fab3a34de01305a6a6e4a97a53dddefbd58bc060dc3ad6673';
const sha=s=>createHash('sha256').update(s).digest('hex');
export function reviewNaturalistOwnerSource({root=packageRoot,scriptOverride,htmlOverride}={}){
 const evidenceBytes=fs.readFileSync(path.join(packageRoot,evidencePath));
 assert.equal(sha(evidenceBytes),evidenceSHA,'unreviewed owner-source receipt');
 const source=JSON.parse(evidenceBytes);
 const script=scriptOverride??fs.readFileSync(path.join(root,'src/apps/naturalist-field-notes/october-2026-note.js'),'utf8');
 const context=vm.createContext({FIELD_NOTES:[]});vm.runInContext(script,context,{timeout:1000});
 const notes=JSON.parse(JSON.stringify(context.FIELD_NOTES));assert.equal(notes.length,1);
 const note=notes[0];assert.equal(note.id,source.stable_note_id,'permanent issue ID');
 const expected=source.bay_watch_source_rows.flatMap(row=>row.normalized_species);
 assert.equal(source.bay_watch_source_rows.length,38);assert.equal(expected.length,39);
 assert.equal(new Set(expected).size,39);
 assert.deepEqual(note.bay,expected,'complete source-derived species and pod inventory');
 assert.equal(note.date,'October 8–14, 2026 (Bay Watch period)','observation period is not an invented email timestamp');
 const historical=note.observations.find(o=>o.title==='Historical gray-whale observation — Big Sur');
 assert(historical,'historical source observation is preserved');
 for(const term of ['Big Sur','Highway 1','March','two years earlier','not an October 8–14 sighting'])assert(historical.text.includes(term),'historical context: '+term);
 assert(!historical.photos?.length,'missing original photo cannot be silently replaced');
 const html=htmlOverride??fs.readFileSync(path.join(root,'src/apps/naturalist-field-notes/october-2026-08-14.html'),'utf8');
 const historicalSections=[...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)].map(m=>m[1]).filter(section=>section.includes('<h2>'+historical.title+'</h2>'));
 assert.equal(historicalSections.length,1,'one historical observation in the offline summary');
 assert(historicalSections[0].includes('<p>'+historical.text+'</p>'),'offline summary preserves the same historical context');
 assert(!/<(?:img|picture|video|object|embed|iframe)\b|(?:src|srcset)\s*=/i.test(historicalSections[0]),'offline summary cannot substitute a missing historical photo');
 assert(html.includes('<h1>Naturalist Update • October 8–14, 2026</h1>'),'offline summary uses the observation period');
 const photos=note.observations.flatMap(o=>o.photos||[]).map(p=>path.posix.normalize('apps/naturalist-field-notes/'+p.src));
 assert.deepEqual(photos,source.source_media.filter(row=>row.candidate_app_asset).map(row=>row.candidate_app_asset),'declared subject-corresponding assets');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'src/apps/naturalist-field-notes/manifest.json'),'utf8'));
 const section=manifest.sections.find(s=>s.id==='note-'+note.id);assert.deepEqual(section.query,{note:note.id});
 for(const term of ['Big Sur','historical gray whale'])assert(section.aliases.includes(term),'historical search metadata');
 assert.equal(manifest.publication_review,'pending');
 return {schema_version:1,app_id:manifest.app_id,source_receipt_sha256:evidenceSHA,current_script_sha256:sha(script),
  current_summary_sha256:sha(html),standalone_historical_context_matches:true,standalone_missing_photo_preserved:true,
  source_rows:38,normalized_species:39,complete_bay_watch:true,stable_note_id:note.id,
  source_email_date_verified:false,display_uses_observation_period:true,historical_context_restored:true,
  source_photo_items:source.source_media.length,current_photo_items:photos.length,
  unresolved_photo_files:source.source_media.filter(row=>!row.candidate_app_asset).map(row=>row.filename),
  attachment_identity_verified:false,approval_granted:false,publication_review:'pending',
  limitations:['Selected excerpts and Bay Watch rows, not a complete email or original attachment archive.',
   'Subject/caption correspondence does not establish exact image identity or reuse rights.',
   'Source-derived biology and exhibit recollections are not independently certified by this comparison.']};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))process.stdout.write(JSON.stringify(reviewNaturalistOwnerSource(),null,2)+'\n');
