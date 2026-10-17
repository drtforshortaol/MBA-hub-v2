import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cli=fileURLToPath(new URL('../scripts/preview-automatic-update.mjs',import.meta.url));
test('Naturalist CLI emits review-only packet',()=>{
 const run=spawnSync(process.execPath,[cli,'--naturalist-packet','Sea otters use tools.'],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 const packet=JSON.parse(run.stdout);
 assert.equal(packet.kind,'mba-v2-naturalist-review-packet');
 assert.equal(packet.review_summary.can_auto_publish,false);
 assert.equal(packet.published,false);
});
test('Naturalist CLI rejects missing source',()=>{
 const run=spawnSync(process.execPath,[cli,'--naturalist-packet'],{encoding:'utf8'});
 assert.equal(run.status,2);
});
test('Naturalist CLI rejects blank source',()=>{
 const run=spawnSync(process.execPath,[cli,'--naturalist-packet','  '],{encoding:'utf8'});
 assert.equal(run.status,2);
});
