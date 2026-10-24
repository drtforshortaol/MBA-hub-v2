import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {animalFilterLetter,bindAnimalFilter} from '../src/core/animal-filter.js';
import {captureVisit,returnToVisit,visitContext,restoredHubState,mainHubURL} from '../src/core/navigation.js';
function fixture(letter=''){
 const changes=[];
 const buttons=['A','B','C'].map(textContent=>({textContent,pressed:'false',setAttribute(key,value){assert.equal(key,'aria-pressed');this.pressed=value;},addEventListener(type,handler){assert.equal(type,'click');this.click=handler;}}));
 const entries=['A','B','B','C'].map(letter=>({dataset:{letter},hidden:false}));
 const row={querySelectorAll:()=>buttons,parentElement:{querySelectorAll:()=>entries}};
 const view={querySelectorAll:()=>[row]};
 bindAnimalFilter(view,{letter,onChange:value=>changes.push(value)});
 return {view,buttons,entries,changes};
}
test('restored animal filter sets matching rows and pressed letter without rewriting state',()=>{
 const f=fixture('B');
 assert.deepEqual(f.entries.map(entry=>entry.hidden),[true,false,false,true]);
 assert.deepEqual(f.buttons.map(button=>button.pressed),['false','true','false']);
 assert.deepEqual(f.changes,[],'restoring is read-only until a user selection');
});
test('animal letter selection is persisted and reselecting it clears the filter',()=>{
 const f=fixture();f.buttons[1].click();
 assert.deepEqual(f.changes,['B']);assert.deepEqual(f.entries.map(entry=>entry.hidden),[true,false,false,true]);
 f.buttons[1].click();
 assert.deepEqual(f.changes,['B','']);assert.ok(f.entries.every(entry=>!entry.hidden));
 assert.ok(f.buttons.every(button=>button.pressed==='false'));
 f.buttons[0].click();f.buttons[2].click();assert.deepEqual(f.changes,['B','','A','C']);
});
test('each contextual Back restores the animal letter captured for its own visit',()=>{
 const root='https://example.test/v2/',values=new Map(),storage={setItem:(key,value)=>values.set(key,value),getItem:key=>values.get(key)||null};
 const state={open:['animals'],scroll:320,animalLetter:'B'};
 const first=captureVisit('apps/one/index.html',root,root+'index.html',state,storage,'tester','first');
 state.animalLetter='C';state.scroll=480;
 const second=captureVisit('apps/two/index.html',root,root+'index.html',state,storage,'tester','second');
 for(const [destination,letter,scroll] of [[first,'B',320],[second,'C',480]]){
  const back=returnToVisit(root,destination,storage,'tester');
  const saved=visitContext(root,back.searchParams.get('restore'),storage,'tester').state;
  const restored=restoredHubState(saved,back),f=fixture(restored.animalLetter);
  assert.equal(restored.scroll,scroll);assert.deepEqual(restored.open,['animals']);
  assert.equal(f.buttons.find(button=>button.pressed==='true').textContent,letter);
 }
 const fresh=restoredHubState(state,mainHubURL(root));
 assert.equal(fresh.animalLetter,'');assert.equal(fresh.scroll,0);assert.deepEqual(fresh.open,[]);
 assert.ok(fixture(fresh.animalLetter).entries.every(entry=>!entry.hidden));
});
test('old or invalid saved filter values show all animals',()=>{
 for(const value of [undefined,null,'b','BB','1',{},['B']]){
  assert.equal(animalFilterLetter(value),'');
  assert.ok(fixture(value).entries.every(entry=>!entry.hidden));
 }
});
test('Hub binds saved animal letter and remembers changed selections',()=>{
 const source=fs.readFileSync('src/core/hub.js','utf8');
 assert.match(source,/bindAnimalFilter\(view,\{letter:state\.animalLetter,onChange:letter=>\{state\.animalLetter=letter;remember\(\);\}\}\)/);
});
