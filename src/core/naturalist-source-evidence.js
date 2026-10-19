// Read-only source evidence belongs beside review controls, outside diagnostics.
export function renderNaturalistSourceEvidence(document,entry){
 const evidence=document.createElement('section');
 evidence.setAttribute('aria-label','Full Naturalist statement');
 const heading=document.createElement('h5');heading.textContent='Statement to review';
 const statement=document.createElement('p');statement.textContent=entry.source_text;
 statement.style.whiteSpace='pre-wrap';statement.style.overflowWrap='anywhere';
 evidence.append(heading,statement);
 if(typeof entry.source_block==='string'&&entry.source_block!==entry.source_text){
  const context=document.createElement('details');
  const label=document.createElement('summary');label.textContent='Original source paragraph';
  const paragraph=document.createElement('p');paragraph.textContent=entry.source_block;
  paragraph.style.whiteSpace='pre-wrap';paragraph.style.overflowWrap='anywhere';
  context.append(label,paragraph);evidence.append(context);
 }
 return evidence;
}
