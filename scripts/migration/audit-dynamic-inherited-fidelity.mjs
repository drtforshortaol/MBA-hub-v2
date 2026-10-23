#!/usr/bin/env node
// Independently reviewed inherited-content evidence; never changes approval flags.
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2),index=args.indexOf('--sources-dir');
if(index<0||!args[index+1])throw Error('Usage: node scripts/migration/audit-dynamic-inherited-fidelity.mjs --sources-dir PATH [--output PATH]');
const sourceDir=path.resolve(args[index+1]);process.chdir(root);
const sha=b=>createHash('sha256').update(b).digest('hex');const read=p=>fs.readFileSync(p);
const ids=['information-center','aquarium-library-explorer','mmc-narrations'];
const prov=JSON.parse(read('config/migration-provenance.json'));
const reviewedFiles={
  "src/apps/information-center/app.js": "a17fdc8fc37fe3cafb77e22ee675b0d5e5cd6eca58c1c2011549751a4780ccef",
  "src/apps/information-center/data.js": "3503d6ed30b7f1bf70a31bc8cab63a462bc453e4a9742ce29135850e5ce0a164",
  "src/apps/information-center/index.html": "a422da4397c337161fbbbe5742b505417d282373e44b53d8093b9cdfd08f2324",
  "src/apps/information-center/manifest.json": "da217d1fa637f786ea60b14dca3f196213a1b332bc5b4f8e686cc675b43aa123",
  "src/apps/information-center/styles.css": "0ca2a7a5fb8ba77698cb6261cba60b29a8f0a1516729d251c4dd641d46523468",
  "src/apps/aquarium-library-explorer/index.html": "763447eba9155035b3d8ad1a0d12ddf51da915ad6b5d8491e9671d76d83f4b93",
  "src/apps/aquarium-library-explorer/library-data.js": "35bd9bf0e106633c226982d20453f591a63eca20393cd81a5981b887bc4febe3",
  "src/apps/aquarium-library-explorer/manifest.json": "c32cb42c056cee5d16d3641e315bdeeacbb0137129fd34423b4c1f2646f7cc84",
  "src/apps/mmc-narrations/app.js": "045212e49863b65ef23fad7e3fd39a5af81343680b650f962599fb49155bb4dc",
  "src/apps/mmc-narrations/apps.js": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "src/apps/mmc-narrations/data.js": "0b7f8a902968518dd623bd4be042d1e331da3507ce17b8d9b2c7c38d804a70f4",
  "src/apps/mmc-narrations/index.html": "7cb897b58a6e2939ea5de46e100969bc18cab94b0e315f2ce0d47e652a3e0db0",
  "src/apps/mmc-narrations/manifest.json": "a5312fc15eea14e12e0ccf6dc831b3dbe20469318f49eedc0fc9b364b6956262",
  "src/apps/mmc-narrations/styles.css": "481a5fd4100211ceb7bfca202b4e82f080cc52c9d7da2aeda57849982eb8effd"
};
// Reject both changed reviewed bytes and newly added app-local files.
for(const id of ids){const paths=fs.readdirSync(`src/apps/${id}`).map(f=>`src/apps/${id}/${f}`).sort();
 assert.deepEqual(paths,Object.keys(reviewedFiles).filter(p=>p.startsWith(`src/apps/${id}/`)).sort(),'Unreviewed app-local file set: '+id);
 for(const p of paths)assert.equal(sha(read(p)),reviewedFiles[p],'Stale reviewed source bytes: '+p);
 const app=prov.apps.find(a=>a.app_id===id);assert(app);
 const repo=sourceDir+'/fidelity-'+app.source_repository.split('/')[1];
 assert.equal(execFileSync('git',['-C',repo,'rev-parse',app.source_commit+'^{commit}'],{encoding:'utf8'}).trim(),app.source_commit);
}
const pinned=(repo,commit,p)=>execFileSync('git',['-C',sourceDir+'/fidelity-'+repo,'show',commit+':'+p],{encoding:'utf8'});

