import test from 'node:test';
import assert from 'node:assert/strict';
import {request} from '../src/core/worker-channel.js';
function harness(reply){
 const previousNavigator=globalThis.navigator,previousChannel=globalThis.MessageChannel;
 const port={closed:false,onmessage:null,onmessageerror:null,close(){this.closed=true;}};
 const worker={postMessage(){reply?.(port);}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{ready:Promise.resolve({active:worker}),controller:null}}});
 globalThis.MessageChannel=class{constructor(){this.port1=port;this.port2={closed:false,close(){this.closed=true;}};}};
 return {port,restore(){if(previousNavigator===undefined)delete globalThis.navigator;else Object.defineProperty(globalThis,'navigator',{configurable:true,value:previousNavigator});if(previousChannel===undefined)delete globalThis.MessageChannel;else globalThis.MessageChannel=previousChannel;}};
}
test('worker channel closes after successful reply',async()=>{const h=harness(p=>queueMicrotask(()=>p.onmessage({data:{complete:true}})));try{assert.equal((await request('STATUS')).complete,true);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel rejects malformed response and closes',async()=>{const h=harness(p=>queueMicrotask(()=>p.onmessage({data:null})));try{await assert.rejects(request('STATUS'),/Invalid offline worker response/);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel closes after postMessage throws',async()=>{const h=harness(()=>{throw Error('send failed');});try{await assert.rejects(request('STATUS'),/send failed/);assert.equal(h.port.closed,true);}finally{h.restore();}});

test('worker channel rejects decoding errors and releases both ports',async()=>{const h=harness(p=>queueMicrotask(()=>p.onmessageerror()));try{await assert.rejects(request('STATUS'),/could not be decoded/);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel surfaces worker-reported errors',async()=>{const h=harness(p=>queueMicrotask(()=>p.onmessage({data:{error:'cache unavailable'}})));try{await assert.rejects(request('STATUS'),/cache unavailable/);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel ignores duplicate replies after settling',async()=>{let replies=0;const h=harness(p=>queueMicrotask(()=>{p.onmessage({data:{complete:true}});replies++;if(p.onmessage)p.onmessage({data:{complete:false}});}));try{assert.equal((await request('STATUS')).complete,true);assert.equal(replies,1);assert.equal(h.port.closed,true);}finally{h.restore();}});
test('worker channel rejects when no active worker is available',async()=>{const h=harness();try{Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{ready:Promise.resolve({active:null}),controller:null}}});await assert.rejects(request('STATUS'),/No active offline worker/);}finally{h.restore();}});
