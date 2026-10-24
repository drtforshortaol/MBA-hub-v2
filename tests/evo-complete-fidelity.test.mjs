import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {reviewEvolutionTimeline} from '../scripts/migration/review-evolution-timeline-fidelity.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const app=read('src/apps/evolution-timeline/app.js');

test('complete independent Timeline source, three parsed rendered views and actual shared mapping remain equivalent',async()=>{
 const r=await reviewEvolutionTimeline({includeTrees:true});
 assert.equal(r.source_files,11);assert.equal(r.current_files,4);assert.equal(r.complete_rendered_views,3);assert.equal(r.source_events,35);assert.equal(r.event_search_rows,35);assert.equal(r.manifest_destinations,36);
 assert.equal(r.navigation.targets,39);assert.equal(r.actual_assign_section_ids,true);assert.equal(r.approval_granted,false);
 for(const [id,trees] of Object.entries(r.rendered_view_trees)){assert.deepEqual(trees.current,trees.pinned,id);assert.equal(r.rendered_view_sha256[id].current,r.rendered_view_sha256[id].pinned);}
});
for(const [name,from,to] of [
 ['scientific template prose','Why kelp is not a plant','Kelp is a plant'],
 ['entire authored structure','class="energy-flow"','class="energy-flow-changed"'],
 ['native modes',"toolsView.hidden=view!=='tools'","toolsView.hidden=true"],
 ['independent lineage behavior',"storyView.querySelectorAll('.story-accordion').forEach(panel=>panel.removeAttribute('open'))", "storyView.querySelectorAll('.story-accordion').forEach(panel=>panel.open=true)"],
 ['mutually exclusive tools',"if(o!==d)o.removeAttribute('open')", "if(o===d)o.removeAttribute('open')"],
 ['shared reveal adapter',"[timeView,'time']", "[timeView,'tools']"],
 ['inert parsing security',"/^on/i.test(attr.name)","false"]
])test('complete review rejects changed '+name+' even with current-file byte guard disabled',async()=>{
 assert(app.includes(from),'mutation source exists');
 await assert.rejects(reviewEvolutionTimeline({verifyBytes:false,overrides:{'app.js':app.replace(from,to)}}));
});
test('complete review rejects changed static markup and entire original stylesheet',async()=>{
 await assert.rejects(reviewEvolutionTimeline({verifyBytes:false,overrides:{'index.html':read('src/apps/evolution-timeline/index.html').replace('Page navigation','Other navigation')}}));
 await assert.rejects(reviewEvolutionTimeline({verifyBytes:false,overrides:{'styles.css':read('src/apps/evolution-timeline/styles.css')+'\nbody{display:none}'} }));
});
test('complete review rejects scientific field changes in the full shared data export',async()=>{
 const bridge=read('src/shared/knowledge/evo-interface.js');assert(bridge.includes('The Universe begins expanding'));
 await assert.rejects(reviewEvolutionTimeline({verifyBytes:false,overrides:{bridge:bridge.replace('The Universe begins expanding','The Universe stops expanding')}}));
});
test('complete review rejects dropped source-derived canonical search prose and aliases',async()=>{
 for(const field of ['text','aliases']){
  const knowledge=JSON.parse(read('src/shared/knowledge.json'));const record=knowledge.records.find(r=>r.id==='evo-evolution-knowledge');record.sections[0][field]=field==='text'?'truncated':[];
  await assert.rejects(reviewEvolutionTimeline({verifyBytes:false,overrides:{knowledge:JSON.stringify(knowledge)}}));
 }
});
test('complete review detects broken actual shared anchor assignment instead of synthesizing IDs',async()=>{
 const contract=read('src/core/app-contract.js');assert(contract.includes('target.id=section.id'));
 await assert.rejects(reviewEvolutionTimeline({verifyBytes:false,overrides:{contract:contract.replace('target.id=section.id','target.id="wrong"')}}));
});
test('complete review fails closed on manifest destinations, offline inventory and existing permission evidence',async()=>{
 for(const mutate of [m=>m.sections.pop(),m=>m.offline_assets.pop()]){
  const manifest=JSON.parse(read('src/apps/evolution-timeline/manifest.json'));mutate(manifest);
  await assert.rejects(reviewEvolutionTimeline({verifyBytes:false,overrides:{'manifest.json':JSON.stringify(manifest)}}));
 }
 const catalog=JSON.parse(read('src/shared/media/catalog.json'));catalog.assets.find(asset=>asset.asset_id==='asset-7020f164e3928edc').permission_evidence='';
 await assert.rejects(reviewEvolutionTimeline({verifyBytes:false,overrides:{catalog:JSON.stringify(catalog)}}));
});
function snapshot(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'evo-fidelity-'));
 for(const relative of ['src/apps/evolution-timeline/app.js','src/apps/evolution-timeline/index.html','src/apps/evolution-timeline/styles.css','src/apps/evolution-timeline/manifest.json','src/shared/knowledge/evo-interface.js','src/shared/knowledge.json','src/shared/media/catalog.json','src/shared/media/asset-7020f164e3928edc--icon-192.png','src/core/app-contract.js','src/core/section-navigation.js']){
  const target=path.join(dir,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,relative),target);
 }
 return dir;
}
test('complete review rejects extra app resources, missing or changed icon bytes',async()=>{
 const dir=snapshot();try{
  fs.writeFileSync(path.join(dir,'src/apps/evolution-timeline/extra.js'),'');await assert.rejects(reviewEvolutionTimeline({root:dir}));fs.unlinkSync(path.join(dir,'src/apps/evolution-timeline/extra.js'));
  fs.writeFileSync(path.join(dir,'src/shared/media/asset-7020f164e3928edc--icon-192.png'),'changed');await assert.rejects(reviewEvolutionTimeline({root:dir}));
  fs.unlinkSync(path.join(dir,'src/shared/media/asset-7020f164e3928edc--icon-192.png'));await assert.rejects(reviewEvolutionTimeline({root:dir}));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('complete review rejects byte-identical source/app/shared-media symlink substitutions',async()=>{
 for(const relative of ['src','src/apps/evolution-timeline','src/shared/media']){
  const dir=snapshot(),target=path.join(dir,relative),moved=path.join(dir,'retained');try{fs.renameSync(target,moved);fs.symlinkSync(moved,target,'dir');await assert.rejects(reviewEvolutionTimeline({root:dir}));}finally{fs.rmSync(dir,{recursive:true,force:true});}
 }
 const dir=snapshot();try{const alias=dir+'-alias';fs.symlinkSync(dir,alias,'dir');try{await assert.rejects(reviewEvolutionTimeline({root:alias}));}finally{fs.unlinkSync(alias);}}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
