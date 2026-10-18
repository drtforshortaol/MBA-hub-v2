import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSectionNavigator} from '../src/core/section-navigation.js';

function fixture(hash='#habitat',skipInitial=false){
 const outer={tagName:'DETAILS',open:false,parentElement:null};
 const inner={tagName:'DETAILS',open:false,parentElement:outer};
 let scrolls=0,clicks=0,targetAvailable=true;
 const target={tagName:'H2',parentElement:inner,querySelector:()=>({click(){clicks++;}}),scrollIntoView(options){assert.deepEqual(options,{block:'start'});scrolls++;}};
 const location={hash};
 const document={getElementById:id=>targetAvailable&&id==='habitat'?target:null,querySelector:()=>null};
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
