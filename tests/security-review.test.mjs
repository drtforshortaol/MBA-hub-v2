import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

test('tester build excludes developer maintenance code',()=>{
 execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'pipe'});
 assert.equal(fs.existsSync('dist/tester/core/developer.js'),false);
 assert.equal(fs.existsSync('dist/developer/core/developer.js'),true);
 assert.doesNotMatch(fs.readFileSync('dist/tester/core/hub.js','utf8'),/import\(['"]\.\/developer\.js['"]\)/);
});
test('service worker isolates scope and blocks tester repair',()=>{
 const sw=fs.readFileSync('src/sw.js','utf8');
 assert.match(sw,/url\.origin!==ROOT\.origin/);
 assert.match(sw,/url\.pathname\.startsWith\(ROOT\.pathname\)/);
 assert.match(sw,/NAMESPACE\.endsWith\('-developer'\)/);
 assert.match(sw,/crypto\.subtle\.digest\('SHA-256'/);
});
test('published HTML has no embedded credential-shaped assignments',()=>{
 const paths=['src/index.html','src/install.html'].filter(fs.existsSync);
 for(const path of paths){
  const data=fs.readFileSync(path,'utf8');
  assert.doesNotMatch(data,/(?:github_pat_|ghp_)[A-Za-z0-9_]{20,}/);
  assert.doesNotMatch(data,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/);
 }
});
test('release manifest hashes and sizes match built tester bytes',async()=>{
 const release=JSON.parse(fs.readFileSync('dist/tester/release.json','utf8'));
 const crypto=await import('node:crypto');
 for(const item of release.resources){
  const bytes=fs.readFileSync('dist/tester/'+item.url);
  assert.equal(bytes.length,item.bytes,item.url);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256,item.url);
 }
});
