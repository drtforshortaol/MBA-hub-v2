import {suggestContentDestination} from './suggest-content-destination.mjs';
import {assessExistingContent} from './assess-existing-content.mjs';
// Read-only intake of independent update paragraphs; never alters source or manifests.
export function classifyUpdateBatch(input,applications){
 if(typeof input!=='string'||!input.trim())return {valid:false,errors:['update text required']};
 if(input.length>60000)return {valid:false,errors:['update exceeds intake limit']};
 const blocks=input.split(/\n\s*\n|\n(?=\s*[-*]\s+)/).map(s=>s.trim().replace(/^[-*]\s*/,'' )).filter(Boolean);
 const entries=blocks.map((text,index)=>{
  const route=suggestContentDestination(text,applications);
  const app=route.app_id&&Array.isArray(applications)?applications.find(a=>a.app_id===route.app_id):null;
  const existing_content=app?assessExistingContent(text,app,{sectionId:route.section_id}):null;
  return {index,text,route,existing_content,review_required:true,committed:false,published:false};
 });
 return {valid:true,entries,requires_review:true,committed:false,published:false};
}
