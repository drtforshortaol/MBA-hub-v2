import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {reviewWhaleParasites} from '../scripts/migration/review-whale-parasites-fidelity.mjs';
const project=fileURLToPath(new URL('../',import.meta.url));
const root=path.resolve(process.env.WHALE_FIDELITY_ROOT||project);
const app='src/apps/whale-parasites-associates';
const navigation=fs.existsSync(path.join(root,'src/core/section-navigation.js'));
const original=fs.readFileSync(path.join(root,app,'app.js'),'utf8');
const base={root,includeNavigation:navigation};

test('complete pinned/current Whale Parasites inventory, DOM, data, styles and interactions reproduce',async()=>{
 const report=await reviewWhaleParasites(base);
 assert.equal(report.current_byte_guard,true);
 assert.equal(Object.keys(report.source_inventory).length,10);
 assert.equal(Object.keys(report.current_inventory).length,5);
 assert.equal(report.complete_static_document,true);
 assert.equal(report.complete_stylesheet,true);assert.equal(report.complete_dataset,true);
 assert.equal(report.rendered_cards,7);assert.equal(report.rendered_filters,5);
 assert.ok(report.filter_search_combinations>500);
 assert.equal(report.jump_targets,7);assert.equal(report.manifest_destinations,9);assert.equal(report.offline_app_assets,4);
 assert.equal(report.navigation.complete,navigation);
 if(navigation){assert.equal(report.navigation.resolved_cards,7);assert.equal(report.navigation.one_shot_verified,true);}
 else assert.match(report.navigation.reason,/combined-root navigation reproduction required/);
 assert.equal(report.approval_granted,false);
});

test('unreviewed runtime and manifest bytes fail before structural reproduction',async()=>{
 await assert.rejects(reviewWhaleParasites({...base,overrides:{'app.js':original+'\n// unexpected edit'}}),/unreviewed current bytes app.js/);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,app,'manifest.json'),'utf8'));manifest.publication_review='approved';
 await assert.rejects(reviewWhaleParasites({...base,overrides:{'manifest.json':JSON.stringify(manifest)}}),/unreviewed current bytes manifest.json/);
});

for(const [label,before,after] of [
 ['paragraph element','<p>${escapeHTML(paragraph)}</p>','<aside>${escapeHTML(paragraph)}</aside>'],
 ['icon background','style="background:${escapeHTML(item.iconBg)};"','style="background:#ffffff;"'],
 ['harm accessibility','aria-label="Harm level: ${escapeHTML(item.harm)}"','aria-label="Harm level: unknown"'],
 ['harm dot count','[1, 2, 3, 4]','[1, 2, 3]'],
 ['host chips','class="host-chip"','class="changed-chip"'],
 ['facts label','<strong>${escapeHTML(label)}</strong>','<em>${escapeHTML(label)}</em>'],
 ['filter pressed state','aria-pressed="${index === 0 ? "true" : "false"}"','aria-pressed="false"']
])test('full parsed renderer rejects '+label+' mutation independently of byte guard',async()=>{
 assert(original.includes(before),'mutation precondition');
 await assert.rejects(reviewWhaleParasites({...base,verifyBytes:false,overrides:{'app.js':original.replace(before,after)}}),/complete rendered (card|filter) trees/);
});

test('complete static DOM, exact CSS and source data comparisons reject altered prose/style',async()=>{
 const html=fs.readFileSync(path.join(root,app,'index.html'),'utf8');
 await assert.rejects(reviewWhaleParasites({...base,verifyBytes:false,overrides:{'index.html':html.replace('Round scars','Different scars')}}),/normalized static document/);
 const css=fs.readFileSync(path.join(root,app,'styles.css'),'utf8');
 await assert.rejects(reviewWhaleParasites({...base,verifyBytes:false,overrides:{'styles.css':css+'\n.card{color:red}'}}),/original stylesheet/);
 const data=fs.readFileSync(path.join(root,app,'data.js'),'utf8');
 await assert.rejects(reviewWhaleParasites({...base,verifyBytes:false,overrides:{'data.js':data.replace('Cookiecutter Shark','Changed shark')}}),/original dataset/);
});

test('complete inventory and ancestor symlinks fail closed',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'whale-fidelity-'));
 try{
  fs.mkdirSync(path.join(temp,'src/apps'),{recursive:true});fs.cpSync(path.join(root,app),path.join(temp,app),{recursive:true});
  fs.writeFileSync(path.join(temp,app,'unreviewed.txt'),'extra');
  await assert.rejects(reviewWhaleParasites({root:temp,includeNavigation:false}),/complete current inventory/);
  fs.unlinkSync(path.join(temp,app,'unreviewed.txt'));
  const runtime=path.join(temp,app,'app.js');fs.renameSync(runtime,runtime+'.target');fs.symlinkSync(runtime+'.target',runtime);
  // Keep inventory unchanged while redirecting the file outside the app path.
  fs.renameSync(runtime+'.target',path.join(temp,'runtime-target'));fs.unlinkSync(runtime);fs.symlinkSync(path.join(temp,'runtime-target'),runtime);
  await assert.rejects(reviewWhaleParasites({root:temp,includeNavigation:false}),/symlink/);
  fs.rmSync(path.join(temp,'src'),{recursive:true});fs.symlinkSync(path.join(root,'src'),path.join(temp,'src'));
  await assert.rejects(reviewWhaleParasites({root:temp,includeNavigation:false}),/symlink/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});

test('integrated navigation detects a missing app reveal adapter beyond byte guards',async()=>{
 if(!navigation){
  // Track A intentionally has no canonical section-navigation dependency.
  // The full CLI requires --root; isolated tests must not claim this coverage.
  await assert.rejects(reviewWhaleParasites({root,includeNavigation:true}),/ENOENT/);
  return;
 }
 assert(original.includes('mba:reveal-section'));
 await assert.rejects(reviewWhaleParasites({...base,verifyBytes:false,overrides:{'app.js':original.replace('mba:reveal-section','mba:unhandled-section')}}),/Expected values to be strictly deep-equal/);
});
