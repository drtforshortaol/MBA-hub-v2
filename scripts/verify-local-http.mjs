import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {verifyPreviewHttp} from './verify-preview-http.mjs';

// Exercise the real generated bundles over loopback, without publishing a preview.
// This checks HTTP delivery only and does not grant physical-device or release approval.
export async function verifyLocalHttp({directory='dist',reportDirectory=null}={}){
 const reports=[];
 for(const environment of ['developer','tester']){
  const root=path.resolve(directory,environment);
  const release=JSON.parse(fs.readFileSync(path.join(root,'release.json'),'utf8'));
  const server=http.createServer((request,response)=>{
   try{
    const name=decodeURIComponent(request.url.split('?',1)[0]).slice(1);
    if(!name||name.split('/').some(part=>!part||part==='.'||part==='..'||!/^[A-Za-z0-9_.-]+$/.test(part))){response.writeHead(404).end();return;}
    const target=path.join(root,name);
    // Never expose links or directories through the local verifier's server.
    let current=root;
    for(const part of name.split('/')){
     current=path.join(current,part);
     if(fs.lstatSync(current).isSymbolicLink())throw Error('symbolic link');
    }
    if(!fs.statSync(target).isFile())throw Error('not a file');
    const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'}[path.extname(name)]||'application/octet-stream';
    response.setHeader('Content-Type',mime);
    response.end(fs.readFileSync(target));
   }catch{response.writeHead(404).end();}
  });
  try{
   await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
   const report=await verifyPreviewHttp(`http://127.0.0.1:${server.address().port}/`,environment,{expectedRelease:release.release});
   reports.push(report);
   if(reportDirectory){
    fs.mkdirSync(reportDirectory,{recursive:true});
    fs.writeFileSync(path.join(reportDirectory,`${environment}-http.json`),JSON.stringify(report,null,2)+'\n');
   }
  }finally{
   server.closeAllConnections();
   if(server.listening)await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  }
 }
 return reports;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length!==0&&(args.length!==2||args[0]!=='--report-dir'||!args[1]))throw Error('Usage: node scripts/verify-local-http.mjs [--report-dir PATH]');
 const reports=await verifyLocalHttp({reportDirectory:args[1]||null});
 for(const report of reports){
  console.log(`${report.environment}: ${report.passed?'PASS':'FAIL'} ${report.resources.verified}/${report.resources.expected} resources; release ${report.release}`);
  if(!report.passed)for(const error of report.errors)console.error(`${report.environment}: ${error}`);
 }
 if(reports.some(report=>!report.passed))process.exitCode=1;
}
