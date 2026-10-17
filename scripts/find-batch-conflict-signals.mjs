// Conservative cross-statement conflict signals; no scientific conclusion is inferred.
const normalize=text=>String(text??'').toLowerCase().replace(/\b(?:can't|cannot)\b/g,'can not').replace(/\b(?:doesn't|don't|didn't)\b/g,'do not').replace(/[^a-z0-9]+/g,' ').trim();
const negated=text=>/\b(?:not|never|no|cannot|can't|doesn't|don't|didn't|without|unable)\b/i.test(text);
const terms=text=>new Set(normalize(text).split(' ').filter(word=>word.length>3&&!['never','cannot','without','doesn','don','didn'].includes(word)));
export function findBatchConflictSignals(entries){
 if(!Array.isArray(entries))return {valid:false,errors:['entries array required']};
 const items=[];
 for(let i=0;i<entries.length;i++){
  for(let j=0;j<i;j++){
   const a=String(entries[i]?.text??''),b=String(entries[j]?.text??'');
   const x=terms(a),y=terms(b);
   if(!x.size||!y.size||negated(a)===negated(b))continue;
   const shared=[...x].filter(t=>y.has(t)).length;
   const similarity=shared/Math.min(x.size,y.size);
   if(similarity>=0.75)items.push({index:i,compared_with:j,signal:'negation-difference-review',requires_scientific_review:true});
  }
 }
 return {valid:true,items,requires_review:true,can_auto_publish:false};
}
