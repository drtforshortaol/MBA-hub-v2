import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {captureAppView,restoreAppView} from '../src/core/app-view.js';
import {captureAppVisit,returnToVisit,appRestoreState} from '../src/core/navigation.js';

// Execute the actual inherited mode-selection handler; no science, renderer or
// application bytes are replaced by this fixture.
const source=readFileSync(new URL('../src/apps/evolution-timeline/app.js',import.meta.url),'utf8');
const modeHandler=source.split('\n').find(line=>line.startsWith("document.querySelectorAll('.mode').forEach"));
assert.ok(modeHandler,'inherited view control handler missing');
function timeline(){
 const panels={story:{hidden:false},time:{hidden:true},tools:{hidden:true}},details=[{open:false},{open:false}],scrolls=[];
 const buttons=['story','time','tools'].map(view=>{
  const classes=new Set(view==='story'?['mode','active']:['mode']);let handler;
  return {tagName:'BUTTON',dataset:{view},clicks:0,classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),contains:value=>classes.has(value)},addEventListener(type,fn){assert.equal(type,'click');handler=fn;},click(){this.clicks++;handler();}};
 });
 const document={getElementById:()=>null,querySelectorAll(selector){
  if(selector==='.mode'||selector==='button.mode[data-view]')return buttons;
  if(selector==='button.mode.active[data-view]')return buttons.filter(button=>button.classList.contains('active'));
  if(selector==='details')return details;
  return [];
 }};
 vm.runInNewContext(modeHandler,{document,storyView:panels.story,timeView:panels.time,toolsView:panels.tools});
 return {document,buttons,panels,details,scrolls,options:{Event:class{},scrollTo:(x,y)=>scrolls.push([x,y])}};
}
for(const selected of ['story','time','tools'])test('contextual Back restores actual Timeline '+selected+' mode and nested state',()=>{
 const original=timeline();original.buttons.find(button=>button.dataset.view===selected).click();original.details[1].open=true;
 const values=new Map(),storage={setItem:(key,value)=>values.set(key,value),getItem:key=>values.get(key)||null};
 const root='https://example.test/v2/',origin=root+'apps/evolution-timeline/index.html';
 const destination=captureAppVisit(root+'apps/ray/index.html',root,origin,captureAppView(original.document,420),storage,'tester','timeline');
 const back=returnToVisit(root,destination,storage,'tester'),state=appRestoreState(root,back,storage,'tester');
 const returned=timeline();restoreAppView(returned.document,state,returned.options);
 assert.deepEqual(Object.entries(returned.panels).filter(([,panel])=>!panel.hidden).map(([name])=>name),[selected]);
 assert.deepEqual(returned.buttons.filter(button=>button.classList.contains('active')).map(button=>button.dataset.view),[selected]);
 assert.deepEqual(returned.details.map(panel=>panel.open),[false,true]);
 assert.deepEqual(returned.scrolls,[[0,420]]);
 const clicks=returned.buttons.map(button=>button.clicks);restoreAppView(returned.document,state,returned.options);
 assert.deepEqual(returned.buttons.map(button=>button.clicks),clicks,'same active mode must not replay side effects');
});

test('legacy, malformed, missing and ambiguous mode snapshots do not click controls',()=>{
 for(const modes of [undefined,null,'time',[null,{},'',42],['missing'],['time','tools']]){
  const f=timeline();const state={appView:true,details:[],expanded:[],inputs:[],scroll:0,modes};
  restoreAppView(f.document,state,f.options);
  assert.deepEqual(f.buttons.map(button=>button.clicks),[0,0,0]);
 }
 const f=timeline();f.buttons.push({...f.buttons[1],dataset:{view:'time'}});
 restoreAppView(f.document,{appView:true,details:[],expanded:[],inputs:[],scroll:0,modes:['time']},f.options);
 assert.deepEqual(f.buttons.map(button=>button.clicks),[0,0,0,0]);
});

test('mode restoration data remains scoped to originating app and normalizes saved values',()=>{
 const root='https://example.test/v2/',origin=root+'apps/evolution-timeline/index.html',f=timeline();
 f.buttons[1].click();const values=new Map(),storage={setItem:(key,value)=>values.set(key,value),getItem:key=>values.get(key)||null};
 const snapshot=captureAppView(f.document,0);snapshot.modes=['time','time',null,42,''];
 const destination=captureAppVisit(root+'apps/ray/index.html',root,origin,snapshot,storage,'tester','timeline');
 const back=returnToVisit(root,destination,storage,'tester');
 assert.deepEqual(appRestoreState(root,back,storage,'tester').modes,['time']);
 assert.equal(appRestoreState(root,root+'apps/ray/index.html?restore=timeline',storage,'tester'),null);
});
