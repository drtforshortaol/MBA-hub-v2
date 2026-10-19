import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createSectionNavigator,revisitSectionLink} from '../src/core/section-navigation.js';

function fixture(hash='#habitat',skipInitial=false){
 const outer={tagName:'DETAILS',open:false,parentElement:null};
 const inner={tagName:'DETAILS',open:false,parentElement:outer};
 let scrolls=0,clicks=0,targetAvailable=true;
 const target={tagName:'H2',parentElement:inner,querySelector:()=>({click(){clicks++;}}),scrollIntoView(options){assert.deepEqual(options,{block:'start'});scrolls++;}};
 const location={hash};
 const document={getElementById:id=>targetAvailable&&id==='habitat'?target:null,querySelector:()=>null,querySelectorAll:()=>[]};
 const navigate=createSectionNavigator({document,location,escape:value=>value,skipInitial});
 return {navigate,location,document,outer,inner,target,setAvailable:value=>{targetAvailable=value;},scrolls:()=>scrolls,clicks:()=>clicks};
}

test('deep links open every enclosing details panel and scroll once',()=>{
 const f=fixture();
 assert.equal(f.navigate(),true);
 assert.equal(f.inner.open,true);assert.equal(f.outer.open,true);
 assert.equal(f.scrolls(),1);assert.equal(f.clicks(),1);
});
test('subsequent body mutations do not reset scroll or reopen a user-collapsed panel',()=>{
 const f=fixture();f.navigate();f.inner.open=false;f.outer.open=false;
 for(let count=0;count<5;count++)assert.equal(f.navigate(),false);
 assert.equal(f.scrolls(),1);assert.equal(f.clicks(),1);
 assert.equal(f.inner.open,false);assert.equal(f.outer.open,false);
});
test('dynamically rendered section retries until available then stops',()=>{
 const f=fixture();f.setAvailable(false);
 assert.equal(f.navigate(),false);assert.equal(f.navigate(),false);assert.equal(f.scrolls(),0);
 f.setAvailable(true);assert.equal(f.navigate(),true);assert.equal(f.navigate(),false);assert.equal(f.scrolls(),1);
});
test('new fragment navigation works after a previously resolved fragment',()=>{
 const f=fixture();f.navigate();f.location.hash='#missing';assert.equal(f.navigate(),false);
 f.location.hash='#habitat';assert.equal(f.navigate(),true);assert.equal(f.scrolls(),2);
});
test('Back restoration preserves captured position instead of replaying initial fragment',()=>{
 const f=fixture('#habitat',true);assert.equal(f.navigate(),false);assert.equal(f.scrolls(),0);
 assert.equal(f.inner.open,false);
 f.location.hash='';f.navigate();f.location.hash='#habitat';assert.equal(f.navigate(),true);assert.equal(f.scrolls(),1);
});
test('malformed encoded fragment is harmless and later valid navigation still works',()=>{
 const f=fixture('#%E0%A4%A');assert.doesNotThrow(()=>f.navigate());assert.equal(f.scrolls(),0);
 f.location.hash='#habitat';assert.equal(f.navigate(),true);
});
test('encoded section identifiers decode and sense-data targets remain supported',()=>{
 const f=fixture('#sense%20of%20touch');let selector;
 f.document.querySelector=value=>{selector=value;return f.target;};
 assert.equal(f.navigate(),true);assert.equal(selector,'[data-sense-id="sense of touch"]');
});
test('reentrant mutations during panel expansion cannot navigate twice',()=>{
 const f=fixture();f.target.querySelector=()=>({click(){assert.equal(f.navigate(),false);}});
 assert.equal(f.navigate(),true);assert.equal(f.scrolls(),1);
});
test('shared application contract applies one-shot section navigation to dynamic content',()=>{
 const source=fs.readFileSync('src/core/app-contract.js','utf8');
 assert.match(source,/createSectionNavigator\(\{document,location,escape:value=>CSS\.escape\(value\),skipInitial:Boolean\(restore\?\.appView\)\}\)/);
 assert.match(source,/new MutationObserver\(\(\)=>\{assignSectionIDs\(\);section\(\);\}\)/);
 assert.match(source,/window\.addEventListener\('hashchange',section\)/);
});


