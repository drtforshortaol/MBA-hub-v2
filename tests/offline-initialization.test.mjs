import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeOffline} from '../src/core/offline.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness({register,ready=new Promise(()=>{}),controller=true}={}){
 const previous={navigator:globalThis.navigator,window:globalThis.window,document:globalThis.document};
 const window=new EventTarget(),document=new EventTarget(),serviceWorker=new EventTarget();
 document.visibilityState='visible';let requests=0;
 Object.assign(serviceWorker,{ready,register,controller:controller?{postMessage(message,ports){requests++;ports[0].postMessage({complete:true,count:360,total:360});}}:null});
 for(const [name,value] of Object.entries({navigator:{serviceWorker},window,document}))Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
 return {window,document,serviceWorker,get requests(){return requests;},restore(){for(const [name,value] of Object.entries(previous)){if(value===undefined)delete globalThis[name];else Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}}};
}
test('installed app verifies cache while registration and ready remain pending',async()=>{
 let registrations=0;const h=harness({register(){registrations++;return new Promise(()=>{});}});let lifecycle;
 try{
  const status={textContent:'Offline preparation pending'};lifecycle=await initializeOffline(status);
  assert.equal(status.textContent,'Ready offline · 360 files');assert.equal(registrations,1);
  h.window.dispatchEvent(new Event('online'));await tick();assert.equal(registrations,1);
  h.document.dispatchEvent(new Event('visibilitychange'));await tick();assert.ok(h.requests>=2);
 }finally{lifecycle?.stop();h.restore();}
});
test('failed offline registration preserves verified readiness and retries on reconnect',async()=>{
 let registrations=0,updates=0;const h=harness({register(){if(++registrations===1)return Promise.reject(Error('offline'));return Promise.resolve({update(){updates++;return Promise.resolve();}});}});let lifecycle;
 try{
  const status={textContent:''};lifecycle=await initializeOffline(status);await tick();
  assert.equal(status.textContent,'Ready offline · 360 files');assert.equal(registrations,1);
  h.window.dispatchEvent(new Event('online'));await tick();assert.equal(registrations,2);
  h.window.dispatchEvent(new Event('online'));await tick();assert.equal(updates,1);
  assert.equal(status.textContent,'Ready offline · 360 files');
 }finally{lifecycle?.stop();h.restore();}
});
test('fresh registration verifies once ready resolves and retains resume recovery',async()=>{
 let release;const ready=new Promise(resolve=>{release=resolve;});
 const registration={active:{postMessage(message,ports){ports[0].postMessage({complete:true,count:360,total:360});}},update(){return Promise.resolve();}};
 const h=harness({controller:false,ready,register(){release(registration);return Promise.resolve(registration);}});let lifecycle;
 try{
  const status={textContent:''};lifecycle=await initializeOffline(status);
  assert.equal(status.textContent,'Ready offline · 360 files');
  status.textContent='stale';h.window.dispatchEvent(new Event('pageshow'));await lifecycle.verify();assert.equal(status.textContent,'Ready offline · 360 files');
 }finally{lifecycle?.stop();h.restore();}
});
test('Hub manual control rechecks actual worker status and safely discovers updates',async()=>{
 let updates=0,count=360;const h=harness({register:async()=>({update:async()=>{updates++;}})});let lifecycle;
 const button=new EventTarget();button.setAttribute=()=>{};button.remove=()=>{button.removed=true;};
 const status={textContent:'',id:'offline',parentNode:{},ownerDocument:{createElement:()=>button},after(){}};
 h.serviceWorker.controller.postMessage=(message,ports)=>ports[0].postMessage({complete:true,count,total:count});
 try{
  lifecycle=await initializeOffline(status);assert.equal(status.textContent,'Ready offline · 360 files');
  count=361;button.dispatchEvent(new Event('click'));await lifecycle.verify();
  assert.equal(status.textContent,'Ready offline · 361 files');assert.equal(updates,1);
  lifecycle.stop();assert.equal(button.removed,true);
 }finally{lifecycle?.stop();h.restore();}
});

test('stopping lifecycle cancels in-flight verification without late status updates',async()=>{
 const h=harness({register:()=>new Promise(()=>{})});let lifecycle,reply;
 try{
  const status={textContent:''};lifecycle=await initializeOffline(status);
  h.serviceWorker.controller.postMessage=(message,ports)=>{reply=ports[0];};
  const pending=lifecycle.verify();
  assert.equal(status.textContent,'Checking offline files…');
  lifecycle.stop();await pending;
  assert.equal(status.textContent,'Checking offline files…','cancellation must not overwrite a disposed status');
  reply.postMessage({complete:true,count:999,total:999});reply.close();await tick();
  assert.equal(status.textContent,'Checking offline files…');
  await lifecycle.verify();assert.equal(status.textContent,'Checking offline files…');
 }finally{lifecycle?.stop();h.restore();}
});

