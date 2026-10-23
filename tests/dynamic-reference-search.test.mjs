import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=(app,name)=>fs.readFileSync(`src/apps/${app}/${name}`,'utf8');
const manifest=app=>JSON.parse(read(app,'manifest.json'));
const norm=value=>String(value).replace(/\s+/g,' ').trim();
function sourceData(app,key){const window={};vm.runInNewContext(read(app,'data.js'),{window});return window[key];}
function sealSections(){const window={};const context=vm.createContext({window,document:{addEventListener(){}}});vm.runInContext(read('northern-elephant-seal','data.js')+'\n'+read('northern-elephant-seal','app.js'),context);return vm.runInContext('buildSections()',context);}
function visible(markup){return norm(markup.replace(/<[^>]*>/g,' ').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#039;',"'"));}
test('Five Senses source references index every complete original note at the existing target',()=>{
 const app='five-senses-pwa',data=sourceData(app,'USING_FIVE_SENSES_DATA'),entry=manifest(app).sections.find(s=>s.id==='Sources-and-Notes');
 assert.equal(data.references.length,7);assert.equal(entry.text,[entry.title,...data.references].join(' '));
 assert.match(read(app,'index.html'),/<details[^>]*id="Sources-and-Notes"/);
 assert.match(read(app,'index.html'),/<ul id="referenceList"><\/ul>/);
 assert.match(read(app,'app.js'),/DATA\.references\s*\.map\(\(reference\) => `<li>\$\{escapeHtml\(reference\)\}<\/li>`\)/);
 assert.equal(manifest(app).sections.length,11);assert.equal(manifest(app).publication_review,'pending');
});
test('Seal index includes the entire inherited rendered Diet explanation and displayed version labels',()=>{
 const app='northern-elephant-seal',data=sourceData(app,'APP_DATA'),sections=sealSections(),index=manifest(app).sections;
 assert.equal(index.length,1);assert.equal(index[0].id,'Northern-Elephant-Seal');assert.equal(sections.length,17);
 const diet=sections.find(s=>s.title==='Diet');const paragraphs=[...diet.html.matchAll(/<p>(.*?)<\/p>/gs)].map(m=>visible(m[1]));
 assert(paragraphs.some(p=>p.startsWith('Nighttime foraging connects')));
 for(const text of paragraphs)assert(norm(index[0].text).includes(text),text);
 const version=visible(sections.find(s=>s.title==='Version / Last Updated').html);assert(norm(index[0].text).includes(version));
 assert(norm(index[0].text).includes(`Version: ${data.version} Last updated: ${data.lastUpdated}`));
 assert.equal(manifest(app).publication_review,'pending');
});
test('both generated offline indexes retain exact existing destinations and complete restored phrases',()=>{
 for(const environment of ['developer','tester']){
  const index=JSON.parse(fs.readFileSync(`dist/${environment}/search-index.json`));
  for(const [app,id] of [['five-senses-pwa','Sources-and-Notes'],['northern-elephant-seal','Northern-Elephant-Seal']]){
   const source=manifest(app).sections.find(s=>s.id===id);const hits=index.filter(e=>e.app_id===app&&e.url===`apps/${app}/index.html#${id}`);assert.equal(hits.length,1);assert(hits[0].text.includes(source.text));
  }
 }
});
