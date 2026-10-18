import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {verifyBuildArtifacts,verifyRegistryCoverage} from '../scripts/verify-build-artifacts.mjs';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function fixture(t) {
 const dir = fs.mkdtempSync(path.join(os.tmpdir(),'mba-artifact-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const write = (name,data) => fs.writeFileSync(path.join(dir,name),typeof data === 'string' ? data : JSON.stringify(data));
 write('index.html','<title>preview</title>');
 fs.mkdirSync(path.join(dir,'shared/media'),{recursive:true});
 write('shared/media/catalog.json',{schema_version:1,assets:[]});
 write('manifest.webmanifest',{id:'./',scope:'./',start_url:'./index.html',icons:[{src:'icon.svg'}]});
 write('icon.svg','<svg xmlns="http://www.w3.org/2000/svg"/>');
 write('registry.json',{schema_version:1,environment:'tester',version:'test',apps:[{app_id:'sample',entry_point:'index.html',offline_assets:['index.html'],media:[]}]});
 write('environment.json',{environment:'tester',version:'test',namespace:'mba-v2-tester',developer:false});
 write('search-index.json',[{app_id:'sample',title:'Sample',text:'Sample',url:'index.html'}]);
 const resources = ['environment.json','icon.svg','index.html','manifest.webmanifest','registry.json','search-index.json','shared/media/catalog.json'].map(url => { const bytes=fs.readFileSync(path.join(dir,url)); return {url,sha256:hash(bytes),bytes:bytes.length}; });
 const release={schema_version:1,environment:'tester',version:'test',resources,release:hash(JSON.stringify(resources)).slice(0,16)};
 write('release.json',release);
 write('sw.js',`const NAMESPACE='mba-v2-tester',RELEASE='${release.release}';`);
 return {dir,write,release};
}
test('built developer and tester artifacts satisfy independent integrity checks',()=>{
 for (const environment of ['developer','tester']) assert.deepEqual(verifyBuildArtifacts(`dist/${environment}`,environment),[]);
});
test('complete fixture passes and post-build corruption fails',t=>{
 const {dir,write}=fixture(t);
 assert.deepEqual(verifyBuildArtifacts(dir,'tester'),[]);
 write('index.html','corrupt');
 assert(verifyBuildArtifacts(dir,'tester').includes('integrity mismatch: index.html'));
});
test('unlisted files and missing files fail verification',t=>{
 const {dir,write}=fixture(t);
 write('extra.html','unexpected'); fs.rmSync(path.join(dir,'index.html'));
 const errors=verifyBuildArtifacts(dir,'tester');
 assert(errors.includes('untracked artifact: extra.html'));
 assert(errors.includes('missing resource: index.html'));
});
test('traversal, duplicates and altered release identifiers fail closed',t=>{
 const {dir,write,release}=fixture(t);
 release.resources.push({...release.resources[0]}, {url:'../outside',sha256:'0'.repeat(64),bytes:0});
 write('release.json',release);
 const errors=verifyBuildArtifacts(dir,'tester');
 assert(errors.some(error=>error.startsWith('duplicate resource:')));
 assert(errors.includes('unsafe release resource'));
 assert(errors.includes('release identifier mismatch'));
});
test('cross-environment metadata and worker binding are rejected',t=>{
 const {dir,write}=fixture(t);
 write('environment.json',{environment:'developer',version:'test',namespace:'mba-v2-developer',developer:true});
 write('sw.js',"const NAMESPACE='mba-v2-developer',RELEASE='__RELEASE__';");
 const errors=verifyBuildArtifacts(dir,'tester');
 assert(errors.includes('environment: environment mismatch'));
 assert(errors.includes('environment: privilege mismatch'));
 assert(errors.includes('service worker release binding mismatch'));
});
test('tester rejects maintenance engines, secrets and symlinks',t=>{
 const {dir,write}=fixture(t);
 fs.mkdirSync(path.join(dir,'core/naturalist-engine'),{recursive:true});
 write('core/naturalist-engine/private.js','export {};');
 write('.env','placeholder');
 fs.symlinkSync(path.join(dir,'index.html'),path.join(dir,'linked.html'));
 const errors=verifyBuildArtifacts(dir,'tester');
 assert(errors.includes('developer artifact in tester: core/naturalist-engine/private.js'));
 assert(errors.includes('private artifact: .env'));
 assert(errors.includes('symbolic link: linked.html'));
});

const sampleApp = {app_id:'sample',entry_point:'apps/sample/index.html',offline_assets:['apps/sample/index.html','shared/media/image.svg'],media:['image']};
const sampleMedia = {schema_version:1,assets:[{asset_id:'image',path:'shared/media/image.svg',offline:true}]};
const covered = new Set(sampleApp.offline_assets);
test('referenced offline media must be covered by the verified release',()=>{
 assert.deepEqual(verifyRegistryCoverage({apps:[sampleApp]},sampleMedia,covered),[]);
 const missing=verifyRegistryCoverage({apps:[{...sampleApp,offline_assets:[sampleApp.entry_point]}]},sampleMedia,covered);
 assert.deepEqual(missing,[]); // Per-app duplicate registration is enforced by source preflight.
 const absent=verifyRegistryCoverage({apps:[sampleApp]},sampleMedia,new Set([sampleApp.entry_point]));
 assert(absent.includes('offline media missing from release: sample: image'));
});
test('missing application entries and unsafe offline paths fail independently',()=>{
 const errors=verifyRegistryCoverage({apps:[{...sampleApp,offline_assets:['../outside']}]},sampleMedia,new Set());
 assert(errors.includes('entry missing from app offline assets: sample'));
 assert(errors.includes('entry missing from release: sample'));
 assert(errors.includes('app offline asset missing or unsafe: sample: ../outside'));
});
test('missing malformed and duplicate registry declarations fail closed',()=>{
 for (const registry of [{},{apps:[]},{apps:[null]}]) assert(verifyRegistryCoverage(registry,sampleMedia,covered).length);
 assert(verifyRegistryCoverage({apps:[sampleApp]},null,covered).includes('invalid media catalog'));
 assert(verifyRegistryCoverage({apps:[sampleApp,sampleApp]},sampleMedia,covered).includes('duplicate application identifier: sample'));
 const unknown=verifyRegistryCoverage({apps:[{...sampleApp,media:['missing']}]},sampleMedia,covered);
 assert(unknown.includes('unknown app media: sample: missing'));
 assert(verifyRegistryCoverage({apps:[sampleApp]},{schema_version:1,assets:[{asset_id:'image',path:'../private',offline:true}]},covered).includes('invalid media declaration'));
});
test('missing metadata versions and schema cannot agree accidentally',t=>{
 const {dir,write,release}=fixture(t);
 delete release.version; delete release.schema_version;
 write('release.json',release);
 write('environment.json',{environment:'tester',namespace:'mba-v2-tester',developer:false});
 write('registry.json',{environment:'tester',apps:[]});
 const errors=verifyBuildArtifacts(dir,'tester');
 assert(errors.includes('missing artifact version'));
 assert(errors.includes('invalid artifact schema'));
 assert(errors.includes('missing registry applications'));
});
test('critical startup resources cannot be omitted from a self-consistent release',t=>{
 const {dir,write,release}=fixture(t);
 release.resources=release.resources.filter(item=>item.url!=='manifest.webmanifest');
 fs.rmSync(path.join(dir,'manifest.webmanifest'));
 release.release=hash(JSON.stringify(release.resources)).slice(0,16);
 write('release.json',release);
 write('sw.js',`const NAMESPACE='mba-v2-tester',RELEASE='${release.release}';`);
 assert(verifyBuildArtifacts(dir,'tester').includes('missing critical resource: manifest.webmanifest'));
});

function updateFixtureRelease({dir,write,release}) {
 release.resources = release.resources.map(item => { const bytes=fs.readFileSync(path.join(dir,item.url)); return {...item,bytes:bytes.length,sha256:hash(bytes)}; });
 release.release=hash(JSON.stringify(release.resources)).slice(0,16);
 write('release.json',release);
 write('sw.js',`const NAMESPACE='mba-v2-tester',RELEASE='${release.release}';`);
}
test('PWA acceptance rejects external and out-of-scope startup despite valid release hashes',t=>{
 const fixtureData=fixture(t);
 for (const change of [{id:'https://other.example/'},{scope:'../'},{start_url:'https://other.example/'},{start_url:'./missing.html'}]) {
  fixtureData.write('manifest.webmanifest',{id:'./',scope:'./',start_url:'./index.html',icons:[{src:'icon.svg'}],...change});
  updateFixtureRelease(fixtureData);
  const errors=verifyBuildArtifacts(fixtureData.dir,'tester');
  assert(errors.includes('PWA startup scope mismatch'));
  assert(!errors.some(error=>error.startsWith('integrity mismatch:')));
 }
});
test('PWA acceptance requires bundled safe icons',t=>{
 const fixtureData=fixture(t);
 for (const icons of [[],null,[null],[{src:'../private.svg'}],[{src:'https://other.example/icon.svg'}],[{src:'missing.svg'}]]) {
  fixtureData.write('manifest.webmanifest',{id:'./',scope:'./',start_url:'./index.html',icons});
  updateFixtureRelease(fixtureData);
  assert(verifyBuildArtifacts(fixtureData.dir,'tester').some(error=>/PWA icon/.test(error)));
 }
});
test('metadata and service worker symlinks fail before reading their targets',t=>{
 const {dir}=fixture(t);
 fs.renameSync(path.join(dir,'environment.json'),path.join(dir,'environment-copy.json'));
 fs.symlinkSync(path.join(dir,'environment-copy.json'),path.join(dir,'environment.json'));
 assert.deepEqual(verifyBuildArtifacts(dir,'tester'),['missing or invalid artifact metadata']);
 fs.rmSync(path.join(dir,'environment.json'));
 fs.renameSync(path.join(dir,'environment-copy.json'),path.join(dir,'environment.json'));
 fs.renameSync(path.join(dir,'sw.js'),path.join(dir,'worker-copy.js'));
 fs.symlinkSync(path.join(dir,'worker-copy.js'),path.join(dir,'sw.js'));
 const errors=verifyBuildArtifacts(dir,'tester');
 assert(errors.includes('symbolic link: sw.js'));
 assert(errors.includes('missing service worker'));
});

test('search index requires valid local registered targets despite valid release hashes',t=>{
 const data=fixture(t);
 for (const change of [{app_id:'unknown'},{url:'https://other.example/index.html'},{url:'../index.html'},{url:'missing.html'},{url:'index.html/extra'},{url:null},{title:''},{text:null}]) {
  data.write('search-index.json',[{app_id:'sample',title:'Sample',text:'Sample',url:'index.html',...change}]);
  updateFixtureRelease(data);
  const errors=verifyBuildArtifacts(data.dir,'tester');
  assert(errors.some(error=>/search index/.test(error)),JSON.stringify(change));
  assert(!errors.some(error=>error.startsWith('integrity mismatch:')));
 }
 for (const url of ['index.html#section','index.html?view=details#section']) {
  data.write('search-index.json',[{app_id:'sample',title:'Sample',text:'Sample',url}]);
  updateFixtureRelease(data);
  assert.deepEqual(verifyBuildArtifacts(data.dir,'tester'),[]);
 }
});
test('search index cannot omit registered apps or disappear from the offline release',t=>{
 const data=fixture(t);
 for (const search of [null,{},[],[null]]) {
  data.write('search-index.json',search);
  updateFixtureRelease(data);
  assert(verifyBuildArtifacts(data.dir,'tester').some(error=>/search index/.test(error)));
 }
 data.write('registry.json',{schema_version:1,environment:'tester',version:'test',apps:[{app_id:'sample',entry_point:'index.html',offline_assets:['index.html'],media:[]},{app_id:'second',entry_point:'index.html',offline_assets:['index.html'],media:[]}]});
 data.write('search-index.json',[{app_id:'sample',title:'Sample',text:'Sample',url:'index.html'}]);
 updateFixtureRelease(data);
 assert(verifyBuildArtifacts(data.dir,'tester').includes('application missing from search index: second'));
 data.release.resources=data.release.resources.filter(item=>item.url!=='search-index.json');
 fs.rmSync(path.join(data.dir,'search-index.json'));
 updateFixtureRelease(data);
 const errors=verifyBuildArtifacts(data.dir,'tester');
 assert(errors.includes('missing critical resource: search-index.json'));
 assert(errors.includes('missing or invalid search index'));
});
