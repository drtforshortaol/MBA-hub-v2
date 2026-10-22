// Resolve a fragment once, retrying only while a dynamic target is unavailable.
export function createSectionNavigator({document,location,escape,skipInitial=false}){
 let previous=location.hash,resolved=skipInitial;
 return function navigateSection({revisit=false}={}){
  const fragment=location.hash;
  if(fragment!==previous){previous=fragment;resolved=false;}
  if(resolved&&!revisit)return false;
  let id;
  try{id=decodeURIComponent(fragment.slice(1));}catch{resolved=true;return false;}
  if(!id){resolved=true;return false;}
  const target=document.getElementById(id)||document.querySelector(`[data-sense-id="${escape(id)}"]`);
  if(!target)return false;
  // Mark before opening panels: their rendering can produce more mutations.
  resolved=true;
  const ancestors=[];
  for(let current=target;current;current=current.parentElement)ancestors.push(current);
  const controls=[...document.querySelectorAll('[aria-controls][aria-expanded]')];
  // Custom accordions often keep their trigger beside the hidden panel.
  // Replay only an explicit ARIA relationship, from outer panels inward.
  for(const current of ancestors.reverse()){
   if(current.tagName==='DETAILS')current.open=true;
   if(current.id)for(const control of controls){
    if(control.getAttribute('aria-expanded')==='false'&&control.getAttribute('aria-controls').split(/\s+/).includes(current.id))control.click();
   }
  }
  if(target.getAttribute?.('aria-expanded')==='false')target.click();
  else target.querySelector('[aria-expanded=false]')?.click();
  // Keep keyboard and assistive-technology reading position with the revealed
  // section. Native summaries retain their normal keyboard behavior; headings
  // and other section containers gain only programmatic focus, not a Tab stop.
  const focusTarget=target.tagName==='DETAILS'?target.querySelector('summary')||target:target;
  if(typeof focusTarget.focus==='function'){
   if(focusTarget.tabIndex<0&&!focusTarget.hasAttribute('tabindex'))focusTarget.setAttribute('tabindex','-1');
   focusTarget.focus({preventScroll:true});
  }
  target.scrollIntoView({block:'start'});
  return true;
 };
}


// Reselecting the current fragment does not emit hashchange in the browser.
// Honor that explicit navigation without replaying it on unrelated DOM mutations.
export function revisitSectionLink(event,location,navigate){
 const link=event.target.closest?.('a[href]');
 if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return false;
 const current=new URL(location.href),target=new URL(link.href,current);
 if(!target.hash||target.hash!==current.hash||target.origin!==current.origin||target.pathname!==current.pathname||target.search!==current.search)return false;
 if(!navigate({revisit:true}))return false;
 event.preventDefault();return true;
}
