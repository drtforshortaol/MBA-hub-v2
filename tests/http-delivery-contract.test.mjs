import test from 'node:test';
import assert from 'node:assert/strict';
import {deliveryErrors} from '../scripts/verify-preview-http.mjs';

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
