// Source/classification-bound text drafts. Review decisions remain separately owned.
const MAX_RECORD_LENGTH=2000000;
function storageKey(namespace,fingerprint){
 if(typeof namespace!=='string'||!/^mba-v2-[a-z0-9-]+$/.test(namespace)||typeof fingerprint!=='string'||! /^[a-f0-9]{64}$/.test(fingerprint))throw new TypeError('Invalid replacement draft context');
 return namespace+':naturalist-replacements:'+fingerprint;
}
function validDrafts(drafts,entries){
 if(!Array.isArray(drafts)||!Array.isArray(entries))return false;
 const seen=new Set();
 return drafts.every(pair=>{
  if(!Array.isArray(pair)||pair.length!==2)return false;
  const [index,text]=pair;
  if(!Number.isInteger(index)||index<0||index>=entries.length||seen.has(index)||entries[index]?.index!==index||entries[index]?.route?.action!=='update-existing'||typeof text!=='string'||!text.trim()||text.length>20000)return false;
  seen.add(index);return true;
 });
}
export function createReplacementBackup(fingerprint,entries,drafts){
 if(typeof fingerprint!=='string'||!/^[a-f0-9]{64}$/.test(fingerprint)||!validDrafts(drafts,entries))throw new TypeError('Invalid replacement draft backup');
 const packet={schema_version:1,kind:'mba-v2-naturalist-replacement-drafts',review_context_sha256:fingerprint,drafts:drafts.map(([index,text])=>[index,text]),can_auto_publish:false};
 if(new TextEncoder().encode(JSON.stringify(packet,null,2)+'\n').length>MAX_RECORD_LENGTH)throw new TypeError('Replacement backup exceeds recovery limit');
 return packet;
}
export function readReplacementBackup(text,fingerprint,entries){
 try{
  if(typeof text!=='string'||text.length>MAX_RECORD_LENGTH)return {valid:false,drafts:[]};
  const packet=JSON.parse(text);
  const expected=createReplacementBackup(fingerprint,entries,packet?.drafts);
  if(!packet||typeof packet!=='object'||Array.isArray(packet)||Object.keys(packet).length!==5||Object.keys(expected).some(key=>!Object.hasOwn(packet,key))||packet.schema_version!==expected.schema_version||packet.kind!==expected.kind||packet.review_context_sha256!==fingerprint||packet.can_auto_publish!==false)return {valid:false,drafts:[]};
  return {valid:true,drafts:expected.drafts};
 }catch{return {valid:false,drafts:[]};}
}
export function readReplacementDrafts(storage,namespace,fingerprint,entries){
 try{
  const raw=storage.getItem(storageKey(namespace,fingerprint));
  if(raw===null)return {valid:true,drafts:[]};
  if(typeof raw!=='string'||raw.length>MAX_RECORD_LENGTH)return {valid:false,drafts:[]};
  const packet=JSON.parse(raw);
  if(!packet||typeof packet!=='object'||Array.isArray(packet)||Object.keys(packet).length!==5||packet.schema_version!==1||packet.kind!=='mba-v2-naturalist-replacement-drafts'||packet.review_context_sha256!==fingerprint||packet.can_auto_publish!==false||!validDrafts(packet.drafts,entries))return {valid:false,drafts:[]};
  return {valid:true,drafts:packet.drafts.map(([index,text])=>[index,text])};
 }catch{return {valid:false,drafts:[]};}
}
export function saveReplacementDrafts(storage,namespace,fingerprint,entries,drafts){
 try{
  const key=storageKey(namespace,fingerprint);
  if(!validDrafts(drafts,entries))return false;
  if(!drafts.length){storage.removeItem(key);return storage.getItem(key)===null;}
  const raw=JSON.stringify({schema_version:1,kind:'mba-v2-naturalist-replacement-drafts',review_context_sha256:fingerprint,drafts,can_auto_publish:false});
  if(raw.length>MAX_RECORD_LENGTH)return false;
  storage.setItem(key,raw);
  const restored=readReplacementDrafts(storage,namespace,fingerprint,entries);
  return restored.valid&&JSON.stringify(restored.drafts)===JSON.stringify(drafts);
 }catch{return false;}
}
