// Pure, read-only Naturalist review queue export. No staging or publication.
import {reviewActionQueue} from './naturalist-review-state.js';
export function exportNaturalistReviewQueue(decisions,entries,fingerprint){
 if(typeof fingerprint!=='string'||!fingerprint.trim())throw new TypeError('A review fingerprint is required');
 const queue=reviewActionQueue(decisions,entries);
 if(!queue.valid)throw new TypeError('Invalid review decisions');
 const project=item=>({
  index:item.index,
  action:item.action,
  reviewer_notes:item.reviewer_notes,
  ...(item.block_reasons?{block_reasons:[...item.block_reasons]}:{})
 });
 return {
  schema_version:1,
  kind:'mba-v2-naturalist-review-queue',
  review_context_sha256:fingerprint,
  status:'read-only',
  prepared:false,
  committed:false,
  published:false,
  can_auto_publish:false,
  summary:{ready:queue.items.length,blocked:queue.blocked_items.length,review_state:queue.reason},
  ready_items:queue.items.map(project),
  blocked_items:queue.blocked_items.map(project)
 };
}
