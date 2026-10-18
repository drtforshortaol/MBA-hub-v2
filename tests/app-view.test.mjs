import test from 'node:test';
import assert from 'node:assert/strict';
import {captureAppView,restoreAppView} from '../src/core/app-view.js';
import {captureAppVisit,returnToVisit,appRestoreState} from '../src/core/navigation.js';
function fixture(){
 const events=[],scrolls=[];
 const inputs=[['query','search','kelp'],['notes','textarea','My notes'],['station','select-one','ocean'],['secret','password','private'],['upload','file',''],['token','hidden','sensitive']].map(([id,type,value])=>({id,type,value,tagName:type==='textarea'?'TEXTAREA':type==='select-one'?'SELECT':'INPUT',checked:false,dispatchEvent:event=>events.push([id,event.type])}));
 const details=[{open:true},{open:false},{open:true}];
 const controls=[['overview','true'],['facts','false']].map(([id,value])=>({id,value,clicks:0,getAttribute(name){return name==='aria-controls'?this.id:this.value;},click(){this.clicks++;this.value=this.value==='true'?'false':'true';}}));
 const document={getElementById:id=>inputs.find(input=>input.id===id),querySelectorAll(selector){if(selector==='details')return details;if(selector==='[aria-controls][aria-expanded="true"]')return controls.filter(control=>control.value==='true');if(selector==='[aria-controls][aria-expanded]')return controls;return inputs;}};
 const options={Event:class{constructor(type){this.type=type;}},scrollTo:(x,y)=>scrolls.push([x,y])};
 return {document,details,controls,inputs,events,scrolls,options};
}
test('app snapshot includes multiline notes and omits sensitive or non-user fields',()=>{
 const f=fixture(),state=captureAppView(f.document,430);
 assert.deepEqual(state.details,[0,2]);assert.deepEqual(state.expanded,['overview']);
 assert.deepEqual(state.inputs.map(input=>input.id),['query','notes','station']);
 assert.equal(state.inputs[1].value,'My notes');
});
test('contextual Back restores deliberately closed details and custom panels as well as open ones',()=>{
 const f=fixture(),saved=captureAppView(f.document,430);
 f.details.forEach(detail=>detail.open=true);f.controls[0].value='false';f.controls[1].value='true';
 restoreAppView(f.document,saved,f.options);
 assert.deepEqual(f.details.map(detail=>detail.open),[true,false,true]);
 assert.deepEqual(f.controls.map(control=>control.value),['true','false']);
 assert.deepEqual(f.controls.map(control=>control.clicks),[1,1]);
 assert.deepEqual(f.scrolls,[[0,430]]);
});
test('restoration replays field input and change events before panel state and scrolling',()=>{
 const f=fixture(),saved=captureAppView(f.document,90);
 f.inputs[0].value='other';f.inputs[1].value='';
 f.inputs[0].dispatchEvent=event=>{f.events.push(['query',event.type]);f.details[1].open=true;};
 restoreAppView(f.document,saved,f.options);
 assert.equal(f.inputs[0].value,'kelp');assert.equal(f.inputs[1].value,'My notes');
 assert.deepEqual(f.events,[['query','input'],['query','change'],['notes','input'],['notes','change'],['station','input'],['station','change']]);
 assert.equal(f.details[1].open,false);assert.deepEqual(f.scrolls,[[0,90]]);
});
test('already matching custom panels are not toggled and repeated restoration is stable',()=>{
 const f=fixture(),saved=captureAppView(f.document,100);
 restoreAppView(f.document,saved,f.options);restoreAppView(f.document,saved,f.options);
 assert.deepEqual(f.controls.map(control=>control.clicks),[0,0]);
 assert.deepEqual(f.details.map(detail=>detail.open),[true,false,true]);
});
test('restoration tolerates removed controls and refuses values for newly sensitive fields',()=>{
 const f=fixture(),saved=captureAppView(f.document,0);
 saved.inputs.push({id:'removed',value:'old',checked:false},{id:'upload',value:'unsafe',checked:false},{id:'secret',value:'unsafe',checked:false});
 f.inputs[0].type='password';f.inputs[0].value='unchanged';
 restoreAppView(f.document,saved,f.options);
 assert.equal(f.inputs[0].value,'unchanged');assert.equal(f.inputs[3].value,'private');assert.equal(f.inputs[4].value,'');
});

test('app link and contextual Back round-trip the complete saved view through session storage',()=>{
 const original=fixture(),values=new Map(),storage={setItem:(key,value)=>values.set(key,value),getItem:key=>values.get(key)||null};
 const root='https://example.test/v2/',origin=root+'apps/guide/index.html?station=ocean#facts';
 const destination=captureAppVisit(root+'apps/ray/index.html',root,origin,captureAppView(original.document,260),storage,'tester','view');
 const back=returnToVisit(root,destination,storage,'tester'),state=appRestoreState(root,back,storage,'tester');
 const returned=fixture();returned.details.forEach(detail=>detail.open=true);returned.controls[1].value='true';returned.inputs[1].value='';
 restoreAppView(returned.document,state,returned.options);
 assert.equal(returned.inputs[1].value,'My notes');
 assert.deepEqual(returned.details.map(detail=>detail.open),[true,false,true]);
 assert.deepEqual(returned.controls.map(control=>control.value),['true','false']);
 assert.deepEqual(returned.scrolls,[[0,260]]);
});

test('reused field IDs on nonform elements cannot receive saved values or synthetic events',()=>{
 const f=fixture(),saved=captureAppView(f.document,0);
 f.inputs[0].tagName='ARTICLE';f.inputs[0].value='unchanged';
 restoreAppView(f.document,saved,f.options);
 assert.equal(f.inputs[0].value,'unchanged');assert.equal(f.events.some(([id])=>id==='query'),false);
});
