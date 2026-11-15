import {renderNaturalistReviewLink} from './naturalist-review-link.js';

// Queue blockers treat relationships as undirected. Show the original statement
// the corresponding evidence even when only its counterpart records the link.
export function renderNaturalistReferencedEvidence(document,entry,entries,controls){
 const rows=[];
 entries.forEach((other,index)=>{
  if(!other||index===entry.index)return;
  const duplicate=other.duplicate_of===entry.index&&entry.duplicate_of!==index;
  const conflict=Array.isArray(other.conflict_with)&&other.conflict_with.includes(entry.index)&&
   !(Array.isArray(entry.conflict_with)&&entry.conflict_with.includes(index));
  if(!duplicate&&!conflict)return;
  const row=document.createElement('div');
  const add=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;node.style.whiteSpace='pre-wrap';node.style.overflowWrap='anywhere';row.append(node);};
  add('h5','Statement '+(index+1)+' — '+[...(duplicate?['possible duplicate']:[]),...(conflict?['potential conflict']:[])].join(' and '));
  add('p',other.source_text);
  if(typeof other.source_block==='string'&&other.source_block!==other.source_text){
   add('p','Original source paragraph — classification context');add('p',other.source_block);
  }
  add('p','Proposed destination: '+(other.route?.app_id||'unresolved')+' / '+(other.route?.section_id||'unresolved'));
  row.append(renderNaturalistReviewLink(document,index,controls));rows.push(row);
 });
 if(!rows.length)return null;
 const section=document.createElement('section');section.setAttribute('aria-label','Statements referencing this source');
 const heading=document.createElement('h5');heading.textContent='Related evidence recorded by other statements';
 const warning=document.createElement('p');warning.textContent='These recorded relationships require comparison. Showing this evidence changes no scientific or editorial decision.';
 section.append(heading,warning,...rows);return section;
}
