// Deterministic, review-only routing. No publication or manifest writes.
const normalize=s=>String(s??'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const tokens=s=>new Set(normalize(s).split(' ').filter(w=>w.length>2));
export function suggestContentDestination(update,applications){
 if(typeof update!=='string'||!update.trim())return {valid:false,errors:['update text required']};
 if(!Array.isArray(applications))return {valid:false,errors:['application catalog required']};
 const words=tokens(update);
 const ranked=applications.filter(a=>a&&typeof a.app_id==='string'&&/^[a-z0-9-]+$/.test(a.app_id)).map(app=>{
  const titleTokens=tokens(app.title);const idTokens=tokens(app.app_id.replace(/-/g,' '));
  const appScore=[...new Set([...titleTokens,...idTokens])].reduce((n,w)=>n+(words.has(w)?5:0),0);
  const sections=Array.isArray(app.sections)?app.sections:[];
  const matches=sections.filter(s=>typeof s.id==='string').map(s=>({id:s.id,title:s.title??s.id,score:[...tokens(s.title??s.id)].reduce((n,w)=>n+(words.has(w)?2:0),0)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  return {app_id:app.app_id,title:app.title??app.app_id,score:appScore+(matches[0]?.score??0),section:matches[0]?.score>0?matches[0].id:null};
 }).sort((a,b)=>b.score-a.score||a.app_id.localeCompare(b.app_id));
 const best=ranked[0],second=ranked[1];
 if(!best||best.score<5||second?.score===best.score)return {valid:true,action:'review-placement',reason:'no unambiguous existing application match',candidates:ranked.slice(0,3),requires_review:true,published:false};
 return {valid:true,action:'update-existing',app_id:best.app_id,section_id:best.section,confidence:best.score>=9?'high':'medium',requires_review:true,published:false,candidates:ranked.slice(0,3)};
}
