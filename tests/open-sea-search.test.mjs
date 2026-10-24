import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const html=fs.readFileSync('src/apps/open-sea/index.html','utf8');
const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const data=vm.runInNewContext(script.slice(0,script.indexOf('const cardListElement'))+';DATA');
const manifest=JSON.parse(fs.readFileSync('src/apps/open-sea/manifest.json','utf8'));
// Independent HTML parser, rather than the renderer or the generation transform.
const plain=markup=>execFileSync('python3',['-c',`from html.parser import HTMLParser
import sys
class Text(HTMLParser):
 def __init__(self): super().__init__(convert_charrefs=True); self.parts=[]
 def handle_data(self,s): self.parts.append(s)
p=Text();p.feed(sys.stdin.read());print(' '.join(' '.join(p.parts).split()),end='')`],{input:markup,encoding:'utf8'});
function element(tag=''){
 const e={tagName:tag.toUpperCase(),nodeType:1,childNodes:[],attributes:{},textContent:'',tabIndex:-1,
 appendChild(n){this.childNodes.push(n);n.parentElement=this;return n;},append(...ns){ns.forEach(n=>this.appendChild(n));},replaceChildren(...ns){this.childNodes=[];this.append(...ns);},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];},hasAttribute(k){return k in this.attributes;},addEventListener(k,f){this[k]=f;},focus(){this.focused=true;},scrollIntoView(){this.scrolled=true;},querySelector(selector){return all(this).find(n=>selector==='[aria-expanded=false]'?n.getAttribute?.('aria-expanded')==='false':n.className===selector.slice(1))||null;}};
 e.classList={contains:c=>(e.className||'').split(' ').includes(c),toggle(c,on){const values=new Set((e.className||'').split(' ').filter(Boolean));if(on)values.add(c);else values.delete(c);e.className=[...values].join(' ');},get length(){return (e.className||'').split(' ').filter(Boolean).length;},*[Symbol.iterator](){yield* (e.className||'').split(' ').filter(Boolean);}};return e;
}
const all=n=>[n,...n.childNodes.flatMap(all)];
function rendered(){const list=element('div');vm.runInNewContext(script,{document:{getElementById:()=>list,createElement:element,createElementNS:(_,tag)=>element(tag),createTextNode:text=>({nodeType:3,textContent:text,childNodes:[]}),createDocumentFragment:()=>element()},Node:{TEXT_NODE:3,ELEMENT_NODE:1},DOMParser:class{parseFromString(body){return {body:{childNodes:[{nodeType:3,textContent:plain(body),childNodes:[]}]}}}}});return list;}
test('all twelve dynamic Open Sea cards index complete source text at existing stable IDs',()=>{
 assert.equal(data.length,12);assert.equal(manifest.sections.length,16);
 for(const item of data){const s=manifest.sections.find(s=>s.id===`card-${item.id}`);assert(s);assert.equal(s.title,plain(item.title));assert.equal(s.text,[item.title,item.subtitle,...item.tags,item.body].map(plain).join(' '));assert(!s.title.includes('&amp;'));}
 assert.equal(manifest.publication_review,'pending');assert.equal(manifest.status,'testing');
});
test('actual Open Sea renderer creates every stable card target with working toggle and ARIA state',()=>{
 const nodes=all(rendered());
 for(const item of data){const card=nodes.find(n=>n.id===`card-${item.id}`);assert(card);const header=card.querySelector('.card-header'),body=card.querySelector('.card-body');assert.equal(header.getAttribute('aria-controls'),body.id);assert.equal(header.getAttribute('aria-expanded'),'false');assert.equal(body.getAttribute('aria-hidden'),'true');
 header.click();assert.equal(header.getAttribute('aria-expanded'),'true');assert.equal(body.getAttribute('aria-hidden'),'false');assert(card.classList.contains('open'));
 header.click();assert.equal(header.getAttribute('aria-expanded'),'false');assert.equal(body.getAttribute('aria-hidden'),'true');assert(!card.classList.contains('open'));}
});
test('both offline search indexes route every dynamic Open Sea card to its real renderer target',()=>{
 for(const environment of ['developer','tester']){const entries=JSON.parse(fs.readFileSync(`dist/${environment}/search-index.json`)).filter(e=>e.app_id==='open-sea');for(const item of data){const entry=entries.find(e=>e.url.endsWith(`#card-${item.id}`));assert(entry,item.id);assert(entry.text.includes(plain(item.body)),item.id);}const release=JSON.parse(fs.readFileSync(`dist/${environment}/release.json`));assert(release.resources.some(r=>r.url==='apps/open-sea/index.html'));}
});
