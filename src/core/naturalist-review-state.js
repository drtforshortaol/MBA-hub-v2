// Naturalist review annotations: local-only, never publication authorization.
export const REVIEW_SCHEMA=1;
const SCIENCE=new Set(['pending','needs-revision','verified']);
const EDITORIAL=new Set(['pending','needs-revision','approved']);
const ACTIONS=new Set(['needs-review','update-existing','new-content','no-change']);
export function newReviewDecisions(entries){
 return entries.map((_,index)=>({index,scientific_status:'pending',editorial_status:'pending',proposed_action:'needs-review',reviewer_notes:''}));
}
export function validateReviewDecisions(decisions,entries){
 if(!Array.isArray(entries)||!Array.isArray(decisions)||decisions.length!==entries.length)return false;
 return decisions.every((d,i)=>d&&typeof d==='object'&&!Array.isArray(d)&&Object.keys(d).every(k=>['index','scientific_status','editorial_status','proposed_action','reviewer_notes'].includes(k))&&d.index===i&&SCIENCE.has(d.scientific_status)&&EDITORIAL.has(d.editorial_status)&&ACTIONS.has(d.proposed_action)&&typeof d.reviewer_notes==='string'&&d.reviewer_notes.length<=4000);
}
export function reviewProgress(decisions){
 if(!Array.isArray(decisions))return {completed:0,total:0,revisions:0,can_auto_publish:false};
 const completed=decisions.filter(d=>d&&typeof d==='object'&&!Array.isArray(d)&&d.scientific_status==='verified'&&d.editorial_status==='approved'&&ACTIONS.has(d.proposed_action)&&d.proposed_action!=='needs-review').length;
 const revisions=decisions.filter(d=>d&&typeof d==='object'&&!Array.isArray(d)&&(d.scientific_status==='needs-revision'||d.editorial_status==='needs-revision')).length;
 return {completed,total:decisions.length,revisions,can_auto_publish:false};
}
export function reviewStorageKey(namespace,fingerprint){return namespace+':naturalist-review:'+fingerprint;}
export function reviewRecoveryCheck(decisions,entries){
 if(!validateReviewDecisions(decisions,entries))return {valid:false,reason:'invalid-decisions',can_auto_publish:false};
 const progress=reviewProgress(decisions);
 return {valid:true,reason:progress.revisions?'revisions-required':progress.total>0&&progress.completed===progress.total?'review-complete':'review-incomplete',...progress,can_auto_publish:false};
}
export function readReview(storage,key,fingerprint,entries){
 if(typeof fingerprint!=='string'||!fingerprint.trim())return null;
 try{
  const record=JSON.parse(storage.getItem(key)||'null');
  if(record?.schema_version!==REVIEW_SCHEMA||record.review_context_sha256!==fingerprint||!validateReviewDecisions(record.review_decisions,entries))return null;
  for(const field of ['published','committed','prepared','can_auto_publish']){
   if(Object.hasOwn(record,field)&&record[field]!==false)return null;
  }
  return record.review_decisions.map(d=>({...d}));
 }catch{return null;}
}
export function writeReview(storage,key,fingerprint,decisions,entries){
 if(typeof fingerprint!=='string'||!fingerprint.trim()||!validateReviewDecisions(decisions,entries))return false;
 try{
  storage.setItem(key,JSON.stringify({schema_version:REVIEW_SCHEMA,review_context_sha256:fingerprint,review_decisions:decisions}));
  const restored=readReview(storage,key,fingerprint,entries);
  return restored!==null&&JSON.stringify(restored)===JSON.stringify(decisions);
 }catch{return false;}
}

