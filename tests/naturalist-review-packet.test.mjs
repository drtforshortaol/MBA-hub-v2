import test from 'node:test';
import assert from 'node:assert/strict';
import {previewNaturalistPacket} from '../scripts/preview-automatic-update.mjs';
test('review packet preserves source and prohibits publication',()=>{
 const source='A new aquarium exhibit opens next month.';
 const packet=previewNaturalistPacket(source);
 assert.equal(packet.kind,'mba-v2-naturalist-review-packet');
 assert.equal(packet.original_source,source);
 assert.equal(packet.entries[0].source_text,source);
 assert.equal(packet.entries[0].placement.proposal_type,'aquarium-update-candidate');
 assert.equal(packet.entries[0].review.approval_state,'pending');
 assert.equal(packet.entries[0].review.can_auto_publish,false);
 assert.equal(packet.prepared,false);
 assert.equal(packet.published,false);
});
test('review packet rejects empty input',()=>{
 assert.equal(previewNaturalistPacket('').valid,false);
});
