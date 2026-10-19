import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {verifyPreviewHttp,deliveryErrors} from '../scripts/verify-preview-http.mjs';
const snapshot=fs.mkdtempSync(path.join(os.tmpdir(),'mba-http-fixture-')),bundle=path.join(snapshot,'tester');
fs.cpSync('dist/tester',bundle,{recursive:true});
after(()=>fs.rmSync(snapshot,{recursive:true,force:true}));
async function server(t,override=()=>false){
 const requests=[];
 const app=http.createServer((request,response)=>{
  requests.push(request.url);if(override(request,response))return;
  const file=path.join(bundle,decodeURIComponent(request.url.slice('/review/'.length)));
  if(!request.url.startsWith('/review/')||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
  const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html'}[path.extname(file)];
  if(mime)response.setHeader('Content-Type',mime+'; charset=utf-8');
  response.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 t.after(()=>{app.closeAllConnections();app.close();});
 return {url:`http://127.0.0.1:${app.address().port}/review/`,requests};
}
test('HTTP acceptance verifies every served resource and per-app coverage',async t=>{
 const {url,requests}=await server(t),report=await verifyPreviewHttp(url,'tester');
 const release=JSON.parse(fs.readFileSync(path.join(bundle,'release.json')));
 assert.equal(report.passed,true,JSON.stringify(report.errors));assert.equal(report.release,release.release);
 assert.equal(report.resources.verified,release.resources.length);assert.equal(report.resources.bytes,release.resources.reduce((sum,item)=>sum+item.bytes,0));
 assert.equal(report.apps.length,JSON.parse(fs.readFileSync(path.join(bundle,'registry.json'))).apps.length);assert(report.apps.every(app=>app.passed&&app.physicalTesting==='not assessed'));assert(report.apps.some(app=>app.offlineMedia>0));
 assert.equal(requests.length,release.resources.length+2);
});
test('HTTP acceptance rejects redirects and authentication fallback pages',async t=>{
 const {url}=await server(t,(request,response)=>{
  if(request.url.endsWith('/index.html')){response.writeHead(302,{location:'/login'}).end();return true;}
  if(request.url.endsWith('/icon.svg')){response.end('<html>Login</html>');return true;}return false;
 });
 const report=await verifyPreviewHttp(url,'tester');assert.equal(report.passed,false);assert(report.errors.includes('index.html: HTTP 302'));assert(report.errors.some(error=>error.startsWith('icon.svg:')));
});
test('HTTP acceptance bounds stalled requests and reports missing app entry',async t=>{
 const registry=JSON.parse(fs.readFileSync(path.join(bundle,'registry.json'))),target=registry.apps[0].entry_point;
 const {url}=await server(t,(request)=>request.url.endsWith('/'+target));
 const report=await verifyPreviewHttp(url,'tester',{timeoutMs:1000,totalTimeoutMs:30000});
 assert.equal(report.passed,false);assert(report.errors.some(error=>error.startsWith(target+':')));
 const app=report.apps.find(app=>app.app_id===registry.apps[0].app_id);assert.equal(app.passed,false);assert(app.missingResources.includes(target));
});
test('HTTP acceptance rejects unsafe release paths before resource requests',async t=>{
 const {url,requests}=await server(t,(request,response)=>{response.end(JSON.stringify({schema_version:1,environment:'tester',release:'a'.repeat(16),resources:[{url:'../secret',bytes:0,sha256:'a'.repeat(64)}]}));return true;});
 const report=await verifyPreviewHttp(url,'tester');assert.equal(report.passed,false);assert.deepEqual(requests,['/review/release.json']);assert(report.errors.includes('release.json: unsafe or invalid resource declaration'));
});
test('HTTP acceptance enforces overall deadline on initial metadata',async t=>{
 const {url}=await server(t,()=>true),start=Date.now();
 const report=await verifyPreviewHttp(url,'tester',{timeoutMs:5000,totalTimeoutMs:50});assert.equal(report.passed,false);assert(report.errors[0].startsWith('release.json:'));assert(Date.now()-start<2000);
});
test('delivery headers accept MIME essence aliases and ignore data-only formats',()=>{
 for(const mime of ['text/javascript','application/javascript','APPLICATION/JAVASCRIPT; charset=UTF-8','text/x-javascript'])assert.deepEqual(deliveryErrors('core/hub.js',new Headers({'content-type':mime})),[]);
 for(const [name,mime] of [['index.html','text/html; charset=utf-8'],['core/hub.css','text/css'],['shared/data.json','text/plain'],['shared/media/image.svg','application/octet-stream']])assert.deepEqual(deliveryErrors(name,new Headers({'content-type':mime})),[]);
 for(const name of ['index.html','core/hub.css','core/hub.js','module.mjs']){
  assert(deliveryErrors(name,new Headers()).some(error=>error.includes('Content-Type')));
  assert(deliveryErrors(name,new Headers({'content-type':'text/plain'})).some(error=>error.includes('Content-Type')));
 }
 assert(deliveryErrors('index.html',new Headers({'content-type':'text/html','content-disposition':'Attachment; filename=index.html'})).some(error=>error.includes('attachment')));
});
test('HTTP acceptance rejects byte-perfect incorrect MIME and attachment headers',async t=>{
 const {url}=await server(t,(request,response)=>{
  const name=request.url.slice('/review/'.length);
  if(!['index.html','core/hub.js','core/hub.css','sw.js'].includes(name))return false;
  response.setHeader('Content-Type',name==='index.html'?'text/html':'text/plain');
  if(name==='index.html')response.setHeader('Content-Disposition','attachment; filename=index.html');
  response.end(fs.readFileSync(path.join(bundle,name)));return true;
 });
 const report=await verifyPreviewHttp(url,'tester');assert.equal(report.passed,false);
 for(const name of ['core/hub.js','core/hub.css','sw.js'])assert(report.errors.some(error=>error.startsWith(name+': incompatible Content-Type')));
 assert(report.errors.some(error=>error.startsWith('index.html: Content-Disposition attachment')));
 assert(!report.errors.some(error=>error.includes('integrity mismatch')));
});
test('HTTP acceptance can pin expected release and refuse stale complete bundle early',async t=>{
 const {url,requests}=await server(t),release=JSON.parse(fs.readFileSync(path.join(bundle,'release.json'))).release;
 const stale=release==='0'.repeat(16)?'1'.repeat(16):'0'.repeat(16);
 const failed=await verifyPreviewHttp(url,'tester',{expectedRelease:stale});assert.equal(failed.passed,false);assert.equal(failed.release,release);assert.equal(failed.expectedRelease,stale);assert.deepEqual(requests,['/review/release.json']);
 const passed=await verifyPreviewHttp(url,'tester',{expectedRelease:release});assert.equal(passed.passed,true,JSON.stringify(passed.errors));assert.equal(passed.expectedRelease,release);
 await assert.rejects(verifyPreviewHttp(url,'tester',{expectedRelease:'untrusted'}),/Expected release/);
});

test('HTTP header validation rejects attached JavaScript while permitting inline resources',()=>{
 assert(deliveryErrors('core/hub.js',new Headers({'content-type':'text/javascript','content-disposition':'attachment; filename=hub.js'})).some(error=>error.includes('attachment')));
 assert.deepEqual(deliveryErrors('core/hub.js',new Headers({'content-type':'text/javascript','content-disposition':'inline'})),[]);
});
