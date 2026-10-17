import {suggestContentDestination} from './suggest-content-destination.mjs';
import {prepareChangeRequest} from './prepare-change-request.mjs';

// Draft-only orchestration. Content text is never silently rewritten or published.
export function prepareAutomaticUpdate(update,applications,{replacementText}={}){
 const routing=suggestContentDestination(update,applications);
 if(!routing.valid)return routing;
 if(routing.action!=='update-existing')return {...routing,prepared:false};
 const app=applications.find(item=>item.app_id===routing.app_id);
 if(!app)return {valid:false,errors:['selected application not found']};
 if(!routing.section_id)return {...routing,action:'review-section',prepared:false,reason:'no matching existing section'};
 const section=app.sections?.find(item=>item.id===routing.section_id);
 if(!section||typeof section.text!=='string')return {...routing,action:'review-section',prepared:false,reason:'section is not editable text'};
 if(typeof replacementText!=='string'||!replacementText.trim())return {...routing,action:'review-content',prepared:false,reason:'verified replacement text required'};
 const request={schema_version:1,kind:'mba-v2-content-change-request',app_id:app.app_id,app_version:app.version,description:update,section_edits:[{id:section.id,title:section.title,caption:section.caption??'',text:replacementText}],photo_notes:[]};
 const proposal=prepareChangeRequest(request,app);
 return {...routing,prepared:proposal.valid,request,proposal,requires_review:true,published:false};
}
