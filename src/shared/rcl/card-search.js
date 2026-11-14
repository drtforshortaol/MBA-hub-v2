/** RCL v0.2: progressive-enhancement filter for native <details> cards. */
export function attachCardSearch({input,container,empty}){
 if(!input||!container||!empty)throw Error('RCL card search requires input, container and empty indicator');
 const cards=[...container.querySelectorAll('details')];
 const filter=()=>{
  const q=input.value.trim().toLocaleLowerCase();
  let visible=0;
  for(const card of cards){
   const match=(card.textContent||'').toLocaleLowerCase().includes(q);
   card.hidden=!match;
   if(match)visible++;
  }
  empty.hidden=visible!==0;
  return visible;
 };
 input.addEventListener('input',filter);
 filter();
 return {filter,destroy(){input.removeEventListener('input',filter);for(const card of cards)card.hidden=false;empty.hidden=true;}};
}
