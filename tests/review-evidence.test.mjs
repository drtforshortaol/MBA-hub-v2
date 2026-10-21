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
  fs.writeFileSync(path.join(dir,environment,'release.json'),JSON.stringify({environment,release,resources:[{url:'apps/one/index.html'},{url:'apps/two.html'},{url:'registry.json'}]}));
  fs.writeFileSync(path.join(dir,environment,'registry.json'),JSON.stringify({environment,apps:[{app_id:'one',entry_point:'apps/one/index.html'},{app_id:'two',entry_point:'apps/two.html'}]}));
  fs.writeFileSync(path.join(dir,environment,'search-index.json'),JSON.stringify([{app_id:'one',url:'apps/one/index.html#section'}]));
  const base={passed:true,environment,release,errors:[]};
  fs.writeFileSync(path.join(dir,`${environment}-http-report.json`),JSON.stringify({...base,expectedRelease:release,resources:{expected:3,verified:3}}));
  for(const [name,scenario] of [['navigation','prepared-navigation'],['recovery','corrupted-entry-recovery']])fs.writeFileSync(path.join(dir,`offline-reports/${environment}-offline-${name}.json`),JSON.stringify({...base,scenario,resources:{expected:3,verified:3,errors:[]},offlineNetworkAttempts:0,apps:[{app_id:'one',passed:true,expected:3,verified:3,errors:[]},{app_id:'two',passed:true,expected:1,verified:1,errors:[]}]}));
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

for(const mutation of ['missing app','duplicate app','unknown app','wrong target count','string count','fractional count','unsafe count','contradictory errors'])test(`review evidence rejects offline coverage ${mutation}`,t=>{
 const dir=fixture(t),file=path.join(dir,'offline-reports/tester-offline-recovery.json'),report=JSON.parse(fs.readFileSync(file));
 if(mutation==='missing app')report.apps.pop();
 if(mutation==='duplicate app')report.apps[1]={...report.apps[0]};
 if(mutation==='unknown app')report.apps[1].app_id='unregistered';
 if(mutation==='wrong target count')report.apps[0].expected=report.apps[0].verified=2;
 if(mutation==='string count')report.apps[0].expected=report.apps[0].verified='3';
 if(mutation==='fractional count')report.apps[0].expected=report.apps[0].verified=1.5;
 if(mutation==='unsafe count')report.apps[0].expected=report.apps[0].verified=Number.MAX_SAFE_INTEGER+1;
 if(mutation==='contradictory errors')report.apps[0].errors=['target failed'];
 fs.writeFileSync(file,JSON.stringify(report));
 assert(verifyReviewEvidence(dir,commit).some(error=>error.includes('incomplete offline scenario')));
});

for(const environment of ['developer','tester'])test(`review evidence rejects self-consistent truncated HTTP coverage for ${environment}`,t=>{
 const dir=fixture(t),file=path.join(dir,`${environment}-http-report.json`),report=JSON.parse(fs.readFileSync(file));
 report.resources={expected:1,verified:1};fs.writeFileSync(file,JSON.stringify(report));
 assert(verifyReviewEvidence(dir,commit).some(error=>error===`${environment}-http-report.json: incomplete HTTP evidence`));
});
for(const resources of [undefined,null,{},[]])test(`review evidence rejects absent generated resource inventory ${JSON.stringify(resources)}`,t=>{
 const dir=fixture(t),file=path.join(dir,'developer/release.json'),release=JSON.parse(fs.readFileSync(file));
 release.resources=resources;fs.writeFileSync(file,JSON.stringify(release));
 assert(verifyReviewEvidence(dir,commit).some(error=>error==='developer: invalid generated release'));
});

for(const mutation of ['missing','truncated','failed','errors','string count'])test(`review evidence rejects offline resource coverage ${mutation}`,t=>{
 const dir=fixture(t),file=path.join(dir,'offline-reports/tester-offline-navigation.json'),report=JSON.parse(fs.readFileSync(file));
 if(mutation==='missing')delete report.resources;
 if(mutation==='truncated')report.resources.expected=report.resources.verified=1;
 if(mutation==='failed')report.resources.verified=2;
 if(mutation==='errors')report.resources.errors=['icon.svg: incorrect bytes'];
 if(mutation==='string count')report.resources.expected=report.resources.verified='3';
 fs.writeFileSync(file,JSON.stringify(report));
 assert(verifyReviewEvidence(dir,commit).some(error=>error.includes('incomplete offline resource evidence')));
});
