import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {verifyBuildArtifacts} from '../scripts/verify-build-artifacts.mjs';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function fixture(t) {
 const dir = fs.mkdtempSync(path.join(os.tmpdir(),'mba-artifact-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const write = (name,data) => fs.writeFileSync(path.join(dir,name),typeof data === 'string' ? data : JSON.stringify(data));
 write('index.html','<title>preview</title>');
 write('registry.json',{environment:'tester',version:'test'});
 write('environment.json',{environment:'tester',version:'test',namespace:'mba-v2-tester',developer:false});
 const resources = fs.readdirSync(dir).sort().map(url => { const bytes=fs.readFileSync(path.join(dir,url)); return {url,sha256:hash(bytes),bytes:bytes.length}; });
 const release={environment:'tester',version:'test',resources,release:hash(JSON.stringify(resources)).slice(0,16)};
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
