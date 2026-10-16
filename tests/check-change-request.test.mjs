import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectChangeRequestFile} from '../scripts/check-change-request.mjs';
const apps=[{app_id:'ray',version:'1.0.0'}];
const request={schema_version:1,kind:'mba-v2-content-change-request',app_id:'ray',app_version:'1.0.0',description:'Update ray overview'};
test('accepts exported request for current app',()=>assert.equal(inspectChangeRequestFile('request.json',{apps,readFile:()=>JSON.stringify(request)}).valid,true));
test('rejects stale exported request',()=>assert.equal(inspectChangeRequestFile('request.json',{apps,readFile:()=>JSON.stringify({...request,app_version:'0.9.0'})}).valid,false));
test('rejects malformed JSON without crashing',()=>{const result=inspectChangeRequestFile('request.json',{apps,readFile:()=>'{bad'});assert.equal(result.valid,false);assert.match(result.errors[0],/invalid or unreadable/);});
test('rejects unreadable request file',()=>assert.equal(inspectChangeRequestFile('missing.json',{apps,readFile:()=>{throw Error('not found');}}).valid,false));
