import {listedHubApps,whaleTopic} from './whale-reference.js';
// Index presentation only: canonical titles, app IDs and species content stay intact.
const names=Object.freeze({
 'big-bellied-seahorse':'Seahorse, Big-Bellied',
 'bluespotted-ribbontail-ray':'Ribbontail Ray, Blue-spotted',
 'gooseneck-barnacle':'Barnacle, Gooseneck',
 'green-falsejingle':'Falsejingle, Green',
 'hopkins-rose-nudibranch':'Nudibranch, Hopkins’ Rose',
 'northern-elephant-seal':'Elephant Seal, Northern',
 'california-flying-fish':'Flying Fish, California',
 'california-sheephead':'Sheephead, California'
});
const references=Object.freeze({
 'big-bellied-seahorse':'Big-Bellied Seahorse',
 'bluespotted-ribbontail-ray':'Blue-spotted Ribbontail Ray',
 'gooseneck-barnacle':'Gooseneck Barnacle',
 'green-falsejingle':'Green Falsejingle',
 'hopkins-rose-nudibranch':'Hopkins’ Rose Nudibranch',
 'sea-slugs-nudibranchs':'Nudibranchs & Sea Slugs',
 'northern-elephant-seal':'Seal',
 'gray-whale':'Whale',
 'sperm-whale':'Whale'
});
export const animalGroups=Object.freeze([{id:'fishes',title:'Fishes'},{id:'sharks-rays',title:'Sharks & Rays'},{id:'marine-mammals',title:'Marine Mammals'},{id:'invertebrates',title:'Invertebrates'}]);
const groups=Object.freeze({
 'big-bellied-seahorse':'fishes','california-flying-fish':'fishes','california-sheephead':'fishes','stargazer-species-guide':'fishes',
 'bluespotted-ribbontail-ray':'sharks-rays',
 'gray-whale':'marine-mammals','northern-elephant-seal':'marine-mammals','whale-associated-organisms':'marine-mammals',
 'gooseneck-barnacle':'invertebrates','green-falsejingle':'invertebrates','hopkins-rose-nudibranch':'invertebrates','sea-slugs-nudibranchs':'invertebrates'
});
const searchAliases=Object.freeze({'california-sheephead':'wrasse wrasses','big-bellied-seahorse':'seahorse seahorses big belly','california-flying-fish':'flying fish flying fishes'});
export function animalGroupFor(id){return groups[id]||'';}
export function animalFilterGroup(value){return animalGroups.some(g=>g.id===value)?value:'';}
export function animalSearchTerms(id){const g=animalGroups.find(g=>g.id===groups[id]);return [names[id],references[id],g?.title,searchAliases[id]].filter(Boolean).join(' ');}
export function animalIndexEntries(apps){
 const unique=[...new Map(listedHubApps(apps).filter(app=>app.category==='animals'&&app.listed!==false).map(app=>[app.app_id,app])).values()];
 return unique.flatMap(app=>{
  const label=(app.app_id===whaleTopic.id?whaleTopic.title:names[app.app_id])||String(app.title||'').replace(/^[^\p{L}\p{N}]+/u,'');
  const entry={app,label,group:animalGroupFor(app.app_id),letter:label.charAt(0).toUpperCase(),crossReference:false};
  const group=references[app.app_id];
  return group?[entry,{app,group:animalGroupFor(app.app_id),label:group+' → '+label,letter:group.charAt(0),crossReference:true}]:[entry];
 }).sort((a,b)=>a.label.localeCompare(b.label,'en'));
}
