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
const uploadReceiptPath='docs/verification/naturalist-gray-whale-upload-20261029.json';
const uploadReceiptSHA='b49fa8e796487c68869f567bbe5468d0a4f6773449300b2e2fc45f34c70173e7';
const sha=s=>createHash('sha256').update(s).digest('hex');
export function reviewNaturalistOwnerSource({root=packageRoot,scriptOverride,htmlOverride,photoBytesOverride}={}){
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
 const uploadBytes=fs.readFileSync(path.join(packageRoot,uploadReceiptPath));
 assert.equal(sha(uploadBytes),uploadReceiptSHA,'unreviewed uploaded-photo receipt');
 const upload=JSON.parse(uploadBytes);
 assert.deepEqual(historical.photos,[{src:'../../'+upload.asset_path,alt:'Whale offshore beside a coastal bluff at Big Sur',caption:'Historical gray-whale observation from Highway 1, Big Sur — March, two years before the source update.'}],'exact owner-supplied historical photo placement');
 let target=path.join(root,'src');
 for(const part of upload.asset_path.split('/')){target=path.join(target,part);assert(!fs.lstatSync(target).isSymbolicLink(),'uploaded photo must not be a symlink');}
 assert(fs.statSync(target).isFile(),'uploaded photo must be a regular file');
 const photoBytes=photoBytesOverride??fs.readFileSync(target);
 assert.equal(photoBytes.length,upload.bytes,'uploaded photo byte length');
 assert.equal(sha(photoBytes),upload.sha256,'exact uploaded photo bytes');
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'src/shared/media/catalog.json'),'utf8'));
 const assets=catalog.assets.filter(a=>a.path===upload.asset_path);
 assert.equal(assets.length,1,'unique uploaded photo registration');
 assert.equal(assets[0].sha256,upload.sha256,'uploaded photo catalog hash');
 assert.equal(assets[0].permission,'review-required','upload does not grant reuse rights');
 const html=htmlOverride??fs.readFileSync(path.join(root,'src/apps/naturalist-field-notes/october-2026-08-14.html'),'utf8');
 const historicalSections=[...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)].map(m=>m[1]).filter(section=>section.includes('<h2>'+historical.title+'</h2>'));
 assert.equal(historicalSections.length,1,'one historical observation in the offline summary');
 assert(historicalSections[0].includes('<p>'+historical.text+'</p>'),'offline summary preserves the same historical context');
 const summaryImages=[...historicalSections[0].matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)].map(m=>m[1]);
 assert.deepEqual(summaryImages,['../../'+upload.asset_path],'offline summary uses only the supplied historical photo');
 assert(!/<(?:picture|video|object|embed|iframe)\b|\bsrcset\s*=/i.test(historicalSections[0]),'offline summary cannot substitute alternate historical media');
 assert(html.includes('<h1>Naturalist Update • October 8–14, 2026</h1>'),'offline summary uses the observation period');
 const photos=note.observations.flatMap(o=>o.photos||[]).map(p=>path.posix.normalize('apps/naturalist-field-notes/'+p.src));
 assert.deepEqual(photos,source.source_media.map(row=>row.filename===upload.newsletter_filename?upload.asset_path:row.candidate_app_asset).filter(Boolean),'declared subject-corresponding assets');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'src/apps/naturalist-field-notes/manifest.json'),'utf8'));
 const section=manifest.sections.find(s=>s.id==='note-'+note.id);assert.deepEqual(section.query,{note:note.id});
 for(const term of ['Big Sur','historical gray whale'])assert(section.aliases.includes(term),'historical search metadata');
 assert(manifest.media.includes(assets[0].asset_id),'uploaded photo manifest media');
 assert(manifest.offline_assets.includes(upload.asset_path),'uploaded photo offline declaration');
 assert.equal(manifest.publication_review,'pending');
 return {schema_version:1,app_id:manifest.app_id,source_receipt_sha256:evidenceSHA,current_script_sha256:sha(script),
  current_summary_sha256:sha(html),standalone_historical_context_matches:true,standalone_uploaded_photo_matches:true,uploaded_photo_bytes_verified:true,upload_receipt_sha256:uploadReceiptSHA,owner_supplied_filename_mapping:true,newsletter_original_byte_identity_verified:false,
  source_rows:38,normalized_species:39,complete_bay_watch:true,stable_note_id:note.id,
  source_email_date_verified:false,display_uses_observation_period:true,historical_context_restored:true,
  source_photo_items:source.source_media.length,current_photo_items:photos.length,
  unresolved_photo_files:source.source_media.filter(row=>!row.candidate_app_asset&&row.filename!==upload.newsletter_filename).map(row=>row.filename),
  attachment_identity_verified:false,approval_granted:false,publication_review:'pending',
  limitations:['Selected excerpts and Bay Watch rows, not a complete email or original attachment archive.',
   'Other subject/caption mappings do not establish exact image identity. The owner-supplied historical photo is bound to uploaded bytes, not a recovered original email attachment; reuse rights remain pending.',
   'Source-derived biology and exhibit recollections are not independently certified by this comparison.']};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))process.stdout.write(JSON.stringify(reviewNaturalistOwnerSource(),null,2)+'\n');
