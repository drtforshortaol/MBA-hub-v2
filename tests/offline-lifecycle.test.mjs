import test from 'node:test';
import assert from 'node:assert/strict';
import {observeOfflineLifecycle} from '../src/core/offline-lifecycle.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness(refresh=async()=>{}) {
 const window=new EventTarget(),document=new EventTarget(),serviceWorker=new EventTarget();
 document.visibilityState='visible';let updates=0;const errors=[];
 const lifecycle=observeOfflineLifecycle({window,document,serviceWorker,refresh,checkForUpdate:()=>{updates++;return Promise.reject(Error('offline'));},onError:error=>errors.push(error.message)});
 return {window,document,serviceWorker,lifecycle,errors,get updates(){return updates;}};
}
test('installed app re-verifies offline cache after pageshow, foreground and worker changes',async()=>{
 let count=0;const h=harness(async()=>{count++;});
 for(const [target,type] of [[h.window,'pageshow'],[h.document,'visibilitychange'],[h.serviceWorker,'controllerchange'],[h.window,'offline']]){
  target.dispatchEvent(new Event(type));await tick();
 }
 assert.equal(count,4);assert.equal(h.updates,0);h.lifecycle.stop();
});
test('hidden app avoids unnecessary resume verification and online checks update safely',async()=>{
 let count=0;const h=harness(async()=>{count++;});h.document.visibilityState='hidden';
 h.document.dispatchEvent(new Event('visibilitychange'));h.window.dispatchEvent(new Event('pageshow'));await tick();assert.equal(count,0);
 h.window.dispatchEvent(new Event('online'));await tick();assert.equal(count,1);assert.equal(h.updates,1);h.lifecycle.stop();
});
test('resume bursts coalesce without concurrent checks and recheck once after an in-flight result',async()=>{
 let count=0,release;const h=harness(async()=>{count++;if(count===1)await new Promise(resolve=>{release=resolve;});});
 const pending=h.lifecycle.verify();for(let i=0;i<10;i++)h.window.dispatchEvent(new Event('pageshow'));
 assert.equal(count,1);release();await pending;assert.equal(count,2);h.lifecycle.stop();
});
test('failed verification reports failure and later resume recovers',async()=>{
 let count=0;const h=harness(async()=>{if(++count===1)throw Error('storage evicted');});
 await h.lifecycle.verify();assert.deepEqual(h.errors,['storage evicted']);h.window.dispatchEvent(new Event('pageshow'));await tick();assert.equal(count,2);h.lifecycle.stop();
});
test('stopping lifecycle removes listeners and cancels queued verification',async()=>{
 let count=0,release;const h=harness(async()=>{count++;await new Promise(resolve=>{release=resolve;});});
 const pending=h.lifecycle.verify();h.window.dispatchEvent(new Event('pageshow'));h.lifecycle.stop();release();await pending;
 h.window.dispatchEvent(new Event('online'));h.document.dispatchEvent(new Event('visibilitychange'));await h.lifecycle.verify();await tick();
 assert.equal(count,1);assert.equal(h.updates,0);
});
