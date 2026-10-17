// Conservative statement extraction for review-only Naturalist intake.
// Only split on explicit sentence boundaries; ambiguous text remains intact.
export function extractUpdateStatements(input){
 if(typeof input!=='string'||!input.trim())return {valid:false,errors:['update text required']};
 if(input.length>60000)return {valid:false,errors:['update exceeds intake limit']};
 const blocks=input.split(/\n\s*\n|\n(?=\s*[-*]\s+)/);
 const entries=[];
 for(const block of blocks){
  const original=block.trim().replace(/^[-*]\s*/,'');
  if(!original)continue;
  // Preserve abbreviations and uncertain boundaries rather than risking false segmentation.
  const ambiguous=/\b(?:Dr|Mr|Mrs|Ms|Prof|St|vs|e\.g|i\.e)\./i.test(original);
  const parts=ambiguous?[original]:original.split(/(?<=[.!?])\s+(?=[A-Z][a-z])/);
  for(const text of parts){
   if(text.trim())entries.push({text:text.trim(),source_block:original,extraction:parts.length>1?'sentence-boundary':'original-block',requires_review:true});
  }
 }
 return {valid:true,entries,requires_review:true,published:false};
}
