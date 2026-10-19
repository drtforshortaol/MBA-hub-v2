// Animal filtering belongs to Hub view state; canonical application records stay intact.
export function animalFilterLetter(value){return typeof value==='string'&&/^[A-Z]$/.test(value)?value:'';}
export function bindAnimalFilter(view,{letter='',onChange}){
 let selected=animalFilterLetter(letter);
 for(const row of view.querySelectorAll('.letters')){
  const buttons=[...row.querySelectorAll('button')],entries=[...row.parentElement.querySelectorAll('.entry')];
  function apply(){
   buttons.forEach(button=>button.setAttribute('aria-pressed',String(Boolean(selected)&&button.textContent===selected)));
   entries.forEach(entry=>{entry.hidden=Boolean(selected)&&entry.dataset.letter!==selected;});
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{
   selected=selected===button.textContent?'':animalFilterLetter(button.textContent);
   apply();onChange(selected);
  }));
  apply();
 }
}
