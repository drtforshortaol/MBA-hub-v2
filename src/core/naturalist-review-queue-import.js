import {exportNaturalistReviewQueue} from './naturalist-review-queue-export.js';
import {matchesNaturalistSnapshot} from './naturalist-snapshot.js';
export function verifyNaturalistReviewQueue(packet,decisions,entries,fingerprint){
 if(!packet||typeof packet!=='object'||Array.isArray(packet))return {valid:false,reason:'invalid-packet',can_auto_publish:false};
 if(typeof fingerprint!=='string'||!fingerprint.trim()||packet.review_context_sha256!==fingerprint)return {valid:false,reason:'context-mismatch',can_auto_publish:false};
 if(packet.schema_version!==1||packet.kind!=='mba-v2-naturalist-review-queue'||packet.status!=='read-only')return {valid:false,reason:'unsupported-schema',can_auto_publish:false};
 if(['prepared','committed','published','can_auto_publish'].some(field=>!Object.hasOwn(packet,field)||packet[field]!==false))return {valid:false,reason:'unsafe-state',can_auto_publish:false};
 let expected;
 try{expected=exportNaturalistReviewQueue(decisions,entries,fingerprint);}catch{return {valid:false,reason:'invalid-review',can_auto_publish:false};}
 if(!matchesNaturalistSnapshot(packet,expected))return {valid:false,reason:'summary-mismatch',can_auto_publish:false};
 return {valid:true,reason:'verified-read-only',ready:expected.summary.ready,blocked:expected.summary.blocked,can_auto_publish:false};
}
