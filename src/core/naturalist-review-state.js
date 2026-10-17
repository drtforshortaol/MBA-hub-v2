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
 if(packet.published===true||packet.committed===true||packet.prepared===true||packet.can_auto_publish===true)return null;
 if(typeof fingerprint!=='string'||!fingerprint.trim()||packet.review_context_sha256!==fingerprint)return null;
 if(!validateReviewDecisions(packet.review_decisions,entries))return null;
 return packet.review_decisions.map(d=>({...d}));
}


// A read-only work queue for approved review decisions. Never stages or publishes content.
export function reviewActionQueue(decisions,entries){
 if(!validateReviewDecisions(decisions,entries))return {valid:false,reason:'invalid-decisions',items:[],can_auto_publish:false};
 const items=[],blocked_items=[];
 decisions.forEach((decision,index)=>{
  const ready=decision.scientific_status==='verified'&&decision.editorial_status==='approved'&&decision.proposed_action!=='needs-review';
  if(!ready||decision.proposed_action==='no-change')return;
  const entry=entries[index];
  const item={index,action:decision.proposed_action,entry,reviewer_notes:decision.reviewer_notes};
  // A review decision is not an override for a classifier safety flag.
  // Keep flagged actions visible, but never place them in the preparable queue.
  const duplicate=entry?.duplicate_of!=null;
  const conflict=Array.isArray(entry?.conflict_with)&&entry.conflict_with.length>0;
  const malformed=entry==null||typeof entry!=='object'||Array.isArray(entry)||
   !Object.hasOwn(entry,'duplicate_of')||!Array.isArray(entry.conflict_with)||
   (duplicate&&(!Number.isInteger(entry.duplicate_of)||entry.duplicate_of<0||entry.duplicate_of>=entries.length||entry.duplicate_of===index))||
   (Array.isArray(entry.conflict_with)&&entry.conflict_with.some(i=>!Number.isInteger(i)||i<0||i>=entries.length||i===index));
  if(duplicate||conflict||malformed)blocked_items.push({...item,block_reasons:[...(duplicate?['duplicate']:[]),...(conflict?['scientific-conflict']:[]),...(malformed?['invalid-classification']:[])]});
  else items.push(item);
 });
 return {valid:true,reason:reviewRecoveryCheck(decisions,entries).reason,items,blocked_items,can_auto_publish:false};
}
