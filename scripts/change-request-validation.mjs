export function validateChangeRequest(value,apps){
 const errors=[];
 if(!value||typeof value!=='object'||Array.isArray(value))return {valid:false,errors:['request must be an object']};
 if(value.schema_version!==1)errors.push('unsupported schema version');
 if(value.kind!=='mba-v2-content-change-request')errors.push('invalid request kind');
 if(typeof value.app_id!=='string'||!value.app_id.trim())errors.push('missing application ID');
 const app=Array.isArray(apps)?apps.find(a=>a.app_id===value.app_id):undefined;
 if(!app)errors.push('unknown application ID');
 if(!app||value.app_version!==app.version)errors.push('application version mismatch');
 if(typeof value.description!=='string'||!value.description.trim()||value.description.length>4000)errors.push('description must be 1–4000 characters');
 if(Object.keys(value).some(key=>!['schema_version','kind','app_id','app_version','description','proposed_title','section_edits'].includes(key)))errors.push('unrecognized request fields');
 if(value.proposed_title!==undefined&&(typeof value.proposed_title!=='string'||!value.proposed_title.trim()||value.proposed_title.length>160))errors.push('invalid proposed title');
 if(value.section_edits!==undefined){
  if(!Array.isArray(value.section_edits)||value.section_edits.length>(app?.sections?.length??0))errors.push('invalid section edits');
  else{
   const known=new Set((app.sections||[]).map(s=>s.id)),seen=new Set();
   for(const edit of value.section_edits){
    if(!edit||typeof edit!=='object'||Array.isArray(edit)||Object.keys(edit).some(k=>!['id','title','caption'].includes(k))||typeof edit.id!=='string'||!known.has(edit.id)||seen.has(edit.id)){errors.push('unknown, duplicate or protected section fields');continue;}
    seen.add(edit.id);
    if(typeof edit.title!=='string'||!edit.title.trim()||edit.title.length>160)errors.push('invalid section title');
    if(typeof edit.caption!=='string'||edit.caption.length>2000)errors.push('invalid section caption');
   }
  }
 }
 return {valid:errors.length===0,errors};
}
