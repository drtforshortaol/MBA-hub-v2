import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const page=fs.readFileSync('src/apps/open-sea/index.html','utf8');
const script=page.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const data=vm.runInNewContext(script.slice(0,script.indexOf('const cardListElement'))+';DATA');
const adversarial='<div class="adapt-box evil training-note" onclick="alert(1)" style="color:red"><p class="fact-pill" data-private="x">Safe <em>emphasis</em><br> after <a href="javascript:alert(1)">link</a><strong>strong</strong></p><span class="training-note fact-pill evil">pill</span><img src=x onerror="alert(1)"><script>alert(2)</script><!-- hidden --><iframe src="https://example.invalid/">frame</iframe></div>';
// Independent standard-library parser retains the actual full element/text trees.
// These valid authored fragments do not require browser error-recovery semantics.
const parsed=JSON.parse(execFileSync('python3',['-c',`
from html.parser import HTMLParser
import json,sys
class Tree(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.root={'tag':'#fragment','attrs':{},'children':[]};self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n={'tag':tag,'attrs':dict(attrs),'children':[]};self.stack[-1]['children'].append(n)
  if tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append(n)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i]['tag']==tag:self.stack=self.stack[:i];break
 def handle_data(self,text):self.stack[-1]['children'].append({'text':text})
 def handle_comment(self,text):self.stack[-1]['children'].append({'comment':text})
result={}
for value in json.load(sys.stdin):
 p=Tree();p.feed(value);p.close();result[value]=p.root
print(json.dumps(result))
`],{input:JSON.stringify([...data.map(item=>item.body),adversarial]),encoding:'utf8'}));

function text(value){return {nodeType:3,textContent:String(value),childNodes:[]};}
function element(tag='#fragment'){
 const node={nodeType:tag==='#fragment'?11:1,tagName:tag.toUpperCase(),childNodes:[],attributes:{},
  appendChild(child){if(child.nodeType===11){for(const nested of [...child.childNodes])this.appendChild(nested);child.childNodes=[];return child;}this.childNodes.push(child);child.parentElement=this;return child;},
  append(...children){for(const child of children)this.appendChild(child);},
  replaceChildren(...children){this.childNodes=[];this.append(...children);},
  setAttribute(key,value){this.attributes[key]=String(value);},getAttribute(key){return this.attributes[key];},
  addEventListener(type,callback){this[type]=callback;},
  querySelector(selector){return descendants(this).find(child=>child.classList?.contains(selector.slice(1)))||null;}};
 Object.defineProperty(node,'textContent',{get(){return this.childNodes.map(child=>child.textContent||'').join('');},set(value){this.childNodes=[text(value)];}});
 for(const [property,attribute] of [['className','class'],['id','id'],['type','type']])Object.defineProperty(node,property,{get(){return this.attributes[attribute]||'';},set(value){this.attributes[attribute]=String(value);}});
 node.classList={contains:value=>node.className.split(/\s+/).includes(value),toggle(value,enabled){const values=new Set(node.className.split(/\s+/).filter(Boolean));if(enabled)values.add(value);else values.delete(value);node.className=[...values].join(' ');},get length(){return node.className.split(/\s+/).filter(Boolean).length;},*[Symbol.iterator](){yield* node.className.split(/\s+/).filter(Boolean);}};
 return node;
}
function hydrate(source){
 if('text' in source)return text(source.text);
 if('comment' in source)return {nodeType:8,textContent:source.comment,childNodes:[]};
 const result=element(source.tag);for(const [key,value] of Object.entries(source.attrs))result.setAttribute(key,value??'');
 for(const child of source.children)result.appendChild(hydrate(child));return result;
}
function descendants(node){return node.childNodes.flatMap(child=>[child,...descendants(child)]);}
function structural(node){
 if(node.nodeType===3){const value=node.textContent.replace(/\s+/g,' ').trim();return value?{text:value}:null;}
 if(node.nodeType!==1&&node.nodeType!==11)return null;
 return {tag:node.tagName.toLowerCase(),attrs:Object.fromEntries(Object.entries(node.attributes).sort()),children:node.childNodes.map(structural).filter(Boolean)};
}
function execute(){
 const list=element('div');
 const context=vm.createContext({document:{getElementById:()=>list,createElement:element,createElementNS:(_,name)=>element(name),createTextNode:text,createDocumentFragment:()=>element()},Node:{TEXT_NODE:3,ELEMENT_NODE:1},DOMParser:class{parseFromString(markup){assert(parsed[markup],'Unparsed markup');return {body:hydrate(parsed[markup])};}}});
 vm.runInContext(script,context,{timeout:1000});return {list,context};
}

