import test from 'node:test';
import assert from 'node:assert/strict';
import {deliveryErrors,workerScopeErrors} from '../scripts/verify-preview-http.mjs';

test('HTTP acceptance accepts interoperable JavaScript and stylesheet MIME types', () => {
 for (const name of ['assets/main.js', 'assets/runtime.mjs']) {
  for (const mime of ['text/javascript; charset=utf-8', 'application/javascript', 'application/ecmascript']) {
   assert.deepEqual(deliveryErrors(name, new Headers({'content-type': mime})), [], name + ': ' + mime);
  }
 }
 assert.deepEqual(deliveryErrors('assets/main.css', new Headers({'content-type': 'text/css; charset=utf-8'})), []);
 assert.deepEqual(deliveryErrors('index.html', new Headers({'content-type': 'text/html; charset=utf-8'})), []);
});

test('HTTP acceptance rejects navigation-breaking content types and HTML downloads', () => {
 const examples = [
  ['index.html', {'content-type':'application/octet-stream'}, 'incompatible Content-Type'],
  ['assets/main.mjs', {'content-type':'text/html'}, 'incompatible Content-Type'],
  ['assets/main.js', {}, 'incompatible Content-Type'],
  ['assets/main.css', {'content-type':'text/plain'}, 'incompatible Content-Type'],
  ['index.html', {'content-type':'text/html', 'content-disposition':'attachment; filename="index.html"'}, 'Content-Disposition attachment'],
 ];
 for (const [name, headers, match] of examples)
  assert.ok(deliveryErrors(name, new Headers(headers)).some(error => error.includes(match)), name);
});

test('HTTP acceptance does not apply navigation MIME gates to data and images', () => {
 for (const name of ['registry.json', 'shared/media/animal.webp', 'content/data.txt'])
  assert.deepEqual(deliveryErrors(name, new Headers({'content-type':'application/octet-stream'})), []);
});

test('HTTP acceptance treats inline HTML as navigable and attachment case-insensitively', () => {
 assert.deepEqual(deliveryErrors('index.html', new Headers({'content-type':'text/html','content-disposition':'inline'})), []);
 assert.ok(deliveryErrors('index.html', new Headers({'content-type':'text/html','content-disposition':'ATTACHMENT; filename="index.html"'})).some(e=>e.includes('attachment')));
});

test('HTTP acceptance rejects attachment delivery for script and stylesheet resources',()=>{
 for(const [name,mime] of [['assets/main.js','text/javascript'],['assets/main.mjs','text/javascript'],['assets/main.css','text/css']]){
  const errors=deliveryErrors(name,new Headers({'content-type':mime,'content-disposition':'attachment; filename="download"'}));
  assert.ok(errors.some(error=>error.includes('Content-Disposition attachment')),name);
 }
});


test('worker scope acceptance permits default, equal and broader directory scopes',()=>{
 for(const value of [null,'./','/','/review/','https://preview.example/review/']){
  const headers=new Headers(value===null?{}:{'service-worker-allowed':value});
  assert.deepEqual(workerScopeErrors(headers,'https://preview.example/review/sw.js','https://preview.example/review/'),[],String(value));
 }
});

test('worker scope acceptance rejects restrictive, external and escaped separator scopes',()=>{
 for(const value of ['/review/private/','/other/','https://other.example/','/review%2f','/review%5c','http://[']){
  assert.equal(workerScopeErrors(new Headers({'service-worker-allowed':value}),'https://preview.example/review/sw.js','https://preview.example/review/').length,1,value);
 }
});
