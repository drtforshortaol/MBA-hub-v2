import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
function harness({saved=true,imported=[{scientific_status:'verified',editorial_status:'approved'}]}={}){
 const start=source.indexOf('   let activeDecisionImport=0;'),end=source.indexOf('   reviewOutput.append(recoveryLabel);',start);
 let handler,writes=0,clicks=0,replacements=0;
 const context={generation:1,activeReviewGeneration:1,requireFreshIntakeReview:true,isCurrentReview:()=>true,packet:{entries:[],review_decisions:[{scientific_status:'pending',editorial_status:'pending'}]},sourceFingerprint:'context',reviewKey:'key',localStorage:{},recoveryInput:{value:'file.json',files:[],addEventListener(type,callback){handler=callback;}},intakeStatus:{textContent:''},reviewOutput:{dataset:{reviewFingerprint:'context'},replaceChildren(){replacements++;}},reviewButton:{click(){clicks++;}},importReviewPacket(){return imported;},writeReview(){writes++;return saved;}};
 vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 return {context,get writes(){return writes;},get clicks(){return clicks;},get replacements(){return replacements;},select(file){context.recoveryInput.files=[file];return handler();}};
}
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const file=(text='{}')=>({size:100,text:async()=>text});
test('explicit valid decision recovery exits fresh-source mode only after durable save',async()=>{
 const h=harness();await h.select(file());
 assert.equal(h.writes,1);assert.equal(h.clicks,1);assert.equal(h.replacements,1);
 assert.equal(h.context.requireFreshIntakeReview,false);assert.equal(h.context.recoveryInput.value,'');
 assert.equal(h.context.packet.review_decisions[0].scientific_status,'pending');
});
test('decision edits during file reading are preserved, never overwritten by recovery',async()=>{
 const h=harness(),read=deferred();const operation=h.select({size:100,text:()=>read.promise});
 h.context.packet.review_decisions[0].scientific_status='needs-revision';read.resolve('{}');await operation;
 assert.equal(h.writes,0);assert.equal(h.clicks,0);assert.equal(h.context.requireFreshIntakeReview,true);
 assert.match(h.context.intakeStatus.textContent,/decisions changed/);
 assert.equal(h.context.packet.review_decisions[0].scientific_status,'needs-revision');
});
test('newer file selection supersedes a slow older file and its errors',async()=>{
 for(const fail of [false,true]){
  const h=harness(),read=deferred();const old=h.select({size:100,text:()=>read.promise});
  await h.select(file());const message=h.context.intakeStatus.textContent;
  if(fail)read.reject(Error('old error'));else read.resolve('{}');await old;
  assert.equal(h.writes,1);assert.equal(h.clicks,1);assert.equal(h.context.intakeStatus.textContent,message);
 }
});
test('stale source, generation, malformed packet, oversized file and failed storage keep fresh review',async()=>{
 for(const scenario of ['source','generation','malformed','oversized','storage']){
  const h=harness({saved:scenario!=='storage',imported:scenario==='malformed'?null:[]}),read=deferred();
  const operation=h.select({size:scenario==='oversized'?2000001:100,text:()=>read.promise});
  if(scenario==='source')h.context.isCurrentReview=()=>false;
  if(scenario==='generation')h.context.activeReviewGeneration=2;
  read.resolve('{}');await operation;
  assert.equal(h.clicks,0,scenario);assert.equal(h.replacements,0,scenario);assert.equal(h.context.requireFreshIntakeReview,true,scenario);
  assert.equal(h.writes,scenario==='storage'?1:0,scenario);
 }
});
