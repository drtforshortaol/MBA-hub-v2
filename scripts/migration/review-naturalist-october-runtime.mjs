// Execute the current October addition with base data and the complete app.
// Engineering coverage only: neither content approval nor native-browser QA.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createNaturalistDOM} from './naturalist-fidelity-dom.mjs';
const packageRoot=fileURLToPath(new URL('../../',import.meta.url));
const directory='src/apps/naturalist-field-notes/';
const id='2026-10-15-seahorse';
const norm=s=>s.replace(/\s+/g,' ').trim();
const sha=s=>createHash('sha256').update(s).digest('hex');
export function reviewNaturalistOctober({root=packageRoot,overrides={}}={}){
 const read=name=>overrides[name]??fs.readFileSync(path.join(root,directory,name),'utf8');
 const files=Object.fromEntries(['index.html','data.js','october-2026-note.js','app.js','manifest.json'].map(n=>[n,read(n)]));
 const manifest=JSON.parse(files['manifest.json']);
 // Read actual authored script order. Fail if an unknown classic script appears.
 const scripts=[...files['index.html'].matchAll(/<script\b([^>]*)><\/script>/g)].filter(([,attrs])=>!attrs.includes('type="module"')).map(([,attrs])=>attrs.match(/src="([^"?]+)/)?.[1]);
 assert.deepEqual(scripts,['data.js','october-2026-note.js','app.js'],'current classic script loading order');
 const fixture=query=>{
  const dom=createNaturalistDOM(files['index.html']);
  const location={href:'https://example.test/v2/apps/naturalist-field-notes/index.html'+query,search:query};
  const update=url=>{const u=new URL(url);location.href=u.href;location.search=u.search;};
  const context=vm.createContext({...dom,URL,URLSearchParams,location,navigator:{},window:{location,scrollTo(){}},history:{replaceState(_a,_b,url){update(String(url));}},console});
  // Separate evaluations preserve the classic-script global lexical environment.
  for(const script of scripts)vm.runInContext(files[script],context,{timeout:3000});
  const call=s=>vm.runInContext(s,context,{timeout:3000});
  return {...dom,location,call,notes:JSON.parse(call('JSON.stringify(FIELD_NOTES)')),content:()=>dom.document.getElementById('content')};
 };
 const initial=fixture('');
 assert.equal(initial.notes.length,25,'original archive plus one October note');
 assert.equal(new Set(initial.notes.map(n=>n.id)).size,25,'unique issue identities');
 const added=initial.notes.find(n=>n.id===id);assert(added,'current October note');
 assert.equal(initial.document.querySelectorAll('.qna-direct').length,41,'38 original plus 3 October Q&A');
 const latest=initial.document.querySelector('.latest');
 assert.equal(latest.querySelector('.issue-open').dataset.id,id,'latest issue routes to October addition');
 const issueButtons=initial.document.querySelectorAll('.issue-open').filter(e=>e.dataset.id===id);
 assert.equal(issueButtons.length,7,'October latest/archive/Q&A/Bay Watch/species source buttons');
 const openingButton=issueButtons[0];openingButton.click();
 assert.equal(new URL(initial.location.href).searchParams.get('note'),id,'bound October button updates route');
 verifyArticle(initial,added);
 initial.document.querySelector('[data-back]').click();
 assert.equal(new URL(initial.location.href).searchParams.has('note'),false,'bound Back clears route');
 assert(initial.document.querySelector('.home-intro'),'bound Back restores Home');
 const direct=fixture('?note='+id);verifyArticle(direct,added);
 const imagePaths=added.observations.flatMap(o=>o.photos||[]).map(p=>p.src);
 assert.deepEqual(imagePaths,['../IMG_4207.jpeg','../IMG_4208.jpeg','../IMG_4209.jpeg','../IMG_4210.jpeg'],'complete October image set');
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'src/shared/media/catalog.json'),'utf8'));
 for(const relative of imagePaths){
  const imagePath=path.posix.normalize('apps/naturalist-field-notes/'+relative);
  const rows=catalog.assets.filter(a=>a.path===imagePath);assert.equal(rows.length,1,'one media catalog record '+imagePath);
  assert.equal(rows[0].permission,'review-required','October permission remains pending');
  assert(manifest.media.includes(rows[0].asset_id),'manifest media identity '+imagePath);
  assert(manifest.offline_assets.includes(imagePath),'offline declaration '+imagePath);
  assert(fs.statSync(path.join(root,'src',imagePath)).isFile(),'local October resource '+imagePath);
 }
 let searches=0;
 for(const query of ['ephyra','CA51As','Hippocampus abdominalis']){
  const input=initial.document.getElementById('search');input.value=query;input.dispatchEvent({type:'input',isTrusted:true});
  const expected=initial.notes.filter(n=>JSON.stringify(n).toLowerCase().includes(query.toLowerCase())).map(n=>n.id);
  assert.deepEqual(initial.document.querySelectorAll('.issue-open').map(b=>b.dataset.id),expected,'full current search '+query);
  assert(expected.includes(id),'October discoverability '+query);
  initial.document.querySelectorAll('.issue-open').find(b=>b.dataset.id===id).click();verifyArticle(initial,added);
  initial.document.getElementById('clearSearch').click();
  assert.equal(initial.document.getElementById('search').value,'');assert(initial.document.querySelector('.home-intro'));
  searches++;
 }
 assert.equal(manifest.publication_review,'pending','whole-app publication review remains pending');
 const section=manifest.sections.find(s=>s.id==='note-'+id);assert(section,'stable October destination');
 assert.deepEqual(section.query,{note:id},'October destination query');
 return {schema_version:1,app_id:manifest.app_id,current_inventory:Object.fromEntries(Object.entries(files).map(([n,s])=>[n,sha(s)])),
  current_classic_script_order:scripts,current_notes:25,current_QA:41,october_source_buttons:issueButtons.length,authored_october_fields:true,
  direct_query_startup:true,bound_issue_and_back:true,search_cases:searches,october_photos:4,
  approval_granted:false,whole_app_inheritance:false,limitations:['Independent lxml trees and bounded synchronous events, not native browser layout or service-worker acceptance.','Current added data is exercised as authored, without scientific/editorial or image-rights approval.','Shared app-contract module and separate October HTML page are outside this runtime check.']};
}
function verifyArticle(f,n){
 const article=f.document.querySelector('.article');assert(article,'October article rendered');
 assert.equal(article.querySelector('h2').textContent,n.title,'October title');
 assert.deepEqual(article.querySelectorAll('.stat').map(e=>e.textContent),n.summary,'complete October summary');
 for(const o of n.observations){
  const sections=article.querySelectorAll('.article-section');const section=sections.find(s=>s.querySelector('h3')?.textContent===o.title);
  assert(section,'October observation '+o.title);assert.equal(section.querySelector('p').textContent,o.text,'October observation body');
 }
 const photos=n.observations.flatMap(o=>o.photos||[]);
 assert.deepEqual(article.querySelectorAll('img').map(e=>[e.getAttribute('src'),e.getAttribute('alt'),e.getAttribute('loading')]),photos.map(p=>[p.src,p.alt,'lazy']),'complete October photos');
 assert.deepEqual(article.querySelectorAll('figcaption').map(e=>e.textContent),photos.map(p=>p.caption),'pending photo captions preserved');
 assert.deepEqual(article.querySelectorAll('.qna').map(e=>[e.querySelector('h3').textContent,e.querySelector('p').textContent]),n.qa.map(q=>[q.q,q.short]),'complete October visitor answers');
 assert.deepEqual(article.querySelectorAll('.bayitem').map(e=>norm(e.textContent)),n.bay.map(b=>'• '+b),'complete October Bay Watch');
 const highlight=n.highlights[0];const species=article.querySelectorAll('.article-section').find(s=>s.querySelector('h3')?.textContent===highlight.name);
 assert(species,'October species highlight');assert.equal(species.querySelector('a').getAttribute('href'),highlight.url,'dedicated species route');
 assert.deepEqual(species.querySelectorAll('p').map(e=>e.textContent),[highlight.scientific,highlight.intro,...highlight.facts.map(s=>'• '+s)],'complete October species content');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))process.stdout.write(JSON.stringify(reviewNaturalistOctober(),null,2)+'\n');
