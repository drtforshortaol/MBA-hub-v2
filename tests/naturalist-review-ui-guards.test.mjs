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
