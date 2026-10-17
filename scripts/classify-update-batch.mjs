import {suggestContentDestination} from './suggest-content-destination.mjs';
// Read-only intake of independent update paragraphs; never alters source or manifests.
export function classifyUpdateBatch(input,applications){
 if(typeof input!=='string'||!input.trim())return {valid:false,errors:['update text required']};
 if(input.length>60000)return {valid:false,errors:['update exceeds intake limit']};
 const blocks=input.split(/\n\s*\n|\n(?=\s*[-*]\s+)/).map(s=>s.trim().replace(/^[-*]\s*/,'' )).filter(Boolean);
 const entries=blocks.map((text,index)=>{
  const route=suggestContentDestination(text,applications);
  return {index,text,route,review_required:true,committed:false,published:false};
 });
 return {valid:true,entries,requires_review:true,committed:false,published:false};
}
