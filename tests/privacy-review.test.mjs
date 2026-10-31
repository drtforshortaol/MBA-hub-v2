import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';import {privacySnapshot} from '../scripts/audit-privacy-snapshot.mjs';import {assessRepositoryReadiness} from '../scripts/assess-release-readiness.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));const sha=b=>createHash('sha256').update(b).digest('hex');
test('completed privacy gate is bound to current source/config/build inputs and existing distribution authority',()=>{
 const p=read('config/platform.json'),e=read('config/privacy-review.json'),s=privacySnapshot();assert.equal(p.privacyReviewed,true);assert.equal(e.status,'reviewed');assert.equal(e.release_authorized,false);assert.equal(e.authorization_source,'docs/GUIDE_CONTENT_RESTORED.md');assert.equal(s.snapshot_sha256,e.snapshot_sha256);assert.deepEqual(s,e.snapshot);assert.equal(s.automaticExternalResources.length,0);assert.equal(s.sensitiveBrowserAPIs.length,0);
 const q=assessRepositoryReadiness();assert.equal(q.blockers.length,4);assert(q.blockers.every(b=>b.category==='operational-gate'));assert(!q.blockers.some(b=>b.reason==='release gate: privacyReviewed'));assert.equal(q.releaseEligible,false);
});
test('all installation QR instances use the exact local offline resource and preserve the fixed public target',()=>{
 const e=read('config/privacy-review.json'),h=fs.readFileSync('src/install.html','utf8'),bytes=fs.readFileSync('src/'+e.qr.path);assert.equal((h.match(/src="\.\/install-qr.png"/g)||[]).length,3);assert(!h.includes('api.qrserver.com'));assert.equal(sha(bytes),e.qr.sha256);assert.equal(bytes.readUInt32BE(16),220);assert.equal(bytes.readUInt32BE(20),220);assert.equal(new URL(e.qr.original_generation_url).searchParams.get('data'),e.qr.target);
 for(const env of ['developer','tester']){assert.equal(sha(fs.readFileSync(`dist/${env}/install-qr.png`)),e.qr.sha256);assert(read(`dist/${env}/release.json`).resources.some(r=>r.url==='install-qr.png'&&r.sha256===e.qr.sha256));}assert(!fs.existsSync('dist/tester/core/developer.js'));
});

test('Python-generated cache files do not invalidate review, while source edits and symlinks remain guarded',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'mba-privacy-cache-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const dir of ['src','config','scripts','docs'])fs.mkdirSync(path.join(root,dir));
 for(const [name,body] of [['package.json','{}'],['docs/GUIDE_CONTENT_RESTORED.md','existing authority'],['scripts/check.py','original source']])fs.writeFileSync(path.join(root,name),body);
 const first=privacySnapshot(root);fs.mkdirSync(path.join(root,'scripts/__pycache__'));fs.writeFileSync(path.join(root,'scripts/__pycache__/check.cpython-312.pyc'),'generated cache');assert.deepEqual(privacySnapshot(root),first);
 fs.writeFileSync(path.join(root,'scripts/check.py'),'changed source');assert.notEqual(privacySnapshot(root).snapshot_sha256,first.snapshot_sha256);
 fs.symlinkSync(path.join(root,'scripts/check.py'),path.join(root,'scripts/link.py'));assert.throws(()=>privacySnapshot(root),/symlink/);
});