export function importReviewPacket(packet,fingerprint,entries){
 if(!packet||typeof packet!=='object'||Array.isArray(packet))return null;
 if(packet.schema_version!==REVIEW_SCHEMA||packet.kind!=='mba-v2-naturalist-review-packet')return null;
 // Explicit publication state fields must be false, never truthy, null, or ambiguous.
 for(const field of ['published','committed','prepared','can_auto_publish']){
  if(Object.hasOwn(packet,field)&&packet[field]!==false)return null;
 }
 if(typeof fingerprint!=='string'||!fingerprint.trim()||packet.review_context_sha256!==fingerprint)return null;
 if(!validateReviewDecisions(packet.review_decisions,entries))return null;
 // Recovery is tied to the exact source and classification snapshot, not only
 // a caller-supplied fingerprint. Legacy packets without entries remain valid.
 if(Object.hasOwn(packet,'entries')){
  if(!Array.isArray(packet.entries)||packet.entries.length!==entries.length)return null;
  if(packet.entries.some((item,i)=>!item||typeof item!=='object'||Array.isArray(item)||item.index!==i))return null;
  for(let i=0;i<entries.length;i++){
   const actual=packet.entries[i],expected=entries[i];
   if(!actual||typeof actual!=='object'||Array.isArray(actual)||actual.index!==i||!expected||typeof expected!=='object'||Array.isArray(expected)||expected.index!==i)return null;
   for(const field of ['source_text','text','reviewed_source_snapshot','source_block','extraction','duplicate_of','conflict_with','placement','route','reviewed_app_version','reviewed_section_snapshot','review','existing_content','review_required']){
    if(Object.hasOwn(expected,field)!==Object.hasOwn(actual,field))return null;
    if(JSON.stringify(actual[field]??null)!==JSON.stringify(expected[field]??null))return null;
   }
  }
 }
 return packet.review_decisions.map(d=>({...d}));
}


// A read-only work queue for approved review decisions. Never stages or publishes content.
export function reviewActionQueue(decisions,entries){
 if(!validateReviewDecisions(decisions,entries))return {valid:false,reason:'invalid-decisions',items:[],blocked_items:[],can_auto_publish:false};
 const items=[],blocked_items=[];
 decisions.forEach((decision,index)=>{
  const ready=decision.scientific_status==='verified'&&decision.editorial_status==='approved'&&decision.proposed_action!=='needs-review';
  if(!ready||decision.proposed_action==='no-change')return;
  const entry=entries[index];
  const item={index,action:decision.proposed_action,entry,reviewer_notes:decision.reviewer_notes};
  // A review decision is not an override for a classifier safety flag.
  // Keep flagged actions visible, but never place them in the preparable queue.
  // A review queue must never offer a changed source as actionable, even before draft preparation.
  const sourceChanged=Object.hasOwn(entry??{},'reviewed_source_snapshot')&&
   (typeof entry.reviewed_source_snapshot!=='string'||entry.reviewed_source_snapshot!==JSON.stringify({text:entry.text,source_block:entry.source_block,extraction:entry.extraction}));
  const duplicate=entry?.duplicate_of!=null||entries.some((other,j)=>j!==index&&other?.duplicate_of===index);
  // Conflicts are undirected safety relationships even when the classifier
  // records only one side of the pair. Never prepare the unflagged endpoint.
  const conflict=Array.isArray(entry?.conflict_with)&&entry.conflict_with.length>0||
   entries.some((other,j)=>j!==index&&Array.isArray(other?.conflict_with)&&other.conflict_with.includes(index));
  // Independently approved statements must not generate competing edits to the
  // same destination section in a single export. Require explicit consolidation.
  const destination=entry?.route;
  const competing=decision.proposed_action==='update-existing'&&destination?.action==='update-existing'&&
   typeof destination.app_id==='string'&&typeof destination.section_id==='string'&&
   decisions.some((other,j)=>j!==index&&other?.scientific_status==='verified'&&
    other.editorial_status==='approved'&&other.proposed_action==='update-existing'&&
    entries[j]?.route?.action==='update-existing'&&
    entries[j].route.app_id===destination.app_id&&entries[j].route.section_id===destination.section_id);
  const malformed=entry==null||typeof entry!=='object'||Array.isArray(entry)||
   (Object.hasOwn(entry,'index')&&entry.index!==index)||
   (Object.hasOwn(entry,'conflict_with')&&!Array.isArray(entry.conflict_with))||
   (Object.hasOwn(entry,'duplicate_of')&&entry.duplicate_of!==null&&(!Number.isInteger(entry.duplicate_of)||entry.duplicate_of<0||entry.duplicate_of>=entries.length||entry.duplicate_of===index))||
   (Array.isArray(entry.conflict_with)&&entry.conflict_with.some(i=>!Number.isInteger(i)||i<0||i>=entries.length||i===index));
  if(duplicate||conflict||malformed||sourceChanged||competing)blocked_items.push({...item,block_reasons:[...(duplicate?['duplicate']:[]),...(conflict?['scientific-conflict']:[]),...(malformed?['invalid-classification']:[]),...(sourceChanged?['source-changed']:[]),...(competing?['competing-section-update']:[])]});
  else items.push(item);
 });
 return {valid:true,reason:reviewRecoveryCheck(decisions,entries).reason,items,blocked_items,can_auto_publish:false};
}
