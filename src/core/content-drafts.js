// Developer-only, local drafts. Never changes published application data.
export const DRAFT_SCHEMA=1;
export function draftKey(namespace,appId){return namespace+':content-draft:'+appId;}
export function createDraft(app){return {schema_version:DRAFT_SCHEMA,kind:'mba-v2-local-content-draft',app_id:app.app_id,app_version:app.version,title:app.title,description:'',updated_at:new Date().toISOString()};}
export function validateDraft(draft,app){
 const errors=[];
 if(!draft||typeof draft!=='object'||Array.isArray(draft))return {valid:false,errors:['Draft must be an object']};
 if(draft.schema_version!==DRAFT_SCHEMA||draft.kind!=='mba-v2-local-content-draft')errors.push('Unsupported draft schema');
 if(draft.app_id!==app?.app_id||draft.app_version!==app?.version)errors.push('Application identity or version mismatch');
 if(typeof draft.title!=='string'||!draft.title.trim()||draft.title.length>160)errors.push('Title must contain 1–160 characters');
 if(typeof draft.description!=='string'||draft.description.length>4000)errors.push('Description exceeds 4000 characters');
 if(Object.keys(draft).some(key=>!['schema_version','kind','app_id','app_version','title','description','updated_at'].includes(key)))errors.push('Unrecognized or protected fields');
 return {valid:errors.length===0,errors};
}
export function loadDraft(storage,namespace,app){try{const raw=storage.getItem(draftKey(namespace,app.app_id));if(!raw)return null;const draft=JSON.parse(raw);return validateDraft(draft,app).valid?draft:null;}catch{return null;}}
export function saveDraft(storage,namespace,app,draft){const result=validateDraft(draft,app);if(!result.valid)return result;try{storage.setItem(draftKey(namespace,app.app_id),JSON.stringify(draft));return result;}catch{return {valid:false,errors:['Local draft storage unavailable']};}}
