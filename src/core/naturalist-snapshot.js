// JSON object member order is not meaningful; source strings and array order are.
// Shared by portable review recovery and read-only queue verification.
export function matchesNaturalistSnapshot(actual,expected){
 if(actual===expected)return true;
 if(actual===null||expected===null||typeof actual!=='object'||typeof expected!=='object')return false;
 if(Array.isArray(actual)!==Array.isArray(expected))return false;
 const keys=Object.keys(expected);
 if(Object.keys(actual).length!==keys.length)return false;
 if(Array.isArray(actual)){
  if(actual.length!==expected.length)return false;
  for(let i=0;i<expected.length;i++){
   if(!Object.hasOwn(actual,i)||!Object.hasOwn(expected,i))return false;
  }
 }
 return keys.every(key=>Object.hasOwn(actual,key)&&matchesNaturalistSnapshot(actual[key],expected[key]));
}
