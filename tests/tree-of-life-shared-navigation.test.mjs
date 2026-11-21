import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createSectionNavigator} from '../src/core/section-navigation.js';

// Execute the actual inherited app and the actual shared navigator together.
// This event/DOM model covers their interface, not native layout or device QA.
const source=readFileSync(new URL('../src/apps/tree-of-life-origins/app.js',import.meta.url),'utf8');
function fixture(){
 const listeners={},order=[];
 const node=(id,tagName='DIV',textContent='')=>{
  const classes=new Set(),handlers={};
  return {id,tagName,textContent,value:'',dataset:{},handlers,open:false,tabIndex:-1,
   classList:{contains:n=>classes.has(n),remove(...names){names.forEach(n=>classes.delete(n));},toggle(n,on){on?classes.add(n):classes.delete(n);}},
   getAttribute(){return null;},hasAttribute(){return false;},setAttribute(){},querySelector(){return null;},
   addEventListener(type,fn){handlers[type]=fn;},
   dispatchEvent(event){event.target=this;listeners[event.type]?.(event);return true;},
   focus(){order.push('focus');assert.equal(chapter.classList.contains('hidden-by-search'),false);},
   scrollIntoView(){order.push('scroll');assert.equal(chapter.classList.contains('hidden-by-search'),false);}
  };
 };
 const ids=Object.fromEntries(['searchInput','searchStatus','clearSearch','collapseAll','installButton','offlineStatus'].map(id=>[id,node(id)]));
 const chapter=node('hidden-chapter','DETAILS','Mitochondrial endosymbiosis');
 const match=node('matching-chapter','DETAILS','HORGASM seven characteristics');
 const target=node('destination','H2');target.parentElement=chapter;ids.destination=target;
 const document={defaultView:{CustomEvent:class{constructor(type,options){Object.assign(this,{type},options);}}},
  addEventListener(type,fn){listeners[type]=fn;},getElementById:id=>ids[id]||null,
  querySelectorAll:selector=>({'.searchable':[chapter,match],details:[chapter,match],'.fast-tools button[data-target]':[],'a[href^="#"]':[],'[aria-controls][aria-expanded]':[]}[selector]||[]),
  querySelector(){return null;}
 };
 vm.runInNewContext(source,{document,navigator:{onLine:true},window:{addEventListener(){}},location:{hash:''},history:{}},{timeout:3000});
 const location={hash:'#destination'};
 const navigate=createSectionNavigator({document,location,escape:x=>x});
 return {ids,chapter,target,match,listeners,order,navigate,location};
}

test('shared Tree navigation clears a blocking query before core focus and scroll',()=>{
 const f=fixture();f.ids.searchInput.value='HORGASM';f.ids.searchInput.handlers.input();
 assert.equal(f.chapter.classList.contains('hidden-by-search'),true);
 assert.equal(f.navigate(),true);
 assert.equal(f.ids.searchInput.value,'');assert.equal(f.ids.searchStatus.textContent,'');
 assert.equal(f.chapter.open,true);assert.deepEqual(f.order,['focus','scroll']);
 assert.equal(f.navigate(),false);assert.deepEqual(f.order,['focus','scroll']);
});

test('shared Tree navigation preserves matching queries and rejects mismatched event identity',()=>{
 const f=fixture();f.ids.searchInput.value='mitochondrial';f.ids.searchInput.handlers.input();
 assert.equal(f.navigate(),true);assert.equal(f.ids.searchInput.value,'mitochondrial');
 f.ids.searchInput.value='HORGASM';f.ids.searchInput.handlers.input();
 f.listeners['mba:reveal-section']({target:f.target,detail:{id:'another-destination'}});
 assert.equal(f.ids.searchInput.value,'HORGASM');
 assert.equal(f.chapter.classList.contains('hidden-by-search'),true);
});
