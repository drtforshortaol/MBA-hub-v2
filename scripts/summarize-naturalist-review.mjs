// Aggregate review flags without changing any entry or approving publication.
export function summarizeNaturalistReview(entries){
 if(!Array.isArray(entries))return {valid:false,errors:['entries array required']};
 const flags={};
 const placements={};
 let duplicates=0;
 let conflictedStatements=0;
 for(const entry of entries){
  if(!entry||typeof entry!=='object'||!entry.review||!Array.isArray(entry.review.flags))return {valid:false,errors:['reviewed entries required']};
  for(const flag of new Set(entry.review.flags))flags[flag]=(flags[flag]??0)+1;
  const placement=entry.placement?.proposal_type??'unresolved';
  placements[placement]=(placements[placement]??0)+1;
  if(entry.duplicate_of!==null&&entry.duplicate_of!==undefined)duplicates++;
  if(Array.isArray(entry.conflict_with)&&entry.conflict_with.length>0)conflictedStatements++;
 }
 return {valid:true,statement_count:entries.length,duplicate_statement_count:duplicates,conflicted_statement_count:conflictedStatements,review_flag_counts:flags,placement_counts:placements,scientific_verification:'required',editorial_review:'required',approval_state:'pending',can_auto_publish:false,published:false};
}
