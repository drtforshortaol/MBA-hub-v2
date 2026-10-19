import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {verifyReviewEvidence} from '../scripts/verify-review-evidence.mjs';
const commit='a'.repeat(40);
function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mba-evidence-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 fs.mkdirSync(path.join(dir,'offline-reports'));fs.writeFileSync(path.join(dir,'SOURCE-COMMIT.txt'),commit+'\n');
 for(const environment of ['developer','tester']){
  fs.mkdirSync(path.join(dir,environment));const release=environment==='developer'?'1'.repeat(16):'2'.repeat(16);
  fs.writeFileSync(path.join(dir,environment,'release.json'),JSON.stringify({environment,release}));
  const base={passed:true,environment,release,errors:[]};
  fs.writeFileSync(path.join(dir,`${environment}-http-report.json`),JSON.stringify({...base,expectedRelease:release,resources:{expected:3,verified:3}}));
  for(const [name,scenario] of [['navigation','prepared-navigation'],['recovery','corrupted-entry-recovery']])fs.writeFileSync(path.join(dir,`offline-reports/${environment}-offline-${name}.json`),JSON.stringify({...base,scenario,offlineNetworkAttempts:0,apps:[{passed:true,expected:3,verified:3}]}));
 }
 return dir;
}
test('review evidence accepts complete distinct release and checkout bindings',t=>assert.deepEqual(verifyReviewEvidence(fixture(t),commit),[]));
for(const mutation of ['stale','wrong scenario','network','incomplete','failed'])test(`review evidence rejects ${mutation} retained recovery report`,t=>{
 const dir=fixture(t),file=path.join(dir,'offline-reports/tester-offline-recovery.json'),r=JSON.parse(fs.readFileSync(file));
 if(mutation==='stale')r.release='f'.repeat(16);
 if(mutation==='wrong scenario')r.scenario='prepared-navigation';
 if(mutation==='network')r.offlineNetworkAttempts=1;
 if(mutation==='incomplete')r.apps[0].verified=2;
 if(mutation==='failed')r.passed=false;
 fs.writeFileSync(file,JSON.stringify(r));assert(verifyReviewEvidence(dir,commit).length);
});
test('review evidence rejects wrong checkout and missing report',t=>{
 const dir=fixture(t);assert(verifyReviewEvidence(dir,'b'.repeat(40)).length);fs.unlinkSync(path.join(dir,'developer-http-report.json'));assert(verifyReviewEvidence(dir,commit).length);
});
test('combined workflow retains evidence only after offline and provenance gates',()=>{
 const workflow=fs.readFileSync('.github/workflows/combined-iphone-review.yml','utf8');
 assert.match(workflow,/contents: read/);assert.doesNotMatch(workflow,/deploy-pages|contents: write|continue-on-error|always\(\)/);
 for(const token of ['npm run build','npm test','verify-build-artifacts.mjs','verify:preview:http','verify-offline-navigation.mjs --report-dir dist/offline-reports','git rev-parse HEAD > dist/SOURCE-COMMIT.txt','verify-review-evidence.mjs dist "$GITHUB_SHA"','actions/upload-artifact@v4'])assert(workflow.includes(token),token);
 assert(workflow.indexOf('verify-review-evidence.mjs')>workflow.indexOf('SOURCE-COMMIT.txt'));assert(workflow.indexOf('actions/upload-artifact@')>workflow.indexOf('verify-review-evidence.mjs'));
});

for(const resources of [undefined,{}, {expected:3}, {verified:3}, {expected:'3',verified:'3'}, {expected:0,verified:0}, {expected:1.5,verified:1.5}, {expected:Number.MAX_SAFE_INTEGER+1,verified:Number.MAX_SAFE_INTEGER+1}, {expected:3,verified:'3'}, {expected:3,verified:2}])test(`review evidence rejects invalid HTTP counts ${JSON.stringify(resources)}`,t=>{
 const dir=fixture(t),file=path.join(dir,'developer-http-report.json'),report=JSON.parse(fs.readFileSync(file));
 report.resources=resources;fs.writeFileSync(file,JSON.stringify(report));
 assert(verifyReviewEvidence(dir,commit).some(error=>error.includes('incomplete HTTP evidence')));
});
