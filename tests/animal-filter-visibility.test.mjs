import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Author CSS must not override the HTML hidden attribute on filtered animal rows.
test('animal letter filter hides nonmatching rows despite flex layout',()=>{
 const css=readFileSync(new URL('../src/core/hub.css',import.meta.url),'utf8');
 assert.match(css,/\.entry\[hidden\]\s*\{\s*display\s*:\s*none\s*;?\s*\}/);
});

test('animal alphabet omits empty letters and includes All',()=>{
 const hub=readFileSync(new URL('../src/core/hub.js',import.meta.url),'utf8');
 assert.match(hub,/filter\(l=>indexed\.some\(entry=>entry\.letter===l\)\)/);
 assert.match(hub,/text:'All'/);assert.doesNotMatch(hub,/disabled:''/);
 const css=readFileSync(new URL('../src/core/hub.css',import.meta.url),'utf8');
 assert.match(css,/\.letters button:disabled\s*\{/);
});
