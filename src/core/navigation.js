// Navigation interface 1.0.0: contextual Back and explicit main-Hub return.
export function mainHubURL(root){const url=new URL('index.html',root);url.searchParams.set('home','1');return url;}
export function restoredHubState(saved,url){return new URL(url).searchParams.get('home')==='1'?{...saved,open:[],scroll:0}:saved;}
