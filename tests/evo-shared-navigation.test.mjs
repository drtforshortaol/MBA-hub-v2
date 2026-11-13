import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createSectionNavigator} from '../src/core/section-navigation.js';

const source=readFileSync(new URL('../src/apps/evolution-timeline/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../src/apps/evolution-timeline/index.html',import.meta.url),'utf8');
const manifest=JSON.parse(readFileSync(new URL('../src/apps/evolution-timeline/manifest.json',import.meta.url),'utf8'));
const dataContext={window:{}};
vm.runInNewContext(readFileSync(new URL('../src/shared/knowledge/evo-interface.js',import.meta.url),'utf8'),dataContext);
const sourceGroups=dataContext.window.EVO_APPROVED_DATA.groups;
const events=manifest.sections.filter(section=>section.id.startsWith('evo-'));
// Execute the unchanged actual mode click handler and app-owned adapter. Rendering
// is outside this bounded integration fixture; registered targets model the
// stable IDs assigned by the shared app contract to native authored disclosures.
const controlsSource=source.slice(source.indexOf("document.querySelectorAll('.mode').forEach"));
assert.ok(controlsSource.startsWith("document.querySelectorAll('.mode').forEach"));
function fixture({hash='#toolsView',skipInitial=false}={}){
 const ids=new Map(),documentHandlers=new Map(),scrolls=[],focuses=[];
 class RevealEvent{constructor(type,options={}){Object.assign(this,{type,...options});}}
 const document={defaultView:{CustomEvent:RevealEvent},getElementById:id=>ids.get(id)||null,querySelector:()=>null,
  addEventListener:(type,handler)=>documentHandlers.set(type,handler),
  querySelectorAll(selector){if(selector==='.mode')return buttons;return [];}};
 const node=(id,tagName,parentElement=null)=>{
  const handlers=new Map(),classes=new Set(),attributes=new Map();let open=false;
  const value={id,tagName,parentElement,hidden:false,tabIndex:-1,dataset:{},classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name)},
   contains(target){for(let current=target;current;current=current.parentElement)if(current===this)return true;return false;},
   addEventListener:(type,handler)=>handlers.set(type,handler),removeAttribute(name){if(name==='open')this.open=false;},
   hasAttribute:name=>attributes.has(name),setAttribute:(name,value)=>attributes.set(name,value),getAttribute:()=>null,
   querySelector:selector=>selector==='summary'&&tagName==='DETAILS'?value.summary:null,querySelectorAll:()=>[],
   focus(){for(let current=this;current;current=current.parentElement)assert.equal(current.hidden,false,'cannot focus hidden view');focuses.push(id);},
   scrollIntoView(){for(let current=this;current;current=current.parentElement)assert.equal(current.hidden,false,'cannot scroll hidden view');scrolls.push(id);},
   dispatchEvent(event){event.target=this;if(event.bubbles)documentHandlers.get(event.type)?.(event);return true;},
   click(){handlers.get('click')?.();}};
  Object.defineProperty(value,'open',{get:()=>open,set:next=>{const changed=open!==next;open=next;if(changed)handlers.get('toggle')?.();}});
  if(tagName==='DETAILS')value.summary={tabIndex:0,focus(){for(let current=value;current;current=current.parentElement)assert.equal(current.hidden,false);focuses.push(id+':summary');}};
  if(id)ids.set(id,value);return value;
 };
 const panels=Object.fromEntries(['story','time','tools'].map(name=>{assert.ok(html.includes('id="'+name+'View"'));const panel=node(name+'View','SECTION');panel.hidden=name!=='story';return [name,panel];}));
 const buttons=[...html.matchAll(/<button class="mode( active)?" data-view="([^"]+)"/g)].map(([,active,view])=>{const button=node('','BUTTON');button.dataset.view=view;if(active)button.classList.add('active');return button;});
 const lineages=Object.fromEntries(Object.keys(sourceGroups).map(key=>[key,node('','DETAILS',panels.story)]));
 panels.story.querySelectorAll=selector=>selector==='.story-accordion'?Object.values(lineages):[];
 for(const section of events){
  const group=Object.keys(sourceGroups).find(key=>sourceGroups[key].events.some(event=>event.title===section.title));
  node(section.id,'DETAILS',group?lineages[group]:panels.story);
 }
 const outside=node('How-to-read-the-app','H2');
 const tools=['quick','clock','energy','kelp'].map(name=>node('fixture-'+name,'DETAILS',panels.tools));
 panels.tools.querySelectorAll=selector=>selector==='.closing-accordion'?tools:[];
 const context={document,storyView:panels.story,timeView:panels.time,toolsView:panels.tools};
 const closing=source.slice(source.indexOf('function configureClosingAccordions()'),source.indexOf('configureClosingAccordions();')+'configureClosingAccordions();'.length);
 const story=source.slice(source.indexOf('function configureStoryAccordions()'),source.indexOf('configureStoryAccordions();')+'configureStoryAccordions();'.length);
 vm.runInNewContext(story,context);vm.runInNewContext(closing,context);vm.runInNewContext(controlsSource,context);
 const location={hash};const navigate=createSectionNavigator({document,location,escape:value=>value,skipInitial});
 return {document,documentHandlers,ids,panels,buttons,lineages,tools,outside,location,navigate,scrolls,focuses,node};
}
function active(f){return f.buttons.filter(button=>button.classList.contains('active')).map(button=>button.dataset.view);}
for(const view of ['story','time','tools'])test('shared deep link reveals actual Timeline '+view+' view via inherited mode controls',()=>{
 const f=fixture({hash:'#'+view+'View'});f.buttons.find(button=>button.dataset.view===(view==='story'?'tools':'story')).click();
 assert.equal(f.navigate(),true);assert.deepEqual(active(f),[view]);assert.equal(f.panels[view].hidden,false);
 assert.deepEqual(f.scrolls,[view+'View']);assert.deepEqual(f.focuses,[view+'View']);assert.equal(f.navigate(),false);
});
test('all 35 registered event destinations reveal Story from Time/Tools and open native ancestors',()=>{
 assert.equal(events.length,35);
 for(const section of events)for(const start of ['time','tools']){
  const f=fixture({hash:'#'+section.id});f.buttons.find(button=>button.dataset.view===start).click();
  assert.equal(f.navigate(),true);assert.deepEqual(active(f),['story']);assert.equal(f.ids.get(section.id).open,true);
  const parent=f.ids.get(section.id).parentElement;
  if(parent.tagName==='DETAILS')assert.equal(parent.open,true);
  for(const panel of Object.values(f.lineages))if(panel!==parent)assert.equal(panel.open,false,'unrelated lineages remain collapsed');
  assert.deepEqual(f.scrolls,[section.id]);assert.deepEqual(f.focuses,[section.id+':summary']);
 }
});
test('Story event navigation preserves independently open unrelated lineage disclosures',()=>{
 const section=events.find(section=>sourceGroups.brown.events.some(event=>event.title===section.title));
 const f=fixture({hash:'#'+section.id});f.lineages.animals.open=true;f.buttons[2].click();
 assert.equal(f.navigate(),true);assert.equal(f.lineages.brown.open,true);assert.equal(f.lineages.animals.open,true);assert.equal(f.lineages.plastid.open,false);
});
test('nested registered tool targets retain the original mutually exclusive native tool behavior',()=>{
 const f=fixture({hash:'#fixture-clock'});f.tools[0].open=true;
 assert.equal(f.navigate(),true);assert.deepEqual(active(f),['tools']);assert.deepEqual(f.tools.map(tool=>tool.open),[false,true,false,false]);
 // Ordinary source controls remain available after navigation.
 f.tools[2].open=true;assert.deepEqual(f.tools.map(tool=>tool.open),[false,false,true,false]);
 f.buttons[1].click();assert.deepEqual(active(f),['time']);
});
test('Back and unrelated mutations do not reset the selected Timeline mode; explicit revisit does',()=>{
 const f=fixture({hash:'#toolsView',skipInitial:true});f.buttons[1].click();
 assert.equal(f.navigate(),false);assert.deepEqual(active(f),['time']);assert.deepEqual(f.scrolls,[]);
 assert.equal(f.navigate({revisit:true}),true);assert.deepEqual(active(f),['tools']);
 f.buttons[1].click();assert.equal(f.navigate(),false);assert.deepEqual(active(f),['time']);
 assert.equal(f.navigate({revisit:true}),true);assert.deepEqual(active(f),['tools']);
});
test('adapter ignores forged, mismatched, external and non-view reveal targets',()=>{
 const f=fixture();const listener=f.documentHandlers.get('mba:reveal-section');assert.equal(typeof listener,'function');
 const target=f.ids.get(events[0].id);
 for(const event of [{target,detail:null},{target,detail:{id:42}},{target,detail:{id:'toolsView'}},{target:{id:'toolsView'},detail:{id:'toolsView'}},{target:f.outside,detail:{id:'How-to-read-the-app'}}]){
  listener(event);assert.deepEqual(active(f),['story']);assert.deepEqual(f.scrolls,[]);
 }
});
