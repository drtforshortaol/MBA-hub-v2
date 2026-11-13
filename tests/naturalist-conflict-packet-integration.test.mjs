import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {previewNaturalistPacket} from '../scripts/preview-automatic-update.mjs';

test('review packet preserves potential conflicts without granting publication',()=>{
 const packet=previewNaturalistPacket('Sea otters use tools to open shellfish. Sea otters do not use tools to open shellfish.');
 assert.equal(packet.entries.length,2);
 assert.equal(packet.conflict_signals.length,1);
 assert.deepEqual(packet.entries[1].conflict_with,[0]);
 assert.deepEqual(packet.entries[0].conflict_with,[1]);
 assert.ok(packet.entries[1].review.flags.includes('possible-scientific-conflict-in-submission'));
 assert.equal(packet.review_summary.review_flag_counts['possible-scientific-conflict-in-submission'],2);
 assert.equal(packet.published,false);
 assert.equal(packet.committed,false);
});
test('developer UI exports conflict evidence and identifies related statements',()=>{
 const source=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 assert.match(source,/conflict_signals:result\.conflict_signals/);
 assert.match(source,/conflict_with:entry\.conflict_with\?\?\[\]/);
 assert.match(source,/Potentially conflicting statements/);
});
