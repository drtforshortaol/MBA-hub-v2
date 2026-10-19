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
export function captureAppView(document,scroll){
 return {scroll,appView:true,
  details:[...document.querySelectorAll('details')].flatMap((element,index)=>element.open?[index]:[]),
  expanded:[...document.querySelectorAll('[aria-expanded="true"]')].map(disclosureKey).filter(Boolean),
  inputs:[...document.querySelectorAll(fields)].filter(restorable).map(element=>({id:element.id,value:element.value,checked:element.checked===true}))};
}
export function restoreAppView(document,state,{Event,scrollTo}){
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

