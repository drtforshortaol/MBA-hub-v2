import test from 'node:test';
import assert from 'node:assert/strict';
import {releaseErrors} from '../scripts/build.mjs';

const approved = {
 migrationComplete:true, ownerApproved:true, pilotPassed:true,
 deviceOfflinePassed:true, rollbackDevicePassed:true, privacyReviewed:true
};
const app = {app_id:'species-ray',status:'approved'};
const inventory = {apps:[{id:'species-ray'}]};

test('release gate remains closed until every approval and device check is complete',()=>{
 for(const gate of Object.keys(approved)){
  const failures=releaseErrors({...approved,[gate]:false},[app],{assets:[]},inventory);
  assert(failures.includes('release gate: '+gate),gate);
 }
 assert.deepEqual(releaseErrors(approved,[app],{assets:[]},inventory),[]);
});

test('release gate detects missing migrated applications and unapproved content',()=>{
 const failures=releaseErrors(approved,[{...app,status:'development'}],{assets:[]},{apps:[...inventory.apps,{id:'species-missing'}]});
 assert(failures.includes('unmigrated: species-missing'));
 assert(failures.includes('content review pending: species-ray'));
});

test('release gate rejects unresolved media permissions',()=>{
 const failures=releaseErrors(approved,[app],{assets:[{asset_id:'photo-1',permission:'review-required'}]},inventory);
 assert(failures.includes('media permission review: photo-1'));
});

test('inherited V1 review is scoped to explicitly identified source content',()=>{
 const inherited={...app,status:'development',source_repository:'MBA-hub',publication_review:'inherited-v1-approved'};
 assert.deepEqual(releaseErrors(approved,[inherited],{assets:[]},inventory),[]);
 const unsourced={...inherited,source_repository:undefined};
 assert(releaseErrors(approved,[unsourced],{assets:[]},inventory).includes('content review pending: species-ray'));
});
