import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Author CSS must not override the HTML hidden attribute on filtered animal rows.
test('animal letter filter hides nonmatching rows despite flex layout',()=>{
 const css=readFileSync(new URL('../src/core/hub.css',import.meta.url),'utf8');
 assert.match(css,/\.entry\[hidden\]\s*\{\s*display\s*:\s*none\s*;?\s*\}/);
});

test('animal alphabet disables letters without registered apps',()=>{
 const hub=readFileSync(new URL('../src/core/hub.js',import.meta.url),'utf8');
 assert.match(hub,/indexed\.some\(entry=>entry\.letter===l\)/);
 assert.match(hub,/\{disabled:''\}/);
 const css=readFileSync(new URL('../src/core/hub.css',import.meta.url),'utf8');
 assert.match(css,/\.letters button:disabled\s*\{/);
});
