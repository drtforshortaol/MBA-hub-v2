// Detect repeated intake statements without publishing.
export function findBatchDuplicates(entries){
 if(!Array.isArray(entries))return {valid:false,errors:['entries array required']};
 const seen=new Map();
 const items=entries.map((entry,index)=>{
  const key=String(entry?.text??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const duplicate_of=key&&seen.has(key)?seen.get(key):null;
  if(key&&!seen.has(key))seen.set(key,index);
  return {index,duplicate_of,review_required:true};
 });
 return {valid:true,items,published:false};
}
