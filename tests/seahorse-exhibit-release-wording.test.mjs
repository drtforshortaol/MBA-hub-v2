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

test('future-facing exhibit text must not automatically approve seahorse publication or media',()=>{
 assert.equal(manifest.publication_review,'owner-approved-text');
 assert.deepEqual(manifest.media,[
  'asset-e62b39cc07a542c4',
  'asset-b2bea165550eabcc',
  'asset-225131703b4c0c59',
  'asset-83f2a50a706d2488'
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
  }else if(id==='asset-225131703b4c0c59'){assert.equal(asset.permission,'approved');assert.match(asset.permission_evidence,/seahorse-poster-replacement-20261030.json/);}else if(id==='asset-b2bea165550eabcc'||id==='asset-83f2a50a706d2488'){assert.equal(asset.permission,id==='asset-b2bea165550eabcc'?'public-domain':'approved');assert.match(asset.permission_evidence,/seahorse-trout-photo-replacement/);}else assert.equal(asset.permission,'review-required','rights review cannot be inferred from exhibit wording');
 }
});
