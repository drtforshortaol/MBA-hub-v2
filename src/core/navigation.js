// Navigation interface 1.0.0: contextual Back and explicit main-Hub return.
export function mainHubURL(root){const url=new URL('index.html',root);url.searchParams.set('home','1');return url;}
export function restoredHubState(saved,url){return new URL(url).searchParams.get('home')==='1'?{...saved,open:[],scroll:0}:saved;}
function key(namespace,id){return `${namespace}:return:${id}`;}
export function captureVisit(destination,root,origin,state,storage,namespace,id){
 const target=new URL(destination,origin),scope=new URL(root),source=new URL(origin,scope);
 if(target.origin!==scope.origin||!target.pathname.startsWith(scope.pathname+'apps/')||/[\\%]/.test(target.pathname)||!(/^[a-zA-Z0-9-]{1,100}$/.test(id))||source.origin!==scope.origin||![scope.pathname,new URL('index.html',scope).pathname].includes(source.pathname))return target;
 try{storage.setItem(key(namespace,id),JSON.stringify({url:origin,state:structuredClone(state)}));target.searchParams.set('visit',id);}catch{}
 return target;
}
function scopedAppURL(url,scope){
 return url.origin===scope.origin&&url.pathname.startsWith(scope.pathname+'apps/')&&!/[\\%]/.test(url.pathname)&&url.pathname.slice((scope.pathname+'apps/').length).split('/').every(part=>part&&part!=='.'&&part!=='..');
}
// App-to-app visits use an explicit context type; Hub captures remain Hub-only.
export function captureAppVisit(destination,root,origin,state,storage,namespace,id){
 const scope=new URL(root),source=new URL(origin,scope),target=new URL(destination,source);
 if(!scopedAppURL(source,scope)||!scopedAppURL(target,scope)||source.pathname===target.pathname||!/^[a-zA-Z0-9-]{1,100}$/.test(id)||state?.appView!==true)return target;
 try{storage.setItem(key(namespace,id),JSON.stringify({type:'app',url:source.href,state:structuredClone(state)}));target.searchParams.set('visit',id);}catch{}
 return target;
}
export function visitContext(root,id,storage,namespace){
 if(!id||!/^[a-zA-Z0-9-]{1,100}$/.test(id))return null;
 try{const context=JSON.parse(storage.getItem(key(namespace,id))),url=new URL(context.url),scope=new URL(root);const hub=url.origin===scope.origin&&(url.pathname===new URL('index.html',scope).pathname||url.pathname===scope.pathname);const app=context.type==='app'&&context.state?.appView===true&&scopedAppURL(url,scope);return (hub||app)&&context.state!==null&&typeof context.state==='object'&&!Array.isArray(context.state)?context:null;}catch{return null;}
}
export function returnToVisit(root,current,storage,namespace){
 const id=new URL(current).searchParams.get('visit'),context=visitContext(root,id,storage,namespace);
 if(!context)return mainHubURL(root);
 const url=new URL(context.url);url.searchParams.delete('home');url.searchParams.set('restore',id);return url;
}
