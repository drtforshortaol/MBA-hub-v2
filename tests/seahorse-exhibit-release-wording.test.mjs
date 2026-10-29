import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const manifest=JSON.parse(readFileSync(new URL('../src/apps/big-bellied-seahorse/manifest.json',import.meta.url),'utf8'));

test('seahorse release-facing exhibit description follows owner decision',()=>{
 const history=manifest.sections.find(section=>section.id==='Aquarium-history');
 assert.ok(history,'Aquarium-history section is required');
 assert.match(history.text,/Big-bellied seahorses are featured in Monterey Bay Aquarium's Ocean in Motion exhibit\./);
 assert.match(history.text,/precise earlier exhibit history of big-bellied seahorses awaits Aquarium confirmation/);
});

test('owner-approved exhibit text cannot clear seahorse media permissions',()=>{
 assert.equal(manifest.publication_review,'owner-approved-text');
 assert.deepEqual(manifest.media,[
  'asset-486b6cdb96375dfb',
  'asset-2913dc8df835400c',
  'asset-e62b39cc07a542c4',
  'asset-54f52bac7bc827bc',
  'asset-93c15fb934aba9e6'
 ]);
 const catalog=JSON.parse(readFileSync(new URL('../src/shared/media/catalog.json',import.meta.url),'utf8'));
 for(const id of manifest.media){
  const asset=catalog.assets.find(item=>item.asset_id===id);
  assert.ok(asset,'missing media catalog asset: '+id);
  assert.equal(asset.permission,'review-required','rights review cannot be inferred from exhibit wording');
 }
});
