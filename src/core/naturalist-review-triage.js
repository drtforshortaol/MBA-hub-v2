// Relationship endpoints need comparison even when only the counterpart carries
// a classifier flag. This navigation hint grants no approval and mutates nothing.
export function hasNaturalistRelationshipFlag(entries,index){
 if(!Array.isArray(entries)||!Number.isInteger(index)||index<0||index>=entries.length||!entries[index])return false;
 const entry=entries[index],valid=other=>Number.isInteger(other)&&other>=0&&other<entries.length&&other!==index;
 if(valid(entry.duplicate_of)||Array.isArray(entry.conflict_with)&&entry.conflict_with.some(valid))return true;
 return entries.some((other,i)=>i!==index&&other&&(other.duplicate_of===index||Array.isArray(other.conflict_with)&&other.conflict_with.includes(index)));
}
