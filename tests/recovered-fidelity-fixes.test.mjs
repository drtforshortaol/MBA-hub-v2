import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(`src/apps/${p}`,'utf8');
test('active Kelp renderer restores three authored Story paragraphs without altering text',()=>{
 const window={};vm.runInNewContext(read('kelp-forest/data.js'),{window});
 const parent={children:[],appendChild(n){this.children.push(n);}};
 const document={createElement:tag=>({tag,textContent:'',appendChild(){}})};
 const source=read('kelp-forest/app.js').replace(/init\(\);\s*$/,'');
 vm.runInNewContext(source+'\nrenderSectionBody(parent,2);',{window,document,parent});
 assert.equal(parent.children.length,3);assert(parent.children.every(n=>n.tag==='p'));
 assert.equal(parent.children.map(n=>n.textContent).join('\n\n'),window.APP_DATA.story);
});
test('whole-app search anchors explicitly retain existing initialization heading IDs',()=>{
 for(const [app,anchor,heading] of [['kelp-forest','Kelp-Forest','appTitle'],['northern-elephant-seal','Northern-Elephant-Seal','app-title']]){
 const html=read(`${app}/index.html`),manifest=JSON.parse(read(`${app}/manifest.json`));
 assert(manifest.sections.some(s=>s.id===anchor));
 assert.equal(html.split(`id="${anchor}"`).length-1,1);assert(html.includes(`id="${heading}"`));
 assert(new RegExp(`<(?:header|section)[^>]*id="${anchor}"`).test(html));
 }
});
test('actual Five Senses inert helper strips javascript links and event handlers',()=>{
 const source=read('five-senses-pwa/app.js');
 const helper=source.slice(source.indexOf('  function renderMarkup('),source.indexOf('  function renderSenses('));
 const nodes=['javascript:alert(1)',' \tJaVaScRiPt:alert(1)','https://example.org/'].map(value=>({attributes:[{name:'href',value},{name:'onclick',value:'bad()'}],removeAttribute(name){this.attributes=this.attributes.filter(a=>a.name!==name);}}));
 const parsed={querySelectorAll:selector=>selector==='*'?nodes:[],body:{childNodes:nodes}};
 let output;const document={importNode:n=>n};
 vm.runInNewContext(helper+'\nrenderMarkup(target,"fixture");',{DOMParser:class{parseFromString(){return parsed;}},document,target:{replaceChildren(...n){output=n;}}});
 assert.equal(output[0].attributes.length,0);assert.equal(output[1].attributes.length,0);
 assert.deepEqual(output[2].attributes,[{name:'href',value:'https://example.org/'}]);
});
test('Open Sea title decoding uses text and warning class is limited to div',()=>{
 const html=read('open-sea/index.html');
 const assignment=html.split('\n').find(line=>line.includes('span.textContent = String(value)'));assert(assignment);
 const span={};vm.runInNewContext(assignment,{span,value:'Light &amp; Color <img onerror=x>'});
 assert.equal(span.textContent,'Light & Color <img onerror=x>');
 const predicate=html.match(/\.filter\(name => (\(allowedClasses[^;]+)\);/)?.[1];assert(predicate);
 for(const tagName of ['DIV','SPAN'])assert.equal(vm.runInNewContext(predicate,{name:'training-note',source:{tagName},allowedClasses:new Set(['adapt-box','fact-strip','fact-pill'])}),tagName==='DIV');
});
test('MMC reference search text contains exact authored reference labels and notes',()=>{
 const window={};vm.runInNewContext(read('mmc-narrations/data.js'),{window});
 const section=JSON.parse(read('mmc-narrations/manifest.json')).sections.find(s=>s.id==='referencesTitle');
 for(const r of window.MMC_NARRATIONS_DATA.references)assert(section.text.includes(`${r.label}: ${r.note}`));
 assert(read('mmc-narrations/index.html').includes('id="referencesTitle"'));
});
