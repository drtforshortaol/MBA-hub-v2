// Pure browser-safe conversion. No repository writes or publication.
import {validateDraft} from './content-drafts.js';
export function naturalistChangeRequest(draft,app){
 const checked=validateDraft(draft,app);
 if(!checked.valid)return {valid:false,errors:checked.errors,published:false};
 if(!Array.isArray(draft.section_edits)||draft.section_edits.length!==1)return {valid:false,errors:['one reviewed section edit required'],published:false};
 const request={schema_version:1,kind:'mba-v2-content-change-request',app_id:app.app_id,app_version:app.version,description:draft.description,section_edits:draft.section_edits.map(({id,title,text,caption})=>({id,title,text,caption})),photo_notes:[]};
 if(!request.description.trim())return {valid:false,errors:['source statement required'],published:false};
 return {valid:true,request,requires_review:true,committed:false,published:false,can_auto_publish:false};
}
