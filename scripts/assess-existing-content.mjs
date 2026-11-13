// Conservative lexical comparison: candidate findings require editorial/scientific review.
const normalize=s=>String(s??'').toLowerCase().replace(/[\u2018\u2019]/g,"'").replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const words=s=>new Set(normalize(s).split(' ').filter(w=>w.length>3));
const overlap=(a,b)=>{const x=words(a),y=words(b);if(!x.size||!y.size)return 0;return [...x].filter(w=>y.has(w)).length/Math.min(x.size,y.size);};
export function assessExistingContent(update,app,{sectionId}={}){
 if(typeof update!=='string'||!update.trim()||!app||!Array.isArray(app.sections))return {valid:false,errors:['update and application sections required']};
 const target=sectionId?app.sections.filter(s=>s.id===sectionId):app.sections;
 // Do not infer scientific equivalence from lexical overlap, including negation changes.
 const comparisons=target.filter(s=>typeof s.text==='string').map(s=>({section_id:s.id,similarity:overlap(update,s.text),exact:String(s.text).trim().toLowerCase()===update.trim().toLowerCase()})).sort((a,b)=>b.similarity-a.similarity||String(a.section_id).localeCompare(String(b.section_id)));
 const best=comparisons[0];
 const normalized=normalize(update);
 const repeated=comparisons.find(c=>c.exact);
 const exactAnywhere=app.sections.some(s=>typeof s.text==='string'&&normalize(s.text)===normalized);
 const exactSection=app.sections.find(s=>typeof s.text==='string'&&normalize(s.text)===normalized);
 const bestMatch=exactSection?{section_id:exactSection.id,similarity:1,exact:true}:repeated??best;
 const negation=/\b(?:not|never|no|cannot|can't|doesn't|don't|didn't|isn't|aren't|wasn't|weren't|won't|without|unable)\b/i;
 const possibleContradiction=Boolean(best&&!exactAnywhere&&best.similarity>=0.5&&negation.test(update)!==negation.test(app.sections.find(s=>s.id===best.section_id)?.text??''));
 return {valid:true,status:exactAnywhere?'exact-duplicate':best?.similarity>=0.75?'possible-overlap':'no-strong-overlap',match:bestMatch??null,contradiction_check:'not-performed',potential_conflict_signal:possibleContradiction?'negation-difference-review':'none',scientific_verification:'required',requires_review:true,published:false};
}