function sectionClick(href,{target='',download=false,...modifiers}={}){
 let prevented=false;
 const link={href,target,hasAttribute:name=>name==='download'&&download};
 return {button:0,defaultPrevented:false,target:{closest:()=>link},preventDefault(){prevented=true;},prevented:()=>prevented,...modifiers};
}
test('reselecting current section link reopens a deliberately collapsed section exactly once',()=>{
 const f=fixture();f.location.href='https://example.test/v2/apps/guide/index.html?visit=one#habitat';
 f.navigate();f.inner.open=false;f.outer.open=false;
 const event=sectionClick('#habitat');
 assert.equal(revisitSectionLink(event,f.location,f.navigate),true);
 assert.equal(event.prevented(),true);
 assert.equal(f.inner.open,true);assert.equal(f.outer.open,true);
 assert.equal(f.scrolls(),2);
 assert.equal(f.navigate(),false,'later DOM mutation must not replay explicit navigation');
});
test('Back restored views remain untouched until user explicitly reselects the section',()=>{
 const f=fixture('#habitat',true);f.location.href='https://example.test/v2/apps/guide/index.html#habitat';
 assert.equal(f.navigate(),false);assert.equal(f.scrolls(),0);
 assert.equal(revisitSectionLink(sectionClick('#habitat'),f.location,f.navigate),true);
 assert.equal(f.scrolls(),1);assert.equal(f.inner.open,true);
});
test('section revisit preserves modified clicks, other pages, queries and new fragments',()=>{
 const f=fixture();f.location.href='https://example.test/v2/apps/guide/index.html?visit=one#habitat';
 f.navigate();
 for(const event of [sectionClick('#habitat',{ctrlKey:true}),sectionClick('#habitat',{metaKey:true}),
  sectionClick('#habitat',{shiftKey:true}),sectionClick('#habitat',{altKey:true}),sectionClick('#habitat',{button:1}),
  sectionClick('#habitat',{target:'_blank'}),sectionClick('#habitat',{download:true}),sectionClick('#habitat',{defaultPrevented:true}),
  sectionClick('#other'),sectionClick('index.html#habitat'),sectionClick('../other/index.html?visit=one#habitat'),
  sectionClick('https://elsewhere.test/v2/apps/guide/index.html?visit=one#habitat')]){
  assert.equal(revisitSectionLink(event,f.location,f.navigate),false);
  assert.equal(event.prevented(),false);
 }
 assert.equal(f.scrolls(),1);
});
test('unavailable section target leaves native link navigation available for dynamic rendering',()=>{
 const f=fixture();f.location.href='https://example.test/v2/apps/guide/index.html#habitat';f.setAvailable(false);
 const event=sectionClick('#habitat');
 assert.equal(revisitSectionLink(event,f.location,f.navigate),false);assert.equal(event.prevented(),false);
 f.setAvailable(true);assert.equal(f.navigate(),true);
});


test('section inside nested custom panels opens only explicit ARIA controllers before scrolling',()=>{
 const events=[];
 const outer={id:'outer-panel',parentElement:null},inner={id:'inner-panel',parentElement:outer};
 const target={id:'habitat',parentElement:inner,querySelector:()=>null,scrollIntoView(){events.push('scroll');}};
 const control=(id,panels,expanded='false')=>({expanded,getAttribute(name){return name==='aria-controls'?panels:this.expanded;},click(){events.push(id);this.expanded='true';}});
 const innerControl=control('inner','other-panel inner-panel'),outerControl=control('outer','outer-panel');
 const unrelated=control('unrelated','unrelated-panel'),alreadyOpen=control('already-open','habitat','true');
 const controls=[innerControl,unrelated,alreadyOpen,outerControl];
 const document={getElementById:()=>target,querySelectorAll:()=>controls};
 const navigate=createSectionNavigator({document,location:{hash:'#habitat'},escape:value=>value});
 assert.equal(navigate(),true);
 assert.deepEqual(events,['outer','inner','scroll']);
 assert.equal(unrelated.expanded,'false');
 assert.equal(navigate(),false,'later mutations must not reopen panels or move the reader');
 assert.deepEqual(events,['outer','inner','scroll']);
});

test('a disclosure trigger used as the deep-link target opens through its own handler',()=>{
 const f=fixture();let expanded='false';
 f.target.getAttribute=name=>name==='aria-expanded'?expanded:null;
 f.target.click=()=>{expanded='true';};
 assert.equal(f.navigate(),true);assert.equal(expanded,'true');
 assert.equal(f.clicks(),0,'do not click an unrelated descendant after opening the target');
 assert.equal(f.scrolls(),1);
});


test('Interpretation Principles hidden panels reveal through the existing application toggle handler',()=>{
 const source=fs.readFileSync('src/apps/interpretation-principles/app.js','utf8');
 const handler=source.slice(source.indexOf('function togglePanel(btn)'),source.indexOf('function setTag(tag)'));
 const panel={id:'panel-principle-1',hidden:true,parentElement:null};let open=false,scrolls=0;
 const card={classList:{toggle(name,value){assert.equal(name,'open');open=value;}}};
 const control={expanded:'false',getAttribute(name){return name==='aria-controls'?panel.id:this.expanded;},setAttribute(name,value){assert.equal(name,'aria-expanded');this.expanded=value;},closest:()=>card};
 const target={id:'example-heading',parentElement:panel,querySelector:()=>null,scrollIntoView(){assert.equal(panel.hidden,false);assert.equal(open,true);scrolls++;}};
 const document={getElementById:id=>id===panel.id?panel:target,querySelectorAll:()=>[control]};
 const toggle=runInNewContext(handler+';togglePanel;',{document});control.click=()=>toggle(control);
 const navigate=createSectionNavigator({document,location:{hash:'#example-heading'},escape:value=>value});
 assert.equal(navigate(),true);assert.equal(control.expanded,'true');assert.equal(scrolls,1);
});
