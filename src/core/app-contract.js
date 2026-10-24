import {captureAppView,restoreAppView} from './app-view.js';
import {createSectionNavigator,revisitSectionLink} from './section-navigation.js';
import {mainHubURL,returnToVisit,appRestoreState,captureAppVisit} from './navigation.js';
import {initializeOffline} from './offline.js';
const root=new URL('../',import.meta.url);let env;try{env=await fetch(new URL('environment.json',root)).then(r=>r.json());}catch{env={namespace:'mba-v2'};}
const hubLinks=[...document.querySelectorAll('a')].filter(link=>/MBA Hub|Return to Hub/i.test(link.textContent)&&new URL(link.href).pathname===new URL('index.html',root).pathname);
hubLinks.forEach(link=>{link.href=mainHubURL(root).href;});
const primaryHub=hubLinks[0];if(primaryHub){const button=document.createElement('a');button.href=mainHubURL(root).href;button.textContent='← Back';button.className=primaryHub.className;button.setAttribute('data-v2-back','true');button.style.cssText='font:inherit;cursor:pointer;margin-right:8px;min-height:44px;display:inline-flex;align-items:center';button.onclick=event=>{event.preventDefault();let destination=mainHubURL(root);try{destination=returnToVisit(root,location.href,sessionStorage,env.namespace);}catch{}location.assign(destination);};primaryHub.before(button);}
function viewState(){return captureAppView(document,scrollY);}
document.addEventListener('click',event=>{const link=event.target.closest?.('a');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('data-v2-back'))return;const url=new URL(link.href);if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname+'apps/')||url.pathname===location.pathname)return;try{link.href=captureAppVisit(url,root,location.href,viewState(),sessionStorage,env.namespace,crypto.randomUUID()).href;}catch{}});
let restore=null;try{restore=appRestoreState(root,location.href,sessionStorage,env.namespace);}catch{}
if(restore?.appView){requestAnimationFrame(()=>restoreAppView(document,restore,{Event,scrollTo}));}
const id=location.pathname.slice(root.pathname.length).split('/')[1];
let manifest;try{manifest=await fetch(new URL(`apps/${id}/manifest.json`,root)).then(r=>r.json());}catch{}
function assignSectionIDs(){for(const section of [...(manifest?.sections||[])].sort((a,b)=>b.title.length-a.title.length)){if(section.query||document.getElementById(section.id))continue;const title=section.title.replace(/\s+/g,' ').trim().toLowerCase();const node=[...document.querySelectorAll('summary,h2,h3,h4')].find(e=>e.textContent.replace(/\s+/g,' ').trim().toLowerCase().includes(title));if(node){const target=node.tagName==='SUMMARY'?node.parentElement:node;target.id=section.id;}}}
const section=createSectionNavigator({document,location,escape:value=>CSS.escape(value),skipInitial:Boolean(restore?.appView)});
document.addEventListener('click',event=>revisitSectionLink(event,location,section));
assignSectionIDs();new MutationObserver(()=>{assignSectionIDs();section();}).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',section);else section();window.addEventListener('hashchange',section);initializeOffline();
