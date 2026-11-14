import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync('src/apps/rcl-component-lab/manifest.json','utf8'));
const html=fs.readFileSync('src/apps/rcl-component-lab/index.html','utf8');
test('RCL lab is an isolated development-only Hub app',()=>{
 assert.equal(manifest.status,'development');
 assert.equal(manifest.version,'0.4.0');
 assert.equal(manifest.category,'volunteer-tools');
 assert.equal(manifest.entry_point,'apps/rcl-component-lab/index.html');
 assert.deepEqual(manifest.offline_assets,['apps/rcl-component-lab/index.html','shared/rcl/card-search.js']);
});
test('RCL lab uses Hub platform navigation rather than external production URL',()=>{
 assert.match(html,/href="\.\.\/\.\.\/index\.html"/);
 assert.match(html,/src="\.\.\/\.\.\/core\/app-contract\.js"/);
 assert.doesNotMatch(html,/id="back"/);
 const contract=fs.readFileSync('src/core/app-contract.js','utf8');
 assert.match(contract,/data-v2-back/);
 assert.match(contract,/returnToVisit/);
 assert.match(contract,/mainHubURL/);
});
test('cards render without JavaScript, search remains optional enhancement',()=>{
 for(const title of ['Ocean science','Marine habitats','Visitor guidance'])assert.ok(html.includes('<summary>'+title+'</summary>'));
 assert.match(html,/shared\/rcl\/card-search\.js/);
 const module=fs.readFileSync('src/shared/rcl/card-search.js','utf8');
 assert.match(module,/addEventListener\('input',filter\)/);
 assert.match(module,/card.hidden=!match/);
 assert.doesNotMatch(module,/replaceChildren/);
});

test('public-review pipeline explicitly excludes dummy lab',()=>{const source=fs.readFileSync('scripts/public-review.mjs','utf8');assert.match(source,/excluded=new Set\(\['rcl-component-lab'\]\)/);assert.match(source,/fs\.rmSync/);assert.match(source,/input\.filter\(app=>!excluded\.has\(app\.app_id\)\)/);});

test('built developer registry contains lab while tester registry excludes it',()=>{
 const dev='dist/developer/registry.json',tester='dist/tester/registry.json';
 assert.ok(fs.existsSync(dev),'developer bundle must be built before tests');
 assert.ok(fs.existsSync(tester),'tester bundle must be built before tests');
 const a=JSON.parse(fs.readFileSync(dev,'utf8')).apps;
 const b=JSON.parse(fs.readFileSync(tester,'utf8')).apps;
 assert.ok(a.some(x=>x.app_id==='rcl-component-lab'));
 assert.ok(!b.some(x=>x.app_id==='rcl-component-lab'));
 assert.ok(fs.existsSync('dist/developer/apps/rcl-component-lab/index.html'));
 assert.ok(!fs.existsSync('dist/tester/apps/rcl-component-lab/index.html'));
 assert.ok(fs.existsSync('dist/developer/shared/rcl/card-search.js'));
 assert.ok(!fs.existsSync('dist/tester/shared/rcl/card-search.js'));
 const testerSearch=JSON.parse(fs.readFileSync('dist/tester/search-index.json','utf8'));
 assert.ok(!testerSearch.some(x=>x.app_id==='rcl-component-lab'));
 const testerRelease=JSON.parse(fs.readFileSync('dist/tester/release.json','utf8'));
 assert.ok(!testerRelease.resources.some(x=>x.url.includes('rcl-component-lab')));
 assert.ok(!testerRelease.resources.some(x=>x.url.startsWith('shared/rcl/')));
 const devRelease=JSON.parse(fs.readFileSync('dist/developer/release.json','utf8'));
 assert.ok(devRelease.resources.some(x=>x.url==='apps/rcl-component-lab/index.html'));
 assert.ok(devRelease.resources.some(x=>x.url==='shared/rcl/card-search.js'));

});

test('developer RCL bundle resolves its imported modules and offline dependencies',()=>{
 const root='dist/developer';
 const page=fs.readFileSync(root+'/apps/rcl-component-lab/index.html','utf8');
 const searchPath=root+'/shared/rcl/card-search.js';
 const contractPath=root+'/core/app-contract.js';
 const navigationPath=root+'/core/navigation.js';
 const offlinePath=root+'/core/offline.js';
 for(const path of [searchPath,contractPath,navigationPath,offlinePath]){
  assert.ok(fs.existsSync(path),'missing imported module: '+path);
 }
 assert.match(page,/import\s*\{attachCardSearch\}\s*from\s*['"]\.\.\/\.\.\/shared\/rcl\/card-search\.js['"]/);
 const contract=fs.readFileSync(contractPath,'utf8');
 assert.match(contract,/from ['"]\.\/navigation\.js['"]/);
 assert.match(contract,/from ['"]\.\/offline\.js['"]/);
 const release=JSON.parse(fs.readFileSync(root+'/release.json','utf8'));
 for(const asset of manifest.offline_assets){
  assert.ok(release.resources.some(resource=>resource.url===asset),'offline release omits '+asset);
 }
 const registry=JSON.parse(fs.readFileSync(root+'/registry.json','utf8'));
 assert.ok(registry.categories.some(category=>category.id==='volunteer-tools'));
 const lab=registry.apps.find(app=>app.app_id==='rcl-component-lab');
 assert.equal(lab?.listed,true);
});
