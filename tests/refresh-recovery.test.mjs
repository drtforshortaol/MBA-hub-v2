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
const active={postMessage(message,ports){assert.equal(message.type,'STATUS');ports[0].postMessage({complete:true,count:360,total:360,release:'current'});}};
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


test('missing or partial offline setup explicitly restores the same release before reopening',async()=>{
 for(const initial of [{complete:false,count:0,total:0,release:'current'},{complete:false,count:1,total:360,release:'current'}]){
  const commands=[];
  const h=recoveryPage({register:async()=>({...registration(),active:{postMessage(message,ports){commands.push(message.type);ports[0].postMessage(message.type==='STATUS'?initial:{complete:true,count:360,total:360,release:'current'});}}})});
  await h.done;assert.deepEqual(commands,['STATUS','RECOVER_OFFLINE']);assert.equal(h.navigations.length,1);
  assert.ok(h.ports.every(port=>port.closed));assert.equal(h.timers.size,0);
 }
});

test('failed restoration keeps the page open and never activates or clears data',async()=>{
 const commands=[];const h=recoveryPage({register:async()=>({...registration(),active:{postMessage(message,ports){commands.push(message.type);ports[0].postMessage(message.type==='STATUS'?{complete:false,count:0,total:0,release:'current'}:{error:'Release manifest unavailable'});}}})});
 await h.done;assert.deepEqual(commands,['STATUS','RECOVER_OFFLINE']);assert.deepEqual(h.navigations,[]);assert.match(h.status.textContent,/manifest unavailable/);
});

for(const [name,status] of [
 ['truthy completion',{complete:'yes',count:360,total:360,release:'current'}],
 ['missing counts',{complete:true,release:'current'}],
 ['premature completion',{complete:true,count:359,total:360,release:'current'}],
 ['inconsistent incomplete flag',{complete:false,count:360,total:360,release:'current'}],
 ['empty inventory marked ready',{complete:true,count:0,total:0,release:'current'}],
 ['negative counts',{complete:false,count:-1,total:360,release:'current'}],
 ['unsafe counts',{complete:true,count:Number.MAX_SAFE_INTEGER+1,total:Number.MAX_SAFE_INTEGER+1,release:'current'}],
 ['missing release',{complete:true,count:360,total:360}],
 ['blank release',{complete:true,count:360,total:360,release:'  '}]
])test(`refresh rejects ${name} before fetching or navigating`,async()=>{
 let fetches=0;const commands=[];
 const h=recoveryPage({register:async()=>({...registration(),active:{postMessage(message,ports){commands.push(message.type);ports[0].postMessage(status);}}}),fetch:async()=>{fetches++;throw Error('must not fetch');}});
 await h.done;
 assert.equal(fetches,0);assert.deepEqual(commands,['STATUS']);assert.deepEqual(h.navigations,[]);
 assert.match(h.status.textContent,/readiness could not be verified/);
 assert.ok(h.ports.every(port=>port.closed));assert.equal(h.timers.size,0);
});

test('refresh rejects incomplete or malformed recovery results before reopening',async()=>{
 for(const recovered of [{complete:false,count:1,total:2,release:'current'},{complete:true,count:1,total:2,release:'current'}]){
  const h=recoveryPage({register:async()=>({...registration(),active:{postMessage(message,ports){ports[0].postMessage(message.type==='STATUS'?{complete:false,count:0,total:0,release:'current'}:recovered);}}})});
  await h.done;assert.deepEqual(h.navigations,[]);assert.match(h.status.textContent,/not complete|could not be verified/);
 }
});

test('refresh never reopens when restored worker release differs from the live deployment',async()=>{
 const h=recoveryPage({register:async()=>({...registration(),active:{postMessage(message,ports){ports[0].postMessage(message.type==='STATUS'?{complete:false,count:0,total:0,release:'current'}:{complete:true,count:1,total:1,release:'current'});}}}),fetch:async()=>({ok:true,json:async()=>({release:'newer'})})});
 await h.done;assert.deepEqual(h.navigations,[]);assert.match(h.status.textContent,/still preparing/);
});


test('corrupt inventory status remains a safe actionable diagnostic without automatic recovery',async()=>{
 const commands=[];const h=recoveryPage({register:async()=>({...registration(),active:{postMessage(message,ports){commands.push(message.type);ports[0].postMessage({error:'Cached release inventory integrity mismatch'});}}})});
 await h.done;assert.deepEqual(commands,['STATUS']);assert.deepEqual(h.navigations,[]);
 assert.match(h.status.textContent,/integrity mismatch/);assert.match(h.status.textContent,/do not clear data or reinstall/);assert.match(h.status.textContent,/Install & Help/);
});

test('typed corrupt metadata triggers explicit recovery with full readiness and live release verification',async()=>{
 const commands=[];const h=recoveryPage({register:async()=>({...registration(),active:{postMessage(message,ports){commands.push(message.type);ports[0].postMessage(message.type==='STATUS'?{error:'Invalid cached release manifest',code:'OFFLINE_INVENTORY_INVALID'}:{complete:true,count:1,total:1,release:'current'});}}})});
 await h.done;assert.deepEqual(commands,['STATUS','RECOVER_OFFLINE']);assert.equal(h.navigations.length,1);assert.ok(h.ports.every(port=>port.closed));
});

for(const code of [undefined,'OTHER_ERROR',true])test(`unrecognized STATUS error code ${code} cannot trigger restoration`,async()=>{
 const commands=[];const h=recoveryPage({register:async()=>({...registration(),active:{postMessage(message,ports){commands.push(message.type);ports[0].postMessage({error:'Invalid cached release manifest',code});}}})});
 await h.done;assert.deepEqual(commands,['STATUS']);assert.deepEqual(h.navigations,[]);
});

test('typed corrupt metadata recovery failure preserves diagnostics and prevents navigation',async()=>{
 const commands=[];const h=recoveryPage({register:async()=>({...registration(),active:{postMessage(message,ports){commands.push(message.type);ports[0].postMessage(message.type==='STATUS'?{error:'Invalid cached release manifest',code:'OFFLINE_INVENTORY_INVALID'}:{error:'Deployment changed during offline preparation'});}}})});
 await h.done;assert.deepEqual(commands,['STATUS','RECOVER_OFFLINE']);assert.deepEqual(h.navigations,[]);assert.match(h.status.textContent,/Deployment changed/);assert.match(h.status.textContent,/do not clear data/);
});


test('typed metadata recovery attempts reconstruction only once if it remains incomplete',async()=>{
 const commands=[];const h=recoveryPage({register:async()=>({...registration(),active:{postMessage(message,ports){commands.push(message.type);ports[0].postMessage(message.type==='STATUS'?{error:'invalid inventory',code:'OFFLINE_INVENTORY_INVALID'}:{complete:false,count:1,total:2,release:'current'});}}})});
 await h.done;assert.deepEqual(commands,['STATUS','RECOVER_OFFLINE']);assert.deepEqual(h.navigations,[]);assert.match(h.status.textContent,/not complete/);
});
