import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('src/sw.js','utf8');
const helper=source.slice(source.indexOf('async function cachedResponse('),source.indexOf('async function prepare('));
const cachedResponse=vm.runInNewContext(helper+';cachedResponse',{Response});
test('verified cached redirects become navigation-safe responses without changing body',async t=>{
 const server=http.createServer((req,res)=>{if(req.url==='/redirect'){res.writeHead(302,{Location:'/page'});res.end();}else{res.writeHead(200,{'Content-Type':'text/html','X-Review':'kept'});res.end('verified page');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
 const url=`http://127.0.0.1:${server.address().port}/redirect`;
 for(const range of [undefined,'bytes=0-7','bytes=999-']){
  const redirected=await fetch(url);assert.equal(redirected.redirected,true);
  const result=await cachedResponse(redirected,{headers:new Headers(range?{Range:range}:{})});
  assert.equal(result.redirected,false);
  assert.equal(result.status,range==='bytes=999-'?416:range?206:200);
  assert.equal(await result.text(),range==='bytes=999-'?'':range?'verified':'verified page');
  if(!range){assert.equal(result.headers.get('content-type'),'text/html');assert.equal(result.headers.get('x-review'),'kept');assert.equal(result.headers.get('content-length'),'13');}
 }
});
test('ordinary verified responses retain their existing behavior',async()=>{
 const response=new Response('plain',{headers:{'Content-Type':'text/plain'}});
 const result=await cachedResponse(response,{headers:new Headers()});
 assert.equal(result,response);assert.equal(await result.text(),'plain');
});
