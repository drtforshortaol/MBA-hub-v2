// Execute complete source/current Open Sea renderers using independently parsed
// lxml fragment trees. This models structure and click behavior, not a browser.
import fs from 'node:fs';
import vm from 'node:vm';
import cp from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const parseCode=`import json,sys
from lxml import html
root=html.fragment_fromstring(sys.stdin.read(),create_parent='body')
def text(s):return {'nodeType':3,'text':s}
def node(e):
 if not isinstance(e.tag,str):return {'nodeType':8,'text':e.text or ''}
 children=[]
 if e.text:children.append(text(e.text))
 for c in e:
  children.append(node(c))
  if c.tail:children.append(text(c.tail))
 return {'nodeType':1,'tag':e.tag,'attributes':dict(e.attrib),'children':children}
print(json.dumps(node(root)))`;
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
class LiteralNode {
 constructor(tag='',type=1,text=''){this.nodeType=type;this.tagName=tag.toUpperCase();this.childNodes=[];this.attributes={};this.events={};this._text=text;const self=this;this.classList={get length(){return (self.className||'').split(/\s+/).filter(Boolean).length;},*[Symbol.iterator](){yield* (self.className||'').split(/\s+/).filter(Boolean);},contains:c=>[...self.classList].includes(c),toggle(c,on){const set=new Set([...self.classList]);if(on)set.add(c);else set.delete(c);self.className=[...set].join(' ');}};}
 set className(v){this.attributes.class=String(v);}get className(){return this.attributes.class||'';}set id(v){this.attributes.id=String(v);}get id(){return this.attributes.id;}set type(v){this.attributes.type=String(v);}
 setAttribute(k,v){this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k];}
 appendChild(n){if(n.nodeType===11){for(const c of [...n.childNodes])this.appendChild(c);n.childNodes=[];return n;}this.childNodes.push(n);n.parentElement=this;return n;}
 append(...ns){for(const n of ns)this.appendChild(typeof n==='string'?new LiteralNode('',3,n):n);}replaceChildren(...ns){this.childNodes=[];this.append(...ns);}
 set textContent(s){this.childNodes=[];this._text=String(s);}get textContent(){return this._text+this.childNodes.map(n=>n.textContent).join('');}
 set innerHTML(s){this.childNodes=[];this._text='';for(const n of parse(String(s)).childNodes)this.appendChild(n);}get innerHTML(){return this.childNodes.map(n=>n.toHTML()).join('');}
 addEventListener(event,fn){this.events[event]=fn;}
 querySelector(selector){const cls=selector.slice(1);for(const n of this.childNodes){if(n.classList?.contains(cls))return n;const found=n.querySelector?.(selector);if(found)return found;}return null;}
 toHTML(){if(this.nodeType===3)return escape(this._text);if(this.nodeType===8)return '<!--'+this._text+'-->';if(this.nodeType===11)return this.childNodes.map(n=>n.toHTML()).join('');const tag=this.tagName.toLowerCase();return '<'+tag+Object.entries(this.attributes).map(([k,v])=>' '+k+'="'+escape(v)+'"').join('')+'>'+escape(this._text)+this.childNodes.map(n=>n.toHTML()).join('')+'</'+tag+'>';}
}
function hydrate(value){const n=new LiteralNode(value.tag||'',value.nodeType,value.text||'');n.attributes=value.attributes||{};for(const c of value.children||[])n.appendChild(hydrate(c));return n;}
function parse(markup){return hydrate(JSON.parse(cp.execFileSync('python3',['-c',parseCode],{input:markup,encoding:'utf8',maxBuffer:8*1024*1024})));}
export function renderOpenSea(html){
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.includes('const DATA'));
 if(scripts.length!==1)throw Error('Expected exactly one authored DATA/renderer script');
 const list=new LiteralNode('div');
 const document={getElementById:id=>{if(id!=='cardList')throw Error('Unexpected document node '+id);return list;},createElement:t=>new LiteralNode(t),createElementNS:(_,t)=>new LiteralNode(t),createTextNode:s=>new LiteralNode('',3,s),createDocumentFragment:()=>new LiteralNode('',11)};
 const context=vm.createContext({document,Node:{TEXT_NODE:3,ELEMENT_NODE:1},DOMParser:class{parseFromString(s){return {body:parse(s)};}}});
 vm.runInContext(scripts[0],context,{timeout:15000});
 const data=JSON.parse(vm.runInContext('JSON.stringify(DATA)',context));
 const initial=list.childNodes.map(card=>card.toHTML());
 const states=[];
 for(const card of list.childNodes){const head=card.querySelector('.card-header'),body=card.querySelector('.card-body');if(typeof head.events.click!=='function')throw Error('Missing click binding');const state=()=>({open:card.classList.contains('open'),expanded:head.getAttribute('aria-expanded'),hidden:body.getAttribute('aria-hidden')});const before=state();head.events.click();const opened=state();head.events.click();states.push({id:card.id,before,opened,closed:state()});}
 return {data,cards:initial,states};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [root,repo]=process.argv.slice(2),commit='5c219508d23255080f6b050cefa8092905447d81';
 const old=cp.execFileSync('git',['-C',repo,'show',commit+':apps/open-sea/index.html'],{encoding:'utf8'});
 const current=fs.readFileSync(path.join(root,'src/apps/open-sea/index.html'),'utf8');
 console.log(JSON.stringify({pinned:renderOpenSea(old),current:renderOpenSea(current)}));
}
