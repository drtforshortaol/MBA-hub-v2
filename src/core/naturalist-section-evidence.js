// Classification evidence is read-only; it never supplies review authority.
export function renderNaturalistSectionEvidence(document,entry){
 if(entry.route?.action!=='update-existing')return null;
 const evidence=document.createElement('section');
 evidence.setAttribute('aria-label','Captured existing section');
 const add=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;node.style.whiteSpace='pre-wrap';node.style.overflowWrap='anywhere';evidence.append(node);};
 add('h5','Existing section — captured at classification');
 add('p','Destination: '+(entry.route.app_id||'unresolved')+' / '+(entry.route.section_id||'unresolved'));
 add('p','Captured app version: '+(entry.reviewed_app_version??'unavailable'));
 let section;
 try{section=JSON.parse(entry.reviewed_section_snapshot);}catch{/* Missing evidence requires fresh classification. */}
 if(!section||Array.isArray(section)||typeof section!=='object'||section.id!==entry.route.section_id||typeof section.text!=='string'||typeof entry.route.app_id!=='string'||!entry.route.app_id||entry.reviewed_app_version==null){
  add('p','Existing section evidence is missing or does not match this destination. Regenerate the classification before approving this update.');
  return evidence;
 }
 add('p','Captured title: '+(typeof section.title==='string'?section.title:'(no title recorded)'));
 add('p',section.text);
 if(typeof section.caption==='string')add('p','Captured caption: '+section.caption);
 add('p','This is the captured classification snapshot, not a live section lookup. Scientific and editorial review are still required.');
 return evidence;
}
