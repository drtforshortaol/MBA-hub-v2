import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const folder='src/apps/applied-water-science-life-support/';
const html=fs.readFileSync(folder+'index.html','utf8');
const script=fs.readFileSync(folder+'app.js','utf8');
const manifest=JSON.parse(fs.readFileSync(folder+'manifest.json','utf8'));
const cards=[...html.matchAll(/<article class="card" id="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
const text=value=>value.replace(/<[^>]*>/g,' ').replaceAll('&amp;','&').replace(/\s+/g,' ').trim();
test('all 13 Water Science cards are globally searchable at their existing rendered IDs',()=>{
 assert.equal(cards.length,13);assert.equal(manifest.sections.length,18);
 for(const [,id,body] of cards){const section=manifest.sections.find(s=>s.id===id);assert(section,id);assert.equal(section.title,text(body.match(/<strong>([\s\S]*?)<\/strong>/)[1]));assert.equal(section.text,text(body));assert.equal(html.split(`id="${id}"`).length-1,1);}
 for(const id of ['Why-don-t-the-pipes-clog-completely','Why-use-natural-seawater','What-are-the-orange-cylinders','Does-upwelling-affect-the-Aquarium','Is-all-water-the-same-for-every-exhibit'])assert(manifest.sections.some(s=>s.id===id),id);
 assert.equal(manifest.publication_review,'pending');assert.equal(manifest.status,'testing');
});
test('owning Water Science renderer opens every newly indexed card from its actual hash',()=>{
 for(const [,id] of cards){const classes=new Set(['card']);const attributes={'aria-expanded':'false'};let scrolls=0;const header={setAttribute:(key,value)=>attributes[key]=value};const card={classList:{contains:value=>classes.has(value),add:value=>classes.add(value)},querySelector:()=>header,scrollIntoView:()=>scrolls++};const window={location:{hash:'#'+id},addEventListener(){}};
 vm.runInNewContext(script,{window,document:{querySelectorAll:()=>[],getElementById:target=>target===id?card:null},setTimeout:fn=>fn(),navigator:{}});
 assert(classes.has('open'),id);assert.equal(attributes['aria-expanded'],'true');assert.equal(scrolls,1);
 }
});
test('both offline search indexes include every Water Science card and retain FAQ routes',()=>{
 for(const environment of ['developer','tester']){const index=JSON.parse(fs.readFileSync(`dist/${environment}/search-index.json`));const entries=index.filter(e=>e.app_id===manifest.app_id);for(const section of manifest.sections)assert(entries.some(e=>e.url.endsWith('#'+section.id)),`${environment}:${section.id}`);}
});
