import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {verifyLocalHttp} from '../scripts/verify-local-http.mjs';

test('local HTTP acceptance verifies both real generated bundles and retains release-pinned evidence',async t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'mba-local-http-'));
 t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
 const reports=await verifyLocalHttp({reportDirectory:directory});
 assert.deepEqual(reports.map(report=>report.environment),['developer','tester']);
 for(const report of reports){
  assert.equal(report.passed,true,JSON.stringify(report.errors));
  assert.equal(report.expectedRelease,report.release);
  assert.equal(report.resources.verified,report.resources.expected);
  assert.equal(report.apps.length,JSON.parse(fs.readFileSync(`dist/${report.environment}/registry.json`)).apps.length);
  assert(report.apps.every(app=>app.passed));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(directory,`${report.environment}-http.json`))),report);
 }
});

test('local HTTP acceptance preserves failed artifact evidence and still checks the other environment',async t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'mba-local-http-negative-'));
 t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
 fs.cpSync('dist',directory,{recursive:true});
 fs.writeFileSync(path.join(directory,'developer/index.html'),'corrupt');
 const reports=await verifyLocalHttp({directory,reportDirectory:path.join(directory,'reports')});
 assert.equal(reports[0].passed,false);
 assert(reports[0].errors.includes('index.html: integrity mismatch'));
 assert.equal(reports[1].passed,true,JSON.stringify(reports[1].errors));
 assert.equal(JSON.parse(fs.readFileSync(path.join(directory,'reports/developer-http.json'))).passed,false);
});
