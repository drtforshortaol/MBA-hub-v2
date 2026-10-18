// Resolve a fragment once, retrying only while a dynamic target is unavailable.
export function createSectionNavigator({document,location,escape,skipInitial=false}){
 let previous=location.hash,resolved=skipInitial;
 return function navigateSection(){
  const fragment=location.hash;
  if(fragment!==previous){previous=fragment;resolved=false;}
  if(resolved)return false;
  let id;
  try{id=decodeURIComponent(fragment.slice(1));}catch{resolved=true;return false;}
  if(!id){resolved=true;return false;}
  const target=document.getElementById(id)||document.querySelector(`[data-sense-id="${escape(id)}"]`);
  if(!target)return false;
  // Mark before opening panels: their rendering can produce more mutations.
  resolved=true;
  for(let current=target;current;current=current.parentElement){
   if(current.tagName==='DETAILS')current.open=true;
  }
  target.querySelector('[aria-expanded=false]')?.click();
  target.scrollIntoView({block:'start'});
  return true;
 };
}
