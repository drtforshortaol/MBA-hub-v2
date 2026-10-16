import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('Hub resolves manifest entry points against application root',()=>{
 const js=fs.readFileSync('src/core/hub.js','utf8');
 assert.match(js,/new URL\(String\(value\),new URL\('\.\.\/',import\.meta\.url\)\)/);
});
test('Hub splits multiword search on whitespace',()=>{
 const js=fs.readFileSync('src/core/hub.js','utf8');
 assert(js.includes('split(/\\s+/)'), 'search must split on whitespace');
 assert(!js.includes('split(/\\\\s+/)'), 'search must not split on literal backslash');
});
test('Seahorse is discoverable and links to an existing entry point',()=>{
 const manifest=JSON.parse(fs.readFileSync('src/apps/big-bellied-seahorse/manifest.json','utf8'));
 assert.equal(manifest.listed,true);
 assert.equal(manifest.category,'animals');
 assert(fs.existsSync('src/'+manifest.entry_point));
});
