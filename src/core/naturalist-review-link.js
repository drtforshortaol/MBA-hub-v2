// Queue navigation returns to the statement's evidence and review controls.
// It never changes a decision or overrides a queue blocker.
export function renderNaturalistReviewLink(document,index,{isCurrentReview,showStatement,statementCards}){
 const button=document.createElement('button');
 button.type='button';button.className='button';button.textContent='Review statement '+(index+1);
 button.addEventListener('click',()=>{
  if(!isCurrentReview()||!Number.isInteger(index)||index<0||index>=statementCards.length)return;
  showStatement(index);
  const card=statementCards[index];
  // Move keyboard/screen-reader context with the visual jump. The summary is
  // already a native focus target; do not add a tab stop to the whole card.
  card.querySelector?.('summary')?.focus({preventScroll:true});
  card.scrollIntoView({block:'nearest'});
 });
 return button;
}
