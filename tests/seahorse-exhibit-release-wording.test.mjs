import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const manifest=JSON.parse(readFileSync(new URL('../src/apps/big-bellied-seahorse/manifest.json',import.meta.url),'utf8'));

test('seahorse release-facing exhibit description follows owner decision',()=>{
 const history=manifest.sections.find(section=>section.id==='Aquarium-history');
 assert.ok(history,'Aquarium-history section is required');
 assert.match(history.text,/Big-bellied seahorses are featured in Monterey Bay Aquarium's Ocean in Motion exhibit\./);
 assert.match(history.text,/precise history awaits Aquarium editorial confirmation/);
});

test('future-facing exhibit text must not automatically approve seahorse publication or media',()=>{
 assert.equal(manifest.publication_review,'pending');
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
  if(id==='asset-e62b39cc07a542c4'){
   assert.equal(asset.permission,'licensed');assert.equal(asset.license.id,'CC-BY-4.0');
   assert.match(asset.permission_evidence,/fovea-figure-license-20261029.json/);
   const evidence=JSON.parse(readFileSync(new URL('../docs/verification/fovea-figure-license-20261029.json',import.meta.url),'utf8'));
   assert.equal(evidence.asset_id,id);assert.equal(evidence.sha256,asset.sha256);
  }else assert.equal(asset.permission,'review-required','rights review cannot be inferred from exhibit wording');
 }
});
