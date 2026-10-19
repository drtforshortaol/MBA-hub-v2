// Rank existing registered content without changing scientific text or identifiers.
export function searchHub(index,query,{category='',apps=[]}={}){
 const phrase=String(query).normalize('NFKC').trim().toLocaleLowerCase(),terms=phrase.split(/\s+/).filter(Boolean);
 if(!terms.length)return [];
 const categories=new Map(apps.map(app=>[app.app_id,app.category]));
 return index.flatMap((entry,position)=>{
  if(category&&categories.get(entry.app_id)!==category)return [];
  const title=entry.title.normalize('NFKC').toLocaleLowerCase(),text=entry.text.normalize('NFKC').toLocaleLowerCase(),combined=title+' '+text;
  if(!terms.every(term=>combined.includes(term)))return [];
  const rank=title===phrase?0:title.includes(phrase)?1:terms.every(term=>title.includes(term))?2:text.includes(phrase)?3:4;
  return [{entry,rank,position}];
 }).sort((a,b)=>a.rank-b.rank||a.position-b.position).map(result=>result.entry);
}
