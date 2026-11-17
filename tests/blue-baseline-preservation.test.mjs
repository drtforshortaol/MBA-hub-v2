import vm from 'node:vm';
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

test('Nearby Dining uses a cached local launch page in both channels',()=>{
 const entry='apps/nearby-dining/index.html';
 const external='https://drtforshortaol.github.io/MBA-nearby-dining/';
 for(const channel of ['developer','tester']){
  const dir='dist/'+channel;
  const registry=JSON.parse(fs.readFileSync(dir+'/registry.json','utf8'));
  const app=registry.apps.find(item=>item.app_id==='nearby-dining');
  assert.equal(app.listed,true);
  assert.equal(app.category,'volunteer-tools');
  assert.equal(app.entry_point,entry);
  assert.ok(app.offline_assets.includes(entry));
  const search=JSON.parse(fs.readFileSync(dir+'/search-index.json','utf8'));
  assert.ok(search.some(item=>item.app_id===app.app_id && item.url===entry));
  const hub=fs.readFileSync(dir+'/core/hub.js','utf8');
  assert.ok(!hub.includes(external),'The Hub should navigate to the local launch page');
  const launcher=fs.readFileSync(dir+'/'+entry,'utf8');
  assert.match(launcher,/<a [^>]*href="https:\/\/drtforshortaol\.github\.io\/MBA-nearby-dining\/"/);
  assert.ok(launcher.includes('href="../../index.html?home=1"'));
  assert.match(launcher,/offline access must be prepared separately/);
 }
});

test('both bundles preserve the reviewed El Niño layout and the Monterey-to-Kelvin link',()=>{
 for(const channel of ['developer','tester']){
  const html=fs.readFileSync('dist/'+channel+'/apps/el-nino/index.html','utf8');
  const content=html.split('<span class="num">14</span>')[1];
  assert.ok(content,channel);
  let depth=1;
  let end;
  for(const tag of content.matchAll(/<details\b[^>]*>|<\/details>/g)){
   depth+=tag[0]==='</details>'?-1:1;
   if(depth===0){end=tag.index;break;}
  }
  assert.ok(end,channel);
  const card14=content.slice(0,end);
  assert.equal([...card14.matchAll(/<details class="subtopic"[^>]*>/g)].length,5);
  const illustration=card14.indexOf('src="./images/slide-14.jpg"');
  const introduction=card14.indexOf('What Monterey Bay normally experiences');
  assert.ok(illustration>=0 && introduction>illustration,channel);
  for(const current of ['California Current','California Undercurrent','Davidson Current'])
   assert.ok(card14.includes('<h4>'+current+'</h4>'),current);
  assert.match(card14,/href="#equatorial-kelvin-waves"/);
  assert.match(html,/<details[^>]+id="equatorial-kelvin-waves"/);
  const targets=new Map();
  const listeners=new Map();
  const location={hash:''};
  const parent={parentElement:{closest:()=>null}};
  for(const hash of ['#equatorial-kelvin-waves','#monterey-bay-by-season']){
   targets.set(hash,{parentElement:{closest:()=>hash==='#monterey-bay-by-season'?parent:null},scrollIntoView(){this.scrolled=true;}});
  }
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{
   location,
   window:{addEventListener(){}},
   document:{
    querySelector:selector=>targets.get(selector)??{},
    querySelectorAll:selector=>selector.startsWith('a[href=')?[{addEventListener:(event,handler)=>listeners.set(selector,handler)}]:[]
   }
  });
  for(const [hash,target] of targets){
   const click=listeners.get('a[href="'+hash+'"]');
   assert.equal(typeof click,'function',hash);
   click();
   assert.ok(target.open&&target.scrolled,hash);
  }
  assert.ok(parent.open,'the seasonal link opens its enclosing card');
 }
});
