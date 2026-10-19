// Queue navigation returns to the statement's evidence and review controls.
// It never changes a decision or overrides a queue blocker.
export function renderNaturalistReviewLink(document,index,{isCurrentReview,showStatement,statementCards}){
 const button=document.createElement('button');
 button.type='button';button.className='button';button.textContent='Review statement '+(index+1);
 button.addEventListener('click',()=>{
  if(!isCurrentReview()||!Number.isInteger(index)||index<0||index>=statementCards.length)return;
  showStatement(index);
  statementCards[index].scrollIntoView({block:'nearest'});
 });
 return button;
}
