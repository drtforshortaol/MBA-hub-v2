import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {checkedReviewOutputPath} from '../scripts/review-output-path.mjs';
function fixture(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'mba-review-output-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return root;}
test('review outputs use explicit generated namespaces or external scratch paths',t=>{
 const parent=fixture(t),root=path.join(parent,'repo');fs.mkdirSync(root);
 for(const folder of ['dist','review','review-drafts','reviewdrafts']){
  const target=path.join(root,folder,'packet.json');assert.equal(checkedReviewOutputPath(root,target,'.json'),target);
 }
 const outside=path.join(parent,'scratch','packet.json');assert.equal(checkedReviewOutputPath(root,outside,'.json'),outside);
 assert.equal(checkedReviewOutputPath(root,path.join(parent,'scratch','contact.html'),'.html'),path.join(parent,'scratch','contact.html'));
});
test('uncreated reserved paths, traversal aliases and generated runtime bundles are protected',t=>{
 const root=fixture(t);
 for(const relative of ['config/new.json','src/new.json','scripts/new.json','tests/new.json','.github/new.json','.git/new.json','docs/verification/new.json','package.json','package-lock.json','dist/developer/release.json','dist/tester/release.json','dist/../config/new.json']){
  assert.throws(()=>checkedReviewOutputPath(root,path.join(root,relative),'.json'),/Unsafe review output/);
  assert.ok(!fs.existsSync(path.join(root,relative)));
 }
 assert.throws(()=>checkedReviewOutputPath(root,path.join(root,'review','script.js'),'.json'),/Unsafe review output extension/);
});
test('generated namespace and external scratch symlinks remain prohibited',t=>{
 const parent=fixture(t),root=path.join(parent,'repo'),outside=path.join(parent,'outside');fs.mkdirSync(root);fs.mkdirSync(outside);
 fs.symlinkSync(outside,path.join(root,'review'),'dir');
 assert.throws(()=>checkedReviewOutputPath(root,path.join(root,'review','packet.json'),'.json'),/Symlink/);
 fs.symlinkSync(outside,path.join(parent,'linked'),'dir');
 assert.throws(()=>checkedReviewOutputPath(root,path.join(parent,'linked','packet.json'),'.json'),/Symlink/);
});

test('ordinary generated files remain replaceable while hard links and non-files are refused',t=>{
 const root=fixture(t),folder=path.join(root,'review');fs.mkdirSync(folder);
 const regular=path.join(folder,'regular.json');fs.writeFileSync(regular,'previous generated packet');
 assert.equal(checkedReviewOutputPath(root,regular,'.json'),regular);
 const alias=path.join(folder,'alias.json');fs.linkSync(regular,alias);
 for(const target of [regular,alias])assert.throws(()=>checkedReviewOutputPath(root,target,'.json'),/singly linked regular file/);
 const directory=path.join(folder,'directory.json');fs.mkdirSync(directory);
 assert.throws(()=>checkedReviewOutputPath(root,directory,'.json'),/singly linked regular file/);
});

test('FIFO output targets are refused without opening them',{skip:process.platform==='win32'},t=>{
 const root=fixture(t),folder=path.join(root,'review');fs.mkdirSync(folder);
 const fifo=path.join(folder,'pipe.json'),created=spawnSync('mkfifo',[fifo],{encoding:'utf8'});
 assert.equal(created.status,0,created.stderr);
 assert.throws(()=>checkedReviewOutputPath(root,fifo,'.json'),/singly linked regular file/);
 assert.equal(fs.lstatSync(fifo).isFIFO(),true);
});
