import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {planOfflineMediaRegistration} from '../scripts/plan-offline-media-registration.mjs';
import {inspectRepository} from '../scripts/content-preflight.mjs';

function fixture(){
 return {
  apps:[{app_id:'ray',version:'1.0.0',offline_assets:['apps/ray/index.html','shared/media/already.svg'],media:['new-photo','already','new-photo','online']}],
  media:{assets:[{asset_id:'new-photo',path:'shared/media/new.svg',offline:true},{asset_id:'already',path:'shared/media/already.svg',offline:true},{asset_id:'online',path:'shared/media/online.svg',offline:false}]},
  exists:asset=>['shared/media/new.svg','shared/media/already.svg'].includes(asset)
 };
}

test('media registration plan appends only missing offline paths once in reference order',()=>{
 const context=fixture(),before=structuredClone({apps:context.apps,media:context.media});
 const plan=planOfflineMediaRegistration(context);
 assert.deepEqual(plan,{valid:true,writePerformed:false,apps:1,additions:1,plans:[{app_id:'ray',additions:['shared/media/new.svg']}],errors:[]});
 assert.deepEqual({apps:context.apps,media:context.media},before,'planning must leave inputs intact');
 const original=context.apps[0],updated={...original,offline_assets:[...original.offline_assets,...plan.plans[0].additions]};
 assert.deepEqual({...updated,offline_assets:original.offline_assets},original,'declarative reconciliation changes no other fields');
 assert.deepEqual(updated.offline_assets.slice(0,original.offline_assets.length),original.offline_assets);
 assert.equal(planOfflineMediaRegistration({...context,apps:[updated]}).additions,0,'completed registration is idempotent');
});

test('media registration plan keeps each owning app independent',()=>{
 const context=fixture();
 context.apps.push({app_id:'kelp',offline_assets:['apps/kelp/index.html'],media:['new-photo']});
 const plan=planOfflineMediaRegistration(context);
 assert.deepEqual(plan.plans.map(item=>item.app_id),['ray','kelp']);
 assert.equal(plan.additions,2);
});

test('media registration plan rejects unknown media and unsafe or missing offline paths',()=>{
 for(const asset of [null,{asset_id:'new-photo',path:'../outside.svg',offline:true},{asset_id:'new-photo',path:'https://elsewhere.test/photo.svg',offline:true},{asset_id:'new-photo',path:'shared/media/missing.svg',offline:true}]){
  const context=fixture();context.apps[0].media=['new-photo'];context.media.assets=asset?[asset]:[];
  const plan=planOfflineMediaRegistration(context);
  assert.equal(plan.valid,false);
  assert.equal(plan.additions,0);
  assert.equal(plan.errors.length,1);
 }
});

test('all repository media declarations pass strict preflight with nothing left to reconcile',()=>{
 const result=inspectRepository('--all');
 assert.equal(result.checked,33);
 assert.equal(result.ready,true,JSON.stringify(result.results.filter(item=>!item.ready)));
});

