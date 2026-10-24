// App view snapshots preserve both open and deliberately closed panels.
const fields='input[id],select[id],textarea[id]';
function restorable(input){return ['INPUT','SELECT','TEXTAREA'].includes(input.tagName)&&!['password','file','button','submit','reset','image','hidden'].includes(input.type);}
// Snapshot ownership is checked against the app URL before these local keys replay.
function disclosureKey(control){
 const panel=control.getAttribute('aria-controls');
 if(panel)return panel; // Preserve existing session snapshot keys.
 if(control.id)return JSON.stringify(['control',control.id]);
 const owner=control.closest('[id]');
 if(!owner)return null;
 return JSON.stringify(['owner',owner.id,[...owner.querySelectorAll('[aria-expanded]')].indexOf(control)]);
}
// Inherited segmented views expose a selected button through .mode.active.
// Replay only one uniquely identified existing mode, using the app's own click
// handler so panel visibility remains owned by the application.
function modeButtons(document){return [...document.querySelectorAll('button.mode[data-view]')].filter(button=>button.tagName==='BUTTON'&&typeof button.dataset?.view==='string'&&button.dataset.view&&button.dataset.view.length<=100);}
export function captureAppView(document,scroll){
 const modes=modeButtons(document).filter(button=>button.classList.contains('active')).map(button=>button.dataset.view);
 return {scroll,appView:true,...(modes.length===1?{modes}:{}),
  details:[...document.querySelectorAll('details')].flatMap((element,index)=>element.open?[index]:[]),
  expanded:[...document.querySelectorAll('[aria-expanded="true"]')].map(disclosureKey).filter(Boolean),
  inputs:[...document.querySelectorAll(fields)].filter(restorable).map(element=>({id:element.id,value:element.value,checked:element.checked===true}))};
}
export function restoreAppView(document,state,{Event,scrollTo}){
 if(Array.isArray(state.modes)&&state.modes.length===1&&typeof state.modes[0]==='string'){
  const matches=modeButtons(document).filter(button=>button.dataset.view===state.modes[0]);
  if(matches.length===1&&!matches[0].classList.contains('active'))matches[0].click();
 }
 for(const saved of state.inputs){
  const input=document.getElementById(saved.id);
  if(!input||!restorable(input))continue;
  input.value=saved.value;
  if('checked' in input)input.checked=saved.checked;
  input.dispatchEvent(new Event('input',{bubbles:true}));
  input.dispatchEvent(new Event('change',{bubbles:true}));
 }
 const expanded=new Set(state.expanded);
 // Click the app's own controls so visual state and accessibility stay in sync.
 for(const control of document.querySelectorAll('[aria-expanded]')){
  const key=disclosureKey(control);
  if(!key)continue;
  const desired=expanded.has(key);
  if((control.getAttribute('aria-expanded')==='true')!==desired)control.click();
 }
 const open=new Set(state.details);
 [...document.querySelectorAll('details')].forEach((element,index)=>{element.open=open.has(index);});
 scrollTo(0,state.scroll);
}

