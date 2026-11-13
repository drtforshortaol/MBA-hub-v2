// Execute both pinned and current whale reference renderers in a literal DOM model.
// Called by review-static-fidelity.py; no network or browser acceptance is implied.
import fs from 'node:fs';
import vm from 'node:vm';
const input=JSON.parse(fs.readFileSync(0,'utf8'));
const escape=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
class Element {
 constructor(tag,text=''){this.tag=tag;this.text=String(text);this.children=[];this.className='';}
 set textContent(value){this.text=String(value);this.children=[];}
 append(...nodes){this.children.push(...nodes);}
 appendChild(node){this.append(node);return node;}
 replaceChildren(...nodes){this.text='';this.children=nodes;}
 set innerHTML(value){this.literal=String(value);}
 serialize(){if(!this.tag)return escape(this.text);return `<${this.tag}${this.className?` class="${escape(this.className)}"`:''}>${this.literal??escape(this.text)+this.children.map(n=>n.serialize()).join('')}</${this.tag}>`;}
}
const render=script=>{
 const container=new Element('div');
 const document={getElementById:id=>{if(id!=='detailedSpecies')throw Error('Unexpected element');return container;},createElement:tag=>new Element(tag),createTextNode:text=>new Element('',text)};
 vm.runInNewContext(input.data+'\n'+script,{document,navigator:{}},{timeout:1000});
 return container.serialize();
};
process.stdout.write(JSON.stringify({pinned:render(input.source),current:render(input.current)}));
