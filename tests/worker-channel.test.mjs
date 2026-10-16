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
