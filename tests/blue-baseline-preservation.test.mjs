import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

// Immutable blue production source inventory, deployed from 40e1826166f0.
const original=[
  "applied-water-science-life-support",
  "aquarium-library-explorer",
  "big-bellied-seahorse",
  "bluespotted-ribbontail-ray",
  "california-flying-fish",
  "california-kelp-field-guide",
  "california-sheephead",
  "evolution-timeline",
  "five-senses-pwa",
  "flamboyant-cuttlefish",
  "gooseneck-barnacle",
  "gray-whale-skeleton-exhibit",
  "gray-whale",
  "green-falsejingle",
  "hopkins-rose-nudibranch",
  "inaturalist-citizen-science",
  "information-center",
  "interpretation-principles",
  "kelp-forest",
  "mba-leadership",
  "mmc-narrations",
  "naturalist-briefing-20261111",
  "naturalist-field-notes",
  "northern-elephant-seal",
  "ocellaris-clownfish",
  "open-sea",
  "pacific-white-sided-dolphin",
  "pseudo-nitzschia",
  "sea-slugs-nudibranchs",
  "sperm-whale",
  "stargazer-species-guide",
  "tree-of-life-origins",
  "whale-associated-organisms",
  "whale-parasites-associates",
  "wildfires-ocean-health",
  "wildlife-rescue"
];
test('blue reconciliation preserves every existing application',()=>{
 for(const id of original){
  assert.ok(fs.existsSync('src/apps/'+id+'/manifest.json'),'Missing existing blue application '+id);
  const m=JSON.parse(fs.readFileSync('src/apps/'+id+'/manifest.json','utf8'));
  assert.equal(m.app_id,id);
 }
 const registered=fs.readdirSync('src/apps',{withFileTypes:true}).filter(x=>x.isDirectory());
 assert.ok(registered.length>=original.length+2,'El Niño and Nearby Dining must augment, not replace, baseline');
});
test('El Niño owns its 18 original offline illustrations and local navigation',()=>{
 const m=JSON.parse(fs.readFileSync('src/apps/el-nino/manifest.json','utf8'));
 assert.equal(m.category,'concepts');
 assert.equal(m.owner,'el-nino');
 assert.equal(m.offline_assets.filter(x=>x.includes('/images/')).length,18);
 const html=fs.readFileSync('src/apps/el-nino/index.html','utf8');
 assert.ok(html.includes('href="../../index.html?home=1"'));
 assert.ok(!html.includes('https://drtforshortaol.github.io/MBA-hub-v2-dev/'));
 for(let i=1;i<=18;i++){
  const file='src/apps/el-nino/images/slide-'+String(i).padStart(2,'0')+'.jpg';
  const bytes=fs.readFileSync(file);
  assert.ok(bytes.length>10000,'Missing original illustration '+file);
  assert.ok(m.offline_assets.includes(file.slice(4)));
 }
});
test('blue build retains all baseline registrations and adds exactly one El Niño',()=>{
 const registry=JSON.parse(fs.readFileSync('dist/tester/registry.json','utf8'));
 const ids=new Set(registry.apps.map(x=>x.app_id));
 for(const id of original)assert.ok(ids.has(id),'Blue registry lost '+id);
 assert.equal(registry.apps.filter(x=>x.app_id==='el-nino').length,1);
 assert.equal(registry.apps.filter(x=>x.app_id==='nearby-dining').length,1);
 assert.equal(registry.apps.find(x=>x.app_id==='nearby-dining').category,'volunteer-tools');
 const hub=fs.readFileSync('dist/tester/core/hub.js','utf8');
 assert.ok(!hub.includes('const nearbyDining='),'Dining must not be injected into Hub core');
 assert.ok(hub.includes('listedHubApps(registry.apps)'),'Entries must derive from canonical registry');
});
