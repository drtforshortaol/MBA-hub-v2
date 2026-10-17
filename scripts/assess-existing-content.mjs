// Conservative lexical comparison: candidate findings require editorial/scientific review.
const words=s=>new Set(String(s??'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>3));
const overlap=(a,b)=>{const x=words(a),y=words(b);if(!x.size||!y.size)return 0;return [...x].filter(w=>y.has(w)).length/Math.min(x.size,y.size);};
export function assessExistingContent(update,app,{sectionId}={}){
 if(typeof update!=='string'||!update.trim()||!app||!Array.isArray(app.sections))return {valid:false,errors:['update and application sections required']};
 const target=sectionId?app.sections.filter(s=>s.id===sectionId):app.sections;
 const comparisons=target.filter(s=>typeof s.text==='string').map(s=>({section_id:s.id,similarity:overlap(update,s.text),exact:String(s.text).trim().toLowerCase()===update.trim().toLowerCase()})).sort((a,b)=>b.similarity-a.similarity||String(a.section_id).localeCompare(String(b.section_id)));
 const best=comparisons[0];
 return {valid:true,status:best?.exact?'exact-duplicate':best?.similarity>=0.75?'possible-overlap':'no-strong-overlap',match:best??null,contradiction_check:'not-performed',scientific_verification:'required',requires_review:true,published:false};
}
