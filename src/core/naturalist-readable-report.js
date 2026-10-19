import {validateReviewDecisions,reviewActionQueue,reviewProgress} from './naturalist-review-state.js';

// A human-readable snapshot, never an import packet or publication authority.
export function naturalistReadableReport(packet,replacements=[]){
 if(!packet||packet.kind!=='mba-v2-naturalist-review-packet'||typeof packet.original_source!=='string'||typeof packet.review_context_sha256!=='string'||!/^[a-f0-9]{64}$/.test(packet.review_context_sha256)||!validateReviewDecisions(packet.review_decisions,packet.entries))throw new TypeError('Invalid Naturalist review report');
 if(!Array.isArray(replacements))throw new TypeError('Invalid replacement text');
 const proposals=new Map();
 for(const pair of replacements){
  if(!Array.isArray(pair)||pair.length!==2)throw new TypeError('Invalid replacement text');
  const [index,text]=pair;
  if(!Number.isInteger(index)||index<0||index>=packet.entries.length||proposals.has(index)||typeof text!=='string'||text.length>20000)throw new TypeError('Invalid replacement text');
  proposals.set(index,text);
 }
 const queue=reviewActionQueue(packet.review_decisions,packet.entries),progress=reviewProgress(packet.review_decisions);
 const lines=['MBA Naturalist review report','READ-ONLY DRAFT — not publication authorization.','Scientific/editorial statuses below are reviewer annotations, not independent verification.','Classification fingerprint: '+packet.review_context_sha256,'Review decisions complete: '+progress.completed+' of '+progress.total,'Reviewed actions: '+queue.items.length+' queued; '+queue.blocked_items.length+' blocked. Queued actions still require draft validation.','','ORIGINAL SOURCE — preserved between the following markers','BEGIN ORIGINAL SOURCE',packet.original_source,'END ORIGINAL SOURCE',''];
 packet.entries.forEach((entry,index)=>{
  if(!entry||entry.index!==index||typeof entry.source_text!=='string')throw new TypeError('Invalid statement');
  const decision=packet.review_decisions[index],blocked=queue.blocked_items.find(item=>item.index===index),queued=queue.items.some(item=>item.index===index);
  let existing='No editable section snapshot recorded.';
  try{const section=JSON.parse(entry.reviewed_section_snapshot);if(typeof section?.text==='string')existing=section.text;}catch{/* unresolved placement has no section snapshot */}
  lines.push('STATEMENT '+(index+1),entry.source_text,'Destination: '+(entry.route?.app_id||'unresolved')+' / '+(entry.route?.section_id||'unresolved'),'Review flags: '+(entry.review?.flags?.join(', ')||'none detected; human review still required'),'Duplicate of: '+(Number.isInteger(entry.duplicate_of)?'statement '+(entry.duplicate_of+1):'none recorded'),'Potential conflict statements: '+((entry.conflict_with||[]).map(i=>i+1).join(', ')||'none recorded'),'Scientific status: '+decision.scientific_status,'Editorial status: '+decision.editorial_status,'Proposed action: '+decision.proposed_action,'Action queue: '+(blocked?'BLOCKED — '+blocked.block_reasons.join(', '):queued?'queued for draft validation':decision.proposed_action==='no-change'?'no change requested':'not queued; review incomplete'),'Reviewer notes:',decision.reviewer_notes||'(none)','CURRENT SECTION — classification snapshot',existing,'PROPOSED REPLACEMENT — unverified draft',proposals.get(index)?.trim()?proposals.get(index):'(no replacement text entered)','');
 });
 return lines.join('\n')+'\n';
}
