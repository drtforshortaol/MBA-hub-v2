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
 assert.match(code,/item\.append\(label,body,flags,related,details,warning,form\)/);
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
