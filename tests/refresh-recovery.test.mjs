import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function recoveryPage({register,fetch=async()=>({ok:true,json:async()=>({release:'current'})})}={}){
 const script=fs.readFileSync('src/refresh.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
 const status={textContent:''},serviceWorker=new EventTarget(),timers=new Map(),ports=[],navigations=[];
 let now=0,next=0;
 serviceWorker.register=register;
 class Channel{constructor(){this.port1={onmessage:null,onmessageerror:null,closed:false,close(){this.closed=true;}};this.port2={closed:false,close(){this.closed=true;},postMessage:data=>this.port1.onmessage?.({data})};ports.push(this.port1,this.port2);}}
 const done=vm.runInNewContext(script,{document:{querySelector:()=>status},navigator:{serviceWorker},location:{href:'https://example.test/v2/tester/refresh.html',replace:url=>navigations.push(String(url))},URL,MessageChannel:Channel,fetch,
  setTimeout(fn,delay){const id=++next;timers.set(id,{fn,at:now+delay});return id;},clearTimeout:id=>timers.delete(id)});
 return {status,serviceWorker,ports,navigations,timers,done,
  async advance(ms){now+=ms;for(const [id,timer]of [...timers])if(timer.at<=now){timers.delete(id);timer.fn();}await tick();}
 };
}
const active={postMessage(message,ports){assert.equal(message.type,'STATUS');ports[0].postMessage({complete:true,release:'current'});}};
const registration=()=>({update:async()=>{},active,installing:null,waiting:null});

test('recovery registration timeout is actionable and late resolution cannot activate or navigate',async()=>{
 let resolve;const h=recoveryPage({register:()=>new Promise(done=>{resolve=done;})});
 await h.advance(90000);await h.done;
 assert.match(h.status.textContent,/Reopen this refresh link while online/);
 let updates=0;resolve({...registration(),update:async()=>{updates++;}});await tick();
 assert.equal(updates,0);assert.deepEqual(h.navigations,[]);assert.equal(h.timers.size,0);
});

test('recovery shares one deadline across update and current-release fetch',async()=>{
 let resolveUpdate;const h=recoveryPage({register:async()=>({...registration(),update:()=>new Promise(done=>{resolveUpdate=done;})}),fetch:()=>new Promise(()=>{})});
 await tick();await h.advance(60000);resolveUpdate();await tick();
 assert.equal(h.ports.length,2);
 await h.advance(30000);await h.done;
 assert.match(h.status.textContent,/taking longer than expected/);
 assert.deepEqual(h.navigations,[]);assert.ok(h.ports.every(port=>port.closed));assert.equal(h.timers.size,0);
});

test('stalled installing worker deadline removes its state listener and prevents late activation',async()=>{
 const installing=new EventTarget();installing.state='installing';
 let activations=0;const h=recoveryPage({register:async()=>({...registration(),installing,waiting:{postMessage(){activations++;}}})});
 await tick();await h.advance(90000);await h.done;
 installing.state='installed';installing.dispatchEvent(new Event('statechange'));await tick();
 assert.equal(activations,0);assert.deepEqual(h.navigations,[]);assert.match(h.status.textContent,/taking longer/);
});

test('failed activation releases message ports and removes late controller navigation listener',async()=>{
 const h=recoveryPage({register:async()=>({...registration(),waiting:{postMessage(message,ports){assert.equal(message.type,'ACTIVATE_UPDATE');ports[0].postMessage({error:'Update is not completely verified'});}}})});
 await h.done;assert.match(h.status.textContent,/not completely verified/);assert.ok(h.ports.every(port=>port.closed));
 h.serviceWorker.dispatchEvent(new Event('controllerchange'));await tick();
 assert.deepEqual(h.navigations,[]);assert.equal(h.timers.size,0);
});

test('verified current recovery reopens Hub and cleans up channels and deadlines',async()=>{
 const h=recoveryPage({register:async()=>registration()});await h.done;
 assert.deepEqual(h.navigations,['https://example.test/v2/tester/index.html?home=1']);
 assert.ok(h.ports.every(port=>port.closed));assert.equal(h.timers.size,0);
});

test('verified waiting update retains explicit activation and fallback reopen behavior',async()=>{
 let activations=0;const h=recoveryPage({register:async()=>({...registration(),waiting:{postMessage(message,ports){assert.equal(message.type,'ACTIVATE_UPDATE');activations++;ports[0].postMessage({activating:true});}}})});
 await tick();assert.equal(activations,1);assert.deepEqual(h.navigations,[]);
 await h.advance(2000);await h.done;
 assert.equal(h.navigations.length,1);assert.ok(h.ports.every(port=>port.closed));assert.equal(h.timers.size,0);
});