test('all twelve actual Open Sea card bodies retain complete authored structure and class inventory',()=>{
 const {list}=execute();assert.equal(list.childNodes.length,12);
 const tags={},classes={};
 for(const item of data){
  const card=list.childNodes.find(child=>child.id===`card-${item.id}`);assert(card,item.id);
  const inner=card.querySelector('.card-body-inner');assert(inner,item.id);
  const expected=hydrate(parsed[item.body]);assert.deepEqual(inner.childNodes.map(structural).filter(Boolean),expected.childNodes.map(structural).filter(Boolean),item.id);
  for(const node of descendants(inner).filter(n=>n.nodeType===1)){
   tags[node.tagName]=(tags[node.tagName]||0)+1;
   for(const value of node.classList)classes[value]=(classes[value]||0)+1;
  }
 }
 assert.deepEqual(tags,{H4:28,P:34,DIV:12,UL:16,LI:66,SPAN:10,STRONG:9});
 assert.deepEqual(classes,{'adapt-box':6,'fact-strip':5,'fact-pill':10,'training-note':1});
});

test('Open Sea structural allowlist removes executable attributes/elements and limits classes while retaining safe descendants',()=>{
 const {context}=execute();context.fixture={id:'adversarial',icon:'<img src=x>',title:'<svg onload=alert(1)> &amp; title',subtitle:'<iframe>subtitle</iframe>',tags:['<script>tag</script>'],body:adversarial};
 const card=vm.runInContext('buildCard(fixture)',context,{timeout:1000}),inner=card.querySelector('.card-body-inner');
 const nodes=descendants(inner),elements=nodes.filter(n=>n.nodeType===1);
 assert(elements.length>5,'safeNode must traverse actual nested elements');
 assert(elements.every(n=>['DIV','P','EM','BR','STRONG','SPAN'].includes(n.tagName)));
 assert(elements.every(n=>Object.keys(n.attributes).every(key=>key==='class')));
 assert.equal(elements.find(n=>n.tagName==='DIV').className,'adapt-box training-note');
 assert.equal(elements.find(n=>n.tagName==='P').className,'');
 assert.equal(elements.find(n=>n.tagName==='SPAN').className,'fact-pill');
 assert.equal(nodes.filter(n=>n.nodeType===8).length,0);
 assert.equal(inner.textContent,'Safe emphasis after linkstrongpillalert(2)frame');
 const header=card.querySelector('.card-header');
 assert.equal(header.querySelector('.card-icon').textContent,'<img src=x>');
 assert.equal(header.querySelector('.card-title').textContent,'<svg onload=alert(1)> & title');
 assert.equal(header.querySelector('.card-subtitle').textContent,'<iframe>subtitle</iframe>');
 assert.equal(header.querySelector('.mini-tag').textContent,'<script>tag</script>');
 assert.equal(descendants(header).filter(n=>n.tagName==='SCRIPT'||n.tagName==='IMG'||n.tagName==='IFRAME').length,0);
});

test('every structurally rendered Open Sea card retains complete SVG metadata and independent disclosure state',()=>{
 const {list}=execute();
 for(const card of list.childNodes){
  const header=card.querySelector('.card-header'),body=card.querySelector('.card-body'),svg=header.querySelector('.chevron');
  assert.deepEqual(svg.attributes,{class:'chevron',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'2.5','aria-hidden':'true'});
  assert.deepEqual(svg.childNodes[0].attributes,{d:'M6 9l6 6 6-6','stroke-linecap':'round','stroke-linejoin':'round'});
  assert.equal(header.getAttribute('aria-controls'),body.id);assert.equal(header.getAttribute('aria-expanded'),'false');assert.equal(body.getAttribute('aria-hidden'),'true');
  header.click();assert(card.classList.contains('open'));assert.equal(header.getAttribute('aria-expanded'),'true');assert.equal(body.getAttribute('aria-hidden'),'false');
  header.click();assert(!card.classList.contains('open'));assert.equal(header.getAttribute('aria-expanded'),'false');assert.equal(body.getAttribute('aria-hidden'),'true');
 }
});
