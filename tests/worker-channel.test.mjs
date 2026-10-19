import test from 'node:test';
import assert from 'node:assert/strict';
import {request} from '../src/core/worker-channel.js';
function harness(reply){
 const previousNavigator=globalThis.navigator,previousChannel=globalThis.MessageChannel;
 const port={closed:false,onmessage:null,onmessageerror:null,close(){this.closed=true;}};
 const worker={postMessage(){reply?.(port);}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{ready:Promise.resolve({active:worker}),controller:null}}});
 const port2={closed:false,close(){this.closed=true;}};
 globalThis.MessageChannel=class{constructor(){this.port1=port;this.port2=port2;}};
 return {port,port2,restore(){if(previousNavigator===undefined)delete globalThis.navigator;else Object.defineProperty(globalThis,'navigator',{configurable:true,value:previousNavigator});if(previousChannel===undefined)delete globalThis.MessageChannel;else globalThis.MessageChannel=previousChannel;}};
}
test('worker channel closes after successful reply',async()=>{const h=harness(p=>queueMicrotask(()=>p.onmessage({data:{complete:true}})));try{assert.equal((await request('STATUS')).complete,true);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel rejects malformed response and closes',async()=>{const h=harness(p=>queueMicrotask(()=>p.onmessage({data:null})));try{await assert.rejects(request('STATUS'),/Invalid offline worker response/);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel closes after postMessage throws',async()=>{const h=harness(()=>{throw Error('send failed');});try{await assert.rejects(request('STATUS'),/send failed/);assert.equal(h.port.closed,true);}finally{h.restore();}});

test('worker channel rejects decoding errors and releases both ports',async()=>{const h=harness(p=>queueMicrotask(()=>p.onmessageerror()));try{await assert.rejects(request('STATUS'),/could not be decoded/);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel surfaces worker-reported errors',async()=>{const h=harness(p=>queueMicrotask(()=>p.onmessage({data:{error:'cache unavailable'}})));try{await assert.rejects(request('STATUS'),/cache unavailable/);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel ignores duplicate replies after settling',async()=>{let replies=0;const h=harness(p=>queueMicrotask(()=>{const handler=p.onmessage;handler({data:{complete:true}});replies++;handler({data:{complete:false}});replies++;}));try{assert.equal((await request('STATUS')).complete,true);assert.equal(replies,2);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel rejects when no active worker is available',async()=>{const h=harness();try{Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{ready:Promise.resolve({active:null}),controller:null}}});await assert.rejects(request('STATUS'),/No active offline worker/);}finally{h.restore();}});

test('worker channel uses an existing controlling worker when available',async()=>{const h=harness(p=>queueMicrotask(()=>p.onmessage({data:{complete:true}})));try{Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{ready:Promise.resolve({active:null}),controller:{postMessage(){queueMicrotask(()=>h.port.onmessage({data:{complete:true}}));}}}}});assert.equal((await request('STATUS')).complete,true);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel rejects when service workers are unavailable',async()=>{const h=harness();try{Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}});await assert.rejects(request('STATUS'));}finally{h.restore();}});

test('controlling worker responds even when registration readiness never resolves',async()=>{
 const h=harness();try{
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{ready:new Promise(()=>{}),controller:{postMessage(){queueMicrotask(()=>h.port.onmessage({data:{complete:true}}));}}}}});
  assert.equal((await request('STATUS')).complete,true);assert.equal(h.port.closed,true);
 }finally{h.restore();}
});
test('registration readiness shares request deadline and late registration cannot send',async t=>{
 const h=harness();let release,sends=0;
 t.mock.timers.enable({apis:['setTimeout']});
 try{
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{ready:new Promise(resolve=>{release=resolve;}),controller:null}}});
  const pending=request('STATUS');const rejected=assert.rejects(pending,/Offline worker timed out/);
  t.mock.timers.tick(30000);await rejected;
  release({active:{postMessage(){sends++;}}});await Promise.resolve();assert.equal(sends,0);
 }finally{t.mock.timers.reset();h.restore();}
});
test('registration rejection releases the request deadline',async()=>{
 const h=harness();try{
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{ready:Promise.reject(Error('registration unavailable')),controller:null}}});
  await assert.rejects(request('STATUS'),/registration unavailable/);
 }finally{h.restore();}
});
test('worker reply timeout releases both ports and ignores a late reply',async t=>{
 let lateReply;const h=harness(port=>{lateReply=()=>port.onmessage;});
 t.mock.timers.enable({apis:['setTimeout']});
 try{
  const pending=request('STATUS');await Promise.resolve();
  const rejected=assert.rejects(pending,/Offline worker timed out/);
  t.mock.timers.tick(30000);await rejected;
  assert.equal(h.port.closed,true);assert.equal(h.port2.closed,true);assert.equal(lateReply(),null);
 }finally{t.mock.timers.reset();h.restore();}
});

test('worker response with non-string error is safely surfaced and closes ports',async()=>{
 const h=harness(p=>queueMicrotask(()=>p.onmessage({data:{error:{code:'unavailable'}}})));
 try{await assert.rejects(request('STATUS'));assert.equal(h.port.closed,true);assert.equal(h.port2.closed,true);}finally{h.restore();}
});
