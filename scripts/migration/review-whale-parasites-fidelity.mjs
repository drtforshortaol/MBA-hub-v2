// Full pinned/current engineering reproduction for Whale Parasites & Associates.
// lxml supplies independent full HTML trees; this bounded DOM executes the actual
// renderers and shared navigator. No native layout, science or rights approval.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
const packageRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const prefix='apps/whale-parasites-associates/';
const commit='5c219508d23255080f6b050cefa8092905447d81';
const expected={
 'app.js':'b5d2622f00886b96d72288a7312c460ca473b3f8d8043f215e13e9cf3716d8c9',
 'data.js':'eba6c75c2e079c0b04df1634b324489113f2ee8e790a0f23d2a0ab3accfa2954',
 'index.html':'f04e8ed22ac8f63aee8b248fcafb506b0a58cb30b1f5deb203cdbd0b69c89ed5',
 'manifest.json':'8b49ff2f0d44dd893094ed1e95590eadf111d971958f375be87241afe2fdef77',
 'styles.css':'334352605e15c2a06101069a7663860cfe8842398846eab55c69c41d6a7d6383'
};
const sourceBlobs={
 'CHANGELOG.txt':'17c5f8fed9a711035c8ba3471d8282887a6ebc82',
 'README.md':'6db029f5464fd033f4c7773dfa915770172a7b38',
 'app.js':'a20c2538c6a4e9408e49f169eda7dd55b29b17d7',
 'data.js':'f968c77b3078dedca488be29c18e46b84f14a836',
 'how to use this app-template.txt':'bf03f7b7ada65bda3ca34d26f0f9b4481e70f746',
 'images/icon.svg':'787228959e1379c022cf0f7a3edebe29492a97a9',
 'index.html':'32a4d50e8c639c166feee8586b389195e2b98e46',
 'manifest.json':'08690f3c9ca1b5a5d92a45b8f025b3c76942dda6',
 'styles.css':'2046b07abb042861d84eca2511c768da293b96b5',
 'sw.js':'c655fedb6e8f6644cdaf22a961ad4d9d9fa867a9'
};
const sha=b=>createHash('sha256').update(b).digest('hex');
const norm=s=>String(s).replace(/\s+/g,' ').trim();
const textTokens=e=>[e.text,...e.children.flatMap(c=>[textTokens(c),c.tail])].join(' ');
const python=String.raw`
import json,sys
from lxml import html
v=json.load(sys.stdin)
def node(e):
 if not isinstance(e.tag,str): return None
 return {'tag':e.tag.lower(),'attrs':dict(sorted(e.attrib.items())),'text':e.text or '',
 'children':[{'node':n,'tail':c.tail or ''} for c in e if (n:=node(c)) is not None]}
if v['mode']=='fragment':
 root=html.fragment_fromstring(v['html'],create_parent='body')
 print(json.dumps(node(root)))
else:
 old=html.document_fromstring(v['old']);new=html.document_fromstring(v['new'])
 for e in old.xpath('//link[@rel="manifest"]|//link[@rel="preconnect"]|//link[starts-with(@href,"https://fonts.googleapis.com/")]|//script[@src="../../apps.js"]|//script[@src="../../hub-links.js"]'):e.getparent().remove(e)
 for e in new.xpath('//script[@src="../../core/app-contract.js"]|//style'):
  assert e.tag=='script' or e.text=='[data-v2-maintenance-hidden="true"]{display:none!important}', 'unreviewed inline CSS'
  e.getparent().remove(e)
 for ident in ['clearCacheBtn','troubleshootingBtn','updateMessage','troubleshootingPanel','closeTroubleshootingBtn']:
  e=new.get_element_by_id(ident)
  for a in ['data-v2-maintenance-hidden','aria-hidden','disabled']:e.attrib.pop(a,None)
  if ident!='troubleshootingPanel':e.attrib.pop('hidden',None)
 for ident in ['Fast-field-cues','References']:new.get_element_by_id(ident).attrib.pop('id')
 def clean(e):
  n=node(e)
  def walk(n):
   n['text']=' '.join(n['text'].split())
   for key in ['hidden','disabled']:
    if key in n['attrs']:n['attrs'][key]=''
   for c in n['children']:c['tail']=' '.join(c['tail'].split());walk(c['node'])
  walk(n);return n
 assert clean(old)==clean(new), 'complete normalized static document mismatch'
 print(json.dumps({'equal':True,'pinned':clean(old),'current':clean(new)}))
`;
function py(input){const p=spawnSync('python3',['-c',python],{input:JSON.stringify(input),encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout);}
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
  get id(){return this.attrs.id||'';}get open(){return 'open' in this.attrs;}set open(v){if(v)this.attrs.open='';else delete this.attrs.open;}
  get tabIndex(){return this.attrs.tabindex===undefined?(this.tag==='summary'?0:-1):Number(this.attrs.tabindex);}
  get textContent(){return this.text+this.children.map(e=>e.textContent+e.tail).join('');}set textContent(v){this.text=String(v);this.children=[];}
  set innerHTML(value){this.replaceChildren(...parse(value).children);}
  getAttribute(n){return this.attrs[n]??null;}hasAttribute(n){return n in this.attrs;}setAttribute(n,v){this.attrs[n]=String(v);}
  addEventListener(t,f){(this.handlers[t]??=[]).push(f);}click(){this.dispatchEvent({type:'click',bubbles:true});}
  dispatchEvent(e){e.target??=this;for(const fn of this.handlers[e.type]||[])fn(e);if(e.bubbles){if(this.parentElement)this.parentElement.dispatchEvent(e);else document.dispatchEvent(e);}return true;}
  replaceChildren(...children){this.text='';this.children=children;for(const e of children)e.parentElement=this;}
  appendChild(e){e.parentElement=this;this.children.push(e);return e;}
  querySelectorAll(s){return descendants(this).filter(e=>matches(e,s));}querySelector(s){return this.querySelectorAll(s)[0]||null;}
  focus(){this.focused=true;}scrollIntoView(){this.scrolled=true;}
 }
 function descendants(root){return root.children.flatMap(e=>[e,...descendants(e)]);}
 function matches(e,s){if(s.startsWith('.'))return e.classList.contains(s.slice(1));if(s.startsWith('[')){return [...s.matchAll(/\[([^\]=]+)(?:=["']?([^\]"']+)["']?)?\]/g)].every(([,a,v])=>e.hasAttribute(a)&&(v===undefined||e.getAttribute(a)===v));}return e.tag===s;}
 function parse(markup){return new Element(py({mode:'fragment',html:markup}));}
 const root=parse(html),handlers={};
 document={defaultView:{CustomEvent:class{constructor(type,options){this.type=type;Object.assign(this,options);}}},
  getElementById:id=>[root,...descendants(root)].find(e=>e.id===id)||null,
  querySelectorAll:s=>[root,...descendants(root)].filter(e=>matches(e,s)),querySelector(s){return this.querySelectorAll(s)[0]||null;},
  createElement:tag=>new Element({tag,attrs:{},text:'',children:[]}),
  addEventListener(t,f){(handlers[t]??=[]).push(f);},dispatchEvent(e){for(const fn of handlers[e.type]||[])fn(e);}};
 class DOMParser{parseFromString(markup){return {body:parse(markup)};}}
 // Exercise the authored startup listener, rather than rebuilding its intended
 // effects by calling functions ourselves. The old standalone worker is outside
 // this audit; omit that capability and supply empty legacy message storage.
 const relatedCalls=[];
 const context=vm.createContext({document,window:{renderRelatedHubTopics:id=>relatedCalls.push(id)},navigator:{},localStorage:{getItem:()=>null},DOMParser,setTimeout:fn=>fn()});
 vm.runInContext(data+'\n'+script,context,{timeout:3000});
 assert.equal((handlers.DOMContentLoaded||[]).length,1,'one authored startup listener');
 vm.runInContext('document.dispatchEvent({type:"DOMContentLoaded"});',context,{timeout:3000});
 assert.deepEqual(relatedCalls,['whale-parasites-associates'],'startup optional related-topic call');
 return {document,context,records:JSON.parse(vm.runInContext('JSON.stringify(PARASITES)',context)),filters:JSON.parse(vm.runInContext('JSON.stringify(FILTERS)',context)),
  cards:()=>document.querySelectorAll('.card'),tabs:()=>document.querySelectorAll('.filter-tab'),
  fn:name=>vm.runInContext(name+'.toString()',context),visible(){return this.cards().filter(c=>c.dataset.hidden==='false').map(c=>c.id);},
  search(value){document.getElementById('searchInput').value=value;document.getElementById('searchInput').dispatchEvent({type:'input'});},
  filter(id){this.tabs().find(t=>t.dataset.filter===id).click();},
  jump(id){const select=document.getElementById('jumpSelect');select.value=id;select.dispatchEvent({type:'change'});},
  count:()=>document.getElementById('resultCount').textContent};
}
export async function reviewWhaleParasites({root=packageRoot,includeNavigation=true,verifyBytes=true,overrides={}}={}){
 root=path.resolve(root);
 const fixture=JSON.parse(readRegular(packageRoot,'docs/verification/whale-parasites-pinned-source-20261023.json'));
 assert.equal(fixture.repository,'drtforshortaol/MBA-hub');assert.equal(fixture.commit,commit);
 const pinned={};
 for(const row of fixture.files){assert(row.path.startsWith(prefix));const name=row.path.slice(prefix.length);assert(!pinned[name]);assert.equal(row.git_blob,sourceBlobs[name],'source inventory');const bytes=Buffer.from(row.content);assert.equal(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),row.git_blob,'pinned bytes '+name);pinned[name]=row.content;}
 assert.deepEqual(Object.keys(pinned).sort(),Object.keys(sourceBlobs).sort(),'complete pinned inventory');
 const appPath='src/'+prefix.slice(0,-1);const directory=path.join(root,appPath);
 const names=fs.readdirSync(directory);assert.deepEqual(names.sort(),Object.keys(expected).sort(),'complete current inventory');
 const current={};for(const name of names){current[name]=readRegular(root,appPath+'/'+name);if(name in overrides)current[name]=overrides[name];if(verifyBytes)assert.equal(sha(current[name]),expected[name],'unreviewed current bytes '+name);}
 assert.equal(current['data.js'],pinned['data.js'],'complete original dataset');assert.equal(current['styles.css'],pinned['styles.css'],'complete original stylesheet');
 const staticReview=py({mode:'static',old:pinned['index.html'],new:current['index.html']});
 const old=runtime(pinned['index.html'],pinned['data.js'],pinned['app.js']);const actual=runtime(current['index.html'],current['data.js'],current['app.js']);
 assert.equal(old.cards().length,7);assert.equal(old.tabs().length,5);
 assert.deepEqual(actual.records,old.records,'complete data records');assert.deepEqual(actual.filters,old.filters,'complete filters');
 assert.deepEqual(actual.cards().map(canonical),old.cards().map(canonical),'all complete rendered card trees');
 assert.deepEqual(actual.tabs().map(canonical),old.tabs().map(canonical),'all complete rendered filter trees');
 assert.deepEqual(canonical(actual.document.getElementById('jumpSelect')),canonical(old.document.getElementById('jumpSelect')),'all authored jump options');
 for(const fn of ['escapeHTML','normalizeText','setupSearch','applyCardVisibility'])assert.equal(actual.fn(fn),old.fn(fn),'unchanged behavior '+fn);
 for(const [fn,variable,target] of [['buildCards','cardMarkup','cardList'],['buildFilters','filterMarkup','filterTabs']]){
  const restored=actual.fn(fn).replace('const '+variable+' =',target+'.innerHTML =').replace('\n  '+target+'.replaceChildren(...Array.from(new DOMParser().parseFromString('+variable+', "text/html").body.children));','');
  assert.equal(restored,old.fn(fn),'enumerated DOM construction adapter '+fn);
 }
 const restoredJump=actual.fn('buildJumpMenu').replace('    revealParasiteCard(card);','    card.dataset.hidden = "false";\n    card.open = true;');
 assert.equal(restoredJump,old.fn('buildJumpMenu'),'enumerated jump-count adapter');
 for(const fn of ['setupTroubleshooting','restoreUpdateMessage','setupClearCache','registerServiceWorker'])assert.equal(actual.fn(fn),'function '+fn+'() {}','isolated legacy maintenance '+fn);
 const queries=['',' WHALE ','no-such-entry',...old.records.flatMap(r=>[r.name,r.sci,r.tag,r.hostsTitle,r.harm,...r.paragraphs,...r.hosts,...r.facts.flat()])];let combinations=0;
 for(const [filter] of old.filters){old.filter(filter);actual.filter(filter);for(const q of queries){old.search(q);actual.search(q);assert.deepEqual(actual.visible(),old.visible(),'search/filter '+filter+'/'+q);assert.equal(actual.count(),old.count(),'source result count');combinations++;}}
 actual.filter('all');old.filter('all');actual.search('no-such-entry');old.search('no-such-entry');
 for(const record of old.records){old.jump(record.id);actual.jump(record.id);assert.deepEqual(actual.visible(),old.visible(),'inherited jump reveal '+record.id);assert.equal(actual.document.getElementById(record.id).open,true);assert.equal(actual.document.getElementById(record.id).scrolled,true);assert.equal(actual.document.getElementById('jumpSelect').value,'');assert.equal(actual.count(),`${actual.visible().length} entr${actual.visible().length===1?'y':'ies'} shown.`,'corrected truthful jump count');}
 const manifest=JSON.parse(current['manifest.json']);assert.equal(manifest.app_id,'whale-parasites-associates');assert.equal(manifest.source_commit,commit);assert.equal(manifest.source_repository,fixture.repository);assert.equal(manifest.publication_review,'pending');assert.deepEqual(manifest.media,[]);assert.deepEqual(manifest.knowledge,[]);assert.deepEqual(manifest.cross_links,[]);
 assert.deepEqual(manifest.offline_assets.slice().sort(),['app.js','data.js','index.html','styles.css'].map(n=>prefix+n).sort(),'complete offline app inventory');
 assert.deepEqual(manifest.sections.map(s=>s.id).sort(),['Fast-field-cues','References',...old.records.map(r=>r.id)].sort(),'complete stable destinations');
 for(const record of old.records){const section=manifest.sections.find(s=>s.id===record.id);assert.equal(section.title,record.name);for(const value of [record.name,record.sci,record.hostsTitle,record.harm,...record.paragraphs,...record.hosts,...record.facts.flat()])assert(norm(section.text).includes(norm(value)),'complete manifest prose '+record.id);}
 for(const id of ['Fast-field-cues','References']){const heading=actual.document.getElementById(id);assert.equal(norm(manifest.sections.find(s=>s.id===id).text),norm(textTokens(heading.parentElement)),'complete static search '+id);}
 let navigation={complete:false,reason:'Explicitly excluded; combined-root navigation reproduction required'};
 if(includeNavigation){
  const navSource=readRegular(root,'src/core/section-navigation.js');assert(navSource.includes('mba:reveal-section'),'shared reveal contract missing');
  const {createSectionNavigator}=await import(pathToFileURL(path.join(root,'src/core/section-navigation.js')).href+'?whale-audit='+sha(navSource));
  const location={hash:''};const navigate=createSectionNavigator({document:actual.document,location,escape:s=>s});let reveals=0;
  for(const record of old.records){actual.filter('specific');actual.search('no-such-entry');location.hash='#'+record.id;assert.equal(navigate(),true);assert.deepEqual(actual.visible(),[record.id]);assert.equal(actual.count(),'1 entry shown.');const target=actual.document.getElementById(record.id);assert.equal(target.open,true);assert.equal(target.scrolled,true);assert.equal(target.querySelector('summary').focused,true);assert.equal(actual.document.getElementById('searchInput').value,'no-such-entry');assert.equal(navigate(),false,'one-shot mutation replay');reveals++;}
  navigation={complete:true,resolved_cards:reveals,shared_navigator_sha256:sha(navSource),controls_preserved:true,focus_scroll_verified:true,one_shot_verified:true};
 }
 return {schema_version:1,app_id:manifest.app_id,source_repository:fixture.repository,source_commit:commit,source_inventory:Object.fromEntries(Object.keys(pinned).sort().map(n=>[n,sourceBlobs[n]])),current_inventory:Object.fromEntries(Object.keys(current).sort().map(n=>[n,sha(current[n])])),
  current_byte_guard:verifyBytes,complete_static_document:staticReview.equal,complete_stylesheet:true,complete_dataset:true,rendered_cards:7,rendered_filters:5,filter_search_combinations:combinations,jump_targets:7,manifest_destinations:9,offline_app_assets:4,navigation,
  exclusions:['Legacy standalone maintenance/worker and manifest/icon are replaced by Hub ownership.','Removed original external Google font requests; native typography/layout not certified.','No original photo/media is referenced by current app; standalone SVG icon remains inventoried in pinned source.','Related-topic source call is optional; no loaded legacy related renderer is claimed.'],
  approval_granted:false,limitations:['Engineering reproduction uses lxml and bounded event/DOM behavior, not native browser layout or lifecycle.','Scientific/editorial, media-rights, physical device/privacy and deployment approval remain separate.']};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rootArg=process.argv.indexOf('--root');const result=await reviewWhaleParasites({root:rootArg<0?packageRoot:process.argv[rootArg+1]});process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
