import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),acorn=require('acorn');
const noopFunctions=new Set(['registerServiceWorker','setupClearCache','clearAppCache','setupInstall','setupTroubleshooting','restoreUpdateMessage']);
function chain(node){if(!node)return '';if(node.type==='Identifier')return node.name;if(node.type==='MemberExpression')return chain(node.object)+'.'+(node.computed?node.property.value:node.property.name);return '';}
export function sanitize(source){
 const ast=acorn.parse(source,{ecmaVersion:'latest',sourceType:'script',allowReturnOutsideFunction:true}),edits=[],changes=[];
 function replace(node,text,kind){edits.push({start:node.start,end:node.end,text});changes.push(kind);}
 function walk(node){if(!node||typeof node!=='object')return;
  if(node.type==='FunctionDeclaration'&&noopFunctions.has(node.id?.name)){replace(node.body,'{}','legacy-maintenance-function');return;}
  if(node.type==='BinaryExpression'&&node.operator==='in'&&['serviceWorker','caches'].includes(node.left.value)&&['navigator','window'].includes(chain(node.right))){replace(node,'false','legacy-offline-check');return;}
  if(node.type==='CallExpression'){
   const callee=chain(node.callee).replace(/^window\./,'');
   if(callee==='navigator.serviceWorker.register'){replace(node,'Promise.resolve({update:async()=>{},installing:null,waiting:null,active:null})','legacy-worker');return;}
   if(callee==='navigator.serviceWorker.getRegistrations'||callee==='caches.keys'){replace(node,'Promise.resolve([])','legacy-cache-enumeration');return;}
   if(callee==='caches.delete'||node.callee.type==='MemberExpression'&&node.callee.property.name==='unregister'){replace(node,'Promise.resolve(false)','legacy-cache-removal');return;}
   if(callee==='caches.open'){replace(node,'Promise.resolve({match:async()=>undefined,put:async()=>{}})','legacy-cache-open');return;}
   if(/^(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)$/.test(callee)&&node.arguments[0]){
    const arg=node.arguments[0],text=source.slice(arg.start,arg.end);replace(arg,"('mba-v2:'+location.pathname.split('/apps/')[0]+':'+("+text+"))",'isolated-local-state');
   }
   if(/^(?:localStorage|sessionStorage)\.clear$/.test(callee)){replace(node,'undefined','legacy-storage-clear');return;}
  }
  if(node.type==='Literal'&&node.value==='mba-shared-assets-v1'){replace(node,"'mba-v2-unused-legacy-cache'",'legacy-cache-name');return;}
  for(const [key,value]of Object.entries(node)){if(['start','end','loc'].includes(key))continue;if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}
 }
 walk(ast);edits.sort((a,b)=>b.start-a.start);let edge=Infinity;
 for(const edit of edits){if(edit.end>edge)throw Error('Overlapping migration transforms');source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);edge=edit.start;}
 acorn.parse(source,{ecmaVersion:'latest',sourceType:'script',allowReturnOutsideFunction:true});
 return {source,changes};
}
if(process.argv[2]){
 const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),output=input.map(item=>{try{return {path:item.path,...sanitize(item.source)};}catch(error){throw Error(item.path+': '+error.message);}});
 fs.writeFileSync(process.argv[3],JSON.stringify(output));
}
