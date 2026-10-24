/** Draft-only Naturalist update intake. No publication or scientific approval. */
export function normalizeNaturalistUpdate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Update must be an object');
  const title = String(input.title ?? '').trim();
  const body = String(input.body ?? '').trim();
  if (!title || !body) throw new Error('Title and body are required');
  if (title.length > 160 || body.length > 20000) throw new Error('Update exceeds limits');
  const categories = [...new Set((Array.isArray(input.categories) ? input.categories : []).filter(x => typeof x === 'string').map(x => x.trim()).filter(Boolean))];
  return Object.freeze({title, body, categories, status:'draft', scientificApproval:'pending', publishable:false});
}

// Source-only exchange: re-import never restores approvals or classifications.
const INTAKE_FIELDS=new Set(['schema_version','kind','original_source','scientific_verification','editorial_review','approval_state','classified','committed','published']);
export function createNaturalistIntakePacket(source){
 if(typeof source!=='string'||!source.trim())throw new TypeError('Source notes are required');
 if(source.length>60000)throw new RangeError('Source exceeds intake limit');
 return {schema_version:1,kind:'mba-v2-naturalist-intake',original_source:source,scientific_verification:'required',editorial_review:'required',approval_state:'pending',classified:false,committed:false,published:false};
}
export function readNaturalistIntakePacket(packet){
 if(!packet||typeof packet!=='object'||Array.isArray(packet)||Object.keys(packet).some(key=>!INTAKE_FIELDS.has(key)))
  return {valid:false,reason:'invalid-intake',published:false};
 let expected;
 try{expected=createNaturalistIntakePacket(packet.original_source);}catch{return {valid:false,reason:'invalid-source',published:false};}
 if(Object.keys(expected).some(key=>packet[key]!==expected[key]))return {valid:false,reason:'invalid-review-state',published:false};
 return {valid:true,source:expected.original_source,requires_review:true,published:false,can_auto_publish:false};
}

export function naturalistSourceStorageKey(namespace){
 if(typeof namespace!=='string'||!/^mba-v2-[a-z0-9-]+$/.test(namespace))throw new TypeError('Invalid source storage namespace');
 return namespace+':naturalist-source';
}
export function readNaturalistSource(storage,namespace){
 try{return readNaturalistIntakePacket(JSON.parse(storage.getItem(naturalistSourceStorageKey(namespace))||'null'));}
 catch{return {valid:false,reason:'source-unavailable',published:false};}
}
export function saveNaturalistSource(storage,namespace,source){
 try{
  const key=naturalistSourceStorageKey(namespace);
  if(typeof source!=='string')return false;
  if(!source.trim()){storage.removeItem(key);return storage.getItem(key)===null;}
  const packet=createNaturalistIntakePacket(source);
  storage.setItem(key,JSON.stringify(packet));
  const restored=readNaturalistSource(storage,namespace);
  return restored.valid&&restored.source===source;
 }catch{return false;}
}
export function discardNaturalistSource(storage,namespace){return saveNaturalistSource(storage,namespace,'');}
