import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(new URL('../',import.meta.url).pathname);
test('Naturalist review UI enforces generation and source freshness',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/let activeReviewGeneration=0/);
 assert.match(code,/activeReviewGeneration\+\+/);
 assert.match(code,/generation!==activeReviewGeneration\|\|intakeText\.value!==source/);
 assert.match(code,/reviewOutput\.dataset\.reviewFingerprint===sourceFingerprint/);
 assert.match(code,/delete reviewOutput\.dataset\.reviewFingerprint/);
 assert.match(code,/validateDecisions\(\)/);
});
test('developer bundle contains Naturalist review safeguards and tester excludes developer UI',()=>{
 const developer=fs.readFileSync(path.join(root,'dist/developer/core/developer.js'),'utf8');
 assert.match(developer,/activeReviewGeneration/);
 assert.match(developer,/naturalist-review-state\.js/);
 assert.equal(fs.existsSync(path.join(root,'dist/tester/core/developer.js')),false);
});

test('mobile review navigation exposes one expanded statement at a time',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/aria-label','Naturalist statement navigation/);
 assert.match(code,/statementCards\[i\]\.hidden=i!==activeStatement/);
 assert.match(code,/statementCards\[i\]\.open=i===activeStatement/);
 assert.match(code,/previous\.disabled=activeStatement===0/);
 assert.match(code,/next\.disabled=activeStatement===statementCards\.length-1/);
 assert.match(code,/statementCards\.length>1/);
});

test('scientific conflict links navigate to related statements without editing decisions',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/entry\.conflict_with\?\.length/);
 assert.match(code,/Number\.isInteger\(relatedIndex\)/);
 assert.match(code,/relatedIndex>=packet\.entries\.length/);
 assert.match(code,/showStatement\(relatedIndex\)/);
 assert.match(code,/statementCards\[relatedIndex\]\?\.scrollIntoView/);
 assert.match(code,/item\.append\(label,body,flags,related,technical,warning,form\)/);
});

test('mobile reviewer can advance to incomplete statements without granting publication',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/Next incomplete review/);
 assert.match(code,/decision\.scientific_status!=='verified'\|\|decision\.editorial_status!=='approved'/);
 assert.match(code,/\(activeStatement\+offset\)%count/);
 assert.match(code,/if\(!isCurrentReview\(\)\)return/);
 assert.match(code,/showStatement\(index\)/);
 assert.match(code,/Publication remains disabled/);
});
test('asynchronous digest completion rejects superseded review generations',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/if\(generation!==activeReviewGeneration\|\|intakeText\.value!==source\)\{intakeStatus\.textContent='Source or review generation changed/);
});

test('flagged-statement triage provides a review-only shortcut',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/Next flagged statement/);
 assert.match(code,/packet\.entries\[index\]/);
 assert.match(code,/entry\.review\.flags\.length/);
 assert.match(code,/showStatement\(index\)/);
 assert.match(code,/potential scientific conflict pairs/);
 assert.match(code,/All findings require human review/);
});

test('review identity includes conflict and duplicate relationships',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/conflict_with:e\.conflict_with,duplicate_of:e\.duplicate_of/);
 assert.match(code,/if\(generation!==activeReviewGeneration\|\|intakeText\.value!==source\)return;\s*packet\.review_context_sha256=/);
});
test('disabled browser storage does not prevent generating downloadable review packets',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/try\{saved=readReview\(localStorage,reviewKey,sourceFingerprint,packet\.entries\);\}catch/);
 assert.match(code,/if\(saved\)packet\.review_decisions=saved/);
 assert.match(code,/Download review packet/);
});

test('duplicate navigation links to original statement without altering decisions',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/Number\.isInteger\(entry\.duplicate_of\)/);
 assert.match(code,/entry\.duplicate_of<packet\.entries\.length/);
 assert.match(code,/View original statement/);
 assert.match(code,/showStatement\(entry\.duplicate_of\)/);
 assert.match(code,/if\(!isCurrentReview\(\)\)return;showStatement\(entry\.duplicate_of\)/);
});

