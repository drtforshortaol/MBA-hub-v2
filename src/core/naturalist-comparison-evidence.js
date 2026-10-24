import {renderNaturalistReviewLink} from './naturalist-review-link.js';

// Render the captured counterpart literally, with the same paragraph context
// available when the relationship is recorded in the opposite direction.
export function renderNaturalistComparisonEvidence(document,entry,other,index,controls){
 const row=document.createElement('div');
 const add=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;node.style.whiteSpace='pre-wrap';node.style.overflowWrap='anywhere';row.append(node);};
 add('strong','Statement '+(index+1)+(index===entry.duplicate_of?' — possible duplicate':' — potential conflict'));
 add('p','Current: '+entry.source_text);
 add('p','Compare: '+other.source_text);
 if(typeof other.source_block==='string'&&other.source_block!==other.source_text){
  add('p','Original source paragraph — classification context');add('p',other.source_block);
 }
 add('p','Other proposed placement: '+(other.placement?.target_app_id||'unresolved')+' / '+(other.placement?.target_section_id||'unresolved'));
 row.append(renderNaturalistReviewLink(document,index,controls));
 return row;
}
