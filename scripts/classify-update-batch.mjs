import {findBatchDuplicates} from './find-batch-duplicates.mjs';
import {findBatchConflictSignals} from './find-batch-conflict-signals.mjs';
import {assessNaturalistReviewGates} from './assess-naturalist-review-gates.mjs';
import {proposeUpdatePlacement} from './propose-update-placement.mjs';
import {extractUpdateStatements} from './extract-update-statements.mjs';
import {suggestContentDestination} from './suggest-content-destination.mjs';
import {assessExistingContent} from './assess-existing-content.mjs';
// Read-only intake of independent update paragraphs; never alters source or manifests.
export function classifyUpdateBatch(input,applications){
 if(typeof input!=='string'||!input.trim())return {valid:false,errors:['update text required']};
 if(input.length>60000)return {valid:false,errors:['update exceeds intake limit']};
 if(!Array.isArray(applications))return {valid:false,errors:['application catalog required']};
 const extracted=extractUpdateStatements(input);
 if(!extracted.valid)return extracted;
 const blocks=extracted.entries.map(e=>e.text);
 const entries=blocks.map((text,index)=>{
  const route=suggestContentDestination(text,applications);
  const app=route.app_id&&Array.isArray(applications)?applications.find(a=>a.app_id===route.app_id):null;
  const reviewed_section=app?.sections?.find(s=>s?.id===route.section_id);
  const reviewed_section_snapshot=reviewed_section?JSON.stringify(reviewed_section):null;
  const existing_content=app?assessExistingContent(text,app,{sectionId:route.section_id}):null;
  const placement=proposeUpdatePlacement(text,route,existing_content);
  const review=assessNaturalistReviewGates({route,placement,existing_content,extraction:extracted.entries[index].extraction});
  return {index,text,placement,review,reviewed_app_version:app?.version??null,reviewed_section_snapshot,source_block:extracted.entries[index].source_block,extraction:extracted.entries[index].extraction,route,existing_content,review_required:true,committed:false,published:false};
 });
 const duplicates=findBatchDuplicates(entries);
 for(const item of duplicates.items){
  entries[item.index].duplicate_of=item.duplicate_of;
  if(item.duplicate_of!==null){
   entries[item.index].review={...entries[item.index].review,flags:[...entries[item.index].review.flags,'duplicate-in-submission']};
  }
 }
 const conflicts=findBatchConflictSignals(entries);
 for(const signal of conflicts.items){
  for(const [index,related] of [[signal.index,signal.compared_with],[signal.compared_with,signal.index]]){
   const entry=entries[index];
   entry.review={...entry.review,flags:[...new Set([...entry.review.flags,'possible-scientific-conflict-in-submission'])]};
   entry.conflict_with=[...new Set([...(entry.conflict_with||[]),related])];
  }
 }
 return {valid:true,entries,conflict_signals:conflicts.items,requires_review:true,committed:false,published:false};
}