for(const [name,response] of [
 ['truthy readiness flag',{complete:'yes',count:360,total:360}],
 ['missing total',{complete:true,count:360}],
 ['negative count',{complete:false,count:-1,total:360}],
 ['fractional count',{complete:false,count:1.5,total:360}],
 ['unsafe total',{complete:false,count:1,total:Number.MAX_SAFE_INTEGER+1}],
 ['count above total',{complete:true,count:361,total:360}],
 ['premature completion',{complete:true,count:359,total:360}],
 ['inconsistent incomplete flag',{complete:false,count:360,total:360}],
 ['empty inventory marked ready',{complete:true,count:0,total:0}]
])test(`offline readiness rejects ${name} and recovers on later verification`,async()=>{
 const h=harness({register:()=>new Promise(()=>{})});let lifecycle;
 h.serviceWorker.controller.postMessage=(message,ports)=>ports[0].postMessage(response);
 try{
  const status={textContent:''};lifecycle=await initializeOffline(status);
  assert.equal(status.textContent,'Offline status temporarily unavailable');
  h.serviceWorker.controller.postMessage=(message,ports)=>ports[0].postMessage({complete:true,count:360,total:360});
  await lifecycle.verify();assert.equal(status.textContent,'Ready offline · 360 files');
 }finally{lifecycle?.stop();h.restore();}
});
for(const [name,response,label] of [
 ['partial inventory',{complete:false,count:3,total:360},'Preparing offline · 3/360'],
 ['missing manifest',{complete:false,count:0,total:0},'Offline readiness unknown · use online and see Install & Help']
])test(`offline readiness preserves ${name} preparation state`,async()=>{
 const h=harness({register:()=>new Promise(()=>{})});let lifecycle;
 h.serviceWorker.controller.postMessage=(message,ports)=>ports[0].postMessage(response);
 try{
  const status={textContent:''};lifecycle=await initializeOffline(status);assert.equal(status.textContent,label);
 }finally{lifecycle?.stop();h.restore();}
});

test('worker handover interrupts a stalled old worker and immediately verifies replacement',async()=>{
 const h=harness({register:()=>new Promise(()=>{})});let lifecycle,oldPort;
 try{
  const status={textContent:''};lifecycle=await initializeOffline(status);
  h.serviceWorker.controller.postMessage=(message,ports)=>{oldPort=ports[0];};
  const pending=lifecycle.verify();
  assert.equal(status.textContent,'Checking offline files…');
  let replacementRequests=0;
  h.serviceWorker.controller={postMessage(message,ports){replacementRequests++;ports[0].postMessage({complete:true,count:361,total:361});}};
  h.serviceWorker.dispatchEvent(new Event('controllerchange'));
  await pending;
  assert.equal(replacementRequests,1);
  assert.equal(status.textContent,'Ready offline · 361 files');
  oldPort.postMessage({complete:true,count:1,total:1});oldPort.close();await tick();
  assert.equal(status.textContent,'Ready offline · 361 files','obsolete worker cannot overwrite replacement readiness');
  await lifecycle.verify();assert.equal(replacementRequests,2,'new requests remain usable after cancellation');
 }finally{lifecycle?.stop();h.restore();}
});

test('hidden installed app verifies a replacement controller before its next foreground event',async()=>{
 const h=harness({register:()=>new Promise(()=>{})});let lifecycle;
 try{
  const status={textContent:''};lifecycle=await initializeOffline(status);
  h.document.visibilityState='hidden';
  h.serviceWorker.controller={postMessage(message,ports){ports[0].postMessage({complete:false,count:3,total:361});}};
  h.serviceWorker.dispatchEvent(new Event('controllerchange'));await lifecycle.verify();
  assert.equal(status.textContent,'Preparing offline · 3/361');
 }finally{lifecycle?.stop();h.restore();}
});

test('controller handover recovers initialization blocked on its first verification',async()=>{
 const h=harness({register:()=>new Promise(()=>{})});let lifecycle,oldPort;
 h.serviceWorker.controller.postMessage=(message,ports)=>{oldPort=ports[0];};
 try{
  const status={textContent:''};const pending=initializeOffline(status);
  assert.equal(status.textContent,'Checking offline files…');
  h.serviceWorker.controller={postMessage(message,ports){ports[0].postMessage({complete:true,count:361,total:361});}};
  h.serviceWorker.dispatchEvent(new Event('controllerchange'));
  lifecycle=await pending;assert.equal(status.textContent,'Ready offline · 361 files');
 }finally{oldPort?.close();lifecycle?.stop();h.restore();}
});

test('back-forward cache restore interrupts a suspended check and ignores its late reply',async()=>{
 const h=harness({register:()=>new Promise(()=>{})});let lifecycle,oldPort;
 try{
  const status={textContent:''};lifecycle=await initializeOffline(status);
  h.serviceWorker.controller.postMessage=(message,ports)=>{oldPort=ports[0];};
  const pending=lifecycle.verify();
  assert.equal(status.textContent,'Checking offline files…');
  let resumedRequests=0;
  h.serviceWorker.controller.postMessage=(message,ports)=>{resumedRequests++;ports[0].postMessage({complete:false,count:7,total:360});};
  const restored=new Event('pageshow');Object.defineProperty(restored,'persisted',{value:true});
  h.window.dispatchEvent(restored);await pending;
  assert.equal(resumedRequests,1);
  assert.equal(status.textContent,'Preparing offline · 7/360');
  oldPort.postMessage({complete:true,count:360,total:360});oldPort.close();await tick();
  assert.equal(status.textContent,'Preparing offline · 7/360','suspended readiness cannot overwrite the resumed check');
  lifecycle.stop();h.window.dispatchEvent(restored);await tick();assert.equal(resumedRequests,1);
 }finally{oldPort?.close();lifecycle?.stop();h.restore();}
});
