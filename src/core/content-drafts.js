// Developer-only, local drafts. Never changes published application data.
export const DRAFT_SCHEMA=1;
export function draftKey(namespace,appId){return namespace+':content-draft:'+appId;}
export function createDraft(app){return {schema_version:DRAFT_SCHEMA,kind:'mba-v2-local-content-draft',app_id:app.app_id,app_version:app.version,title:app.title,description:'',section_edits:[],updated_at:new Date().toISOString()};}
export function validateDraft(draft,app){
 const errors=[];
 if(!draft||typeof draft!=='object'||Array.isArray(draft))return {valid:false,errors:['Draft must be an object']};
 if(draft.schema_version!==DRAFT_SCHEMA||draft.kind!=='mba-v2-local-content-draft')errors.push('Unsupported draft schema');
 if(draft.app_id!==app?.app_id||draft.app_version!==app?.version)errors.push('Application identity or version mismatch');
 if(typeof draft.title!=='string'||!draft.title.trim()||draft.title.length>160)errors.push('Title must contain 1–160 characters');
 if(typeof draft.description!=='string'||draft.description.length>4000)errors.push('Description exceeds 4000 characters');
 if(draft.section_edits!==undefined){
  if(!Array.isArray(draft.section_edits)||draft.section_edits.length>(app?.sections?.length??0))errors.push('Invalid section edits');
  else{
   const ids=new Set(),allowed=new Map((app.sections||[]).map(s=>[s.id,s]));
   for(const edit of draft.section_edits){
    if(!edit||typeof edit!=='object'||Array.isArray(edit)||Object.keys(edit).some(k=>!['id','title','text','caption'].includes(k))||typeof edit.id!=='string'||!allowed.has(edit.id)||ids.has(edit.id)){errors.push('Invalid or duplicate section identifier');continue;}
    ids.add(edit.id);
    if(typeof edit.title!=='string'||!edit.title.trim()||edit.title.length>160)errors.push('Invalid section title');
    if(edit.text!==undefined&&(typeof edit.text!=='string'||edit.text.length>12000))errors.push('Invalid section text');
    if(typeof edit.caption!=='string'||edit.caption.length>2000)errors.push('Invalid section caption');
   }
  }
 }
 if(Object.keys(draft).some(key=>!['schema_version','kind','app_id','app_version','title','description','section_edits','updated_at'].includes(key)))errors.push('Unrecognized or protected fields');
 return {valid:errors.length===0,errors};
}
export function loadDraft(storage,namespace,app){try{const raw=storage.getItem(draftKey(namespace,app.app_id));if(!raw)return null;const draft=JSON.parse(raw);return validateDraft(draft,app).valid?draft:null;}catch{return null;}}
export function saveDraft(storage,namespace,app,draft){const result=validateDraft(draft,app);if(!result.valid)return result;try{storage.setItem(draftKey(namespace,app.app_id),JSON.stringify(draft));return result;}catch{return {valid:false,errors:['Local draft storage unavailable']};}}
