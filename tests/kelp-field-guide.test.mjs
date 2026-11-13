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
 assert.doesNotMatch(page,/<(?:script|link)\b[^>]*(?:src|href)="https?:/i);
});
test('21 species entries and key science topics',()=>{
 assert.equal((page.match(/<article class="card"/g)||[]).length,21);
 for(const word of ['Giant kelp','Bull kelp','Wakame','Holdfast','pneumatocyst','gametophytes','sporophytes'])assert.ok(page.includes(word),word);
});
