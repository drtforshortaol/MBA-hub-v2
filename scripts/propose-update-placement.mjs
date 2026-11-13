// Review-only placement proposal. Never writes to an application manifest.
const TEMPORARY=/\b(?:opens?|opening|closes?|closing|tomorrow|today|tonight|next (?:week|month|year)|this (?:week|month|year)|schedule|scheduled|event|announcement|temporary|through (?:january|february|march|april|may|june|july|august|september|october|november|december))\b/i;
const AQUARIUM=/\b(?:aquarium|exhibit|gallery|visitor|admission|tickets?|hours|program)\b/i;
export function proposeUpdatePlacement(text,route,existingContent){
 if(typeof text!=='string'||!text.trim()||!route?.valid)return {valid:false,errors:['valid statement and route required']};
 const temporary=TEMPORARY.test(text)&&AQUARIUM.test(text);
 const duplicate=existingContent?.status==='exact-duplicate';
 let proposal_type,action,target_app_id=null,target_section_id=null;
 if(temporary){proposal_type='aquarium-update-candidate';action='review-announcement';}
 else if(route.action==='update-existing'&&route.app_id){
  target_app_id=route.app_id;
  if(route.section_id){proposal_type='existing-section';target_section_id=route.section_id;action=duplicate?'review-duplicate':'review-section-addition';}
  else {proposal_type='new-section-candidate';action='review-new-section';}
 }else{proposal_type='new-application-or-placement-candidate';action='review-placement';}
 return {valid:true,proposal_type,action,target_app_id,target_section_id,source_text:text,temporary_candidate:temporary,duplicate_candidate:duplicate,scientific_verification:'required',editorial_review:'required',contradiction_check:'not-performed',requires_review:true,prepared:false,committed:false,published:false};
}
