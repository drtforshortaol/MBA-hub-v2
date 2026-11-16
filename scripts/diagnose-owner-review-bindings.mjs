#!/usr/bin/env node
// Read-only diagnostic: never refresh or approve review evidence.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {inheritedContentDigest} from './public-review.mjs';
const evidence=JSON.parse(fs.readFileSync('config/owner-text-reviews.json','utf8'));
const rows=evidence.apps.map(record=>{
 const app=JSON.parse(fs.readFileSync('src/apps/'+record.app_id+'/manifest.json','utf8'));
 const actual=inheritedContentDigest(app,{sourceRoot:fileURLToPath(new URL('../src',import.meta.url))});
 return {app_id:record.app_id,expected:record.content_sha256,actual,matches:actual===record.content_sha256};
});
console.log(JSON.stringify({total:rows.length,matched:rows.filter(r=>r.matches).length,rows},null,2));
if(rows.some(r=>!r.matches))process.exitCode=1;
