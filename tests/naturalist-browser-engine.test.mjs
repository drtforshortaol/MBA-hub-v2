import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const modules=['extract-update-statements','find-batch-duplicates','suggest-content-destination','assess-existing-content','propose-update-placement','assess-naturalist-review-gates','classify-update-batch','summarize-naturalist-review'];

test('developer build ships browser-compatible canonical Naturalist engine',()=>{
 const run=spawnSync(process.execPath,['scripts/build.mjs'],{cwd:root,encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 for(const name of modules){
  const original=fs.readFileSync(path.join(root,'scripts',name+'.mjs'),'utf8');
  const expected=original.replace(/from (['"])\.\/([^'"]+)\.mjs\1/g,(_,quote,dependency)=>'from '+quote+'./'+dependency+'.js'+quote);
  const built=fs.readFileSync(path.join(root,'dist/developer/core/naturalist-engine',name+'.js'),'utf8');
  assert.equal(built,expected,name+' differs from canonical module');
  assert.equal(fs.existsSync(path.join(root,'dist/tester/core/naturalist-engine',name+'.js')),false,'engine leaked to tester');
 }
});

test('browser engine classifies without granting publication authority',async()=>{
 const {classifyUpdateBatch}=await import('../dist/developer/core/naturalist-engine/classify-update-batch.js');
 const {summarizeNaturalistReview}=await import('../dist/developer/core/naturalist-engine/summarize-naturalist-review.js');
 const result=classifyUpdateBatch('Sea otters use tools. Sea otters use tools.',[]);
 assert.equal(result.valid,true);
 assert.equal(result.entries.length,2);
 const summary=summarizeNaturalistReview(result.entries);
 assert.equal(summary.duplicate_statement_count,1);
 assert.equal(summary.can_auto_publish,false);
 assert.equal(summary.published,false);
});
