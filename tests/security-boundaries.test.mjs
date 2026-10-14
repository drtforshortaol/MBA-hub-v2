import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const tester='dist/tester';
const registry=JSON.parse(fs.readFileSync(path.join(tester,'registry.json'),'utf8'));
const environment=JSON.parse(fs.readFileSync(path.join(tester,'environment.json'),'utf8'));
function pathsUnder(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?pathsUnder(path.join(dir,e.name)):[path.join(dir,e.name)]);}
test('public tester excludes owner maintenance code and declares read-only mode',()=>{
  assert.equal(environment.developer,false);
  assert.equal(environment.environment,'tester');
  assert(!fs.existsSync(path.join(tester,'core/developer.js')));
  assert(!fs.readFileSync(path.join(tester,'core/hub.js'),'utf8').includes("import('./developer.js')"));
  const sw=fs.readFileSync(path.join(tester,'sw.js'),'utf8');
  assert.match(sw,/if\(!NAMESPACE\.endsWith\('-developer'\)\)throw Error\('Read-only environment'\)/);
});
test('registry links stay inside app paths without executable or network schemes',()=>{
 for(const a of registry.apps){
  assert.match(a.entry_point,/^apps\/[a-z0-9-]+\/index\.html$/);
  for(const asset of a.offline_assets||[])assert.match(asset,/^(?:apps|shared|core)\/[a-zA-Z0-9_.\/-]+$/);
 }
});
test('build contains no accidental GitHub admin configuration or environment files',()=>{
 const files=pathsUnder(tester).map(p=>path.relative(tester,p).replaceAll(path.sep,'/'));
 for(const f of files){
  assert(!/(?:^|\/)\.env(?:\.|$)|(?:^|\/)(?:id_rsa|id_ed25519|credentials\.json|secrets\.json|\.npmrc)(?:$)/i.test(f),'private file exposed: '+f);
  assert(!f.startsWith('.github/'),'repo administration leaked: '+f);
 }
});
