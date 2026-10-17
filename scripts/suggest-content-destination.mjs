// Conservative, deterministic content routing; no edits, GitHub writes, or publishing.
const STOP=new Set(['add','update','information','about','with','the','and','for','into','new','app','application','section','content','species','highlight','how','they','their','from','that','this','more']);
const normalize=s=>String(s??'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const tokens=s=>new Set(normalize(s).split(' ').filter(w=>w.length>2&&!STOP.has(w)));
export function suggestContentDestination(update,applications){
 if(typeof update!=='string'||!update.trim())return {valid:false,errors:['update text required']};
 if(!Array.isArray(applications))return {valid:false,errors:['application catalog required']};
 const words=tokens(update);
 const ranked=applications.filter(a=>a&&typeof a.app_id==='string'&&/^[a-z0-9-]+$/.test(a.app_id)).map(app=>{
  const appWords=new Set([...tokens(app.title),...tokens(app.app_id.replace(/-/g,' '))]);
  const overlap=[...appWords].filter(w=>words.has(w)).length;
  const coverage=appWords.size?overlap/appWords.size:0;
  const sections=Array.isArray(app.sections)?app.sections:[];
  const matches=sections.filter(s=>typeof s.id==='string').map(s=>({id:s.id,title:s.title??s.id,score:[...tokens(s.title??s.id)].reduce((n,w)=>n+(words.has(w)?2:0),0)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  const topSection=matches[0];
  // A single generic heading token is insufficient evidence for section placement.
  const sectionTokens=topSection?tokens(topSection.title):new Set();
  const sectionCoverage=sectionTokens.size?topSection.score/(2*sectionTokens.size):0;
  const sectionSupported=Boolean(topSection?.score>=2&&(sectionTokens.size===1||sectionCoverage>=0.5));
  const sectionAmbiguous=Boolean(topSection?.score>0&&matches[1]?.score===topSection.score);
  return {app_id:app.app_id,title:app.title??app.app_id,score:overlap*5+(topSection?.score??0),app_overlap:overlap,coverage,section:sectionSupported&&!sectionAmbiguous?topSection.id:null,section_ambiguous:sectionAmbiguous};
 }).sort((a,b)=>b.score-a.score||a.app_id.localeCompare(b.app_id));
 const best=ranked[0],second=ranked[1];
 // A section-only match must not redirect an update into an unrelated species.
 if(!best||best.app_overlap===0||best.coverage<0.5||second?.score===best.score||(second?.app_overlap===best.app_overlap&&second?.coverage===best.coverage)||(second?.app_overlap===best.app_overlap&&normalize(second?.title)===normalize(best.title)))return {valid:true,action:'review-placement',reason:'no unambiguous existing application match',candidates:ranked.slice(0,3),requires_review:true,published:false};
 return {valid:true,action:'update-existing',app_id:best.app_id,section_id:best.section,confidence:best.coverage===1&&best.score>=9&&!best.section_ambiguous?'high':'medium',requires_review:true,published:false,candidates:ranked.slice(0,3)};
}
