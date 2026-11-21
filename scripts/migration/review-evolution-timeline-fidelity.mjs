// Complete pinned/current engineering fidelity for independent Evolution Timeline v11.
// lxml parses entire documents/fragments; bounded DOM executes actual old/new code.
// No native-browser layout, scientific, media-rights or deployment approval.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
const packageRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const commit='c6d782d3a8a03e407861a0fbc3aab76e5fbf8d0c';
const sha=b=>createHash('sha256').update(b).digest('hex');
const norm=s=>String(s).replace(/\s+/g,' ').trim();
const textTokens=e=>[e.text,...e.children.flatMap(c=>[textTokens(c),c.tail])].join(' ');
const sourceBlobs={
  ".gitattributes": "dfe0770424b2a19faf507a501ebfc23be8f54e7b",
  "README.txt": "763f053721c240e663cf18a49cda230adda5d954",
  "app.js": "82f6edd91c7db816346f4905171b31ce773e27bb",
  "evolution_timeline_pwa_v10.zip": "d8be3716aba8ddfea27b2322249e3ef55336650f",
  "evolution_timeline_pwa_v11.zip": "5f40c1d0f8ad0967cd63a31a71d30e0b98cad0e2",
  "icons/icon-192.png": "4431360225c297e5494b7a4bbf4ed28a7e73a954",
  "icons/icon-512.png": "d4b93c344c2e05d0b5e4c44deba81edd21a9b73a",
  "index.html": "bb3a79baaa81bbe9dcce4881e157f4d7b2657134",
  "manifest.webmanifest": "fbe35899561bce9b29929ada8fa8ee977f92bca9",
  "styles.css": "2d4f9921c0e1ad72ed642ffda0f3b99c58a4c197",
  "sw.js": "64fa1962d3319a8b517a39e9f15a8db9070695f1"
};
const expected={
  "app.js": "c8cd6dd369e53df308f66b318bb82a4e8b71d5097fa95b57414917e414a23e21",
  "index.html": "62ee9deddfcbb90e1ed2b61619a508c6ff42df6809fec52096b581cd62891f01",
  "manifest.json": "a0997e5c5e4c99a9f0823191602df55e40bebb59de12f076f8441bcffd495540",
  "styles.css": "8c6993c1eb476536a307a972db56dd065497dbb0e270c975cf04a4edcea6345e"
};
const python=String.raw`
import json,sys
from lxml import html
v=json.load(sys.stdin)
def node(e):
 if not isinstance(e.tag,str):return None
 return {'tag':e.tag.lower(),'attrs':dict(sorted(e.attrib.items())),'text':e.text or '',
 'children':[{'node':n,'tail':c.tail or ''} for c in e if (n:=node(c)) is not None]}
if v['mode']=='fragment':
 print(json.dumps(node(html.fragment_fromstring(v['html'],create_parent='body'))))
else:
 old=html.document_fromstring(v['old']);new=html.document_fromstring(v['new'])
 for e in old.xpath('//link[@rel="manifest"]'):e.getparent().remove(e)
 for e in new.xpath('//script[@src="../../core/app-contract.js"]|//script[@src="../../shared/knowledge/evo-interface.js"]|//style'):
  assert e.tag=='script' or e.text=='[data-v2-maintenance-hidden="true"]{display:none!important}', 'unreviewed inline CSS'
  e.getparent().remove(e)
 for e in new.xpath('//link[@href="../../shared/media/asset-7020f164e3928edc--icon-192.png"]'):e.attrib['href']='icons/icon-192.png'
 for e in old.xpath('//a[@class="hub-return"]'):
  assert e.attrib['href']=='https://drtforshortaol.github.io/MBA-hub/'
  e.attrib['href']='../../index.html'
 new.get_element_by_id('How-to-read-the-app').attrib.pop('id')
 def clean(e):
  n=node(e)
  def walk(n):
   n['text']=' '.join(n['text'].split())
   for key in ['hidden','disabled']:
    if key in n['attrs']:n['attrs'][key]=''
   for c in n['children']:c['tail']=' '.join(c['tail'].split());walk(c['node'])
  walk(n);return n
 assert clean(old)==clean(new),'complete static document mismatch'
 print(json.dumps({'equal':True,'tree':clean(old)}))
`;
const parseCache=new Map();
function py(input){const key=JSON.stringify(input);if(parseCache.has(key))return structuredClone(parseCache.get(key));const p=spawnSync('python3',['-c',python],{input:key,encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(p.status,0,p.stderr);const result=JSON.parse(p.stdout);parseCache.set(key,result);return structuredClone(result);}
function readRegular(root,relative){
 assert(!path.isAbsolute(relative)&&relative.split('/').every(p=>p&&p!=='.'&&p!=='..'),'unsafe audit path');
 let current=path.resolve(root);assert(!fs.lstatSync(current).isSymbolicLink(),'root symlink');
 for(const part of relative.split('/')){current=path.join(current,part);assert(!fs.lstatSync(current).isSymbolicLink(),'symlink '+relative);}
 assert(fs.statSync(current).isFile(),'not regular '+relative);return fs.readFileSync(current,'utf8');
}
function canonical(element){return {tag:element.tag,attrs:Object.fromEntries(Object.entries(element.attrs).sort(([a],[b])=>a.localeCompare(b))),text:norm(element.text),children:element.children.map(child=>({node:canonical(child),tail:norm(child.tail)}))};}
function runtime(html,data,script){
 let document;
 class Element {
  constructor(node){this.tag=node.tag;this.tagName=node.tag.toUpperCase();this.attrs={...node.attrs};this.text=node.text;this.tail='';this.children=node.children.map(c=>{const e=new Element(c.node);e.parentElement=this;e.tail=c.tail;return e;});this.handlers={};this.value='';
   this.dataset=new Proxy({}, {get:(_,key)=>this.attrs['data-'+String(key).replace(/[A-Z]/g,c=>'-'+c.toLowerCase())],set:(_,key,value)=>{this.attrs['data-'+String(key).replace(/[A-Z]/g,c=>'-'+c.toLowerCase())]=String(value);return true;}});
   this.classList={contains:c=>(this.attrs.class||'').split(/\s+/).includes(c),add:c=>{this.attrs.class=[...new Set([...(this.attrs.class||'').split(/\s+/).filter(Boolean),c])].join(' ');},remove:c=>{this.attrs.class=(this.attrs.class||'').split(/\s+/).filter(v=>v&&v!==c).join(' ');}};
  }
  get id(){return this.attrs.id||'';}set id(v){this.attrs.id=v;}get open(){return 'open' in this.attrs;}set open(v){const changed=this.open!==Boolean(v);if(v)this.attrs.open='';else delete this.attrs.open;if(changed)this.dispatchEvent({type:'toggle'});}
  get hidden(){return 'hidden' in this.attrs;}set hidden(v){if(v)this.attrs.hidden='';else delete this.attrs.hidden;}
  get attributes(){return Object.entries(this.attrs).map(([name,value])=>({name,value}));}get childNodes(){return this.children;}
  get tabIndex(){return this.attrs.tabindex===undefined?(this.tag==='summary'?0:-1):Number(this.attrs.tabindex);}
  get textContent(){return this.text+this.children.map(e=>e.textContent+e.tail).join('');}set textContent(v){this.text=String(v);this.children=[];}
  set innerHTML(value){this.replaceChildren(...parse(value).children);}
  getAttribute(n){return this.attrs[n]??null;}hasAttribute(n){return n in this.attrs;}setAttribute(n,v){this.attrs[n]=String(v);}removeAttribute(n){if(n==='open')this.open=false;else delete this.attrs[n];}
  contains(target){for(let e=target;e;e=e.parentElement)if(e===this)return true;return false;}
  remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(e=>e!==this);}
  addEventListener(t,f){(this.handlers[t]??=[]).push(f);}click(){this.dispatchEvent({type:'click',bubbles:true});}
  dispatchEvent(e){e.target??=this;for(const fn of this.handlers[e.type]||[])fn(e);if(e.bubbles){if(this.parentElement)this.parentElement.dispatchEvent(e);else document.dispatchEvent(e);}return true;}
  replaceChildren(...children){this.text='';this.children=children;for(const e of children)e.parentElement=this;}
  appendChild(e){e.parentElement=this;this.children.push(e);return e;}
  querySelectorAll(s){return descendants(this).filter(e=>matches(e,s));}querySelector(s){return this.querySelectorAll(s)[0]||null;}
  focus(){for(let e=this;e;e=e.parentElement)assert(!e.hidden,'focus in hidden view');this.focused=true;}scrollIntoView(){for(let e=this;e;e=e.parentElement)assert(!e.hidden,'scroll in hidden view');this.scrolled=true;}
 }
 function descendants(root){return root.children.flatMap(e=>[e,...descendants(e)]);}
 function matches(e,s){if(s==='*')return true;if(s.includes(','))return s.split(',').some(part=>matches(e,part.trim()));if(s.startsWith('.'))return e.classList.contains(s.slice(1));if(s.startsWith('[')){return [...s.matchAll(/\[([^\]=]+)(?:=["']?([^\]"']+)["']?)?\]/g)].every(([,a,v])=>e.hasAttribute(a)&&(v===undefined||e.getAttribute(a)===v));}return e.tag===s;}
 function parse(markup){return new Element(py({mode:'fragment',html:markup}));}
 const root=parse(html),handlers={};
 document={defaultView:{CustomEvent:class{constructor(type,options){this.type=type;Object.assign(this,options);}}},
  getElementById:id=>[root,...descendants(root)].find(e=>e.id===id)||null,
  querySelectorAll:s=>[root,...descendants(root)].filter(e=>matches(e,s)),querySelector(s){return this.querySelectorAll(s)[0]||null;},
  createElement:tag=>new Element({tag,attrs:{},text:'',children:[]}),importNode:element=>new Element({tag:element.tag,attrs:element.attrs,text:element.text,children:element.children.map(child=>({node:raw(child),tail:child.tail}))}),
  addEventListener(t,f){(handlers[t]??=[]).push(f);},dispatchEvent(e){for(const fn of handlers[e.type]||[])fn(e);}};
 function raw(e){return {tag:e.tag,attrs:e.attrs,text:e.text,children:e.children.map(child=>({node:raw(child),tail:child.tail}))};}
 class DOMParser{parseFromString(markup){const body=parse(markup);return {body,querySelectorAll:s=>body.querySelectorAll(s)};}}
 const context=vm.createContext({document,window:{addEventListener(){}},navigator:{onLine:true},DOMParser,structuredClone,setTimeout:fn=>fn()});
 vm.runInContext(data+'\n'+script,context,{timeout:3000});
 return {document,context,fn:name=>vm.runInContext(name+'.toString()',context),data:JSON.parse(vm.runInContext('JSON.stringify({early,groups,earthDayRows,otherDetails,timeRows})',context)),view:id=>document.getElementById(id),buttons:()=>document.querySelectorAll('.mode')};
}
function expressionEnd(source,start){
 let quote=null,depth=0;
 for(let i=start;i<source.length;i++){
  const c=source[i];
  if(quote){if(c==='\\')i++;else if(c===quote)quote=null;continue;}
  if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
  if('([{'.includes(c))depth++;
  if(')]}'.includes(c))depth--;
  if(c===';'&&depth===0)return i;
 }
 throw Error('missing data initializer terminator');
}
function normalizedCode(source,run,current){
 const functions=['earthDayHtml','quickSummaryHtml','closingAccordion','esc','detailsHtml','card','renderStory','renderTools','renderTime','applyVisibility','configureStoryAccordions','configureClosingAccordions'];
 for(const name of functions){const body=run.fn(name);assert.equal(source.split(body).length,2,'unique complete function '+name);source=source.replace(body,'FUNCTION_'+name);}
 for(const name of ['early','groups','earthDayRows','otherDetails','timeRows']){
  const pattern=new RegExp('const\\s+'+name+'\\s*=\\s*'),match=pattern.exec(source);assert(match,'missing data declaration '+name);
  const start=match.index+match[0].length,end=expressionEnd(source,start);source=source.slice(0,start)+'DATA_'+name+source.slice(end);
 }
 if(current){
  const safe=run.fn('renderApprovedMarkup');assert.equal(source.split(safe).length,2);source=source.replace(safe,'');
  const marker='// A shared section request must reveal its owning view before core navigation';
  const end=source.indexOf(marker);assert(end>=0,'missing reviewed reveal adapter');
  assert.equal(sha(source.slice(end)),'575b89b9eee7a58a4241b6561c5995849133a03331eb9c57b5c38ff34f6c65de','unreviewed shared reveal adapter');source=source.slice(0,end);
  source=source.replace("if(false){window.addEventListener('load',async()=>{try{const reg=await Promise.resolve({update:async()=>{},installing:null,waiting:null,active:null});if(navigator.onLine)await reg.update()}catch(_){}})}", "if('serviceWorker'in navigator){window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./sw.js');if(navigator.onLine)await reg.update()}catch(_){}})}");
 }
 return source.split('\n').filter(line=>line.trim()).join('\n');
}
export async function reviewEvolutionTimeline({root=packageRoot,verifyBytes=true,includeNavigation=true,includeTrees=false,overrides={}}={}){
 root=path.resolve(root);
 const fixture=JSON.parse(readRegular(packageRoot,'docs/verification/evolution-timeline-pinned-source-20261024.json'));
 assert.equal(fixture.repository,'drtforshortaol/evolution-timeline');assert.equal(fixture.commit,commit);
 const pinned={};for(const row of fixture.files){assert.equal(row.encoding,'base64');assert.equal(row.git_blob,sourceBlobs[row.path],'pinned inventory');assert(!pinned[row.path],'duplicate source file');const bytes=Buffer.from(row.content,'base64');assert.equal(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),row.git_blob,'pinned bytes '+row.path);pinned[row.path]=bytes;}
 assert.deepEqual(Object.keys(pinned).sort(),Object.keys(sourceBlobs).sort(),'complete source inventory');
 const app='src/apps/evolution-timeline/';assert.deepEqual(fs.readdirSync(path.join(root,app)).sort(),Object.keys(expected).sort(),'complete current inventory');
 const current={};for(const name of Object.keys(expected)){current[name]=name in overrides?overrides[name]:readRegular(root,app+name);if(verifyBytes)assert.equal(sha(current[name]),expected[name],'unreviewed current bytes '+name);}
 assert.equal(current['styles.css'],pinned['styles.css'].toString(),'complete source stylesheet');
 const staticReview=py({mode:'static',old:pinned['index.html'].toString(),new:current['index.html']});
 const bridge=overrides.bridge??readRegular(root,'src/shared/knowledge/evo-interface.js');
 const old=runtime(pinned['index.html'].toString(),'',pinned['app.js'].toString());
 assert.equal(bridge,'// Read-only interface 1.0.0 from pinned upstream EVO v11.\nwindow.EVO_APPROVED_DATA=Object.freeze('+JSON.stringify(old.data)+');\n','entire source-derived read-only data interface');
 const actual=runtime(current['index.html'],bridge,current['app.js']);
 assert.deepEqual(actual.data,old.data,'all five complete independent source data collections');
 const common=['earthDayHtml','quickSummaryHtml','closingAccordion','esc','detailsHtml','card','applyVisibility','configureStoryAccordions','configureClosingAccordions'];
 for(const name of common)assert.equal(actual.fn(name),old.fn(name),'complete original behavior '+name);
 for(const [fn,target] of [['renderStory','storyView'],['renderTools','toolsView'],['renderTime','timeView']]){
  const original=old.fn(fn),adapted=actual.fn(fn);let restored=adapted.replace('renderApprovedMarkup('+target+',`',target+'.innerHTML=`');
  if(fn==='renderStory')restored=restored.replace('`);\n applyVisibility();','`;\n applyVisibility();');
  if(fn==='renderTools')restored=restored.replace(/`\);\}$/, '`;}');
  if(fn==='renderTime')restored=restored.replace(/`\)\}$/, '`}');
  assert.equal(restored,original,'complete original template '+fn);
 }
 assert.equal(sha(actual.fn('renderApprovedMarkup')),'ba4443095998ef4f6a31ed17bd10c26c7d0b7b961b5697e8cb9d5b6a7cbda943','reviewed inert markup adapter');
 assert.equal(normalizedCode(current['app.js'],actual,true),normalizedCode(pinned['app.js'].toString(),old,false),'complete executable outside enumerated data/render/worker/reveal migration');
 const probe=vm.runInContext(`const auditProbe=document.createElement('section');renderApprovedMarkup(auditProbe,'<p onclick="bad()">safe<script>bad()</script><iframe></iframe><object></object><embed><a href="javascript:bad()" onmouseover="bad()">kept</a></p>');auditProbe`,actual.context);
 assert.equal(probe.querySelectorAll('script,iframe,object,embed').length,0,'inert adapter strips executable elements');
 for(const element of probe.querySelectorAll('*'))for(const attr of element.attributes)assert(!/^on/i.test(attr.name)&&!((attr.name==='href'||attr.name==='src')&&/^\s*javascript:/i.test(attr.value)),'inert adapter strips executable attributes');

 const viewTrees={};
 for(const id of ['storyView','timeView','toolsView']){viewTrees[id]={pinned:canonical(old.view(id)),current:canonical(actual.view(id))};assert.deepEqual(viewTrees[id].current,viewTrees[id].pinned,'complete rendered view '+id);}
 const originalEvents=[...old.data.early,...Object.values(old.data.groups).flatMap(group=>group.events)];assert.equal(originalEvents.length,35);
 const manifest=JSON.parse(current['manifest.json']);assert.equal(manifest.app_id,'evolution-timeline');assert.equal(manifest.source_repository,fixture.repository);assert.equal(manifest.source_commit,commit);assert.equal(manifest.publication_review,'pending');
 assert.equal(manifest.integration.development_remains_independent,true);assert.equal(manifest.integration.snapshot_commit,commit);assert.deepEqual(manifest.knowledge,['evo-evolution-knowledge']);assert.deepEqual(manifest.cross_links,[]);
 assert.deepEqual(manifest.offline_assets.slice().sort(),['apps/evolution-timeline/app.js','apps/evolution-timeline/index.html','apps/evolution-timeline/styles.css','shared/media/asset-7020f164e3928edc--icon-192.png'].sort(),'complete offline app inventory');assert.deepEqual(manifest.media,['asset-7020f164e3928edc']);
 const records=JSON.parse(overrides.knowledge??readRegular(root,'src/shared/knowledge.json')).records;const knowledge=records.find(record=>record.id==='evo-evolution-knowledge');assert(knowledge);assert.equal(knowledge.source_repository,fixture.repository);assert.equal(knowledge.source_commit,commit);assert.equal(knowledge.interface_version,'1.0.0');assert.equal(knowledge.sections.length,35);
 const contract=overrides.contract??readRegular(root,'src/core/app-contract.js');
 const assign=contract.split('\n').find(line=>line.startsWith('function assignSectionIDs()'));assert(assign,'actual shared section assignment missing');actual.context.manifest=manifest;vm.runInContext(assign+';assignSectionIDs();',actual.context,{timeout:3000});
 const eventCards=actual.document.querySelectorAll('.event-accordion');assert.equal(eventCards.length,35);const ids=new Set();
 for(const [index,event] of originalEvents.entries()){
  const section=manifest.sections.find(s=>s.title===event.title),entry=knowledge.sections.find(s=>s.title===event.title);assert(section&&entry,'all source event search rows');assert.equal(section.id,entry.id);assert(!ids.has(section.id),'duplicate event ID');ids.add(section.id);
  const expectedText=[event.summary,event.why,event.uncertainty,...event.details||[]].filter(Boolean).join(' ');assert.equal(entry.text,expectedText,'complete source scientific search text '+event.title);assert.equal(entry.date,event.date);assert.deepEqual(entry.aliases,[event.date]);assert.equal(entry.owner,'evolution-timeline');
  const cards=eventCards.filter(card=>norm(card.querySelector('.event-title').textContent)===norm(event.title));assert.equal(cards.length,1,'unique source rendered destination');assert.equal(cards[0].id,section.id,'actual shared contract assigned event destination');
  assert.equal(section.id,'evo-'+event.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),'source-derived permanent event ID');
 }
 assert.deepEqual(manifest.sections.map(s=>s.id).sort(),['How-to-read-the-app',...ids].sort(),'complete manifest destinations');
 const principle=actual.document.getElementById('How-to-read-the-app');assert.equal(norm(manifest.sections.find(s=>s.id===principle.id).text),norm(textTokens(principle.parentElement)),'complete static search text');
 // Execute all inherited modes and both native disclosure ownership policies.
 for(const view of ['time','tools','story','tools','time','story']){
  old.buttons().find(b=>b.dataset.view===view).click();actual.buttons().find(b=>b.dataset.view===view).click();
  for(const name of ['story','time','tools'])assert.equal(actual.view(name+'View').hidden,old.view(name+'View').hidden,'native mode selection');
  assert.deepEqual(actual.buttons().map(canonical),old.buttons().map(canonical),'native active mode buttons');
 }
 const oldLineages=old.document.querySelectorAll('.story-accordion'),newLineages=actual.document.querySelectorAll('.story-accordion');assert.equal(oldLineages.length,3);
 for(let i=0;i<3;i++){oldLineages[i].open=true;newLineages[i].open=true;assert.deepEqual(newLineages.map(n=>n.open),oldLineages.map(n=>n.open));}
 assert.deepEqual(newLineages.map(n=>n.open),[true,true,true],'independent native lineage disclosure');
 const oldTools=old.document.querySelectorAll('.closing-accordion'),newTools=actual.document.querySelectorAll('.closing-accordion');assert.equal(oldTools.length,4);
 for(let i=0;i<4;i++){oldTools[i].open=true;newTools[i].open=true;assert.deepEqual(newTools.map(n=>n.open),oldTools.map(n=>n.open),'native mutually exclusive tools');assert.equal(newTools.filter(n=>n.open).length,1);}
 for(const [index,card] of eventCards.entries()){const oldCard=old.document.querySelectorAll('.event-accordion')[index];oldCard.open=true;card.open=true;assert.equal(card.open,oldCard.open);const oldMore=oldCard.querySelector('.details'),more=card.querySelector('.details');oldMore.open=true;more.open=true;assert.deepEqual(canonical(more),canonical(oldMore),'complete nested Learn More disclosure');}
 const iconRelative='src/shared/media/asset-7020f164e3928edc--icon-192.png';const iconPath=path.join(root,iconRelative);readRegular(root,iconRelative);const icon=fs.readFileSync(iconPath);assert.deepEqual(icon,pinned['icons/icon-192.png'],'exact independently pinned icon bytes');
 const catalog=JSON.parse(overrides.catalog??readRegular(root,'src/shared/media/catalog.json'));const mediaRows=catalog.assets.filter(asset=>asset.asset_id==='asset-7020f164e3928edc');assert.equal(mediaRows.length,1,'unique exact media registration');const asset=mediaRows[0];assert.equal(asset.path,iconRelative.slice(4));assert.equal(asset.sha256,sha(icon));assert.equal(asset.source_repository,fixture.repository);assert.equal(asset.source_commit,commit);assert.equal(asset.source_path,'icons/icon-192.png');assert.equal(asset.offline,true);assert.equal(asset.permission,'owner-approved-v1');assert.equal(asset.permission_evidence,'Owner confirmed all V1 image permissions on 2026-10-12.');assert(asset.uses.some(use=>use.app_id==='evolution-timeline'&&use.source_path==='icons/icon-192.png'));
 let navigation={complete:false,reason:'explicitly excluded for source-only review'};
 if(includeNavigation){
  const navSource=readRegular(root,'src/core/section-navigation.js');assert(navSource.includes('mba:reveal-section'));
  const {createSectionNavigator}=await import(pathToFileURL(path.join(root,'src/core/section-navigation.js')).href+'?timeline-audit='+sha(navSource));
  const location={hash:''};const navigate=createSectionNavigator({document:actual.document,location,escape:value=>value});let count=0;
  for(const section of manifest.sections){actual.buttons().find(b=>b.dataset.view==='tools').click();location.hash='#'+section.id;assert.equal(navigate(),true);const target=actual.document.getElementById(section.id);assert(target.scrolled);const focus=target.tagName==='DETAILS'?target.querySelector('summary'):target;assert(focus.focused);assert.equal(navigate(),false);count++;}
  for(const mode of ['time','tools','story']){location.hash='#'+mode+'View';assert.equal(navigate(),true);assert.equal(actual.view(mode+'View').hidden,false);count++;}
  navigation={complete:true,targets:count,section_navigator_sha256:sha(navSource),focus_scroll_verified:true,one_shot_verified:true};
 }
 return {schema_version:1,app_id:manifest.app_id,source_repository:fixture.repository,source_commit:commit,source_inventory:sourceBlobs,current_inventory:Object.fromEntries(Object.entries(current).map(([name,bytes])=>[name,sha(bytes)])),shared_interface_sha256:sha(bridge),app_contract_sha256:sha(contract),actual_assign_section_ids:true,rendered_view_sha256:Object.fromEntries(Object.entries(viewTrees).map(([id,trees])=>[id,{pinned:sha(JSON.stringify(trees.pinned)),current:sha(JSON.stringify(trees.current))}])),shared_knowledge_sha256:sha(overrides.knowledge??readRegular(root,'src/shared/knowledge.json')),source_files:11,current_files:4,full_static_document:staticReview.equal,full_original_css:true,full_executable_scope:true,inert_adapter_security_probe:true,full_scientific_data_collections:5,complete_rendered_views:3,source_events:35,event_search_rows:35,manifest_destinations:36,native_modes:3,independent_lineages:3,mutually_exclusive_tools:4,event_and_learn_more_disclosures:35,exact_pinned_icon:true,offline_app_assets:4,navigation,current_byte_guard:verifyBytes,approval_granted:false,...(includeTrees?{rendered_view_trees:viewTrees}:{}),
  migration_scope:['Five exact source data initializers moved to the single shared read-only interface.','Three approved template innerHTML assignments replaced with the byte-bound inert parsing helper; complete outputs match independently parsed source trees.','Standalone worker/manifest replaced by Hub ownership; icon relocated byte-for-byte, Hub return isolated, one heading receives stable ID, shared scripts and maintenance-hiding style added.','Fourteen-line app-owned reveal adapter selects the existing mode before core opens/focuses the target.'],
  exclusions:['The35 canonical source-derived search records retain the existing schema summary/why/uncertainty/details/date; flow fields remain in complete rendered source trees, not newly indexed.',
   'Archived v10/v11 ZIPs, README, gitattributes, source512icon and standalone worker/manifest are inventoried byte-for-byte but are not current runtime dependencies.','No full native-browser parsing, layout, storage/performance or physical-device lifecycle is claimed.','Original static aria-label Two timeline views is preserved although three buttons exist; no editorial correction is introduced.'],limitations:['lxml plus bounded DOM/event execution, not native-browser acceptance.','Independent scientific/editorial approval, image permission adjudication, physical acceptance and deployment authorization remain separate.']};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const index=process.argv.indexOf('--root');process.stdout.write(JSON.stringify(await reviewEvolutionTimeline({root:index<0?packageRoot:process.argv[index+1]}),null,2)+'\n');
}
