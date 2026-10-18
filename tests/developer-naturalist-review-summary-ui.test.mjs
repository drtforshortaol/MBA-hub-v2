import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
test('developer UI wires read-only review queue export with current-review guard',()=>{
 assert.match(source,/import \{exportNaturalistReviewQueue\} from '\.\/naturalist-review-queue-export\.js'/);
 assert.match(source,/Download review queue summary/);
 assert.match(source,/if\(!isCurrentReview\(\)\|\|!validateDecisions\(\)\)/);
 assert.match(source,/exportNaturalistReviewQueue\(packet\.review_decisions,packet\.entries,sourceFingerprint\)/);
 assert.match(source,/mba-naturalist-review-queue-summary\.json/);
 assert.match(source,/reviewOutput\.append\(queueHeading,queueStatus,refreshQueue,queueItems,exportQueue,exportSummary\)/);
});
