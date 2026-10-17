import {reviewActionQueue} from '../src/core/naturalist-review-state.js';
import {prepareAutomaticUpdate} from './prepare-automatic-update.mjs';

// Convert approved intake decisions into draft-only proposals. Never apply edits.
export function prepareReviewedNaturalistActions(classification,decisions,applications,replacements={}){
 if(!classification?.valid||!Array.isArray(classification.entries)||!Array.isArray(applications))
  return {valid:false,reason:'invalid-intake',items:[],prepared:false,published:false};
 const entries=classification.entries;
 const queue=reviewActionQueue(decisions,entries);
 if(!queue.valid)return {...queue,prepared:false,published:false};
 const items=queue.items.map(({index,action,entry,reviewer_notes})=>{
  const blocked=entry.duplicate_of!=null||(Array.isArray(entry.conflict_with)&&entry.conflict_with.length>0);
  if(blocked)return {index,action,status:'blocked-review',reason:'duplicate or potential scientific conflict',reviewer_notes};
  if(action==='new-content')return {index,action,status:'placement-review',placement:entry.placement,reviewer_notes};
  const replacement=replacements[index];
  if(typeof replacement!=='string'||!replacement.trim())return {index,action,status:'replacement-required',reviewer_notes};
  const result=prepareAutomaticUpdate(entry.text,applications,{replacementText:replacement});
  return {index,action,status:result.prepared===true?'draft-ready':'routing-review',result,reviewer_notes};
 });
 return {valid:true,reason:queue.reason,items,prepared:items.length>0&&items.every(item=>item.status==='draft-ready'),published:false,can_auto_publish:false};
}
