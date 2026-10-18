import {reviewActionQueue} from '../src/core/naturalist-review-state.js';
import {prepareAutomaticUpdate} from './prepare-automatic-update.mjs';

// Convert approved intake decisions into draft-only proposals. Never apply edits.
export function prepareReviewedNaturalistActions(classification,decisions,applications,replacements={}){
 if(!classification?.valid||!Array.isArray(classification.entries)||!Array.isArray(applications)||!replacements||typeof replacements!=='object'||Array.isArray(replacements))
  return {valid:false,reason:'invalid-intake',items:[],prepared:false,published:false};
 const entries=classification.entries;
 const queue=reviewActionQueue(decisions,entries);
 if(!queue.valid)return {...queue,prepared:false,published:false};
 const items=[...(queue.blocked_items||[]).map(({index,action,reviewer_notes,block_reasons})=>({index,action,status:'blocked-review',reason:block_reasons.join(', '),reviewer_notes})),...queue.items.map(({index,action,entry,reviewer_notes})=>{
  const blocked=entry.duplicate_of!=null||(Array.isArray(entry.conflict_with)&&entry.conflict_with.length>0);
  if(blocked)return {index,action,status:'blocked-review',reason:'duplicate or potential scientific conflict',reviewer_notes};
  if(action==='update-existing'&&entry.route?.action!=='update-existing')return {index,action,status:'routing-review',reason:'review action conflicts with classified destination',reviewer_notes};
  if(action==='new-content')return {index,action,status:'placement-review',placement:entry.placement,reviewer_notes};
  const replacement=replacements[index];
  if(typeof replacement!=='string'||!replacement.trim())return {index,action,status:'replacement-required',reviewer_notes};
  const route=entry.route;
  if(!route||route.action!=='update-existing'||typeof route.app_id!=='string'||typeof route.section_id!=='string')
   return {index,action,status:'routing-review',reason:'classification lacks a specific existing section',reviewer_notes};
  // Reject a changed catalog target instead of preparing against stale approvals.
  const app=applications.find(a=>a?.app_id===route.app_id);
  const section=app?.sections?.find(s=>s?.id===route.section_id);
  if(!app||!section||typeof section.text!=='string'||(Object.hasOwn(entry,'reviewed_app_version')&&entry.reviewed_app_version!==app.version))return {index,action,status:'routing-review',reason:'reviewed destination no longer exists or is not editable',reviewer_notes};
  const result=prepareAutomaticUpdate(entry.text,applications,{replacementText:replacement});
  const matches=result.prepared===true&&result.app_id===route.app_id&&result.section_id===route.section_id&&result.request?.app_id===route.app_id&&result.request?.section_edits?.[0]?.id===route.section_id;
  return {index,action,status:matches?'draft-ready':'routing-review',result,reviewer_notes};
 })];
 items.sort((a,b)=>a.index-b.index);
 return {valid:true,reason:queue.reason,items,prepared:items.length>0&&items.every(item=>item.status==='draft-ready'),published:false,can_auto_publish:false};
}
