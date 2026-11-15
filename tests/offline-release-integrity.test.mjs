import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

test('offline release inventories contain and hash every canonical app resource',()=>{
 for(const channel of ['developer','tester']){
  const root=path.resolve('dist',channel);
  const release=JSON.parse(fs.readFileSync(path.join(root,'release.json'),'utf8'));
  const apps=JSON.parse(fs.readFileSync(path.join(root,'registry.json'),'utf8')).apps;
  const resources=new Map();
  for(const record of release.resources){
   assert.ok(!resources.has(record.url),channel+' duplicate offline resource: '+record.url);
   resources.set(record.url,record);
   const full=path.resolve(root,record.url);
   assert.ok(full.startsWith(root+path.sep),channel+' unsafe resource URL');
   const bytes=fs.readFileSync(full);
   assert.equal(bytes.length,record.bytes,channel+' invalid byte count: '+record.url);
   assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256,channel+' stale resource hash: '+record.url);
  }
  for(const app of apps){
   assert.ok(resources.has(app.entry_point),channel+' missing app entry: '+app.app_id);
   for(const asset of app.offline_assets)assert.ok(resources.has(asset),channel+' missing offline asset: '+app.app_id+' / '+asset);
  }
  const elNino=apps.find(a=>a.app_id==='el-nino');
  assert.ok(elNino,channel+' missing El Niño');
  assert.equal(elNino.offline_assets.filter(a=>a.endsWith('.jpg')).length,18);
 }
});
