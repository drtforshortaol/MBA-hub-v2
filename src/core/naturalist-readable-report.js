import {hasNaturalistRelationshipFlag} from './naturalist-review-triage.js';
import {capturedNaturalistSection} from './naturalist-section-evidence.js';
import {validateReviewDecisions,reviewActionQueue,reviewProgress} from './naturalist-review-state.js';

// A human-readable snapshot, never an import packet or publication authority.
export function naturalistReadableReport(packet,replacements=[]){
 if(!packet||packet.kind!=='mba-v2-naturalist-review-packet'||typeof packet.original_source!=='string'||typeof packet.review_context_sha256!=='string'||!/^[a-f0-9]{64}$/.test(packet.review_context_sha256)||!validateReviewDecisions(packet.review_decisions,packet.entries))throw new TypeError('Invalid Naturalist review report');
 if(!Array.isArray(replacements))throw new TypeError('Invalid replacement text');
 // Avoid ambiguous, excessively large plain-text review exports.
 if(packet.original_source.length>1000000)throw new TypeError('Naturalist source exceeds report limit');
 const proposals=new Map();
 for(const pair of replacements){
  if(!Array.isArray(pair)||pair.length!==2)throw new TypeError('Invalid replacement text');
  const [index,text]=pair;
  if(!Number.isInteger(index)||index<0||index>=packet.entries.length||proposals.has(index)||typeof text!=='string'||text.length>20000)throw new TypeError('Invalid replacement text');
  proposals.set(index,text);
 }
 const queue=reviewActionQueue(packet.review_decisions,packet.entries),progress=reviewProgress(packet.review_decisions);
 const worklist=[];
 packet.entries.forEach((entry,index)=>{
  const decision=packet.review_decisions[index],reasons=[];
  if(decision.scientific_status!=='verified')reasons.push('scientific '+decision.scientific_status);
  if(decision.editorial_status!=='approved')reasons.push('editorial '+decision.editorial_status);
  if(decision.proposed_action==='needs-review')reasons.push('action needs-review');
  if(Array.isArray(entry?.review?.flags)&&entry.review.flags.length||hasNaturalistRelationshipFlag(packet.entries,index))reasons.push('classifier or relationship comparison required');
  const blocked=queue.blocked_items.find(item=>item.index===index);
  if(blocked)reasons.push('blocked: '+blocked.block_reasons.join(', '));
  if(reasons.length)worklist.push('Statement '+(index+1)+': '+reasons.join('; '));
 });
 const lines=['MBA Naturalist review report','READ-ONLY DRAFT — not publication authorization.','Scientific/editorial statuses below are reviewer annotations, not independent verification.','Classification fingerprint: '+packet.review_context_sha256,'Review decisions complete: '+progress.completed+' of '+progress.total,'Reviewed actions: '+queue.items.length+' queued; '+queue.blocked_items.length+' blocked. Queued actions still require draft validation.','','REVIEW WORKLIST — read-only navigation aid; grants no approval',...(worklist.length?worklist:['No incomplete, flagged or blocked statements. Draft validation and publication authorization remain separate.']),'','ORIGINAL SOURCE — preserved between the following markers','BEGIN ORIGINAL SOURCE',packet.original_source,'END ORIGINAL SOURCE',''];
 packet.entries.forEach((entry,index)=>{
  if(!entry||entry.index!==index||typeof entry.source_text!=='string')throw new TypeError('Invalid statement');
  const decision=packet.review_decisions[index],blocked=queue.blocked_items.find(item=>item.index===index),queued=queue.items.some(item=>item.index===index);
  let existing='No editable section snapshot recorded.',capturedTitle='unavailable',capturedCaption=null;
  const section=capturedNaturalistSection(entry);
  if(section){existing=section.text;if(typeof section.title==='string')capturedTitle=section.title;if(typeof section.caption==='string')capturedCaption=section.caption;}
  else if(entry.route?.action==='update-existing')existing='Existing section evidence is missing or does not match this destination. Regenerate the classification before approving this update.';
  const referencedBy=[];
  packet.entries.forEach((other,otherIndex)=>{
   if(otherIndex===index||!other)return;
   const reasons=[];
   if(other.duplicate_of===index)reasons.push('possible duplicate');
   if(Array.isArray(other.conflict_with)&&other.conflict_with.includes(index))reasons.push('potential conflict');
   if(reasons.length)referencedBy.push('statement '+(otherIndex+1)+' ('+reasons.join(', ')+')');
  });
  const context=typeof entry.source_block==='string'&&entry.source_block!==entry.source_text?['ORIGINAL SOURCE PARAGRAPH — classification context',entry.source_block]:[];
  lines.push('STATEMENT '+(index+1),entry.source_text,...context,'Destination: '+(entry.route?.app_id||'unresolved')+' / '+(entry.route?.section_id||'unresolved'),'Captured app version: '+(entry.reviewed_app_version??'unavailable'),'Captured section title: '+capturedTitle,'Review flags: '+(entry.review?.flags?.join(', ')||'none detected; human review still required'),'Duplicate of: '+(Number.isInteger(entry.duplicate_of)?'statement '+(entry.duplicate_of+1):'none recorded'),'Potential conflict statements: '+((entry.conflict_with||[]).map(i=>i+1).join(', ')||'none recorded'),'Referenced by: '+(referencedBy.join('; ')||'none recorded'),'Scientific status: '+decision.scientific_status,'Editorial status: '+decision.editorial_status,'Proposed action: '+decision.proposed_action,'Action queue: '+(blocked?'BLOCKED — '+blocked.block_reasons.join(', '):queued?'queued for draft validation':decision.proposed_action==='no-change'?'no change requested':'not queued; review incomplete'),'Reviewer notes:',decision.reviewer_notes||'(none)','CURRENT SECTION — classification snapshot',existing,...(capturedCaption===null?[]:['Captured caption:',capturedCaption]),'PROPOSED REPLACEMENT — unverified draft',proposals.get(index)?.trim()?proposals.get(index):'(no replacement text entered)','');
 });
 return lines.join('\n')+'\n';
}
