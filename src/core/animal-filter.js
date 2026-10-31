// Animal filtering belongs to Hub view state; canonical application records stay intact.
export function animalFilterLetter(value){return typeof value==='string'&&/^[A-Z]$/.test(value)?value:'';}
export function bindAnimalFilter(view,{letter='',onChange,group='',onGroupChange=()=>{}}){
 let selected=animalFilterLetter(letter),selectedGroup=typeof group==='string'?group:'';
 for(const row of view.querySelectorAll('.letters')){
  const buttons=[...row.querySelectorAll('button')],entries=[...row.parentElement.querySelectorAll('.entry')];
  const groupButtons=[...row.parentElement.querySelectorAll('.animal-group-buttons button')].filter(b=>b.dataset?.group!==undefined);
  const status=row.parentElement.querySelector?.('.animal-group-status');
  if(selectedGroup&&!groupButtons.some(b=>b.dataset.group===selectedGroup)){selectedGroup='';onGroupChange('');}
  if(selected&&!buttons.some(button=>button.textContent===selected&&!button.disabled)){selected='';onChange(selected);}
  function apply(){
   const available=entries.filter(entry=>!selectedGroup||entry.dataset.group===selectedGroup);
   if(selected&&!available.some(entry=>entry.dataset.letter===selected)){selected='';onChange('');}
   buttons.forEach(button=>{button.hidden=button.textContent!=='All'&&!available.some(entry=>entry.dataset.letter===button.textContent);});
   groupButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.group===selectedGroup)));
   buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.textContent==='All'?!selected:Boolean(selected)&&button.textContent===selected)));
   entries.forEach(entry=>{entry.hidden=Boolean(selectedGroup)&&entry.dataset.group!==selectedGroup||Boolean(selected)&&entry.dataset.letter!==selected;});
   if(status){const label=groupButtons.find(b=>b.dataset.group===selectedGroup)?.dataset.label||'All groups',count=new Set(entries.filter(e=>!e.hidden).map(e=>e.dataset.appId)).size;status.textContent=label+' · '+count+(count===1?' guide':' guides');}
  }
  groupButtons.forEach(button=>button.addEventListener('click',()=>{selectedGroup=button.dataset.group;selected='';onChange('');onGroupChange(selectedGroup);apply();}));
  buttons.forEach(button=>button.addEventListener('click',()=>{
   selected=selected===button.textContent?'':animalFilterLetter(button.textContent);
   apply();onChange(selected);
  }));
  apply();
 }
}
