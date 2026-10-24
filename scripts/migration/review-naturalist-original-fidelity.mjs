// Original-source renderer scope only. New October material is never inherited.
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createNaturalistDOM,canonicalNaturalist,parsedTree,parsedDocument} from './naturalist-fidelity-dom.mjs';
const packageRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const prefix='apps/naturalist-field-notes/';const pin='5c219508d23255080f6b050cefa8092905447d81';
const sha=v=>createHash('sha256').update(v).digest('hex');
const blob=v=>createHash('sha1').update('blob '+Buffer.byteLength(v)+'\0').update(v).digest('hex');
const fixtureSHA='95461c215fc9e2c83b7f13e7752e74563439bfb9bfd70fb879b1269efd9cba4c';
const originalHashes={
 'data.js':'683693a6417256d65056a48145ded9714159adb2bef56ec5e8e434334b83a089',
 'styles.css':'14d93dbd164bdb3e063af75d47c254e4f9d81f47dfa1995d5371eea84ed4f2ff',
 'index.html':'ecbcd7616aab2f75c59660d62efd6872bbfd090ac27a9837468647cfaa696252',
 'inaturalist-reference.html':'2bfccfcfe452cd8f9b1e5034818b02f68909569715f0c07f79bc62d24f5f1d52',
 'steve-webster-gray-whale.html':'7b667e08280a4730acad59895a773a7f5799e2e944986ac1e02799bf8edaf11f',
 'manifest.json':'1811ae6e53018867b9c243acd17dc4f69bd11ba0a2917592d290edb06e428269'
};
const runtimeHashes=['4e72f8e78b921e0172b5f1c85fe8d48a36c042c25e7b572aae39d9227bce008e','412c28db578382ca785b4476fb6f59ec217e9671870dea4206040cc000b51eff','c871238eeb6f808a034eb5123517df4720b4a8dd6f560177c25c2df4303065a2'];
const additions={'october-2026-note.js':'f942215c8f7eb22ed2ee9eb26a0f05b9f6076212bdb42be03cc1e7e52f0c2210','october-2026-08-14.html':'692a40302b95ecdba4e19ba6a5849dba89ad20b49ea36c7754a0c3db1a00713b'};
function read(root,relative,encoding='utf8'){
 assert(!path.isAbsolute(relative)&&relative.split('/').every(p=>p&&p!=='.'&&p!=='..'),'unsafe input path');
 let p=path.resolve(root);assert(!fs.lstatSync(p).isSymbolicLink(),'root symlink');
 for(const name of relative.split('/')){p=path.join(p,name);assert(!fs.lstatSync(p).isSymbolicLink(),'symlink '+relative);}
 assert(fs.statSync(p).isFile(),'regular file '+relative);return fs.readFileSync(p,encoding);
}
function dataObject(source){return JSON.parse(vm.runInNewContext(source+';JSON.stringify({FIELD_NOTES,RESOURCES})',{}, {timeout:3000}));}
function metadataPairs(old,current,sourceInventory,root){
 const pairs=new Map();let values=0;
 function visit(a,b){assert.equal(typeof b,typeof a,'source value type');if(a===null||typeof a!=='object'){
   if(a===b)return;
   assert.equal(typeof a,'string','source primitive changed');assert(b.startsWith('../../shared/media/'),'non-media content changed');
   const source_path=path.posix.normalize(prefix+decodeURIComponent(a));const local_path=path.posix.normalize(prefix+b);
   const upstream=sourceInventory.find(x=>x.path===source_path);assert(upstream,'source media inventory '+source_path);
   const bytes=read(root,'src/'+local_path,null);assert.equal(blob(bytes),upstream.git_blob,'complete source media bytes '+source_path);assert.equal(bytes.length,upstream.size,'media size');
   const key=a+'\0'+b;pairs.set(key,{source_url:a,current_url:b,source_path,current_path:local_path,git_blob:upstream.git_blob,sha256:sha(bytes)});values++;return;
  }
  assert.deepEqual(Object.keys(b),Object.keys(a),'source object keys/order');for(const k of Object.keys(a))visit(a[k],b[k]);
 }
 visit(old,current);return {pairs:[...pairs.values()],occurrences:values};
}
function runtime(html,data,script,query='',fullStartup=false){
 const dom=createNaturalistDOM(html);const location={href:'https://example.test/v2/apps/naturalist-field-notes/index.html'+query};
 const history={replaceState(_a,_b,url){location.href=String(url);}};
 const context=vm.createContext({...dom,URL,URLSearchParams,location,history,window:{location:{search:query},scrollTo(){}},navigator:{},console});
 const boundary=script.indexOf('$("#search").addEventListener');assert(boundary>=0,'reviewed runtime boundary');
 // The complete app bytes are bound separately. Execute the real renderer and
 // event binders without standalone cache/worker lifecycle side effects.
 vm.runInContext(data+'\n'+(fullStartup?script:script.slice(0,boundary)),context,{timeout:3000});
 const call=(expression)=>vm.runInContext(expression,context,{timeout:3000});
 return {dom,context,location,call,content:()=>dom.document.getElementById('content'),render(){call('render()');},open(id){call('openIssue('+JSON.stringify(id)+')');},search(q){dom.document.getElementById('search').value=q;call('render()');},
  fn(name){return call(name+'.toString()');},markup(expression){return call(expression);}};
}
function normalizedTree(element,mappings){return canonicalNaturalist(element,mappings);}
function staticTree(markup,mappings,{index=false,current=false}={}){
 const e=/^\s*(?:<!doctype|<html)/i.test(markup)?parsedDocument(markup):parsedTree(markup);
 function clean(n){
  n.children=n.children.filter(({node})=>{
   if(node.tag==='link'&&node.attrs.rel==='manifest')return false;
   if(current&&node.tag==='style'&&node.text==='[data-v2-maintenance-hidden="true"]{display:none!important}')return false;
   if(current&&node.tag==='script'&&['../../core/app-contract.js','october-2026-note.js'].includes(node.attrs.src))return false;
   return true;
  });
  if(current&&['offlineStatus','clearCache'].includes(n.attrs.id)){for(const a of ['data-v2-maintenance-hidden','hidden','aria-hidden','disabled'])delete n.attrs[a];}
  if(current&&n.attrs.id==='Troubleshooting-install')delete n.attrs.id;
  for(const c of n.children)clean(c.node);
 }
 clean(e);return canonicalNaturalist(e,mappings);
}
export async function reviewNaturalistOriginal({root=packageRoot,verifyBytes=true,overrides={}}={}){
 root=path.resolve(root);const raw=read(packageRoot,'docs/verification/naturalist-pinned-source-20261023.json');assert.equal(sha(raw),fixtureSHA,'complete original fixture metadata');
 const fixture=JSON.parse(raw);assert.equal(fixture.commit,pin);assert.equal(fixture.repository,'drtforshortaol/MBA-hub');
 const source={};for(const f of fixture.files){assert.equal(blob(f.content),f.git_blob,'pinned complete source '+f.path);source[f.path.slice(prefix.length)]=f.content;}
 assert.equal(Object.keys(source).length,9);assert.equal(fixture.inventory.length,122);
 const app='src/'+prefix;const names=fs.readdirSync(path.join(root,app)).sort();assert.deepEqual(names,[...Object.keys(originalHashes),'app.js',...Object.keys(additions)].sort(),'complete current app inventory');
 const current={};for(const n of names){current[n]=n in overrides?overrides[n]:read(root,app+n);if(verifyBytes){if(n==='app.js')assert(runtimeHashes.includes(sha(current[n])),'unreviewed app runtime bytes');else if(n==='manifest.json')assert([originalHashes[n],'a6ad9198f2c0f57be576d69909c02b6b0e3700f6fed05c9f577e8ca67443bfb8'].includes(sha(current[n])),'unreviewed manifest bytes');else assert.equal(sha(current[n]),originalHashes[n]||additions[n],'current bytes '+n);}}
 assert.equal(current['styles.css'],source['styles.css'],'complete original CSS');
 const originalData=dataObject(source['data.js']),newData=dataObject(current['data.js']);assert.equal(originalData.FIELD_NOTES.length,24);assert.equal(originalData.RESOURCES.length,8);
 const inventory=[...fixture.inventory,...fixture.external_inventory];const media=metadataPairs(originalData,newData,inventory,root);
 // Restore complete original script bytes, not just the evaluated records.
 let restored=current['data.js'];for(const p of media.pairs)restored=restored.split(p.current_url).join(p.source_url);assert.equal(restored,source['data.js'],'complete original data executable after exact media relocation');
 const hero='../../shared/media/asset-29f85ad9d9ef593f--IMG_3475.jpeg';const oldHero='../../IMG_3475.jpeg';const heroMeta=inventory.find(i=>i.path==='IMG_3475.jpeg');const heroBytes=read(root,'src/shared/media/asset-29f85ad9d9ef593f--IMG_3475.jpeg',null);assert.equal(blob(heroBytes),heroMeta.git_blob,'original standalone hero image');
 const mappings=[...media.pairs,{source_url:oldHero,current_url:hero}];
 for(const n of ['index.html','inaturalist-reference.html','steve-webster-gray-whale.html'])assert.deepEqual(staticTree(current[n],mappings,{current:true}),staticTree(source[n],[],{}),'complete normalized static page '+n);
 const old=runtime(source['index.html'],source['data.js'],source['app.js']);const actual=runtime(current['index.html'],current['data.js'],current['app.js']);
 const blocks=['latestBlock()','archiveBlock()','bayBlock()','highlightBlock()','resourcesBlock()'];
 for(const block of blocks)assert.deepEqual(staticTree(actual.markup(block),mappings),staticTree(old.markup(block),[]),'entire original rendered block '+block);
 const oldQA=old.markup('qaBlock()'),newQA=actual.markup('qaBlock()');
 assert.notDeepEqual(staticTree(newQA,mappings),staticTree(oldQA,[]),'known Q&A presentation difference must stay explicit');
 const replacement='<div data-qa-presentation-review="pending"></div>';
 assert.deepEqual(staticTree(actual.markup('home()').replace(newQA,replacement),mappings),staticTree(old.markup('home()').replace(oldQA,replacement),[]),'complete home outside explicitly changed Q&A block');
 const qas=originalData.FIELD_NOTES.flatMap(n=>(n.qa||[]).map(q=>({...q,date:n.date,id:n.id})));
 const qaDOM=createNaturalistDOM(newQA);const qaCards=qaDOM.document.querySelectorAll('.qna-direct');assert.equal(qaCards.length,38);
 const escaped=value=>old.markup('esc('+JSON.stringify(value||'')+')');
 for(let i=0;i<qas.length;i++){
  const q=qas[i];const expected='<details class="nested qna-direct"><summary>'+escaped(q.q)+' <small>'+escaped(q.date)+'</small></summary><div class="answer"><p>'+escaped(q.short)+'</p>'+(q.photos||[]).map(p=>old.markup('photo('+JSON.stringify(p)+')')).join('')+old.markup('tags('+JSON.stringify(q.tags||[])+')')+'<button class="textbtn issue-open" data-id="'+escaped(q.id)+'">Read original field note →</button></div></details>';
  assert.deepEqual(canonicalNaturalist(qaCards[i],mappings),staticTree(expected,[]).children[0].node,'complete source-derived inline Q&A answer '+i);
 }
 const currentHome=staticTree(actual.markup('home()'),mappings);
 old.render();actual.render();
 let issueTrees=0;for(const note of originalData.FIELD_NOTES){const sourceButton=old.dom.document.querySelectorAll('.issue-open').find(b=>b.dataset.id===note.id);const currentButton=actual.dom.document.querySelectorAll('.issue-open').find(b=>b.dataset.id===note.id);assert(sourceButton&&currentButton,'original bound index destination');sourceButton.click();currentButton.click();assert.deepEqual(normalizedTree(actual.content(),mappings),normalizedTree(old.content(),[]),'complete original issue tree '+note.id);assert.equal(new URL(actual.location.href).searchParams.get('note'),note.id,'canonical original query destination');const back=actual.dom.document.querySelector('[data-back]');assert(back,'note Back');back.click();old.dom.document.querySelector('[data-back]').click();assert.deepEqual(normalizedTree(actual.content(),mappings).children,currentHome.children,'bound Back returns complete current home');assert.equal(new URL(actual.location.href).searchParams.has('note'),false);issueTrees++;}
 const queries=[' WHALE ','not-a-real-note','inaturalist','research grade','tel:',...originalData.FIELD_NOTES.map(n=>n.title)];
 let searches=0;for(const q of queries){old.search(q);actual.search(q);assert.deepEqual(normalizedTree(actual.content(),mappings),normalizedTree(old.content(),[]),'complete search results '+q);for(const b of actual.dom.document.querySelectorAll('.issue-open'))assert(originalData.FIELD_NOTES.some(n=>n.id===b.dataset.id),'source-derived issue query');searches++;}
 old.search('');actual.search('');
 let letters=0;const directories=actual.dom.document.querySelectorAll('.species-highlights-index');assert.equal(directories.length,1);
 const sourceDirectory=old.dom.document.querySelectorAll('.species-highlights-index')[0];
 for(const button of directories[0].querySelectorAll('[data-species-letter]')){const original=sourceDirectory.querySelectorAll('[data-species-letter]').find(b=>b.dataset.speciesLetter===button.dataset.speciesLetter);button.click();original.click();assert.deepEqual(normalizedTree(directories[0],mappings),normalizedTree(sourceDirectory,[]),'actual species-letter filtering');button.click();original.click();assert.deepEqual(normalizedTree(directories[0],mappings),normalizedTree(sourceDirectory,[]),'same-letter reset');letters++;}
 let initialQueries=0;
 for(const note of originalData.FIELD_NOTES){
  const query='?note='+encodeURIComponent(note.id);const before=runtime(source['index.html'],source['data.js'],source['app.js'],query,true);const after=runtime(current['index.html'],current['data.js'],current['app.js'],query,true);
  assert.deepEqual(normalizedTree(after.content(),mappings),normalizedTree(before.content(),[]),'actual full startup note query '+note.id);initialQueries++;
 }
 const manifest=JSON.parse(current['manifest.json']);const originalQueries=[];for(const n of originalData.FIELD_NOTES){const sections=manifest.sections.filter(s=>s.query?.note===n.id);assert.equal(sections.length,1,'exact original query section '+n.id);originalQueries.push({id:sections[0].id,note:n.id});}
 const catalog=JSON.parse(read(root,'src/shared/media/catalog.json'));
 const registeredOriginal=[...media.pairs.map(p=>p.current_path),'shared/media/asset-29f85ad9d9ef593f--IMG_3475.jpeg'];
 for(const p of new Set(registeredOriginal)){const entry=catalog.assets.find(a=>a.path===p);assert(entry,'original catalog registration '+p);assert(manifest.media.includes(entry.asset_id),'original app media declaration '+p);assert.equal(entry.offline,true,'original offline media '+p);assert.equal(entry.sha256,sha(read(root,'src/'+p,null)),'original catalog bytes '+p);}
 const pendingPhotos=['apps/IMG_4207.jpeg','apps/IMG_4208.jpeg','apps/IMG_4209.jpeg','apps/IMG_4210.jpeg'];
 const pendingMedia=pendingPhotos.map(p=>{const entry=catalog.assets.find(a=>a.path===p);if(entry)assert.equal(entry.permission,'review-required','new October photo remains pending');assert(manifest.offline_assets.includes(p));return {path:p,asset_id:entry?.asset_id||null,sha256:sha(read(root,'src/'+p,null)),permission:entry?.permission||'review-required-unregistered',registration_present:Boolean(entry)};});
 const newQueries=manifest.sections.filter(s=>s.query?.note&&!originalData.FIELD_NOTES.some(n=>n.id===s.query.note)).map(s=>({id:s.id,note:s.query.note,review_required:true}));assert.equal(newQueries.length,1);
 return {schema_version:1,scope:'Original inherited runtime only; no whole-app approval',source_repository:fixture.repository,source_commit:pin,source_fixture_sha256:fixtureSHA,current_byte_guard:verifyBytes,
  original_text_files:9,source_app_inventory:fixture.inventory.length,current_app_inventory:Object.fromEntries(names.map(n=>[n,sha(current[n])])),original_notes:24,original_qa:38,original_resources:8,complete_original_CSS:true,complete_data_after_media_relocation:true,original_media_relocations:media.pairs.length,media_value_occurrences:media.occurrences,registered_original_offline_media:new Set(registeredOriginal).size,media_git_blob_matches:media.pairs.map(p=>({source_path:p.source_path,current_path:p.current_path,git_blob:p.git_blob,sha256:p.sha256})),standalone_hero_git_blob:heroMeta.git_blob,
  static_pages:3,complete_rendered_blocks:blocks,complete_home_equal:false,complete_home_equal_outside_QA:true,source_derived_inline_QA_cards:38,presentation_review_required:[{block:'qaBlock()',change:'Original question index buttons now inline disclosure cards with original answers/photos/tags and source-note buttons; not original presentation equality.'},{block:'home()',change:'Contains changed Q&A block; all other complete subtrees match source.'}],complete_issue_trees:issueTrees,bound_original_issue_buttons:issueTrees,search_cases:searches,actual_species_letter_toggles:letters,actual_full_startup_note_queries:initialQueries,original_query_destinations:originalQueries,
  excluded_new_material:{files:Object.fromEntries(Object.keys(additions).map(n=>[n,sha(current[n])])),query_destinations:newQueries,photos:pendingMedia,registration_complete:pendingMedia.every(p=>p.registration_present),executed_or_approved:false},
  technical_adapters:['Exact centralized media relocation and removal of obsolete IMG_33 cache query.','Parsed safe-markup construction with validated links.','Canonical note URL selection and Back cleanup.','Standalone maintenance/worker ownership replaced by Hub controls.','New October script removed only for explicit original-source-scope reproduction.'],
  whole_app_inheritance:false,approval_granted:false,limitations:['Original data/runtime reproduction excludes October additive script execution and standalone new page/photo interpretation.','Bounded lxml DOM/event reproduction is not native browser layout, service-worker lifecycle or physical device acceptance.','Scientific/editorial, media-rights, privacy and operational gates remain separate.']};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const i=process.argv.indexOf('--root');process.stdout.write(JSON.stringify(await reviewNaturalistOriginal({root:i<0?packageRoot:process.argv[i+1]}),null,2)+'\n');}
