import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {releaseErrors} from '../scripts/build.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const approvedIds=['asset-1bd100105f88c83a','asset-95daa2493750e82f','asset-47f9bbb193878eec','asset-df392914e6cf5502'];
const pendingIds=['asset-486b6cdb96375dfb','asset-2913dc8df835400c','asset-e62b39cc07a542c4','asset-54f52bac7bc827bc','asset-93c15fb934aba9e6'];
test('MJ confirmation binds exactly four photographs and removes only their reuse blockers',()=>{
 const permission=read('docs/verification/mj-photo-permission-20261029.json');
 const catalog=read('src/shared/media/catalog.json');
 assert.equal(permission.question_answered,'Has MJ authorized you to include these photos in your Aquarium guide hub?');
 assert.equal(permission.owner_confirmation,'Yes. In fact MJ is one of my tester for the hub');
 assert.deepEqual(permission.assets.map(a=>a.asset_id),approvedIds);
 for(const record of permission.assets){
  const a=catalog.assets.find(a=>a.asset_id===record.asset_id);
  assert.equal(a.permission,'approved');assert.equal(a.credit,'Photo: MJ — Naturalist and Aquarium shift captain.');
  assert.equal(a.sha256,record.sha256);assert.equal(a.path,record.path);
  assert.equal(createHash('sha256').update(fs.readFileSync('src/'+a.path)).digest('hex'),record.sha256);
  assert.match(a.permission_evidence,/mj-photo-permission-20261029.json/);
  assert.deepEqual(a.permission_scope,permission.scope);
 }
 const errors=releaseErrors(read('config/platform.json'),[],catalog,{apps:[]});
 assert.deepEqual(errors.filter(s=>s.startsWith('media permission review: ')).map(s=>s.replace('media permission review: ','')).sort(),pendingIds.slice().sort());
 assert.equal(errors.filter(s=>s.startsWith('release gate: ')).length,5);
 assert.equal(permission.publication_authorized,false);
 assert.deepEqual(permission.scope.not_granted,['standalone-visitor-sharing','unrelated-public-redistribution']);
});
test('MJ credit appears beside all four approved photographs without crediting third-party art',()=>{
 const catalog=read('src/shared/media/catalog.json');
 const context=vm.createContext({FIELD_NOTES:[]});vm.runInContext(fs.readFileSync('src/apps/naturalist-field-notes/october-2026-note.js','utf8'),context);
 const photos=JSON.parse(JSON.stringify(context.FIELD_NOTES[0])).observations.flatMap(o=>o.photos||[]);
 assert.equal(photos.filter(p=>p.caption.endsWith(' Photo: MJ.')).length,4);
 const jelly=photos.find(p=>p.src==='../IMG_4210.jpeg');assert(jelly);assert(!jelly.caption.includes('MJ'));
 for(const id of pendingIds)assert.equal(catalog.assets.find(a=>a.asset_id===id).permission,'review-required');
 assert.equal(catalog.assets.find(a=>a.asset_id==='asset-50646c3fe1d0c359').permission,'licensed');
 assert(fs.readFileSync('src/apps/naturalist-field-notes/october-2026-08-14.html','utf8').includes('Photo: MJ.</figcaption>'));
 assert.equal(read('src/apps/naturalist-field-notes/manifest.json').publication_review,'owner-approved-text');
});
