import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const sw=readFileSync(new URL('../src/sw.js',import.meta.url),'utf8');
const build=readFileSync(new URL('../scripts/build.mjs',import.meta.url),'utf8');

test('offline releases are bound to their build environment',()=>{
 assert.match(build,/const release=hash\(JSON\.stringify\(resources\)\)/);
 assert.match(build,/put\('release\.json',\{schema_version:1,version:platform\.version,environment,release,resources\}\)/);
 assert.match(sw,/manifest\.environment!==NAMESPACE\.slice\('mba-v2-'\.length\)/);
});

test('offline installation verifies assets before publishing the release manifest',()=>{
 const preparation=sw.slice(sw.indexOf('async function prepare()'),sw.indexOf("self.addEventListener('install'"));
 assert(preparation.indexOf('await verified(resource,item)')>=0);
 assert(preparation.indexOf("await cache.put(absolute('release.json'),response)")>preparation.indexOf('await verified(resource,item)'));
});

test('offline fetch does not silently redirect unknown paths to Hub',()=>{
 assert.match(sw,/This resource is not prepared offline\./);
 assert.doesNotMatch(sw,/catch\{return.*index\.html/);
});
