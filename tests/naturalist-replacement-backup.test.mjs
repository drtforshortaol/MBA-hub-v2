import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createReplacementBackup,readReplacementBackup} from '../src/core/naturalist-replacement-drafts.js';
const fingerprint='a'.repeat(64),entries=[{index:0,route:{action:'update-existing'}},{index:1,route:{action:'update-existing'}}];
const backup=drafts=>JSON.stringify(createReplacementBackup(fingerprint,entries,drafts));
test('portable backup preserves proposal text without decisions or authority',()=>{
 const text=' 日本語 🐙\r\n Proposal ';const packet=createReplacementBackup(fingerprint,entries,[[0,text]]);
 assert.deepEqual(readReplacementBackup(JSON.stringify(packet),fingerprint,entries),{valid:true,drafts:[[0,text]]});
 assert.equal(Object.hasOwn(packet,'review_decisions'),false);
 for(const changed of [{...packet,published:true},{...packet,can_auto_publish:true},{...packet,review_context_sha256:'b'.repeat(64)},{...packet,drafts:[[0,'one'],[0,'two']]},{...packet,drafts:[[1,'x'.repeat(20001)]]}])assert.equal(readReplacementBackup(JSON.stringify(changed),fingerprint,entries).valid,false);
 assert.equal(readReplacementBackup(backup([[0,'one']]),fingerprint,[{index:0,route:{action:'new-content'}}]).valid,false);
 assert.equal(readReplacementBackup('x'.repeat(2000001),fingerprint,entries).valid,false);
});
test('downloadable backups fit the file picker byte limit including Unicode',()=>{
 const many=Array.from({length:40},(_,index)=>({index,route:{action:'update-existing'}}));
 assert.throws(()=>createReplacementBackup(fingerprint,many,many.map(({index})=>[index,'語'.repeat(20000)])),/recovery limit/);
});
function harness(){
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 const start=code.indexOf('   const replacementDownload='),end=code.indexOf('   const refreshQueue=',start);
 const context={createReplacementBackup,readReplacementBackup,sourceFingerprint:fingerprint,packet:{entries,review_decisions:[{scientific_status:'pending'}]},replacementDrafts:new Map([[1,'Current second draft']]),replacementRecoveryStatus:{},isCurrentReview:()=>true,document:{createElement(){return {addEventListener(type,handler){this[type]=handler;},append(){}};}},reviewOutput:{append(){}},saveReplacements(){context.saves++;},showQueue(){context.refreshes++;},saves:0,refreshes:0};
 vm.createContext(context);vm.runInContext(code.slice(start,end)+'\nglobalThis.input=replacementRestore;',context);return context;
}
function deferred(){let resolve;return {promise:new Promise(r=>resolve=r),resolve:value=>resolve(value)};}
test('actual restore handler merges proposal text and preserves pending decisions',async()=>{
 const h=harness(),decisions=h.packet.review_decisions;h.input.files=[{size:100,text:async()=>backup([[0,'Restored proposal']])}];await h.input.change();
 assert.equal(h.replacementDrafts.get(0),'Restored proposal');assert.equal(h.replacementDrafts.get(1),'Current second draft');assert.equal(h.packet.review_decisions,decisions);assert.equal(decisions[0].scientific_status,'pending');assert.equal(h.saves,1);assert.equal(h.refreshes,1);assert.equal(h.input.value,'');
});
test('actual restore rejects races, stale context and malformed files',async()=>{
 const h=harness(),old=deferred();h.input.files=[{size:100,text:()=>old.promise}];const first=h.input.change();
 h.replacementDrafts.set(0,'Newer edit');old.resolve(backup([[0,'Old file']]));await first;assert.equal(h.replacementDrafts.get(0),'Newer edit');assert.equal(h.saves,0);
 const slow=deferred();h.input.files=[{size:100,text:()=>slow.promise}];const stale=h.input.change();h.input.files=[{size:100,text:async()=>backup([[0,'New file']])}];await h.input.change();slow.resolve(backup([[0,'Stale file']]));await stale;assert.equal(h.replacementDrafts.get(0),'New file');assert.equal(h.saves,1);
 h.input.files=[{size:100,text:async()=>'{bad'}];await h.input.change();assert.equal(h.saves,1);
 const staleContext=deferred();h.input.files=[{size:100,text:()=>staleContext.promise}];const opening=h.input.change();h.isCurrentReview=()=>false;staleContext.resolve(backup([[0,'Wrong context']]));await opening;assert.equal(h.replacementDrafts.get(0),'New file');
});
