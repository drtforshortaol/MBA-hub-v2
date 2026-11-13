// Run: node --test tests/kelp-field-guide.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('src/apps/california-kelp-field-guide/manifest.json',root),'utf8'));
const page = readFileSync(new URL('src/apps/california-kelp-field-guide/index.html',root),'utf8');
test('manifest identifies isolated development app',()=>{
 assert.equal(manifest.app_id,'california-kelp-field-guide');
 assert.equal(manifest.status,'development');
 assert.equal(manifest.category,'exhibits');
 assert.equal(manifest.entry_point,'apps/california-kelp-field-guide/index.html');
 assert.ok(manifest.offline_assets.includes(manifest.entry_point));
 assert.ok(manifest.cross_links.some(x=>x.app_id==='kelp-forest'));
});
test('all local assets exist under src',()=>{
 for(const path of manifest.offline_assets)assert.ok(existsSync(new URL('src/'+path,root)),path);
});
test('self contained, accessible guide',()=>{
 assert.match(page,/<html lang="en">/);
 assert.match(page,/type="search"/);
 assert.match(page,/aria-expanded="false"/);
 assert.match(page,/aria-live="polite"/);
 assert.match(page,/href="\.\.\/\.\.\/index\.html"/);
 assert.match(page,/src="\.\.\/\.\.\/core\/app-contract\.js"/);
 assert.doesNotMatch(page,/<(?:script|link)\b[^>]*(?:src|href)="https?:/i);
});
test('21 species entries and key science topics',()=>{
 assert.equal((page.match(/<article class="card"/g)||[]).length,21);
 for(const word of ['Giant kelp','Bull kelp','Wakame','Holdfast','pneumatocyst','gametophytes','sporophytes'])assert.ok(page.includes(word),word);
});

test('species directory has unique common and scientific names',()=>{
 const entries=[...page.matchAll(/<strong>([^<]+)<\/strong><em>([^<]+)<\/em>/g)];
 assert.equal(entries.length,21);
 const common=entries.map(m=>m[1].trim().toLowerCase());
 const scientific=entries.map(m=>m[2].trim().toLowerCase());
 assert.equal(new Set(scientific).size,21,'duplicate scientific name');
 assert.ok(new Set(common).size>=20,'unexpected duplicate common names');
 assert.match(page,/\.sort\(\(a,b\)=>a\.querySelector\('strong'\)\.textContent\.localeCompare/);
});
test('shared navigation and offline contract files are included in build source',()=>{
 for(const file of ['src/core/app-contract.js','src/core/navigation.js','src/core/offline.js'])
  assert.ok(existsSync(new URL(file,root)),file);
});

test('filter distinguishes introduced origin from habitat groups',()=>{
 assert.match(page,/All groups/);
 assert.match(page,/“Introduced” describes origin rather than habitat/);
});
test('empty searches provide a readable reset hint',()=>{
 assert.match(page,/id="no-results" role="status" hidden/);
 assert.match(page,/No matching kelp entries/);
 assert.match(page,/querySelector\('#no-results'\)\.hidden=n!==0/);
});
