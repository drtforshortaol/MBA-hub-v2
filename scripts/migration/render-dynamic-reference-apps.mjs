// Literal DOM model: execute the complete pinned/current authored renderers.
// Parsing is independently canonicalized with lxml by the Python caller.
import fs from 'node:fs';import vm from 'node:vm';import cp from 'node:child_process';
const [root,repo]=process.argv.slice(2),commit='5c219508d23255080f6b050cefa8092905447d81';
const folders={'five-senses-pwa':'five-senses-pwa','kelp-forest':'kelp-forest','northern-elephant-seal':'northern-elephant-seal-pwa-v1.2-final-hub (2)'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
class N{
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.dataset={};this.style={};this._text='';this._html='';this.classList={add(){},remove(){},toggle(){}};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}append(...ns){ns.forEach(n=>this.appendChild(n));}replaceChildren(...ns){this.children=[];this._text='';this._html='';this.append(...ns);}get firstElementChild(){return this.children[0];}
 set textContent(s){this.children=[];this._html='';this._text=String(s);}get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}set innerHTML(s){this._html=s;this.children=[];}get innerHTML(){return this._html;}
 setAttribute(k,v){this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k];}addEventListener(){}querySelectorAll(){return [];}
 toHTML(){if(this.tag==='raw')return this._html;if(!this.tag)return esc(this._text);let a={...this.attributes};for(const k of ['id','className','type','href','src','alt','loading','target','rel'])if(this[k]!==undefined)a[k==='className'?'class':k]=this[k];for(const[k,v]of Object.entries(this.dataset))a['data-'+k]=v;if(this.open)a.open='';return '<'+this.tag+Object.entries(a).map(([k,v])=>' '+k+'="'+esc(v)+'"').join('')+'>'+this._html+esc(this._text)+this.children.map(n=>n.toHTML()).join('')+'</'+this.tag+'>';}
}
// DOMParser is a transport for literal markup, not a simulated browser sanitizer.
// The fixed reviewed hashes bind all markup generation and sanitizer code.
class DOMParser {parseFromString(s){const raw=new N('raw');raw._html=s;return {body:{childNodes:[raw]},querySelectorAll(){return [];}};}}
const output={};
for(const app of Object.keys(folders))for(const pinned of [true,false]){
 const read=n=>pinned?cp.execFileSync('git',['-C',repo,'show',commit+':apps/'+folders[app]+'/'+n],{encoding:'utf8'}):fs.readFileSync(root+'/src/apps/'+app+'/'+n,'utf8');
 const nodes={},callbacks=[];const get=id=>nodes[id]??=new N('div');
 const document={baseURI:'https://review.example/apps/'+app+'/index.html',body:new N('body'),addEventListener:(event,fn)=>{if(event==='DOMContentLoaded')callbacks.push(fn);},getElementById:get,querySelector:q=>get(q.replace(/^#/,'')),querySelectorAll:()=>[],createElement:t=>new N(t),createTextNode:t=>Object.assign(new N(''),{_text:t}),importNode:n=>n};
 const context=vm.createContext({window:{addEventListener(){},setTimeout(){}},document,location:{href:document.baseURI,pathname:'/apps/'+app+'/index.html'},URL,DOMParser,navigator:{},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},setTimeout(){},console});
 vm.runInContext(read('data.js'),context);
 let script=read('app.js');
 if(app==='kelp-forest')script=script.replace(/\binit\(\);\s*$/,'');
 vm.runInContext(script,context);
 if(app==='five-senses-pwa')callbacks.forEach(fn=>fn());
 if(app==='kelp-forest')vm.runInContext('setupTroubleshooting=()=>{};setupClearCache=()=>{};registerServiceWorker=()=>{};init();',context);
 if(app==='northern-elephant-seal')vm.runInContext('buildApp();',context);
 const ids=app==='five-senses-pwa'?['senseList','guideList','referenceList']:app==='kelp-forest'?['appTitle','appSummary','appMeta','versionLine','heroImage','notificationArea','faqList','sections','sectionJump']:['app-title','scientific-name','summary','footerVersion','snapshot-strip','accordion'];
 output[app+':'+(pinned?'pinned':'current')]={containers:Object.fromEntries(ids.map(id=>[id,get(id).toHTML()])),dataset:context.window[app==='five-senses-pwa'?'USING_FIVE_SENSES_DATA':'APP_DATA']};
}
console.log(JSON.stringify(output));