test('media planner CLI is read-only and repository reconciliation is complete',()=>{
 const paths=fs.readdirSync('src/apps',{withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=>`src/apps/${entry.name}/manifest.json`);
 const hashes=()=>paths.map(file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
 const before=hashes();
 const result=JSON.parse(execFileSync(process.execPath,['scripts/plan-offline-media-registration.mjs'],{encoding:'utf8'}));
 assert.equal(result.valid,true);
 assert.equal(result.writePerformed,false);
 assert.equal(result.additions,0);
 assert.deepEqual(hashes(),before);
});


test('media registration planner rejects duplicate and malformed catalog IDs without writes',()=>{
 for(const assets of [
  [{asset_id:'new-photo',path:'shared/media/new.svg',offline:true},{asset_id:'new-photo',path:'shared/media/other.svg',offline:true}],
  [{asset_id:'',path:'shared/media/new.svg',offline:true}],
  [null]
 ]){
  const context=fixture();context.media.assets=assets;
  const before=structuredClone(context.media);
  const result=planOfflineMediaRegistration(context);
  assert.equal(result.valid,false);
  assert.equal(result.writePerformed,false);
  assert.ok(result.errors.some(error=>error.startsWith('media catalog:')));
  assert.deepEqual(context.media,before);
 }
});

test('duplicate catalog IDs never silently choose a conflicting media path',()=>{
 const context=fixture();
 context.media.assets.push({asset_id:'new-photo',path:'shared/media/other.svg',offline:true});
 const plan=planOfflineMediaRegistration(context);
 assert.equal(plan.valid,false);
 assert.ok(plan.errors.some(error=>error.includes('duplicate asset ID new-photo')));
 assert.equal(plan.writePerformed,false);
});


test('conflicting offline media never yields an actionable addition in either catalog order',()=>{
 for(const reverse of [false,true]){
  const context=fixture();
  context.apps[0].media=['new-photo'];
  context.media.assets=[
   {asset_id:'new-photo',path:'shared/media/new.svg',offline:true},
   {asset_id:'new-photo',path:'shared/media/other.svg',offline:true},
   {asset_id:'new-photo',path:'shared/media/third.svg',offline:true}
  ];
  if(reverse)context.media.assets.reverse();
  context.exists=()=>assert.fail('ambiguous media must not reach filesystem lookup');
  const result=planOfflineMediaRegistration(context);
  assert.equal(result.valid,false);
  assert.equal(result.additions,0);
  assert.deepEqual(result.plans,[]);
  assert.equal(result.errors.filter(error=>error.includes('duplicate asset ID')).length,2);
 }
});

test('malformed offline intent cannot silently omit media from a successful plan',()=>{
 for(const offline of [undefined,null,'true','false',0,1,{},[]]){
  const context=fixture();
  context.media.assets[0].offline=offline;
  const before=structuredClone(context.media);
  const result=planOfflineMediaRegistration(context);
  assert.equal(result.valid,false);
  assert.ok(result.errors.includes('media catalog: invalid offline intent new-photo'));
  assert.equal(result.additions,0);
  assert.equal(result.writePerformed,false);
  assert.deepEqual(context.media,before);
 }
});


test('malformed planner containers return diagnostics without filesystem access',()=>{
 const valid=fixture();
 for(const context of [undefined,null,{}, {...valid,apps:null},{...valid,apps:{}},{...valid,media:null},{...valid,media:{assets:'wrong'}},{...valid,exists:null}]){
  const result=planOfflineMediaRegistration(context);
  assert.equal(result.valid,false);
  assert.equal(result.writePerformed,false);
  assert.deepEqual(result.plans,[]);
  assert.ok(result.errors.length>0);
 }
});

test('invalid app declarations do not produce partial or character-by-character plans',()=>{
 for(const app of [null,{app_id:' '},{app_id:'ray',media:'new-photo',offline_assets:[]},
  {app_id:'ray',media:['new-photo',null],offline_assets:[]},
  {app_id:'ray',media:['new-photo'],offline_assets:'apps/ray/index.html'},
  {app_id:'ray',media:['new-photo'],offline_assets:['../outside.svg']},
  {app_id:'ray',media:['new-photo'],offline_assets:[null]}]){
  const context=fixture();context.apps=[app];
  context.exists=()=>assert.fail('invalid app must not reach filesystem lookup');
  const before=structuredClone(app);
  const result=planOfflineMediaRegistration(context);
  assert.equal(result.valid,false);
  assert.deepEqual(result.plans,[]);
  assert.equal(result.writePerformed,false);
  assert.deepEqual(app,before);
 }
});

test('unsafe catalog paths fail before filesystem access',()=>{
 for(const path of ['../outside.svg','/outside.svg','shared/../outside.svg','shared//new.svg',
  'https://example.test/new.svg','shared/media/new.svg?download','shared/media/%2e%2e/new.svg',
  'shared\\media\\new.svg',null,42]){
  const context=fixture();context.apps[0].media=['new-photo'];
  context.media.assets[0].path=path;
  context.exists=()=>assert.fail('unsafe path must not reach filesystem lookup');
  const result=planOfflineMediaRegistration(context);
  assert.equal(result.valid,false);
  assert.equal(result.additions,0);
  assert.deepEqual(result.errors,['ray: missing/unsafe offline media new-photo']);
 }
});


test('duplicate app IDs never produce ambiguous manifest additions',()=>{
 for(const reverse of [false,true]){
  const context=fixture();context.apps.push({...context.apps[0],offline_assets:[]});
  if(reverse)context.apps.reverse();
  context.exists=()=>assert.fail('ambiguous app must not reach filesystem lookup');
  const before=structuredClone(context.apps),result=planOfflineMediaRegistration(context);
  assert.equal(result.valid,false);assert.deepEqual(result.plans,[]);
  assert.deepEqual(result.errors,['registration input: duplicate app ID ray']);
  assert.equal(result.writePerformed,false);assert.deepEqual(context.apps,before);
 }
});

test('sparse or inherited manifest arrays cannot masquerade as complete declarations',()=>{
 for(const field of ['media','offline_assets'])for(const inherited of [false,true]){
  const context=fixture(),values=context.apps[0][field].slice(),original=values[0];delete values[0];
  if(inherited)Object.setPrototypeOf(values,Object.assign(Object.create(Array.prototype),{0:original}));
  context.apps[0][field]=values;
  context.exists=()=>assert.fail('incomplete arrays must not reach filesystem lookup');
  const result=planOfflineMediaRegistration(context);
  assert.equal(result.valid,false);assert.deepEqual(result.plans,[]);
  assert.equal(result.writePerformed,false);assert.equal(result.errors.length,1);
 }
});
