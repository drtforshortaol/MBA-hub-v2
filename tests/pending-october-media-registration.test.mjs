import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {releaseErrors} from '../scripts/build.mjs';
import {auditRepositoryMedia} from '../scripts/audit-local-media-coverage.mjs';

const rows=[
 ["naturalist-field-notes","shared/media/asset-df392914e6cf5502--big-sur-gray-whale.jpeg","asset-df392914e6cf5502","df392914e6cf55020db2cf2ae2eab1b55f23160708b1284f765232f300cbb707"],
  [
    "naturalist-field-notes",
    "apps/IMG_4207.jpeg",
    "asset-1bd100105f88c83a",
    "1bd100105f88c83aadb9272fccacd1c023e417799d1b7dc79684e7f321bafb6e"
  ],
  [
    "naturalist-field-notes",
    "apps/IMG_4208.jpeg",
    "asset-95daa2493750e82f",
    "95daa2493750e82f0444679b1c567d66af4e5212ab9d864eca3f2ddb8e475f1d"
  ],
  [
    "naturalist-field-notes",
    "apps/IMG_4209.jpeg",
    "asset-47f9bbb193878eec",
    "47f9bbb193878eeced59326418949849427489f0167e33a7e063be9d091f643b"
  ],
  [
    "naturalist-field-notes",
    "apps/IMG_4210.jpeg",
    "asset-50646c3fe1d0c359",
    "50646c3fe1d0c359860229e041767429fc21a382cd16d75bd165fd5f7a3cef52"
  ],
  [
    "big-bellied-seahorse",
    "apps/IMG_4212.jpeg",
    "asset-486b6cdb96375dfb",
    "486b6cdb96375dfb0c5fa97a8d9538ff81384cc4360d8884875cb71eb16b6e53"
  ],
  [
    "big-bellied-seahorse",
    "apps/IMG_4213.jpeg",
    "asset-2913dc8df835400c",
    "2913dc8df835400ca429d1626e1aebbbdbe358f313db4e6f9b26d88629230889"
  ],
  [
    "big-bellied-seahorse",
    "apps/IMG_4214.jpeg",
    "asset-e62b39cc07a542c4",
    "e62b39cc07a542c4def4dd10a7a5f17cdf7dddb235fd81af7c20b564089c1fea"
  ],
  [
    "big-bellied-seahorse",
    "apps/IMG_4215.jpeg",
    "asset-54f52bac7bc827bc",
    "54f52bac7bc827bc49ca4d0d5e3fd121988d61fc9dd75aa65bdca2cbbcd8ce4a"
  ],
  [
    "big-bellied-seahorse",
    "apps/IMG_4216.jpeg",
    "asset-93c15fb934aba9e6",
    "93c15fb934aba9e67b2cc30cc9732565460cea8d395ba408f37d0a8982d4a19c"
  ]
];
const mjIds=new Set(['asset-1bd100105f88c83a','asset-95daa2493750e82f','asset-47f9bbb193878eec','asset-df392914e6cf5502']);
const licensedIds=new Set(['asset-50646c3fe1d0c359','asset-e62b39cc07a542c4']);
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));

test('new October media registration preserves bytes, original paths and pending permissions',()=>{
 const catalog=read('src/shared/media/catalog.json'),apps=new Map();
 assert.equal(catalog.assets.length,213);
 for(const [id,path,asset_id,expected] of rows){
  const app=apps.get(id)||read('src/apps/'+id+'/manifest.json');apps.set(id,app);
  const matches=catalog.assets.filter(a=>a.path===path);assert.equal(matches.length,1);
  const asset=matches[0];assert.equal(asset.asset_id,asset_id);assert.equal(asset_id,'asset-'+expected.slice(0,16));
  const bytes=fs.readFileSync(new URL('../src/'+path,import.meta.url));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected);
  assert.equal(asset.sha256,expected);assert.equal(asset.permission,mjIds.has(asset_id)?'approved':licensedIds.has(asset_id)?'licensed':'review-required');if(mjIds.has(asset_id))assert.match(asset.permission_evidence,/mj-photo-permission-20261029.json/);else if(asset_id==='asset-50646c3fe1d0c359')assert.match(asset.permission_evidence,/ephyra-figure-license-20261029.json/);else if(asset_id==='asset-e62b39cc07a542c4')assert.match(asset.permission_evidence,/fovea-figure-license-20261029.json/);else assert.equal(asset.permission_evidence,undefined);
  assert.equal(asset.offline,true);assert.ok(app.media.includes(asset_id));assert.ok(app.offline_assets.includes(path));
  assert.equal(asset.source_repository,'drtforshortaol/MBA-hub-v2');assert.equal(asset.source_commit,path.includes('big-sur-gray-whale')?'cae20ad89424d941cfb8f2bf39595307b0bb74a8':'12afc2052c6117cc33616a9687199e353c3d8c48');assert.equal(asset.source_path,'src/'+path);
  assert.equal(app.publication_review,id==='naturalist-field-notes'?'owner-approved-text':'pending');assert.ok(!['approved','published'].includes(app.status));
 }
 const blockers=releaseErrors(read('config/platform.json'),[...apps.values()],catalog,{apps:[]});
 for(const row of rows)assert.equal(blockers.includes('media permission review: '+row[2]),!mjIds.has(row[2])&&!licensedIds.has(row[2]));
});
test('literal media audit reports resolved registration gaps while retaining four remaining rights findings',()=>{
 const report=auditRepositoryMedia(),findings=report.resources.filter(r=>r.issues.length);
 assert.equal(report.summary.uncataloged_resources,0);assert.equal(findings.length,4);assert.equal(report.complete,false);
 assert.deepEqual(findings.map(r=>r.path).sort(),rows.filter(r=>!mjIds.has(r[2])&&!licensedIds.has(r[2])).map(r=>r[1]).sort());
 for(const result of findings)assert.deepEqual(result.issues,['permission-evidence-missing']);
});
