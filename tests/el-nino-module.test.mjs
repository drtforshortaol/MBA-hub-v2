import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('src/apps/el-nino/index.html','utf8');
const manifest=JSON.parse(fs.readFileSync('src/apps/el-nino/manifest.json','utf8'));
test('El Niño is a Concepts module, not a separate hosted app',()=>{
 assert.equal(manifest.app_id,'el-nino');
 assert.equal(manifest.category,'concepts');
 assert.equal(manifest.entry_point,'apps/el-nino/index.html');
 assert.equal(manifest.status,'development');
 assert.equal(manifest.sections.length,18);
 assert(manifest.offline_assets.includes(manifest.entry_point));
 assert.match(html,/core\/app-contract\.js/);
});
test('18 vector illustrations render locally with 16:9 aspect ratio',()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
 assert.equal(scripts.length,2);
 for(const script of scripts)new vm.Script(script);
 const context=vm.createContext({});
 const render=new vm.Script(scripts[1]+'\nArray.from({length:18},(_,i)=>graphic(i))').runInContext(context);
 assert.equal(render.length,18);
 for(const [i,svg] of render.entries()){
  assert.match(svg,/viewBox="0 0 1200 675"/,'slide '+(i+1));
  assert.match(svg,/<svg[\s\S]*<\/svg>/,'slide '+(i+1));
  assert(!svg.includes('undefined'),'slide '+(i+1));
 }
 assert.match(render[6],/EAST/);
});

test('El Niño module contains no external calls, browser storage, or sensitive APIs',()=>{
 assert.doesNotMatch(html,/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|geolocation|getUserMedia|navigator\.credentials|document\.cookie/);
 assert.doesNotMatch(html,/(?:src|href|action)\s*=\s*["']https?:\/\//i);
 assert.doesNotMatch(html.replaceAll('http://www.w3.org/2000/svg',''),/https?:\/\//i,'No remote network references expected');
 assert.deepEqual(manifest.media,[]);
 assert.deepEqual(manifest.offline_assets,['apps/el-nino/index.html']);
 assert.equal(manifest.publication_review,'pending','Publication approval is separate from privacy assessment');
});
