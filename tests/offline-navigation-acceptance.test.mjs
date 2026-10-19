import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {verifyOfflineNavigation} from '../scripts/verify-offline-navigation.mjs';

test('actual generated workers serve every app entry, directory and search deep link offline',async()=>{
 for(const environment of ['developer','tester']){
  const report=await verifyOfflineNavigation(`dist/${environment}`,environment);
  assert.equal(report.passed,true,JSON.stringify(report));
  const registry=JSON.parse(fs.readFileSync(`dist/${environment}/registry.json`));
  assert.deepEqual(report.apps.map(app=>app.app_id),registry.apps.map(app=>app.app_id));
  assert(report.apps.every(app=>app.verified===app.expected&&app.expected>=2));
  assert.equal(report.offlineNetworkAttempts,0);
  assert.equal(report.appEntryPoints,new Set(registry.apps.map(app=>app.entry_point)).size);
  assert.equal(report.navigationTargets,report.apps.reduce((sum,app)=>sum+app.expected,0));
  assert.equal(report.searchTargets,report.apps.reduce((sum,app)=>sum+app.searchTargets,0));
  assert(report.navigationTargets>report.appEntryPoints);
 }
});

test('offline navigation acceptance detects a worker that silently returns Hub for app routes',async t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'mba-offline-navigation-'));
 t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
 fs.cpSync('dist/tester',directory,{recursive:true});
 const worker=fs.readFileSync(path.join(directory,'sw.js'),'utf8');
 assert(worker.includes("url.search='';"));
 fs.writeFileSync(path.join(directory,'sw.js'),worker.replace("url.search='';","url.pathname=ROOT.pathname+'index.html';url.search='';"));
 const report=await verifyOfflineNavigation(directory,'tester');
 assert.equal(report.passed,false);
 assert(report.apps.some(app=>app.errors.some(error=>error.includes('incorrect entry bytes'))));
});


test('every app and search route recovers exact bytes when all current entries are corrupted',async()=>{
 for(const environment of ['developer','tester']){
  const report=await verifyOfflineNavigation(`dist/${environment}`,environment,{recoverFromPrior:true});
  assert.equal(report.scenario,'corrupted-entry-recovery');
  assert.equal(report.passed,true,JSON.stringify(report));
  assert.equal(report.offlineNetworkAttempts,0);
  assert.equal(report.apps.length,JSON.parse(fs.readFileSync(`dist/${environment}/registry.json`)).apps.length);
  assert(report.apps.every(app=>app.verified===app.expected));
 }
});

test('recovery evidence fails when a worker loses compatible rollback lookup',async t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'mba-offline-recovery-'));
 t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
 fs.cpSync('dist/tester',directory,{recursive:true});
 const worker=fs.readFileSync(path.join(directory,'sw.js'),'utf8');
 const lookup='const candidate=await previous.match(url.href);';
 assert(worker.includes(lookup));
 fs.writeFileSync(path.join(directory,'sw.js'),worker.replace(lookup,'const candidate=null;'));
 const report=await verifyOfflineNavigation(directory,'tester',{recoverFromPrior:true});
 assert.equal(report.passed,false);
 assert.equal(report.apps.length,JSON.parse(fs.readFileSync(path.join(directory,'registry.json'))).apps.length);
 assert(report.apps.every(app=>app.verified===0));
 assert(report.offlineNetworkAttempts>0);
});
