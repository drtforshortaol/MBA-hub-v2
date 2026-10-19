// Navigation convenience only. This record contains no review decisions.
function positionKey(namespace,fingerprint){
 if(typeof namespace!=='string'||!/^mba-v2-[a-z0-9-]+$/.test(namespace)||typeof fingerprint!=='string'||!/^[a-f0-9]{64}$/.test(fingerprint))throw new TypeError('Invalid review position context');
 return namespace+':naturalist-position:'+fingerprint;
}
export function readNaturalistReviewPosition(storage,namespace,fingerprint,count){
 try{
  if(!Number.isInteger(count)||count<1)return 0;
  const record=JSON.parse(storage.getItem(positionKey(namespace,fingerprint))||'null');
  if(!record||typeof record!=='object'||Array.isArray(record)||Object.keys(record).length!==3||record.schema_version!==1||record.count!==count||!Number.isInteger(record.index)||record.index<0||record.index>=count)return 0;
  return record.index;
 }catch{return 0;}
}
export function saveNaturalistReviewPosition(storage,namespace,fingerprint,index,count){
 try{
  if(!Number.isInteger(count)||count<1||!Number.isInteger(index)||index<0||index>=count)return false;
  storage.setItem(positionKey(namespace,fingerprint),JSON.stringify({schema_version:1,index,count}));
  return readNaturalistReviewPosition(storage,namespace,fingerprint,count)===index;
 }catch{return false;}
}
