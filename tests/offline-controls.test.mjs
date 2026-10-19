import test from 'node:test';
import assert from 'node:assert/strict';
import {attachOfflineCheck} from '../src/core/offline-controls.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness(options={}){
 const button=new EventTarget();button.setAttribute=(key,value)=>{button[key]=value;};button.remove=()=>{button.removed=true;};
 const status={id:'offline',parentNode:{},ownerDocument:{createElement(tag){assert.equal(tag,'button');return button;}},after(node){assert.equal(node,button);}};
 return {button,controls:attachOfflineCheck(status,options)};
}
test('offline check is accessible, verifies manually, and coalesces repeated taps',async()=>{
 let count=0,updates=0,release;const h=harness({verify:async()=>{count++;await new Promise(resolve=>{release=resolve;});},checkForUpdate:()=>{updates++;},isOnline:()=>true});
 assert.equal(h.button.type,'button');assert.equal(h.button['aria-controls'],'offline');assert.equal(h.button.textContent,'Check offline files');
 h.button.dispatchEvent(new Event('click'));h.button.dispatchEvent(new Event('click'));await tick();
 assert.equal(count,1);assert.equal(updates,1);assert.equal(h.button.disabled,true);assert.equal(h.button.textContent,'Checking offline files…');
 release();await tick();assert.equal(h.button.disabled,false);assert.equal(h.button.textContent,'Check offline files');h.controls.stop();
});
test('offline manual check avoids network discovery and remains retryable after failure',async()=>{
 let checks=0,updates=0;const h=harness({verify:async()=>{if(++checks===1)throw Error('storage unavailable');},checkForUpdate:()=>{updates++;},isOnline:()=>false});
 h.button.dispatchEvent(new Event('click'));await tick();assert.equal(h.button.disabled,false);
 h.button.dispatchEvent(new Event('click'));await tick();assert.equal(checks,2);assert.equal(updates,0);h.controls.stop();
});
test('stalled update discovery does not hold the manual check and disposal removes control',async()=>{
 let checks=0;const h=harness({verify:async()=>{checks++;},checkForUpdate:()=>new Promise(()=>{}),isOnline:()=>true});
 h.button.dispatchEvent(new Event('click'));await tick();assert.equal(h.button.disabled,false);assert.equal(checks,1);
 h.controls.stop();assert.equal(h.button.removed,true);h.button.dispatchEvent(new Event('click'));await tick();assert.equal(checks,1);
});
test('pages without a status element do not gain a check control',()=>{
 assert.doesNotThrow(()=>attachOfflineCheck(undefined,{}).stop());
});

test('a throwing connectivity probe never strands manual offline verification',async()=>{
 let checks=0,updates=0;
 const h=harness({verify:async()=>{checks++;},checkForUpdate:()=>{updates++;},isOnline:()=>{throw Error('network state unavailable');}});
 h.button.dispatchEvent(new Event('click'));await tick();
 assert.equal(checks,1);assert.equal(updates,0);assert.equal(h.button.disabled,false);
 h.button.dispatchEvent(new Event('click'));await tick();
 assert.equal(checks,2);assert.equal(h.button.textContent,'Check offline files');
 h.controls.stop();
});
