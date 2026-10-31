import {animalSearchTerms} from './animal-index.js';
import {whaleSearchEntries} from './whale-reference.js';
// Fold typographic variants only for comparison; keep canonical text and routes intact.
function searchableText(value){
 return value.normalize('NFKD').toLocaleLowerCase().replace(/\p{M}/gu,'')
  .replace(/['’‘]/g,'').replace(/[-‐‑‒–—]/g,' ').replace(/\s+/g,' ').trim();
}

// Rank existing registered content without changing scientific text or identifiers.
export function searchHub(index,query,{category='',apps=[]}={}){
 const phrase=searchableText(String(query)),terms=phrase.split(/\s+/).filter(Boolean);
 if(!terms.length)return [];
 const categories=new Map(apps.map(app=>[app.app_id,app.category]));
 return whaleSearchEntries(index).flatMap((entry,position)=>{
  if(category&&categories.get(entry.app_id)!==category)return [];
  const title=searchableText(entry.title),text=searchableText(entry.text+' '+animalSearchTerms(entry.app_id)),combined=title+' '+text;
  if(!terms.every(term=>combined.includes(term)))return [];
  const rank=title===phrase?0:title.includes(phrase)?1:terms.every(term=>title.includes(term))?2:text.includes(phrase)?3:4;
  return [{entry,rank,position}];
 }).sort((a,b)=>a.rank-b.rank||a.position-b.position).map(result=>result.entry);
}