function verifyData(){
let report={source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),apps:[]};
for(const id of ids){const p=prov.apps.find(a=>a.app_id===id),repo=sourceDir+'/fidelity-'+p.source_repository.split('/')[1],folder=id==='aquarium-library-explorer'?'':`apps/${id}/`;const pinned=f=>execFileSync('git',['-C',repo,'show',p.source_commit+':'+folder+f]);const datafile=id==='aquarium-library-explorer'?'library-data.js':'data.js';const current=read(`src/apps/${id}/${datafile}`);assert.equal(sha(current),sha(pinned(datafile)));const window={};vm.runInNewContext(current.toString(),{window});const m=JSON.parse(read(`src/apps/${id}/manifest.json`));const out={app_id:id,pinned_commit:p.source_commit,data_sha256:sha(current),dataset_exact:true,sections:m.sections.length,media:[],files:[]};
for(const file of fs.readdirSync(`src/apps/${id}`)){const path=`src/apps/${id}/${file}`;if(!fs.statSync(path).isFile())continue;const sourceExists=execFileSync('git',['-C',repo,'ls-tree','--name-only',p.source_commit,'--',folder+file],{encoding:'utf8'}).trim();out.files.push({path,sha256:sha(read(path)),pinned_sha256:sourceExists?sha(pinned(file)):null,review:'Complete source/current diff reviewed; see docs/INHERITED_DYNAMIC_THREE_RECONCILIATION_20261022.md'});}
for(const mid of m.media){const a=prov.media.find(a=>a.asset_id===mid);assert(a);const r=sourceDir+'/fidelity-'+a.source_repository.split('/')[1];const b=execFileSync('git',['-C',r,'show',a.source_commit+':'+a.source_path],{maxBuffer:20*1024*1024});assert.equal(sha(b),sha(read('src/'+a.path)));out.media.push({asset_id:mid,pinned_path:a.source_path,sha256:sha(b),exact:true});}
const check=(s,values)=>values.filter(v=>typeof v==='string'&&v).forEach(v=>assert(s.text.includes(v),`${id}: ${v}`));
if(id==='information-center'){const d=window.IC_SECTIONS;assert.equal(d.length,18);assert.equal(d.reduce((n,s)=>n+s.content.length,0),47);for(const s of d){const t=m.sections.find(t=>t.id==='card-'+s.id);assert(t);check(t,[s.title,...s.content.flatMap(b=>[b.text,b.heading,...(b.items||[]),...(b.cards||[]).flatMap(c=>[c.label,c.value,c.note])])]);}assert.equal(sha(pinned('styles.css')),sha(read(`src/apps/${id}/styles.css`)));out.blocks=47;out.css_exact=true;}
if(id==='aquarium-library-explorer'){const d=window.LIBRARY_DATA;assert.equal(d.length,95);assert.equal(d.filter(b=>!b.wishlist).length,78);for(const b of d){const s=m.sections.find(s=>s.title===b.title);assert(s);check(s,[b.title,b.author,b.owner,b.description,b.borrowed,...b.tags]);if(b.wishlist){assert.equal(s.query.view,'wishlist');assert.equal(s.query.book,b.title);assert.equal(s.query.section,s.id);}}const css=x=>x.toString().match(/<style>([\s\S]*?)<\/style>/)[1];assert.equal(css(pinned('index.html')),css(read(`src/apps/${id}/index.html`)));out.holdings=78;out.wishlist=17;out.css_exact=true;}
if(id==='mmc-narrations'){const d=window.MMC_NARRATIONS_DATA;for(const s of d.sections){const t=m.sections.find(t=>t.id===s.id);assert(t);check(t,[s.title,s.category,s.summary,...s.body,...s.prompts,...s.tags]);}const t=m.sections.find(s=>s.id==='referencesTitle');for(const r of d.references)check(t,[r.label,r.note]);assert.equal(sha(pinned('styles.css')),sha(read(`src/apps/${id}/styles.css`)));out.cards=d.sections.length;out.references=d.references.length;out.css_exact=true;function n(tag=''){return {tag,children:[],dataset:{},textContent:'',attrs:{},appendChild(c){this.children.push(c);return c;},replaceChildren(){this.children=[];},setAttribute(k,v){this.attrs[k]=v;},set innerHTML(v){assert.equal(v,'');this.children=[];}};}function render(js){const nodes=Object.fromEntries(['dropdownContainer','referencesList'].map(id=>[id,n('container')]));vm.runInNewContext(js.toString(),{window:{MMC_NARRATIONS_DATA:d},document:{getElementById:id=>nodes[id]||null,createElement:n},navigator:{}});return JSON.stringify(nodes);}assert.equal(render(pinned('app.js')),render(read(`src/apps/${id}/app.js`)));out.pinned_current_render_trees_equal=true;}
assert.equal(m.publication_review,'pending');out.source_approval_unchanged=true;out.search_all_authored_fields=true;report.apps.push(out);}
return report;
}
function verifyRendering(){
const read=p=>fs.readFileSync(p,'utf8');
const pcommit='5c219508d23255080f6b050cefa8092905447d81';
function node(tag=''){return {tag,tagName:tag.toUpperCase(),children:[],attributes:{},dataset:{},style:{},textContent:'',value:'',append(...ns){ns.forEach(n=>this.appendChild(n));},appendChild(n){n.parentElement=this;this.children.push(n);return n;},replaceChildren(...ns){this.children=[];this.append(...ns);},setAttribute(k,v){this.attributes[k]=v;},addEventListener(){},get innerHTML(){return this._html||'';},set innerHTML(v){this.children=[];this._html=v;}};}
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function serialize(n){if(n.tag==='text')return escape(n.textContent);if(n.tag==='br')return '<br>';const attrs=n.className?' class="'+n.className+'"':'';return `<${n.tag}${attrs}>`+escape(n.textContent)+(n._html||'')+n.children.map(serialize).join('')+`</${n.tag}>`;}
// Compare parsed structural element/class tokens and decoded text independently.
// Ignore whitespace-only nodes and anchor wrappers (the sole phone enhancement).
function canonical(html){return execFileSync('python3',['-c',`import sys,json
from html.parser import HTMLParser
class P(HTMLParser):
 def __init__(self): super().__init__(convert_charrefs=True);self.out=[]
 def handle_starttag(self,t,a):
  if t!='a': self.out.append(['open',t,dict(a).get('class','')])
 def handle_endtag(self,t):
  if t!='a': self.out.append(['close',t])
 def handle_data(self,s):
  if s.strip():
   if self.out and self.out[-1][0]=='text':self.out[-1][1]+=s
   else:self.out.append(['text',s])
p=P();p.feed(sys.stdin.read());print(json.dumps([[v[0],' '.join(v[1].split())] if v[0]=='text' else v for v in p.out],ensure_ascii=False))`],{input:html,encoding:'utf8'}).trim();}
const w={};vm.runInNewContext(read('src/apps/information-center/data.js'),{window:w});const current=vm.createContext({window:w,document:{addEventListener(){},createElement:node,createTextNode:s=>Object.assign(node('text'),{textContent:s})}});vm.runInContext(read('src/apps/information-center/app.js'),current);const prior=vm.createContext({window:w,document:{addEventListener(){}}});vm.runInContext(pinned('MBA-hub',pcommit,'apps/information-center/app.js'),prior);
let ic=[];for(const section of w.IC_SECTIONS){current.section=section;current.parent=node('root');prior.section=section;vm.runInContext('appendSection(parent,section)',current);const before=vm.runInContext('renderSection(section)',prior),after=serialize(current.parent.children[0]);assert.equal(canonical(after),canonical(before),'IC '+section.id);ic.push(section.id);}
// Library: execute both complete inline renderers at their default and Wishlist views.
const libraryData=read('src/apps/aquarium-library-explorer/library-data.js');const oldHTML=pinned('aquarium-shift-library-','9438060bd836c46245e4af45c280e4bb37b0ab94','index.html');const currentHTML=read('src/apps/aquarium-library-explorer/index.html');
function library(html,view){const controls=Object.fromEntries(['q','category','az','list','count','library-view'].map(id=>[id,node('div')]));const ctx=vm.createContext({window:{},document:{getElementById:id=>controls[id],createElement:node,createTextNode:t=>Object.assign(node('text'),{textContent:t})},location:{search:'',pathname:'/',hash:''},navigator:{},history:{replaceState(){}},URLSearchParams});vm.runInContext(libraryData,ctx);ctx.LIBRARY_DATA=ctx.window.LIBRARY_DATA;vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);if(view)vm.runInContext('active="Wishlist";render()',ctx);return {html:controls.list._html||controls.list.children.map(serialize).join(''),count:controls.count.textContent};}
const libraryChecks=[];for(const view of ['', 'Wishlist']){const old=library(oldHTML,view),now=library(currentHTML,view);assert.equal(now.count,old.count);assert.equal(canonical(now.html),canonical(old.html),'Library '+view);libraryChecks.push({view:view||'default',count:now.count});}
const result={information_center_structural_text_equality_ignoring_phone_anchor_wrappers:ic.length,library_structural_text_equality:libraryChecks,limitations:'Lightweight DOM/script comparison; no browser layout or physical device acceptance.'};return result;
}
const report={schema_version:1,scope:'Engineering review of unchanged inherited content; no new scientific, image, physical-device or release approval',...verifyData(),rendering:verifyRendering(),reviewed_current_files:reviewedFiles};
const outputIndex=args.indexOf('--output');if(outputIndex>=0){if(!args[outputIndex+1])throw Error('Missing output path');fs.writeFileSync(path.resolve(args[outputIndex+1]),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
