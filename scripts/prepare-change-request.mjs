import {validateChangeRequest} from './change-request-validation.mjs';

// Pure proposal builder. No filesystem, GitHub, or release mutations.
export function prepareChangeRequest(request,app){
 const validation=validateChangeRequest(request,[app]);
 if(!validation.valid)return {valid:false,errors:validation.errors};
 const next=structuredClone(app);
 const changes=[];
 if(request.proposed_title!==undefined&&request.proposed_title!==app.title){
  next.title=request.proposed_title;changes.push('title');
 }
 for(const edit of request.section_edits||[]){
  const section=next.sections.find(item=>item.id===edit.id);
  for(const key of ['title','text','caption']){
   if(Object.hasOwn(edit,key)&&section[key]!==edit[key]){
    section[key]=edit[key];changes.push('section:'+edit.id+':'+key);
   }
  }
 }
 // Image metadata is a review proposal only. No asset or manifest mutation.
 const photoProposals=(request.photo_notes||[]).filter(note=>note.caption.trim()||note.alt_text.trim());
 return {valid:true,errors:[],app_id:app.app_id,app_version:app.version,changes,proposed_manifest:next,photo_proposals:photoProposals,requires_review:true,published:false};
}
