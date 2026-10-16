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
 return {valid:errors.length===0,errors};
}
