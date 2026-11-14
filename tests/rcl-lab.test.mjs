import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync('src/apps/rcl-component-lab/manifest.json','utf8'));
const html=fs.readFileSync('src/apps/rcl-component-lab/index.html','utf8');
test('RCL lab is an isolated development-only Hub app',()=>{
 assert.equal(manifest.status,'development');
 assert.equal(manifest.category,'volunteer-tools');
 assert.equal(manifest.entry_point,'apps/rcl-component-lab/index.html');
 assert.deepEqual(manifest.offline_assets,['apps/rcl-component-lab/index.html']);
});
test('RCL lab uses Hub platform navigation rather than external production URL',()=>{
 assert.match(html,/href="\.\.\/\.\.\/index\.html"/);
 assert.match(html,/src="\.\.\/\.\.\/core\/app-contract\.js"/);
 assert.doesNotMatch(html,/id="back"/);
});
test('cards render without JavaScript, search remains optional enhancement',()=>{
 for(const title of ['Ocean science','Marine habitats','Visitor guidance'])assert.ok(html.includes('<summary>'+title+'</summary>'));
 assert.match(html,/addEventListener\('input',render\)/);
});

test('public-review pipeline explicitly excludes dummy lab',()=>{const source=fs.readFileSync('scripts/public-review.mjs','utf8');assert.match(source,/excluded=new Set\(\['rcl-component-lab'\]\)/);assert.match(source,/fs\.rmSync/);assert.match(source,/input\.filter\(app=>!excluded\.has\(app\.app_id\)\)/);});

test('built developer registry contains lab while tester registry excludes it',()=>{
 const dev='dist/developer/registry.json',tester='dist/tester/registry.json';
 if(!fs.existsSync(dev)||!fs.existsSync(tester))return; // build verification is run separately in CI
 const a=JSON.parse(fs.readFileSync(dev,'utf8')).apps;
 const b=JSON.parse(fs.readFileSync(tester,'utf8')).apps;
 assert.ok(a.some(x=>x.app_id==='rcl-component-lab'));
 assert.ok(!b.some(x=>x.app_id==='rcl-component-lab'));
 assert.ok(fs.existsSync('dist/developer/apps/rcl-component-lab/index.html'));
 assert.ok(!fs.existsSync('dist/tester/apps/rcl-component-lab/index.html'));
});
