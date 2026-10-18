// App view snapshots preserve both open and deliberately closed panels.
const fields='input[id],select[id],textarea[id]';
function restorable(input){return ['INPUT','SELECT','TEXTAREA'].includes(input.tagName)&&!['password','file','button','submit','reset','image','hidden'].includes(input.type);}
export function captureAppView(document,scroll){
 return {scroll,appView:true,
  details:[...document.querySelectorAll('details')].flatMap((element,index)=>element.open?[index]:[]),
  expanded:[...document.querySelectorAll('[aria-controls][aria-expanded="true"]')].map(element=>element.getAttribute('aria-controls')),
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
 for(const control of document.querySelectorAll('[aria-controls][aria-expanded]')){
  const desired=expanded.has(control.getAttribute('aria-controls'));
  if((control.getAttribute('aria-expanded')==='true')!==desired)control.click();
 }
 const open=new Set(state.details);
 [...document.querySelectorAll('details')].forEach((element,index)=>{element.open=open.has(index);});
 scrollTo(0,state.scroll);
}
