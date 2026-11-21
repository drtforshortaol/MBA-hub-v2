import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
