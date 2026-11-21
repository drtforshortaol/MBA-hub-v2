import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

function javascriptFiles(dir){
 const files=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())files.push(...javascriptFiles(file));
  else if(entry.isFile()&&/\.(?:js|mjs)$/.test(entry.name))files.push(file);
 }
 return files;
}

test('all source and built JavaScript parses without syntax errors',()=>{
 for(const directory of ['src','dist/developer','dist/tester']){
  assert(fs.existsSync(directory),directory+' must exist before syntax validation');
  const files=javascriptFiles(directory);
  assert(files.length>0,directory+' must contain JavaScript');
  for(const file of files){
   const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
   assert.equal(result.status,0,file+' has invalid JavaScript syntax:\n'+result.stderr);
  }
 }
});
