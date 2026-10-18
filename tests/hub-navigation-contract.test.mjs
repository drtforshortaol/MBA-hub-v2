import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=()=>fs.readFileSync('src/core/hub.js','utf8');
test('Hub resolves app links relative to the V2 root',()=>{
 assert(source().includes("new URL(String(value),new URL('../',import.meta.url))"));
});
test('Hub splits search terms on whitespace, not literal backslashes',()=>{
 const expected='split(/'+String.fromCharCode(92)+'s+/)';
 const incorrect='split(/'+String.fromCharCode(92,92)+'s+/)';
 assert(source().includes(expected),'search should split on whitespace');
 assert(!source().includes(incorrect),'literal backslash search regression');
});
test('Seahorse is discoverable and has an existing entry point',()=>{
 const m=JSON.parse(fs.readFileSync('src/apps/big-bellied-seahorse/manifest.json','utf8'));
 assert.equal(m.listed,true);
 assert.equal(m.category,'animals');
 assert(fs.existsSync('src/'+m.entry_point));
});
test('all built applications have valid entry points and offline files',()=>{
 const registry=JSON.parse(fs.readFileSync('dist/developer/registry.json','utf8'));
 assert(registry.apps.length>=32,'expected migrated V2 collection');
 for(const app of registry.apps){
  assert(fs.existsSync('dist/developer/'+app.entry_point),app.app_id);
  for(const file of app.offline_assets)assert(fs.existsSync('dist/developer/'+file),file);
 }
});
