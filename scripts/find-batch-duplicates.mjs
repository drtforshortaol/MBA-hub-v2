// Detect repeated intake statements without publishing.
// Canonicalize typographic variants only; do not collapse scientifically meaningful wording.
const duplicateKey=text=>String(text??'').normalize('NFKC').toLowerCase()
 .replace(/[\u2018\u2019]/g,"'").replace(/[\u2010-\u2015]/g,'-')
 .replace(/[^a-z0-9]+/g,' ').trim();
export function findBatchDuplicates(entries){
 if(!Array.isArray(entries))return {valid:false,errors:['entries array required']};
 const seen=new Map();
 const items=entries.map((entry,index)=>{
  const key=duplicateKey(entry?.text);
  const duplicate_of=key&&seen.has(key)?seen.get(key):null;
  if(key&&!seen.has(key))seen.set(key,index);
  return {index,duplicate_of,review_required:true};
 });
 return {valid:true,items,published:false};
}
