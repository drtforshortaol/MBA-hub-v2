// Independent lxml fragment trees with bounded, synchronous app event semantics.
// This is an executable structural reproduction, not native browser acceptance.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const python=String.raw`
import json,sys
from lxml import html
s=json.load(sys.stdin)
def node(e):
 return {'tag':e.tag.lower(),'attrs':dict(e.attrib),'text':e.text or '',
 'children':[{'node':node(c),'tail':c.tail or ''} for c in e if isinstance(c.tag,str)]}
tree=html.document_fromstring(s['document']) if isinstance(s,dict) else html.fragment_fromstring(s,create_parent='body')
print(json.dumps(node(tree)))
`;
function parsed(markup){const p=spawnSync('python3',['-c',python],{input:JSON.stringify(markup),encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout);}
export const parsedTree=markup=>parsed(markup);
export const parsedDocument=markup=>parsed({document:markup});
export function createNaturalistDOM(markup){
 let document;
 const listeners={};
 class Element{
  constructor(n){this.tag=n.tag;this.tagName=n.tag.toUpperCase();this.attrs={...n.attrs};this.text=n.text;this.tail='';this.children=n.children.map(c=>{const x=new Element(c.node);x.parentElement=this;x.tail=c.tail;return x;});this.handlers={};this.value='';
   this.dataset=new Proxy({}, {get:(_,k)=>this.attrs['data-'+String(k).replace(/[A-Z]/g,c=>'-'+c.toLowerCase())],set:(_,k,v)=>{this.attrs['data-'+String(k).replace(/[A-Z]/g,c=>'-'+c.toLowerCase())]=String(v);return true;}});
   this.classList={contains:c=>(this.attrs.class||'').split(/\s+/).includes(c),toggle:(c,on)=>{const set=new Set((this.attrs.class||'').split(/\s+/).filter(Boolean));on??=!set.has(c);on?set.add(c):set.delete(c);this.attrs.class=[...set].join(' ');return on;}};
  }
  get id(){return this.attrs.id||'';}get firstChild(){return this.children[0]||null;}get attributes(){return Object.entries(this.attrs).map(([name,value])=>({name,value}));}
  get hidden(){return 'hidden' in this.attrs;}set hidden(v){if(v)this.attrs.hidden='';else delete this.attrs.hidden;}
  get open(){return 'open' in this.attrs;}set open(v){if(v)this.attrs.open='';else delete this.attrs.open;}
  get className(){return this.attrs.class||'';}set className(v){this.attrs.class=String(v);}
  get textContent(){return this.text+this.children.map(c=>c.textContent+c.tail).join('');}set textContent(v){this.text=String(v);this.children=[];}
  set innerHTML(v){this.replaceChildren(...parse(v).children);}
  getAttribute(k){return this.attrs[k]??null;}setAttribute(k,v){this.attrs[k]=String(v);}removeAttribute(k){delete this.attrs[k];}
  addEventListener(k,fn){(this.handlers[k]??=[]).push(fn);}dispatchEvent(e){e.target??=this;for(const fn of this.handlers[e.type]||[])fn(e);if(e.bubbles){if(this.parentElement)this.parentElement.dispatchEvent(e);else document.dispatchEvent(e);}return true;}
  click(){this.onclick?.({target:this});this.dispatchEvent({type:'click',bubbles:true});}
  appendChild(x){if(x.parentElement){const i=x.parentElement.children.indexOf(x);if(i>=0)x.parentElement.children.splice(i,1);}x.parentElement=this;this.children.push(x);return x;}
  replaceChildren(...nodes){this.text='';this.children=[];for(const n of nodes){const items=n.tag==='#fragment'?[...n.children]:[n];for(const x of items)this.appendChild(x);}}
  querySelectorAll(s){return descendants(this).filter(e=>matches(e,s));}querySelector(s){return this.querySelectorAll(s)[0]||null;}
 }
 const descendants=e=>e.children.flatMap(c=>[c,...descendants(c)]);
 function matches(e,s){if(s==='*')return true;if(s.startsWith('#'))return e.id===s.slice(1);if(s.startsWith('.'))return e.classList.contains(s.slice(1));if(s.startsWith('['))return [...s.matchAll(/\[([^\]=]+)(?:=["']?([^\]"']+)["']?)?\]/g)].every(([,k,v])=>e.getAttribute(k)!==null&&(v===undefined||e.getAttribute(k)===v));return e.tag===s;}
 function parse(v){return new Element(parsedTree(String(v)));}
 const root=parse(markup);
 document={querySelectorAll:s=>[root,...descendants(root)].filter(e=>matches(e,s)),querySelector(s){return this.querySelectorAll(s)[0]||null;},getElementById:id=>[root,...descendants(root)].find(e=>e.id===id)||null,
 createDocumentFragment:()=>new Element({tag:'#fragment',attrs:{},text:'',children:[]}),addEventListener(k,fn){(listeners[k]??=[]).push(fn);},dispatchEvent(e){for(const fn of listeners[e.type]||[])fn(e);}};
 class DOMParser{parseFromString(v){return {body:parse(v)};}}
 return {document,DOMParser,root};
}
export function canonicalNaturalist(e,relocations=[]){
 const normalize=v=>String(v).replace(/\s+/g,' ').trim();
 const attrs={};
 for(const [k,value] of Object.entries(e.attrs).sort(([a],[b])=>a.localeCompare(b))){let v=value;if(['src','href'].includes(k)){for(const r of relocations)if(v.startsWith(r.current_url))v=r.source_url+v.slice(r.current_url.length);if(k==='src')v=v.replace(/\?v=20261006-1$/,'');}attrs[k]=v;}
 return {tag:e.tag,attrs,text:normalize(e.text),children:e.children.map(c=>({node:canonicalNaturalist(c.node||c,relocations),tail:normalize(c.tail)}))};
}
