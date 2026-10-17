import test from 'node:test';
import assert from 'node:assert/strict';
import {safeLocalPath,releaseErrors} from '../scripts/build.mjs';

test('offline bundle paths reject traversal, encoded separators and absolute paths',()=>{
 for(const unsafe of ['', '../secret', 'apps/../secret', 'apps//index.html', './apps/index.html', '/apps/index.html', '\\apps\\index.html', 'apps/%2e%2e/index.html', 'apps/index.html?debug=1', 'apps/index.html#fragment', 'apps/one\\index.html']){
  assert.equal(safeLocalPath(unsafe),false,JSON.stringify(unsafe));
 }
 for(const valid of ['apps/ray/index.html','apps/ray/topics/behavior.html','images/ray-01.svg']){
  assert.equal(safeLocalPath(valid),true,valid);
 }
});

test('release gates cannot be bypassed by approved app status alone',()=>{
 const platform={migrationComplete:true,ownerApproved:false,pilotPassed:false,deviceOfflinePassed:false,rollbackDevicePassed:false,privacyReviewed:false};
 const apps=[{app_id:'ray',status:'approved'}];
 const errors=releaseErrors(platform,apps,{assets:[{asset_id:'photo',permission:'review-required'}]},{apps:[{id:'ray'},{id:'kelp'}]});
 assert(errors.includes('release gate: ownerApproved'));
 assert(errors.includes('release gate: deviceOfflinePassed'));
 assert(errors.includes('unmigrated: kelp'));
 assert(errors.includes('media permission review: photo'));
 assert(!errors.some(x=>x.includes('content review pending: ray')));
});

test('inherited V1 content does not remove operational release gates',()=>{
 const errors=releaseErrors({},[], {assets:[]},{apps:[]});
 assert(errors.some(x=>x.startsWith('release gate:')));
});

test('release gate remains blocked for unreviewed development applications',()=>{
 const platform={migrationComplete:true,ownerApproved:true,pilotPassed:true,deviceOfflinePassed:true,rollbackDevicePassed:true,privacyReviewed:true};
 const errors=releaseErrors(platform,[{app_id:'ray',status:'development'}],{assets:[]},{apps:[{id:'ray'}]});
 assert(errors.includes('content review pending: ray'));
});

test('inherited V1 approval applies only to explicitly marked applications',()=>{
 const platform={migrationComplete:true,ownerApproved:true,pilotPassed:true,deviceOfflinePassed:true,rollbackDevicePassed:true,privacyReviewed:true};
 const apps=[{app_id:'legacy',status:'development',source_repository:'legacy-repo',publication_review:'inherited-v1-approved'},{app_id:'new',status:'development'}];
 const errors=releaseErrors(platform,apps,{assets:[]},{apps:[{id:'legacy'},{id:'new'}]});
 assert(!errors.includes('content review pending: legacy'));
 assert(errors.includes('content review pending: new'));
});

test('offline path validation rejects control characters and Unicode lookalike separators',()=>{
 for(const unsafe of ['apps/one/index.html\n','apps/one/index.html\r','apps/one/index.html\0','apps/one／index.html','apps/one∕index.html']){
  assert.equal(safeLocalPath(unsafe),false,JSON.stringify(unsafe));
 }
});
