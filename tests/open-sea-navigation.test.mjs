import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {createSectionNavigator} from '../src/core/section-navigation.js';
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
test('actual Open Sea renderer creates every card target and shared navigation opens, focuses and scrolls it once',()=>{
 for(const item of data){const list=rendered(),nodes=all(list),card=nodes.find(n=>n.id===`card-${item.id}`);assert(card);const header=card.querySelector('.card-header'),body=card.querySelector('.card-body');assert.equal(header.getAttribute('aria-expanded'),'false');
 const location={hash:`#${card.id}`},document={getElementById:id=>nodes.find(n=>n.id===id),querySelector:()=>null,querySelectorAll:()=>nodes.filter(n=>n.getAttribute?.('aria-controls'))};const navigate=createSectionNavigator({document,location,escape:x=>x});assert(navigate());assert.equal(header.getAttribute('aria-expanded'),'true');assert.equal(body.getAttribute('aria-hidden'),'false');assert(card.classList.contains('open'));assert(card.focused);assert(card.scrolled);assert.equal(navigate(),false);
 header.click();assert.equal(header.getAttribute('aria-expanded'),'false');const back=createSectionNavigator({document,location,escape:x=>x,skipInitial:true});assert.equal(back(),false);assert.equal(header.getAttribute('aria-expanded'),'false');}
});
