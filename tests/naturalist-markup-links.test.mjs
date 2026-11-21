import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/apps/naturalist-field-notes/app.js',import.meta.url),'utf8');
const sanitizer=app.slice(0,app.indexOf('\nlet view='));
assert.ok(sanitizer.startsWith('function renderTrustedMarkup('));
function sanitize(attributes){
 const node={attributes:Object.entries(attributes).map(([name,value])=>({name,value})),removeAttribute(name){this.attributes=this.attributes.filter(attribute=>attribute.name!==name);}};
 const body={firstChild:node};let inserted=false;
 const context={URL,location:{href:'https://example.test/v2/apps/naturalist-field-notes/index.html'},DOMParser:class{parseFromString(){return {body};}},document:{createDocumentFragment(){return {appendChild(){body.firstChild=null;},querySelectorAll(){return [node];}};}},content:{replaceChildren(){inserted=true;}}};
 vm.runInNewContext(sanitizer+';renderTrustedMarkup("fixture")',context,{timeout:3000});
 assert.equal(inserted,true);return Object.fromEntries(node.attributes.map(({name,value})=>[name,value]));
}
test('Naturalist markup preserves valid local filenames and approved link protocols',()=>{
 for(const value of ['IMG_3333.jpeg','Field-Notes.html','0-photo.jpg','f.jpg','u.html','../gray-whale/index.html','../../shared/media/icon.svg','https://example.test/reference','http://example.test/reference','tel:+18315551234','#chapter']){
  assert.equal(sanitize({href:value}).href,value,'valid URL removed: '+value);assert.equal(sanitize({src:value}).src,value,'valid source removed: '+value);
 }
});
test('Naturalist markup rejects control-prefixed URLs, active schemes and executable attributes',()=>{
 for(const value of ['\u0000https://example.test/image','\u0001/local.jpg','javascript:alert(1)','data:text/html,example','vbscript:example','file:///example',''])for(const name of ['href','src','action','formaction'])assert.equal(sanitize({[name]:value})[name],undefined,'unsafe URL retained: '+JSON.stringify(value));
 assert.deepEqual(sanitize({onclick:'alert(1)',onerror:'alert(1)',srcdoc:'<script>example</script>',alt:'Field observation',title:'Source'}),{alt:'Field observation',title:'Source'});
});
