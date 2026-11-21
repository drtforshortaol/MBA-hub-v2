// Deterministic review gates; never treats routing as scientific approval.
export function assessNaturalistReviewGates(entry){
 if(!entry||typeof entry!=='object')return {valid:false,errors:['entry required']};
 const flags=[];
 if(entry.route?.action!=='update-existing')flags.push('placement-unresolved');
 if(entry.route?.action==='update-existing'&&!entry.route.section_id)flags.push('section-unresolved');
 if(entry.existing_content?.status==='exact-duplicate')flags.push('duplicate-existing-content');
 if(entry.existing_content?.status==='possible-overlap')flags.push('possible-content-overlap');
 if(entry.existing_content?.potential_conflict_signal==='negation-difference-review')flags.push('possible-scientific-conflict');
 if(entry.placement?.temporary_candidate)flags.push('time-sensitive-announcement');
 if(entry.extraction==='sentence-boundary')flags.push('statement-boundary-review');
 return {valid:true,flags,scientific_verification:'required',editorial_review:'required',approval_state:'pending',can_auto_publish:false,requires_review:true};
}
