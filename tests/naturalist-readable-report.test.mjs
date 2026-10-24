import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {naturalistReadableReport} from '../src/core/naturalist-readable-report.js';
import {newReviewDecisions} from '../src/core/naturalist-review-state.js';
function packet(){const entries=[{index:0,source_text:'Sea otter claim.',route:{action:'update-existing',app_id:'sea-otter',section_id:'diet'},review:{flags:[]},reviewed_app_version:'1.0',reviewed_section_snapshot:JSON.stringify({id:'diet',text:'Current diet section.'})},{index:1,source_text:'Conflicting claim.',conflict_with:[0],review:{flags:['scientific-conflict']}}];return {kind:'mba-v2-naturalist-review-packet',original_source:'  日本語 🦦\r\nOriginal notes.  ',review_context_sha256:'a'.repeat(64),entries,review_decisions:newReviewDecisions(entries)};}
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

test('portable report includes full paragraph and captured destination evidence without altering annotations',()=>{
 const p=packet(),entry=p.entries[0];
 entry.source_block='  Paragraph context 日本語.\r\nSea otter claim. <literal>  ';
 entry.reviewed_app_version='2.3.4';
 entry.reviewed_section_snapshot=JSON.stringify({id:'diet',title:'Diet 日本語',text:'Current diet section.',caption:'  Caption\r\n<literal> '});
 p.entries[1].source_block=p.entries[1].source_text;
 const before=JSON.stringify(p),text=naturalistReadableReport(p);
 assert(text.includes('ORIGINAL SOURCE PARAGRAPH — classification context\n'+entry.source_block));
 assert.equal(text.split('ORIGINAL SOURCE PARAGRAPH — classification context').length-1,1);
 assert(text.includes('Destination: sea-otter / diet\nCaptured app version: 2.3.4\nCaptured section title: Diet 日本語'));
 assert(text.includes('Captured caption:\n  Caption\r\n<literal> '));
 assert(text.includes('Captured app version: unavailable'));
 assert(text.includes('Scientific status: pending'));assert(text.includes('Editorial status: pending'));
 assert.equal(JSON.stringify(p),before);
});


test('portable report never presents mismatched or incomplete section evidence as destination wording',()=>{
 for(const mutate of [
  entry=>entry.reviewed_section_snapshot=JSON.stringify({id:'other',title:'Wrong title',text:'Wrong section',caption:'Wrong caption'}),
  entry=>delete entry.reviewed_app_version,
  entry=>delete entry.route.app_id,
  entry=>entry.reviewed_section_snapshot='null',
  entry=>entry.reviewed_section_snapshot='not JSON'
 ]){
  const p=packet();mutate(p.entries[0]);const before=JSON.stringify(p),report=naturalistReadableReport(p);
  assert(report.includes('Regenerate the classification before approving this update.'));
  assert(report.includes('Captured section title: unavailable'));
  assert(!report.includes('Wrong section'));assert(!report.includes('Wrong title'));assert(!report.includes('Wrong caption'));
  assert(!report.includes('CURRENT SECTION — classification snapshot\nCurrent diet section.'));
  assert(report.includes(p.original_source));assert(report.includes('Scientific status: pending'));
  assert.equal(JSON.stringify(p),before);
 }
});

test('portable worklist includes pending, revision, flagged originals and blockers without changing decisions',()=>{
 const p=packet();p.entries.push({index:2,source_text:'Duplicate source.',duplicate_of:0,review:{flags:[]}});
 p.review_decisions=newReviewDecisions(p.entries);
 Object.assign(p.review_decisions[0],{scientific_status:'verified',editorial_status:'approved',proposed_action:'new-content'});
 Object.assign(p.review_decisions[1],{scientific_status:'needs-revision',editorial_status:'approved',proposed_action:'no-change'});
 const before=JSON.stringify(p),report=naturalistReadableReport(p);
 const worklist=report.split('REVIEW WORKLIST')[1].split('ORIGINAL SOURCE')[0];
 assert(worklist.includes('Statement 1: classifier or relationship comparison required; blocked: duplicate, scientific-conflict'));
 assert(worklist.includes('Statement 2: scientific needs-revision; classifier or relationship comparison required'));
 assert(worklist.includes('Statement 3: scientific pending; editorial pending; action needs-review; classifier or relationship comparison required'));
 const original=report.split('STATEMENT 1\n')[1].split('STATEMENT 2\n')[0];
 assert(original.includes('Referenced by: statement 2 (potential conflict); statement 3 (possible duplicate)'));
 assert.equal(JSON.stringify(p),before);
 assert(report.includes('not publication authorization'));
});

test('complete unflagged report worklist preserves separate draft and publication gates',()=>{
 const p=packet();delete p.entries[1].conflict_with;p.entries[1].review.flags=[];
 p.review_decisions.forEach(d=>Object.assign(d,{scientific_status:'verified',editorial_status:'approved',proposed_action:'no-change'}));
 const before=JSON.stringify(p),report=naturalistReadableReport(p);
 assert(report.includes('No incomplete, flagged or blocked statements. Draft validation and publication authorization remain separate.'));
 assert.equal(report.match(/Referenced by: none recorded/g).length,2);
 assert.equal(JSON.stringify(p),before);
});
