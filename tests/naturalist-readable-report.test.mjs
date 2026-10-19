import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {naturalistReadableReport} from '../src/core/naturalist-readable-report.js';
import {newReviewDecisions} from '../src/core/naturalist-review-state.js';
function packet(){const entries=[{index:0,source_text:'Sea otter claim.',route:{action:'update-existing',app_id:'sea-otter',section_id:'diet'},review:{flags:[]},reviewed_section_snapshot:JSON.stringify({id:'diet',text:'Current diet section.'})},{index:1,source_text:'Conflicting claim.',conflict_with:[0],review:{flags:['scientific-conflict']}}];return {kind:'mba-v2-naturalist-review-packet',original_source:'  日本語 🦦\r\nOriginal notes.  ',review_context_sha256:'a'.repeat(64),entries,review_decisions:newReviewDecisions(entries)};}
test('readable report preserves source and pending draft without approving it',()=>{
 const p=packet(),before=JSON.stringify(p),proposal='  Proposed diet 日本語\r\n ';const text=naturalistReadableReport(p,[[0,proposal]]);
 assert(text.includes(p.original_source));assert(text.includes(proposal));assert(text.includes(p.review_context_sha256));assert(text.includes('Scientific status: pending'));assert(text.includes('Editorial status: pending'));assert(text.includes('CURRENT SECTION — classification snapshot\nCurrent diet section.'));assert(text.includes('PROPOSED REPLACEMENT — unverified draft'));assert(text.includes('Potential conflict statements: 1'));assert(text.includes('not publication authorization'));assert.equal(JSON.stringify(p),before);
});
test('readable report retains blocked conflict actions and rejects malformed work',()=>{
 const p=packet();p.review_decisions.forEach(d=>Object.assign(d,{scientific_status:'verified',editorial_status:'approved',proposed_action:'new-content'}));
 const text=naturalistReadableReport(p);assert(text.includes('0 queued; 2 blocked'));assert.equal(text.match(/BLOCKED — scientific-conflict/g).length,2);
 for(const bad of [{...p,review_context_sha256:'old'},{...p,review_decisions:[]},{...p,entries:[null,null]}])assert.throws(()=>naturalistReadableReport(bad));
 assert.throws(()=>naturalistReadableReport(p,[[0,'one'],[0,'two']]));assert.throws(()=>naturalistReadableReport(p,[[2,'wrong index']]));
});
test('actual report button downloads current in-progress text and refuses stale review',async()=>{
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8'),start=code.indexOf('   const readableReport='),end=code.indexOf('   const refreshQueue=',start);
 const p=packet(),links=[],blobs=[],context={naturalistReadableReport,packet:p,replacementDrafts:new Map([[0,'Current unfinished proposal']]),isCurrentReview:()=>true,intakeStatus:{},Blob,URL:{createObjectURL(blob){blobs.push(blob);return 'blob:report';},revokeObjectURL(){}},setTimeout(fn){fn();},document:{createElement(tag){const el={addEventListener(type,fn){this[type]=fn;},click(){links.push(el);}};return el;}},reviewOutput:{append(){}}};
 vm.createContext(context);vm.runInContext(code.slice(start,end)+'\nglobalThis.download=readableReport;',context);context.download.click();
 assert.equal(links[0].download,'mba-naturalist-review-report.txt');assert.equal(blobs[0].type,'text/plain;charset=utf-8');assert((await blobs[0].text()).includes('Current unfinished proposal'));assert.equal(p.review_decisions[0].scientific_status,'pending');
 context.isCurrentReview=()=>false;context.download.click();assert.equal(blobs.length,1);assert.match(context.intakeStatus.textContent,/no longer current/);
});

test('readable report enforces source and replacement boundaries without changing review state',()=>{
 const p=packet(),original=p.original_source,decisions=JSON.stringify(p.review_decisions);
 p.original_source='x'.repeat(1000001);
 assert.throws(()=>naturalistReadableReport(p),/source exceeds report limit/);
 p.original_source='x'.repeat(1000000);
 assert.doesNotThrow(()=>naturalistReadableReport(p));
 p.original_source=original;
 assert.throws(()=>naturalistReadableReport(p,[[0,'x'.repeat(20001)]]),/Invalid replacement text/);
 assert.throws(()=>naturalistReadableReport(p,[[0,42]]),/Invalid replacement text/);
 assert.throws(()=>naturalistReadableReport(p,[[0,'first'],[0,'second']]),/Invalid replacement text/);
 assert.throws(()=>naturalistReadableReport(p,[[Number.NaN,'bad']]),/Invalid replacement text/);
 assert.equal(JSON.stringify(p.review_decisions),decisions);
});

test('readable report rejects malformed replacement container and negative indexes',()=>{
 const p=packet();
 for(const invalid of [null,{},'draft',[[ -1,'bad']],[[0,'valid'],['0','bad']]])assert.throws(()=>naturalistReadableReport(p,invalid),/Invalid replacement text/);
});
