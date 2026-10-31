// Index presentation only: canonical titles, app IDs and species content stay intact.
const names=Object.freeze({
 'big-bellied-seahorse':'Seahorse, Big-Bellied',
 'northern-elephant-seal':'Elephant Seal, Northern',
 'california-flying-fish':'Flying Fish, California',
 'california-sheephead':'Sheephead, California'
});
const references=Object.freeze({
 'big-bellied-seahorse':'Big-Bellied Seahorse',
 'northern-elephant-seal':'Seal',
 'gray-whale':'Whale',
 'sperm-whale':'Whale'
});
export function animalIndexEntries(apps){
 const unique=[...new Map(apps.filter(app=>app.category==='animals'&&app.listed!==false).map(app=>[app.app_id,app])).values()];
 return unique.flatMap(app=>{
  const label=names[app.app_id]||String(app.title||'').replace(/^[^\p{L}\p{N}]+/u,'');
  const entry={app,label,letter:label.charAt(0).toUpperCase(),crossReference:false};
  const group=references[app.app_id];
  return group?[entry,{app,label:group+' → '+label,letter:group.charAt(0),crossReference:true}]:[entry];
 }).sort((a,b)=>a.label.localeCompare(b.label,'en'));
}
