import {listedHubApps,whaleTopic} from './whale-reference.js';
// Index presentation only: canonical titles, app IDs and species content stay intact.
import {animalCatalog,animalRecordForApp} from '../shared/animal-records.js';
const names=Object.fromEntries(animalCatalog.records.map(r=>[r.app_id,r.index.primary]));
const references=Object.fromEntries(animalCatalog.records.filter(r=>r.index.alternate.length).map(r=>[r.app_id,r.index.alternate[0]]));
export const animalGroups=Object.freeze([{id:'fishes',title:'Fishes'},{id:'sharks-rays',title:'Sharks & Rays'},{id:'marine-mammals',title:'Marine Mammals'},{id:'invertebrates',title:'Invertebrates'}]);
export function animalGroupFor(id){return animalRecordForApp(id)?.browse_group||'';}
export function animalFilterGroup(value){return animalGroups.some(g=>g.id===value)?value:'';}
export function animalSearchTerms(id){const r=animalRecordForApp(id);if(!r)return '';const g=animalGroups.find(g=>g.id===r.browse_group);return [r.index.primary,...r.index.alternate,r.common_names.primary,...r.common_names.aliases,r.scientific_names.primary,...r.scientific_names.aliases,g?.title,...r.search_aliases,...Object.values(r.taxonomy).filter(Boolean)].filter(Boolean).join(' ');}
export function animalIndexEntries(apps){
 const unique=[...new Map(listedHubApps(apps).filter(app=>app.category==='animals'&&app.listed!==false).map(app=>[app.app_id,app])).values()];
 return unique.flatMap(app=>{
  const label=(app.app_id===whaleTopic.id?whaleTopic.title:names[app.app_id])||String(app.title||'').replace(/^[^\p{L}\p{N}]+/u,'');
  const entry={app,label,group:animalGroupFor(app.app_id),letter:label.charAt(0).toUpperCase(),crossReference:false};
  const group=references[app.app_id];
  return group?[entry,{app,group:animalGroupFor(app.app_id),label:group+' → '+label,letter:group.charAt(0),crossReference:true}]:[entry];
 }).sort((a,b)=>a.label.localeCompare(b.label,'en'));
}