test('all reviewer interaction paths reject stale review contexts',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/previous\.addEventListener\('click',\(\)=>\{if\(isCurrentReview\(\)\)showStatement/);
 assert.match(code,/next\.addEventListener\('click',\(\)=>\{if\(isCurrentReview\(\)\)showStatement/);
 assert.match(code,/jump\.addEventListener\('click',\(\)=>\{if\(!isCurrentReview\(\)\)return;showStatement/);
 assert.match(code,/select\.addEventListener\('change',\(\)=>\{if\(!isCurrentReview\(\)\)return;decision\[key\]=/);
 assert.match(code,/notes\.addEventListener\('input',\(\)=>\{if\(!isCurrentReview\(\)\)return;decision\.reviewer_notes=/);
});

test('Developer Mode recovery requires matching review context and storage success',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/importReviewPacket\(JSON\.parse\(await file\.text\(\)\),sourceFingerprint,packet\.entries\)/);
 assert.match(code,/if\(!isCurrentReview\(\)\)return;/);
 assert.match(code,/if\(file\.size>2000000\)/);
 assert.match(code,/if\(!saved\)\{intakeStatus\.textContent='Storage unavailable/);
 assert.match(code,/Decisions restored locally/);
});

test('inline comparison presents original evidence without changing review decisions',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/aria-label','Statement comparison/);
 assert.match(code,/new Set\(candidates\)/);
 assert.match(code,/candidate>=packet\.entries\.length/);
 assert.match(code,/Current: '\+entry\.source_text/);
 assert.match(code,/Compare: '\+other\.source_text/);
 assert.match(code,/Other proposed placement:/);
 assert.match(code,/related\.append\(comparison\)/);
});

test('existing-content comparison presents source, classifier evidence and review warning',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/aria-label','Existing content comparison/);
 assert.match(code,/Naturalist statement: '\+entry\.source_text/);
 assert.match(code,/JSON\.stringify\(entry\.existing_content\?\?null,null,2\)/);
 assert.match(code,/Proposed destination:/);
 assert.match(code,/Automated comparison is advisory/);
 assert.match(code,/details\.append\(existingComparison\)/);
});

test('revision triage navigates reviewer decisions without changing them',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/Next needs-revision decision/);
 assert.match(code,/decision\.scientific_status==='needs-revision'\|\|decision\.editorial_status==='needs-revision'/);
 assert.match(code,/if\(!isCurrentReview\(\)\)return/);
 assert.match(code,/navigation\.append\(previous,position,next,nextPending,nextFlagged,nextRevision,jumpToStatement\)/);
});

test('successful recovery automatically reloads persisted review without publishing',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/if\(!saved\)\{intakeStatus\.textContent='Storage unavailable/);
 assert.match(code,/Decisions restored locally\. Reloading review interface/);
 assert.match(code,/reviewButton\.click\(\)/);
 assert.match(code,/if\(!isCurrentReview\(\)\|\|generation!==activeReviewGeneration\)return;\s*if\(!imported\)/);
});

test('direct statement picker stays synchronized with previous, next and flagged navigation',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/aria-label','Jump to statement/);
 assert.match(code,/jumpToStatement\.value=String\(activeStatement\)/);
 assert.match(code,/jumpToStatement\.addEventListener\('change'/);
 assert.match(code,/if\(!isCurrentReview\(\)\)return/);
 assert.match(code,/index>=0&&index<statementCards\.length/);
 assert.match(code,/navigation\.append\(previous,position,next,nextPending,nextFlagged,nextRevision,jumpToStatement\)/);
});

test('asynchronous recovery and reset reject superseded generation',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/recoveryInput\.addEventListener\('change',async\(\)=>\{\s*if\(!isCurrentReview\(\)\|\|generation!==activeReviewGeneration\)return/);
 assert.match(code,/if\(!isCurrentReview\(\)\|\|generation!==activeReviewGeneration\)return;\s*if\(!imported\)/);
 assert.match(code,/if\(!isCurrentReview\(\)\|\|generation!==activeReviewGeneration\)\{intakeStatus\.textContent='Review no longer current\. Regenerate before resetting/);
});

test('all reviewer controls bind to the active generation as well as fingerprint',()=>{
 const code=fs.readFileSync(path.join(root,'src/core/developer.js'),'utf8');
 assert.match(code,/const isCurrentReview=\(\)=>generation===activeReviewGeneration&&intakeText\.value===source&&reviewOutput\.dataset\.reviewFingerprint===sourceFingerprint/);
});
