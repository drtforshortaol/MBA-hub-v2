import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
test('Naturalist developer UI verifies read-only summary with bounded local file input',()=>{
 assert.match(source,/import \{verifyNaturalistReviewQueue\} from '\.\/naturalist-review-queue-import\.js'/);
 assert.match(source,/verifySummaryInput\.type='file'/);
 assert.match(source,/file\.size>1024\*1024/);
 assert.match(source,/verifyNaturalistReviewQueue\(payload,packet\.review_decisions,packet\.entries,sourceFingerprint\)/);
 assert.match(source,/Review changed during verification/);
 assert.match(source,/No changes made/);
 assert.match(source,/verifySummaryLabel,verifySummaryStatus/);
});
