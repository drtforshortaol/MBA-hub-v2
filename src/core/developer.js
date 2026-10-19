import {readReplacementDrafts,saveReplacementDrafts,createReplacementBackup,readReplacementBackup} from './naturalist-replacement-drafts.js';
import {naturalistReadableReport} from './naturalist-readable-report.js';
import {createNaturalistIntakePacket,readNaturalistIntakePacket,readNaturalistSource,saveNaturalistSource,discardNaturalistSource} from './naturalist-intake.js';
import {naturalistChangeRequest} from './naturalist-change-request.js';
import {exportNaturalistReviewQueue} from './naturalist-review-queue-export.js';
import {verifyNaturalistReviewQueue} from './naturalist-review-queue-import.js';
import {createDraft,loadDraft,saveDraft,validateDraft} from './content-drafts.js';
import {request} from './worker-channel.js';
import {newReviewDecisions,validateReviewDecisions,reviewProgress,reviewStorageKey,readReview,writeReview,importReviewPacket,reviewRecoveryCheck,reviewActionQueue} from './naturalist-review-state.js';
import {renderNaturalistSourceEvidence} from './naturalist-source-evidence.js';
import {readNaturalistReviewPosition,saveNaturalistReviewPosition} from './naturalist-review-position.js';
const env=await fetch('environment.json').then(r=>r.json());if(!env.developer)throw Error('Developer module prohibited in this environment');
const panel=document.querySelector('#developer'),title=document.querySelector('#title');let taps=0,last=0;
title.addEventListener('click',()=>{if(Date.now()-last>2200)taps=0;last=Date.now();if(++taps===5){taps=0;panel.hidden=!panel.hidden;if(!panel.hidden)render();}});
async function render(){panel.replaceChildren(...[['h2','Developer mode'],['p','Diagnostics only. Publishing authority remains outside this app.'],['button','Update Now','update'],['button','Repair offline files','repair'],['details','','diagnostics-details'],['h2','Application inventory'],['label','Filter applications'],['input','','app-filter'],['div','','app-inventory'],['div','','app-details'],['h2','Tasks'],['label','Capture an item to fix later'],['input','','task'],['button','Add task','add'],['div','','tasks']].map(([tag,label,id])=>{const el=document.createElement(tag);if(id)el.id=id;if(tag==='label')el.htmlFor=label==='Filter applications'?'app-filter':'task';if(tag==='p')el.className='quiet';if(tag==='button')el.className='button';if(tag!=='input')el.textContent=label;return el;}));

 const diagnosticsDetails=document.querySelector('#diagnostics-details');
 const diagnosticsLabel=document.createElement('summary');diagnosticsLabel.textContent='Technical diagnostics (tap to expand)';
 const diagnosticsOutput=document.createElement('pre');diagnosticsOutput.id='diagnostics';diagnosticsOutput.textContent='Checking…';
 diagnosticsDetails.append(diagnosticsLabel,diagnosticsOutput);

 // Naturalist intake and classification are local and review-only.
 // Browser engine is built from the canonical Node processing modules.
 const intake=document.createElement('section');
 const intakeTitle=document.createElement('h3');intakeTitle.textContent='Naturalist update intake';
 const intakeHint=document.createElement('p');intakeHint.className='quiet';intakeHint.textContent='Paste the full Naturalist update. Download a source-preserving intake request for scientific and editorial review. This does not classify, approve, or publish content.';
 const intakeLabel=document.createElement('label');intakeLabel.htmlFor='naturalist-source';intakeLabel.textContent='Naturalist source notes';
 const intakeText=document.createElement('textarea');intakeText.id='naturalist-source';intakeText.rows=8;intakeText.maxLength=60000;intakeText.style.width='100%';
 const intakeStatus=document.createElement('p');intakeStatus.setAttribute('role','status');
 const intakeButton=document.createElement('button');intakeButton.type='button';intakeButton.className='button';intakeButton.textContent='Download review intake';
 intakeButton.addEventListener('click',()=>{
  const source=intakeText.value;
  if(!source.trim()){intakeStatus.textContent='Source notes are required.';return;}
  let payload;
  try{payload=createNaturalistIntakePacket(source);}catch(error){intakeStatus.textContent=error.message;return;}
  const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='mba-naturalist-intake.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  intakeStatus.textContent='Review intake downloaded. No content or repository changed.';
 });
 intake.append(intakeTitle,intakeHint,intakeLabel,intakeText,intakeButton,intakeStatus);
 panel.insertBefore(intake,document.querySelector('#app-inventory').previousSibling);

 const reviewButton=document.createElement('button');reviewButton.type='button';reviewButton.className='button';reviewButton.textContent='Generate review packet';
 const reviewOutput=document.createElement('div');reviewOutput.setAttribute('aria-live','polite');
 intake.insertBefore(reviewButton,intakeStatus);intake.insertBefore(reviewOutput,intakeStatus);
 // Invalidate generated decisions immediately when their source changes.
 intakeText.addEventListener('input',()=>{activeReviewGeneration++;reviewOutput.replaceChildren();delete reviewOutput.dataset.reviewFingerprint;intakeStatus.textContent='Source changed. Generate a new review packet before downloading.';});
 let activeReviewGeneration=0;
 let activeIntakeImport=0,requireFreshIntakeReview=false;
 const recoveryStatus=document.createElement('p');recoveryStatus.setAttribute('role','status');
 const restoreSourceButton=document.createElement('button');restoreSourceButton.type='button';restoreSourceButton.className='button';restoreSourceButton.textContent='Restore saved source';
 const discardSourceButton=document.createElement('button');discardSourceButton.type='button';discardSourceButton.className='button';discardSourceButton.textContent='Discard saved source';
 let recoveredSource=null;
 try{const recovered=readNaturalistSource(localStorage,env.namespace);if(recovered.valid)recoveredSource=recovered.source;}catch{/* device storage may be unavailable */}
 const updateSourceRecovery=()=>{restoreSourceButton.disabled=recoveredSource===null||intakeText.value===recoveredSource;discardSourceButton.disabled=recoveredSource===null;};
 recoveryStatus.textContent=recoveredSource===null?'Source notes are saved on this device as you type.':'Saved source available on this device. Restore it to begin a fresh review.';
 updateSourceRecovery();
 intake.insertBefore(recoveryStatus,intakeStatus);intake.insertBefore(restoreSourceButton,intakeStatus);intake.insertBefore(discardSourceButton,intakeStatus);
 intakeText.addEventListener('input',()=>{
  let saved=false;try{saved=saveNaturalistSource(localStorage,env.namespace,intakeText.value);}catch{/* storage may be blocked */}
  if(saved){recoveredSource=intakeText.value.trim()?intakeText.value:null;recoveryStatus.textContent=recoveredSource===null?'Saved source cleared.':'Source saved on this device. Review approvals are separate.';}
  else recoveryStatus.textContent='Source could not be saved on this device. Download the review intake to keep a copy.';
  updateSourceRecovery();
 });
 restoreSourceButton.addEventListener('click',()=>{
  if(recoveredSource===null)return;
  requireFreshIntakeReview=true;intakeText.value=recoveredSource;intakeText.dispatchEvent(new Event('input'));
  intakeStatus.textContent='Saved source restored. Generate a new packet and review every statement.';
 });
 discardSourceButton.addEventListener('click',()=>{
  let discarded=false;try{discarded=discardNaturalistSource(localStorage,env.namespace);}catch{/* storage may be blocked */}
  if(discarded){recoveredSource=null;recoveryStatus.textContent='Saved source discarded. Current notes remain available until you leave.';}
  else recoveryStatus.textContent='Saved source could not be discarded on this device.';
  updateSourceRecovery();
 });
 const importIntakeLabel=document.createElement('label');importIntakeLabel.htmlFor='naturalist-intake-import';importIntakeLabel.textContent='Restore source from review intake JSON';
 const importIntakeFile=document.createElement('input');importIntakeFile.type='file';importIntakeFile.id='naturalist-intake-import';importIntakeFile.accept='.json,application/json';
 intake.insertBefore(importIntakeLabel,intakeStatus);intake.insertBefore(importIntakeFile,intakeStatus);
 importIntakeFile.addEventListener('change',async()=>{
  const importGeneration=++activeIntakeImport,generation=activeReviewGeneration,source=intakeText.value;
  const file=importIntakeFile.files?.[0];if(!file)return;
  try{
   if(file.size>400000)throw new Error('Intake file exceeds the source packet limit.');
   const restored=readNaturalistIntakePacket(JSON.parse(await file.text()));
   // Never overwrite notes or a newer selected intake while file reading was pending.
   if(importGeneration!==activeIntakeImport||generation!==activeReviewGeneration||intakeText.value!==source)return;
   if(!restored.valid)throw new Error('Invalid intake source or review state.');
   requireFreshIntakeReview=true;
   intakeText.value=restored.source;
   intakeText.dispatchEvent(new Event('input'));
   intakeStatus.textContent='Source restored. Generate a new review packet; scientific and editorial review remain required.';
  }catch(error){
   if(importGeneration===activeIntakeImport&&generation===activeReviewGeneration&&intakeText.value===source)intakeStatus.textContent=error.message;
  }finally{if(importGeneration===activeIntakeImport)importIntakeFile.value='';}
 });
 reviewButton.addEventListener('click',async()=>{
  const generation=++activeReviewGeneration;
  reviewOutput.replaceChildren();
  const source=intakeText.value;
  if(!source.trim()){intakeStatus.textContent='Source notes are required.';return;}
  intakeStatus.textContent='Preparing review-only classification…';
  try{
   const [{classifyUpdateBatch},{summarizeNaturalistReview}]=await Promise.all([
    import('./naturalist-engine/classify-update-batch.js'),
    import('./naturalist-engine/summarize-naturalist-review.js')
   ]);
   if(generation!==activeReviewGeneration||intakeText.value!==source)return;
   const result=classifyUpdateBatch(source,registry.apps);
   if(!result.valid){intakeStatus.textContent=(result.errors||['Invalid source']).join('; ');return;}
   if(generation!==activeReviewGeneration||intakeText.value!==source)return;
   const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',original_source:source,review_summary:summarizeNaturalistReview(result.entries),conflict_signals:result.conflict_signals,entries:result.entries.map(entry=>({index:entry.index,duplicate_of:entry.duplicate_of,conflict_with:entry.conflict_with??[],source_text:entry.text,text:entry.text,source_block:entry.source_block,extraction:entry.extraction,reviewed_source_snapshot:entry.reviewed_source_snapshot,route:entry.route,reviewed_app_version:entry.reviewed_app_version,reviewed_section_snapshot:entry.reviewed_section_snapshot,placement:entry.placement,review:entry.review,existing_content:entry.existing_content,review_required:true})),scientific_verification:'required',editorial_review:'required',requires_review:true,prepared:false,committed:false,published:false};
   // Review decisions are annotations only: never mutate canonical classifications.
   // Include the classification outcome in the review key: a registry or routing
   // change must not silently reattach decisions to different proposed targets.
   const reviewIdentity=JSON.stringify({source,entries:packet.entries.map(e=>({text:e.source_text,placement:e.placement,review_flags:e.review.flags,conflict_with:e.conflict_with,duplicate_of:e.duplicate_of,existing_content:e.existing_content,route:e.route,app_version:e.reviewed_app_version,section_snapshot:e.reviewed_section_snapshot,source_snapshot:e.reviewed_source_snapshot}))});
   const sourceFingerprint=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(reviewIdentity)).then(bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join(''));
   if(generation!==activeReviewGeneration||intakeText.value!==source){intakeStatus.textContent='Source or review generation changed while classification was running. Generate again.';return;}
   const reviewKey=reviewStorageKey(env.namespace,sourceFingerprint);
   const legacySourceFingerprint=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source)).then(bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join(''));
   const legacyReviewKey=reviewStorageKey(env.namespace,legacySourceFingerprint);
   if(generation!==activeReviewGeneration||intakeText.value!==source)return;
   packet.review_context_sha256=sourceFingerprint;
   packet.review_decisions=newReviewDecisions(packet.entries);
   let saved=null;
   if(!requireFreshIntakeReview){try{saved=readReview(localStorage,reviewKey,sourceFingerprint,packet.entries);}catch{/* Browser storage can be disabled; packet remains downloadable. */}}
   if(saved)packet.review_decisions=saved;
   function reviewDecisionSummary(){
    const progress=reviewRecoveryCheck(packet.review_decisions,packet.entries);
    return progress.valid?progress.completed+' of '+progress.total+' scientifically verified, editorially approved, and assigned an action; '+progress.revisions+' flagged for revision. Status: '+progress.reason+'. Publication remains disabled.':'Invalid review decisions. Publication remains disabled.';
   }
   const reviewProgressDisplay=document.createElement('p');reviewProgressDisplay.setAttribute('role','status');
   const updateReviewSummary=()=>{reviewProgressDisplay.textContent=reviewDecisionSummary();};
   updateReviewSummary();
   reviewOutput.append(reviewProgressDisplay);
   const validateDecisions=()=>validateReviewDecisions(packet.review_decisions,packet.entries);
   // Retire legacy source-only review keys without importing their decisions:
   // the old key did not bind approvals to the current routing context.
   if(legacyReviewKey!==reviewKey){try{localStorage.removeItem(legacyReviewKey);}catch{/* storage may be unavailable */}}
   const isCurrentReview=()=>generation===activeReviewGeneration&&intakeText.value===source&&reviewOutput.dataset.reviewFingerprint===sourceFingerprint;
   reviewOutput.dataset.reviewFingerprint=sourceFingerprint;
   const saveReview=()=>{
    if(!isCurrentReview()){intakeStatus.textContent='Review no longer current. Regenerate before saving.';return;}
    if(!validateDecisions()){intakeStatus.textContent='Review decisions invalid. Nothing saved.';return;}
    const savedCurrentReview=writeReview(localStorage,reviewKey,sourceFingerprint,packet.review_decisions,packet.entries);
    if(savedCurrentReview)requireFreshIntakeReview=false;
    intakeStatus.textContent=savedCurrentReview?'Review decisions saved on this device. Publication remains disabled.':'Local storage unavailable; download the review packet to retain decisions.';
    if(typeof showQueue==='function')showQueue();
   };
   const navigation=document.createElement('div');
   navigation.setAttribute('role','group');
   navigation.setAttribute('aria-label','Naturalist statement navigation');
   const previous=document.createElement('button');previous.type='button';previous.className='button';previous.textContent='Previous statement';
   const next=document.createElement('button');next.type='button';next.className='button';next.textContent='Next statement';
   const position=document.createElement('span');position.setAttribute('role','status');
   const statementCards=[];
   let activeStatement=0;
   function showStatement(index){
    if(!statementCards.length)return;
    activeStatement=Math.max(0,Math.min(index,statementCards.length-1));
    for(let i=0;i<statementCards.length;i++){statementCards[i].hidden=i!==activeStatement;statementCards[i].open=i===activeStatement;}
    previous.disabled=activeStatement===0;next.disabled=activeStatement===statementCards.length-1;
    position.textContent=' Statement '+(activeStatement+1)+' of '+statementCards.length+' ';
    if(jumpToStatement)jumpToStatement.value=String(activeStatement);
    try{saveNaturalistReviewPosition(localStorage,env.namespace,sourceFingerprint,activeStatement,statementCards.length);}catch{/* Navigation works without device storage. */}
   }
   previous.addEventListener('click',()=>{if(isCurrentReview())showStatement(activeStatement-1);});
   next.addEventListener('click',()=>{if(isCurrentReview())showStatement(activeStatement+1);});
   const nextPending=document.createElement('button');nextPending.type='button';nextPending.className='button';nextPending.textContent='Next incomplete review';
   const incomplete=index=>{const decision=packet.review_decisions[index];return decision.scientific_status!=='verified'||decision.editorial_status!=='approved'||decision.proposed_action==='needs-review';};
   nextPending.addEventListener('click',()=>{
    if(!isCurrentReview())return;
    const count=statementCards.length;
    for(let offset=1;offset<=count;offset++){
     const index=(activeStatement+offset)%count;
     if(incomplete(index)){showStatement(index);statementCards[index]?.scrollIntoView({block:'nearest'});return;}
    }
    intakeStatus.textContent='All statements have scientific, editorial, and action decisions recorded. Publication remains disabled.';
   });
   const nextFlagged=document.createElement('button');nextFlagged.type='button';nextFlagged.className='button';nextFlagged.textContent='Next flagged statement';
   nextFlagged.addEventListener('click',()=>{
    if(!isCurrentReview())return;
    const count=statementCards.length;
    for(let offset=1;offset<=count;offset++){
     const index=(activeStatement+offset)%count;
     const entry=packet.entries[index];
     if(entry.review.flags.length||entry.duplicate_of!==null&&entry.duplicate_of!==undefined){
      showStatement(index);statementCards[index]?.scrollIntoView({block:'nearest'});return;
     }
    }
    intakeStatus.textContent='No automatically flagged statements. Scientific and editorial review is still required.';
   });
   const nextRevision=document.createElement('button');nextRevision.type='button';nextRevision.className='button';nextRevision.textContent='Next needs-revision decision';
   nextRevision.addEventListener('click',()=>{
    if(!isCurrentReview())return;
    const count=statementCards.length;
    for(let offset=1;offset<=count;offset++){
     const index=(activeStatement+offset)%count;
     const decision=packet.review_decisions[index];
     if(decision.scientific_status==='needs-revision'||decision.editorial_status==='needs-revision'){
      showStatement(index);statementCards[index]?.scrollIntoView({block:'nearest'});return;
     }
    }
    intakeStatus.textContent='No reviewer-marked revision decisions in this packet.';
   });
   const jumpToStatement=document.createElement('select');jumpToStatement.setAttribute('aria-label','Jump to statement');
   packet.entries.forEach((entry,index)=>{
    const option=document.createElement('option');option.value=String(index);
    option.textContent=(index+1)+'. '+entry.source_text.slice(0,65);
    jumpToStatement.append(option);
   });
   jumpToStatement.addEventListener('change',()=>{
    if(!isCurrentReview())return;
    const index=Number(jumpToStatement.value);
    if(Number.isInteger(index)&&index>=0&&index<statementCards.length){showStatement(index);statementCards[index]?.scrollIntoView({block:'nearest'});}
   });
   navigation.append(previous,position,next,nextPending,nextFlagged,nextRevision,jumpToStatement);
   const heading=document.createElement('h4');heading.textContent='Proposed updates — review required';
   const summary=document.createElement('p');summary.textContent=packet.review_summary.statement_count+' statements; '+packet.review_summary.duplicate_statement_count+' repeated within submission; '+(packet.conflict_signals?.length??0)+' potential scientific conflict pairs. All findings require human review.';
   reviewOutput.append(heading,summary);
   for(const entry of packet.entries){
    const item=document.createElement('details'),label=document.createElement('summary'),body=document.createElement('p'),flags=document.createElement('p');
    label.textContent=(entry.index+1)+'. '+entry.source_text.slice(0,130);
    body.textContent='Proposed: '+entry.placement.proposal_type+' · App: '+(entry.placement.target_app_id||'unresolved')+' · Section: '+(entry.placement.target_section_id||'unresolved');
    flags.textContent='Review flags: '+(entry.review.flags.join(', ')||'none detected; scientific review still required');
    const details=document.createElement('dl');
    const fields=[
     ['Original source block',entry.source_block],
     ['Extraction method',entry.extraction],
     ['Duplicate of statement',entry.duplicate_of===null||entry.duplicate_of===undefined?'None':String(entry.duplicate_of+1)],
     ['Potentially conflicting statements',(entry.conflict_with||[]).length?entry.conflict_with.map(index=>index+1).join(', '):'None detected'],
     ['Existing-content assessment',entry.existing_content],
     ['Placement assessment',entry.placement],
     ['Scientific and editorial review',entry.review]
    ];
    for(const [name,value] of fields){
     const dt=document.createElement('dt'),dd=document.createElement('dd');
     dt.textContent=name;
     dd.textContent=value===null||value===undefined?'Not available':typeof value==='object'?JSON.stringify(value,null,2):String(value);
     dd.style.whiteSpace='pre-wrap';dd.style.overflowWrap='anywhere';
     details.append(dt,dd);
    }
    // Present canonical existing-content evidence before proposing a change.
    const existingComparison=document.createElement('section');
    existingComparison.setAttribute('aria-label','Existing content comparison');
    const existingHeading=document.createElement('h5');existingHeading.textContent='Compare with existing content';
    const existingSource=document.createElement('p');existingSource.textContent='Naturalist statement: '+entry.source_text;
    const existingAssessment=document.createElement('pre');existingAssessment.style.whiteSpace='pre-wrap';existingAssessment.style.overflowWrap='anywhere';
    existingAssessment.textContent='Classifier assessment: '+JSON.stringify(entry.existing_content??null,null,2);
    const existingTarget=document.createElement('p');existingTarget.textContent='Proposed destination: '+(entry.placement.target_app_id||'unresolved')+' / '+(entry.placement.target_section_id||'unresolved');
    const existingWarning=document.createElement('p');existingWarning.textContent='Automated comparison is advisory; verify against the original content before approving changes.';
    existingComparison.append(existingHeading,existingSource,existingAssessment,existingTarget,existingWarning);
    details.append(existingComparison);
    // Reviewers can jump directly between related statements without losing decisions.
    const related=document.createElement('div');
    if(entry.conflict_with?.length){
     const relatedLabel=document.createElement('p');relatedLabel.textContent='Potential scientific conflict — compare statements:';
     related.append(relatedLabel);
     for(const relatedIndex of entry.conflict_with){
      if(!Number.isInteger(relatedIndex)||relatedIndex<0||relatedIndex>=packet.entries.length||relatedIndex===entry.index)continue;
      const jump=document.createElement('button');jump.type='button';jump.className='button';
      jump.textContent='View statement '+(relatedIndex+1);
      jump.addEventListener('click',()=>{if(!isCurrentReview())return;showStatement(relatedIndex);statementCards[relatedIndex]?.scrollIntoView({block:'nearest'});});
      related.append(jump);
     }
    }
    if(Number.isInteger(entry.duplicate_of)&&entry.duplicate_of>=0&&entry.duplicate_of<packet.entries.length&&entry.duplicate_of!==entry.index){
     const duplicateLabel=document.createElement('p');duplicateLabel.textContent='Possible duplicate of statement '+(entry.duplicate_of+1)+'. Compare before deciding whether to retain both.';
     const jumpDuplicate=document.createElement('button');jumpDuplicate.type='button';jumpDuplicate.className='button';jumpDuplicate.textContent='View original statement '+(entry.duplicate_of+1);
     jumpDuplicate.addEventListener('click',()=>{if(!isCurrentReview())return;showStatement(entry.duplicate_of);statementCards[entry.duplicate_of]?.scrollIntoView({block:'nearest'});});
     related.append(duplicateLabel,jumpDuplicate);
    }
    // Side-by-side textual evidence keeps both statements visible on mobile.
    if((entry.conflict_with||[]).length||Number.isInteger(entry.duplicate_of)){
     const comparison=document.createElement('section');comparison.setAttribute('aria-label','Statement comparison');
     const comparisonTitle=document.createElement('h5');comparisonTitle.textContent='Compare source statements';comparison.append(comparisonTitle);
     const candidates=[...(entry.conflict_with||[]),entry.duplicate_of];
     for(const candidate of new Set(candidates)){
      if(!Number.isInteger(candidate)||candidate<0||candidate>=packet.entries.length||candidate===entry.index)continue;
      const other=packet.entries[candidate];
      const row=document.createElement('div');
      const heading=document.createElement('strong');heading.textContent='Statement '+(candidate+1)+(candidate===entry.duplicate_of?' — possible duplicate':' — potential conflict');
      const original=document.createElement('p');original.textContent='Current: '+entry.source_text;
      const counterpart=document.createElement('p');counterpart.textContent='Compare: '+other.source_text;
      const context=document.createElement('p');context.textContent='Other proposed placement: '+(other.placement.target_app_id||'unresolved')+' / '+(other.placement.target_section_id||'unresolved');
      row.append(heading,original,counterpart,context);comparison.append(row);
     }
     related.append(comparison);
    }
    const warning=document.createElement('p');warning.className='quiet';
    warning.textContent='Pending scientific verification and editorial approval. This packet cannot publish updates.';
    const decision=packet.review_decisions[entry.index];
    const form=document.createElement('div');
    function selectDecision(title,key,options){
     const wrapper=document.createElement('label');wrapper.textContent=title+' ';
     const select=document.createElement('select');
     for(const [value,name] of options){const option=document.createElement('option');option.value=value;option.textContent=name;select.append(option);}
     select.value=decision[key];select.addEventListener('change',()=>{if(!isCurrentReview())return;decision[key]=select.value;updateProgress();updateReviewSummary();saveReview();});
     wrapper.append(select);form.append(wrapper);
    }
    selectDecision('Scientific review','scientific_status',[['pending','Pending'],['needs-revision','Needs revision'],['verified','Verified by reviewer']]);
    selectDecision('Editorial review','editorial_status',[['pending','Pending'],['needs-revision','Needs revision'],['approved','Approved by editor']]);
    selectDecision('Proposed action','proposed_action',[['needs-review','Needs review'],['update-existing','Update existing'],['new-content','Propose new content'],['no-change','No change']]);
    const progress=document.createElement('p');progress.setAttribute('role','status');
    function updateProgress(){
     const scientific=decision.scientific_status==='verified';
     const editorial=decision.editorial_status==='approved';
     const action=decision.proposed_action!=='needs-review';
     progress.textContent=scientific&&editorial&&action?'Scientific, editorial, and action decisions recorded locally. Publication remains prohibited.':scientific&&editorial?'Choose a proposed action to complete this review. Publication remains prohibited.':'Review incomplete — scientific and editorial decisions are required.';
    }
    form.append(progress);
    updateProgress();
    const notesLabel=document.createElement('label');notesLabel.textContent='Reviewer notes';
    const notes=document.createElement('textarea');notes.rows=3;notes.maxLength=4000;notes.style.width='100%';
    notes.value=decision.reviewer_notes;notes.addEventListener('input',()=>{if(!isCurrentReview())return;decision.reviewer_notes=notes.value;saveReview();});
    notesLabel.append(notes);form.append(notesLabel);
    const technical=document.createElement('details');
    const technicalSummary=document.createElement('summary');technicalSummary.textContent='Technical classification details (rarely needed)';
    technical.append(technicalSummary,details);
    item.append(label,renderNaturalistSourceEvidence(document,entry),body,flags,related,technical,warning,form);reviewOutput.append(item);statementCards.push(item);
   }
   if(statementCards.length>1){
    reviewOutput.insertBefore(navigation,statementCards[0]);
    let restoredPosition=0;
    try{restoredPosition=readNaturalistReviewPosition(localStorage,env.namespace,sourceFingerprint,statementCards.length);}catch{/* Start at the first statement when storage is unavailable. */}
    showStatement(restoredPosition);
    navigation.setAttribute('aria-description','Your statement position resumes on this device when storage is available. Review decisions remain separate.');
   }
   const recoveryLabel=document.createElement('label');recoveryLabel.textContent='Restore decisions from a downloaded review packet (same classification only)';
   const recoveryInput=document.createElement('input');recoveryInput.type='file';recoveryInput.accept='.json,application/json';
   recoveryLabel.append(recoveryInput);
   let activeDecisionImport=0;
   recoveryInput.addEventListener('change',async()=>{
    if(!isCurrentReview()||generation!==activeReviewGeneration)return;
    const importGeneration=++activeDecisionImport;
    const decisionSnapshot=JSON.stringify(packet.review_decisions);
    const file=recoveryInput.files?.[0];if(!file)return;
    recoveryInput.value='';
    if(file.size>2000000){intakeStatus.textContent='Review packet exceeds 2 MB recovery limit.';return;}
    try{
     const imported=importReviewPacket(JSON.parse(await file.text()),sourceFingerprint,packet.entries);
     if(importGeneration!==activeDecisionImport||!isCurrentReview()||generation!==activeReviewGeneration)return;
     if(JSON.stringify(packet.review_decisions)!==decisionSnapshot){intakeStatus.textContent='Recovery cancelled: review decisions changed while the file was opening. Your current decisions were kept.';return;}
     if(!imported){intakeStatus.textContent='Recovery rejected: packet does not match this classification or decisions are invalid.';return;}
     const saved=writeReview(localStorage,reviewKey,sourceFingerprint,imported,packet.entries);
     if(!saved){intakeStatus.textContent='Storage unavailable. Recovery not retained; keep your original downloaded packet.';return;}
     requireFreshIntakeReview=false;
     reviewOutput.replaceChildren();delete reviewOutput.dataset.reviewFingerprint;
     intakeStatus.textContent='Decisions restored locally. Reloading review interface; nothing published.';
     reviewButton.click();
    }catch{if(importGeneration===activeDecisionImport&&isCurrentReview()&&generation===activeReviewGeneration&&JSON.stringify(packet.review_decisions)===decisionSnapshot)intakeStatus.textContent='Invalid recovery file. No decisions changed.';}
   });
   reviewOutput.append(recoveryLabel);
   const clearButton=document.createElement('button');clearButton.type='button';clearButton.className='button';clearButton.textContent='Reset saved review decisions';
   clearButton.addEventListener('click',()=>{
    if(!isCurrentReview()||generation!==activeReviewGeneration){intakeStatus.textContent='Review no longer current. Regenerate before resetting.';return;}
    if(!confirm('Reset review decisions for this Naturalist submission? Original notes will remain in the input.'))return;
    try{localStorage.removeItem(reviewKey);}catch{intakeStatus.textContent='Unable to clear local storage.';return;}
    reviewOutput.replaceChildren();intakeStatus.textContent='Saved review decisions cleared. Generate a new packet to start pending reviews.';
   });
   reviewOutput.append(clearButton);
   const saveButton=document.createElement('button');saveButton.type='button';saveButton.className='button';saveButton.textContent='Save review decisions on this device';saveButton.addEventListener('click',saveReview);
   reviewOutput.append(saveButton);
   const download=document.createElement('button');download.type='button';download.className='button';download.textContent='Download review packet';
   download.onclick=()=>{
    if(!isCurrentReview()){intakeStatus.textContent='Review no longer current. Regenerate the review packet.';reviewOutput.replaceChildren();return;}
    if(!validateDecisions()){intakeStatus.textContent='Review decisions invalid. Nothing downloaded.';return;}
    const blob=new Blob([JSON.stringify(packet,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='mba-naturalist-review-packet.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   };
   reviewOutput.append(download);
   const queueHeading=document.createElement('h4');queueHeading.textContent='Reviewed content action queue';
   const queueStatus=document.createElement('p');queueStatus.setAttribute('role','status');
   const queueItems=document.createElement('ol');
   const replacementDrafts=new Map();
   const replacementRecoveryStatus=document.createElement('p');replacementRecoveryStatus.setAttribute('role','status');
   try{
    const recovered=readReplacementDrafts(localStorage,env.namespace,sourceFingerprint,packet.entries);
    if(recovered.valid){for(const [index,text] of recovered.drafts)replacementDrafts.set(index,text);replacementRecoveryStatus.textContent=recovered.drafts.length?'Replacement text restored for this exact source and classification. Existing scientific/editorial review requirements still apply.':'Replacement text saves on this device as you type.';}
    else replacementRecoveryStatus.textContent='Saved replacement text unavailable or invalid. Current edits remain usable; copy replacement text before leaving.';
   }catch{replacementRecoveryStatus.textContent='Device storage unavailable. Current edits remain usable; copy replacement text before leaving.';}
   function saveReplacements(){
    const drafts=[...replacementDrafts].filter(([,text])=>text.trim());
    let saved=false;try{saved=saveReplacementDrafts(localStorage,env.namespace,sourceFingerprint,packet.entries,drafts);}catch{/* storage may be blocked */}
    replacementRecoveryStatus.textContent=saved?'Replacement text saved on this device. Review decisions and publication authority are unchanged.':'Replacement text could not be saved on this device. Keep this page open or copy replacement text before leaving.';
   }
   reviewOutput.append(replacementRecoveryStatus);
   // Reject ambiguous IDs and stale review targets before building local drafts.
   function reviewedTarget(entry){
    const route=entry?.route;
    if(route?.action!=='update-existing'||typeof route.app_id!=='string'||typeof route.section_id!=='string')return null;
    if(registry.apps.filter(app=>app.app_id===route.app_id).length!==1)return null;
    const app=registry.apps.find(app=>app.app_id===route.app_id);
    if(!Array.isArray(app.sections)||app.sections.filter(section=>section.id===route.section_id).length!==1)return null;
    const section=app.sections.find(section=>section.id===route.section_id);
    if(typeof section.text!=='string'||entry.reviewed_app_version!==(app.version??null)||entry.reviewed_section_snapshot!==JSON.stringify(section))return null;
    return {app,section};
   }
   // Only text is recovered; classifications and approval decisions are never stored here.
   const replacementDownload=document.createElement('button');replacementDownload.type='button';replacementDownload.className='button';replacementDownload.textContent='Download replacement text backup';
   replacementDownload.addEventListener('click',()=>{
    if(!isCurrentReview())return;
    try{
     const backup=createReplacementBackup(sourceFingerprint,packet.entries,[...replacementDrafts].filter(([,text])=>text.trim()));
     const blob=new Blob([JSON.stringify(backup,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
     link.href=url;link.download='mba-naturalist-replacement-text.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
     replacementRecoveryStatus.textContent='Replacement text backup downloaded. Review decisions are not included.';
    }catch{replacementRecoveryStatus.textContent='Replacement backup invalid. Nothing downloaded.';}
   });
   const replacementRestoreLabel=document.createElement('label');replacementRestoreLabel.textContent='Restore replacement text backup (same classification, max 2 MB)';
   const replacementRestore=document.createElement('input');replacementRestore.type='file';replacementRestore.accept='.json,application/json';replacementRestoreLabel.append(replacementRestore);
   let activeReplacementImport=0;
   replacementRestore.addEventListener('change',async()=>{
    if(!isCurrentReview())return;
    const request=++activeReplacementImport,snapshot=JSON.stringify([...replacementDrafts]),file=replacementRestore.files?.[0];
    replacementRestore.value='';if(!file)return;
    if(file.size>2000000){replacementRecoveryStatus.textContent='Replacement backup exceeds 2 MB limit.';return;}
    try{
     const restored=readReplacementBackup(await file.text(),sourceFingerprint,packet.entries);
     if(request!==activeReplacementImport||!isCurrentReview())return;
     if(JSON.stringify([...replacementDrafts])!==snapshot){replacementRecoveryStatus.textContent='Restore cancelled: replacement text changed while the file was opening. Current edits were kept.';return;}
     if(!restored.valid){replacementRecoveryStatus.textContent='Replacement backup does not match this classification or contains invalid data. Current edits were kept.';return;}
     for(const [index,text] of restored.drafts)replacementDrafts.set(index,text);
     saveReplacements();showQueue();
    }catch{if(request===activeReplacementImport&&isCurrentReview())replacementRecoveryStatus.textContent='Replacement backup could not be read. Current edits were kept.';}
   });
   reviewOutput.append(replacementDownload,replacementRestoreLabel);
   const readableReport=document.createElement('button');readableReport.type='button';readableReport.className='button';readableReport.textContent='Download readable review report';
   readableReport.addEventListener('click',()=>{
    if(!isCurrentReview()){intakeStatus.textContent='Review no longer current. Generate again before downloading a report.';return;}
    try{
     const text=naturalistReadableReport(packet,[...replacementDrafts]);
     const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
     link.href=url;link.download='mba-naturalist-review-report.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
     intakeStatus.textContent='Readable draft report downloaded, including pending decisions and proposal text. Nothing published.';
    }catch{intakeStatus.textContent='Review report invalid. Current work was kept; nothing downloaded.';}
   });
   reviewOutput.append(readableReport);
   const refreshQueue=document.createElement('button');refreshQueue.type='button';refreshQueue.className='button';refreshQueue.textContent='Refresh reviewed actions';
   function showQueue(){
    if(!isCurrentReview()){queueStatus.textContent='Review is stale; regenerate classification.';queueItems.replaceChildren();return;}
    const queue=reviewActionQueue(packet.review_decisions,packet.entries);
    queueItems.replaceChildren();
    if(!queue.valid){queueStatus.textContent='Review decisions invalid.';return;}
    queueStatus.textContent=queue.items.length+' preparable reviewed actions; '+(queue.blocked_items?.length??0)+' blocked actions (duplicates, conflicts, source changes, or competing destinations). No publishing available.';
    for(const item of queue.blocked_items||[]){const li=document.createElement('li');li.textContent='BLOCKED statement '+(item.index+1)+' · '+item.block_reasons.join(', ')+' · '+(item.entry?.source_text||'').slice(0,120);queueItems.append(li);}
    for(const item of queue.items){
     const entry=packet.entries[item.index];
     const blocked=entry.duplicate_of!=null||(entry.conflict_with||[]).length>0;
     const li=document.createElement('li');
     const target=entry.placement?.target_app_id||'unresolved';
     li.textContent='Statement '+(item.index+1)+' · '+item.action+' · '+target+' · '+(blocked?'BLOCKED: duplicate or potential scientific conflict':item.action==='new-content'?'Placement review required':'Draft preparation requires verified replacement text')+' · '+entry.source_text.slice(0,120);
     if(!blocked&&item.action==='update-existing'){
      const replacementLabel=document.createElement('label');replacementLabel.textContent='Proposed replacement text (scientific verification required) for statement '+(item.index+1);
      const replacementInput=document.createElement('textarea');replacementInput.rows=4;replacementInput.maxLength=20000;replacementInput.style.width='100%';
      replacementInput.value=replacementDrafts.get(item.index)||'';
      // Show exact source and proposed section text without applying any changes.
      const comparison=document.createElement('details');
      const comparisonHeading=document.createElement('summary');comparisonHeading.textContent='Preview existing section and proposed replacement';
      const before=document.createElement('pre'),after=document.createElement('pre');
      before.style.whiteSpace=after.style.whiteSpace='pre-wrap';
      before.style.overflowWrap=after.style.overflowWrap='anywhere';
      const target=reviewedTarget(entry);
      before.textContent=target?'CURRENT · '+target.section.text:'Current destination unavailable or changed; regenerate review.';
      const refreshPreview=()=>{after.textContent='PROPOSED · '+(replacementInput.value.trim()?replacementInput.value:'Enter replacement text to preview.');};
      replacementInput.addEventListener('input',()=>{if(!isCurrentReview())return;replacementDrafts.set(item.index,replacementInput.value);refreshPreview();saveReplacements();});
      refreshPreview();
      comparison.append(comparisonHeading,before,after);
      replacementLabel.append(replacementInput,comparison);li.append(replacementLabel);
     }
     queueItems.append(li);
    }
   }
   refreshQueue.addEventListener('click',showQueue);
   const checkDrafts=document.createElement('button');checkDrafts.type='button';checkDrafts.className='button';checkDrafts.textContent='Check replacement drafts';
   const draftFeedback=document.createElement('p');draftFeedback.setAttribute('role','status');
   checkDrafts.addEventListener('click',()=>{
    if(!isCurrentReview()||!validateDecisions()){draftFeedback.textContent='Regenerate the current review before checking drafts.';return;}
    const queue=reviewActionQueue(packet.review_decisions,packet.entries);
    if(!queue.valid){draftFeedback.textContent='Invalid review decisions; no drafts checked.';return;}
    const outcomes=[...queue.blocked_items.map(item=>'blocked statement '+(item.index+1)+': '+item.block_reasons.join(', ')),...queue.items.map(item=>{
     const entry=result.entries[item.index];
     if(entry.duplicate_of!=null||(entry.conflict_with||[]).length)return 'blocked';
     if(item.action!=='update-existing')return 'placement-review';
     const target=reviewedTarget(entry);
     const replacement=replacementDrafts.get(item.index);
     if(!replacement?.trim())return 'replacement-required';
     if(!target)return 'routing-review';
     const {app,section}=target;
     const draft=createDraft(app);
     draft.description=entry.text.slice(0,4000);
     draft.section_edits=[{id:section.id,title:section.title,caption:section.caption??'',text:replacement}];
     return validateDraft(draft,app).valid?'draft-valid':'draft-invalid';
    })];
    draftFeedback.textContent=outcomes.length?outcomes.join(', ')+'; validation only, nothing saved or published.':'No reviewed actions to validate.';
   });
   reviewOutput.append(checkDrafts,draftFeedback);
   const exportDrafts=document.createElement('button');exportDrafts.type='button';exportDrafts.className='button';exportDrafts.textContent='Download validated draft proposals';
   exportDrafts.addEventListener('click',()=>{
    if(!isCurrentReview()||!validateDecisions()){intakeStatus.textContent='Review is stale or invalid. No draft exported.';return;}
    if(packet.review_decisions.some(decision=>decision.scientific_status!=='verified'||decision.editorial_status!=='approved'||decision.proposed_action==='needs-review')){intakeStatus.textContent='Complete every scientific and editorial decision before exporting draft proposals.';return;}
    const queue=reviewActionQueue(packet.review_decisions,packet.entries);
    if(!queue.valid){intakeStatus.textContent='Invalid review queue.';return;}
    const drafts=[];
    if(queue.blocked_items.length){intakeStatus.textContent='Export blocked: duplicate, conflict, or source-integrity review blockers remain.';return;}
    const pendingUpdates=queue.items.filter(item=>item.action==='update-existing');
    for(const item of queue.items){
     const entry=result.entries[item.index];
     if(item.action!=='update-existing'||entry.duplicate_of!=null||(entry.conflict_with||[]).length)continue;
     const target=reviewedTarget(entry);
     const replacement=replacementDrafts.get(item.index);
     if(!target||!replacement?.trim())continue;
     const {app,section}=target;
     const draft=createDraft(app);draft.description=entry.text.slice(0,4000);
     draft.section_edits=[{id:section.id,title:section.title,caption:section.caption??'',text:replacement}];
     const converted=naturalistChangeRequest(draft,app);
     if(converted.valid)drafts.push({statement_index:item.index,reviewer_notes:item.reviewer_notes,draft,change_request:converted.request});
    }
    if(drafts.length!==pendingUpdates.length){intakeStatus.textContent='Export blocked: '+(pendingUpdates.length-drafts.length)+' reviewed updates lack a valid, unblocked replacement proposal. Resolve all updates before exporting.';return;}
    if(!drafts.length){intakeStatus.textContent='No valid reviewed replacement drafts available for export.';return;}
    const payload={schema_version:1,kind:'mba-v2-naturalist-draft-proposals',review_context_sha256:sourceFingerprint,drafts,requires_review:true,prepared:false,committed:false,published:false,can_auto_publish:false};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='mba-naturalist-draft-proposals.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    intakeStatus.textContent=drafts.length+' validated local draft proposals exported. No content saved or published.';
   });
   reviewOutput.append(exportDrafts);
   const exportQueue=document.createElement('button');exportQueue.type='button';exportQueue.className='button';exportQueue.textContent='Download reviewed action packet';
   exportQueue.addEventListener('click',()=>{
    if(!isCurrentReview()||!validateDecisions()){intakeStatus.textContent='Current, valid review decisions required before export.';return;}
    const queue=reviewActionQueue(packet.review_decisions,packet.entries);
    if(!queue.valid){intakeStatus.textContent='Invalid action queue.';return;}
    const actions=queue.items.map(item=>{
     const entry=packet.entries[item.index];
     const blocked=entry.duplicate_of!=null||(entry.conflict_with||[]).length>0;
     return {index:item.index,action:item.action,source_text:entry.source_text,placement:entry.placement,reviewer_notes:item.reviewer_notes,duplicate_of:entry.duplicate_of,conflict_with:entry.conflict_with,preparation_status:blocked?'blocked-review':item.action==='new-content'?'placement-review':replacementDrafts.get(item.index)?.trim()?'draft-validation-required':'verified-replacement-required',replacement_text:!blocked&&item.action==='update-existing'?(replacementDrafts.get(item.index)||''):undefined};
    });
    const blocked_actions=queue.blocked_items.map(item=>({index:item.index,action:item.action,source_text:item.entry?.source_text??'',reviewer_notes:item.reviewer_notes,preparation_status:'blocked-review',block_reasons:[...item.block_reasons]}));
    const payload={schema_version:1,kind:'mba-v2-naturalist-reviewed-action-packet',review_context_sha256:sourceFingerprint,original_source:source,actions,blocked_actions,scientific_verification:'reviewer-recorded',requires_review:true,prepared:false,committed:false,published:false,can_auto_publish:false};
    const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='mba-naturalist-reviewed-actions.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    intakeStatus.textContent='Reviewed action packet downloaded. No application content changed.';
   });
   const exportSummary=document.createElement('button');exportSummary.type='button';exportSummary.className='button';exportSummary.textContent='Download review queue summary';
   exportSummary.addEventListener('click',()=>{
    if(!isCurrentReview()||!validateDecisions()){intakeStatus.textContent='Current, valid review decisions required before summary export.';return;}
    try{
     const payload=exportNaturalistReviewQueue(packet.review_decisions,packet.entries,sourceFingerprint);
     const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
     const url=URL.createObjectURL(blob),link=document.createElement('a');
     link.href=url;link.download='mba-naturalist-review-queue-summary.json';link.click();
     setTimeout(()=>URL.revokeObjectURL(url),1000);
     intakeStatus.textContent='Read-only review queue summary downloaded. No application content changed.';
    }catch{intakeStatus.textContent='Review queue summary invalid. Nothing downloaded.';}
   });
   const verifySummaryLabel=document.createElement('label');verifySummaryLabel.textContent='Verify downloaded review queue summary (JSON, max 1 MB)';
   const verifySummaryInput=document.createElement('input');verifySummaryInput.type='file';verifySummaryInput.accept='.json,application/json';
   const verifySummaryStatus=document.createElement('p');verifySummaryStatus.setAttribute('role','status');
   verifySummaryInput.addEventListener('change',async()=>{
    const file=verifySummaryInput.files?.[0];verifySummaryInput.value='';
    if(!file)return;
    if(!isCurrentReview()||!validateDecisions()){verifySummaryStatus.textContent='Current review required. Regenerate review first.';return;}
    if(file.size>1024*1024){verifySummaryStatus.textContent='Summary exceeds the 1 MB limit.';return;}
    try{
     const payload=JSON.parse(await file.text());
     if(!isCurrentReview()||!validateDecisions()){verifySummaryStatus.textContent='Review changed during verification. Regenerate review.';return;}
     const result=verifyNaturalistReviewQueue(payload,packet.review_decisions,packet.entries,sourceFingerprint);
     verifySummaryStatus.textContent=result.valid?'Verified read-only summary: '+result.ready+' ready; '+result.blocked+' blocked. No changes made.':'Summary rejected: '+result.reason+'. No changes made.';
    }catch{verifySummaryStatus.textContent='Invalid JSON summary. No changes made.';}
   });
   verifySummaryLabel.append(verifySummaryInput);
   reviewOutput.append(queueHeading,queueStatus,refreshQueue,queueItems,exportQueue,exportSummary,verifySummaryLabel,verifySummaryStatus);
   showQueue();
   intakeStatus.textContent='Review packet ready. Nothing approved, committed, or published.';
  }catch(error){if(generation===activeReviewGeneration)intakeStatus.textContent='Review generation unavailable: '+error.message;}
 });
 const inventory=document.querySelector('#app-inventory'),filter=document.querySelector('#app-filter');
 const registry=await fetch('registry.json').then(r=>{if(!r.ok)throw Error('Registry unavailable');return r.json();});
 function drawInventory(){const query=filter.value.trim().toLocaleLowerCase();const apps=registry.apps.filter(a=>[a.title,a.app_id,a.category,a.status].some(value=>String(value||'').toLocaleLowerCase().includes(query))).sort((a,b)=>a.title.localeCompare(b.title));inventory.replaceChildren();const count=document.createElement('p');count.textContent=apps.length+' of '+registry.apps.length+' applications';inventory.append(count);for(const app of apps){const row=document.createElement('p'),label=document.createElement('strong'),meta=document.createElement('span');label.textContent=app.title+' ';meta.textContent='('+app.app_id+') · '+app.category+' · '+app.status;const inspect=document.createElement('button');inspect.type='button';inspect.className='button';inspect.textContent='Inspect';inspect.setAttribute('aria-label','Inspect '+app.title);inspect.addEventListener('click',()=>showDetails(app));row.append(label,meta,document.createTextNode(' '),inspect);inventory.append(row);}}
 function showDetails(app){const details=document.querySelector('#app-details');details.replaceChildren();const heading=document.createElement('h3');heading.textContent=app.title;details.append(heading);const fields=[['Application ID',app.app_id],['Category',app.category],['Status',app.status],['Version',app.version],['Owner',app.owner],['Entry point',app.entry_point],['Sections',app.sections?.length??0],['Offline assets',app.offline_assets?.length??0],['Media',app.media?.length??0],['Knowledge records',app.knowledge?.length??0],['Dependencies',app.dependencies?.length??0],['Cross-links',app.cross_links?.length??0]];const table=document.createElement('dl');for(const [name,value] of fields){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=String(value??'Not set');table.append(dt,dd);}details.append(table);const sectionHeading=document.createElement('h4');sectionHeading.textContent='Registered sections';details.append(sectionHeading);const sections=document.createElement('ul');for(const section of app.sections||[]){const item=document.createElement('li');item.textContent=String(section.title||section.id||'Untitled')+' ('+String(section.id||'no ID')+')';sections.append(item);}if(!sections.children.length){const item=document.createElement('li');item.textContent='No sections registered';sections.append(item);}details.append(sections);const assetHeading=document.createElement('h4');assetHeading.textContent='Offline assets';details.append(assetHeading);const assets=document.createElement('ul');for(const asset of app.offline_assets||[]){const item=document.createElement('li');item.textContent=String(asset);assets.append(item);}if(!assets.children.length){const item=document.createElement('li');item.textContent='No offline assets registered';assets.append(item);}details.append(assets);const note=document.createElement('p');note.className='quiet';note.textContent='Read-only inspection. Edit source content in the authorized development workflow; publication is not available here.';details.append(note);const draftButton=document.createElement('button');draftButton.type='button';draftButton.className='button';draftButton.textContent='Prepare change request';draftButton.addEventListener('click',()=>showChangeRequest(app,details));details.append(draftButton);
 const editButton=document.createElement('button');editButton.type='button';editButton.className='button';editButton.textContent='Edit local draft';editButton.addEventListener('click',()=>showDraft(app,details));details.append(editButton);}
 function showDraft(app,details){
 details.querySelector('#local-draft')?.remove();
 const draft=loadDraft(localStorage,env.namespace,app)||createDraft(app);
 const form=document.createElement('form');form.id='local-draft';
 const heading=document.createElement('h4');heading.textContent='Development draft — not published';form.append(heading);
 function field(name,value,max,rows){const label=document.createElement('label');label.textContent=name;const input=document.createElement(rows?'textarea':'input');input.value=value;input.maxLength=max;input.style.width='100%';if(rows)input.rows=rows;label.append(input);form.append(label);return input;}
 const titleInput=field('Proposed application title',draft.title,160,0);
 const descriptionInput=field('Update notes',draft.description,4000,4);
 const sectionInputs=[];
 for(const section of app.sections||[]){
  if(typeof section.id!=='string')continue;
  const saved=(draft.section_edits||[]).find(e=>e.id===section.id);
  const sectionTitle=field('Section '+section.id+' title',saved?.title??section.title??section.id,160,0);
  const sectionText=field('Section '+section.id+' body text',saved?.text??section.text??'',12000,6);
  const sectionCaption=field('Section '+section.id+' caption (draft only)',saved?.caption??section.caption??'',2000,3);
  sectionInputs.push({id:section.id,title:sectionTitle,text:sectionText,caption:sectionCaption});
 }
 const photoHeading=document.createElement('h5');photoHeading.textContent='Photograph inventory';form.append(photoHeading);
 const imageExtensions=['.png','.jpg','.jpeg','.webp','.gif','.avif'];
 const photoAssets=(app.offline_assets||[]).filter(asset=>typeof asset==='string'&&imageExtensions.some(ext=>asset.toLowerCase().endsWith(ext)));
 const photoSummary=document.createElement('p');photoSummary.textContent=photoAssets.length+' registered photographs. Inventory is read-only; uploads and deletion are unavailable.';form.append(photoSummary);
 const photoInputs=[];
 for(const asset of photoAssets){const item=document.createElement('p');item.textContent=asset;form.append(item);const saved=(draft.photo_notes||[]).find(note=>note.asset===asset);const caption=field('Photo caption',saved?.caption??'',2000,3);const alt=field('Photo alternative text',saved?.alt_text??'',500,2);photoInputs.push({asset,caption,alt});}
 const preview=document.createElement('pre');preview.setAttribute('aria-live','polite');
 const status=document.createElement('p');status.setAttribute('role','status');
 function proposed(){return {...draft,title:titleInput.value,description:descriptionInput.value,photo_notes:photoInputs.filter(p=>p.caption.value.trim()||p.alt.value.trim()).map(p=>({asset:p.asset,caption:p.caption.value,alt_text:p.alt.value})),section_edits:sectionInputs.filter(s=>{const original=(app.sections||[]).find(x=>x.id===s.id);return s.title.value!==(original?.title??s.id)||s.text.value!==(original?.text??'')||s.caption.value!==(original?.caption??'');}).map(s=>({id:s.id,title:s.title.value,text:s.text.value,caption:s.caption.value})),updated_at:new Date().toISOString()};}
 function check(){const next=proposed(),result=validateDraft(next,app);preview.textContent='Current: '+app.title+'\\nProposed: '+next.title+'\\nNotes: '+next.description+'\\nSection edits: '+next.section_edits.map(s=>s.id+': '+s.title+' ('+s.text.length+' body characters)').join('; ');status.textContent=result.valid?'Draft valid — not published':result.errors.join('; ');return {next,result};}
 const previewButton=document.createElement('button');previewButton.type='button';previewButton.className='button';previewButton.textContent='Preview and validate';previewButton.onclick=check;
 const saveButton=document.createElement('button');saveButton.type='submit';saveButton.className='button';saveButton.textContent='Save on this device';
 form.append(previewButton,saveButton,preview);
 const exportButton=document.createElement('button');exportButton.type='button';exportButton.className='button';exportButton.textContent='Download draft change request';
 exportButton.addEventListener('click',()=>{
  const {next,result}=check();if(!result.valid)return;
  const payload={schema_version:1,kind:'mba-v2-content-change-request',app_id:app.app_id,app_version:app.version,description:next.description.trim()||'Review proposed content edits',proposed_title:next.title,section_edits:next.section_edits,photo_notes:next.photo_notes};
  const blob=new Blob([JSON.stringify(payload,null,2)+'\\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='mba-draft-'+String(app.app_id).replace(/[^a-zA-Z0-9_-]/g,'-')+'.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent='Change request downloaded for review. No GitHub changes submitted.';
 });
 form.append(exportButton);

 form.addEventListener('submit',event=>{event.preventDefault();const {next,result}=check();if(!result.valid)return;const saved=saveDraft(localStorage,env.namespace,app,next);status.textContent=saved.valid?'Saved locally. No GitHub or published content changed.':saved.errors.join('; ');});
 form.append(status);details.append(form);check();
}
 function showChangeRequest(app,details){details.querySelector('#change-request')?.remove();const form=document.createElement('form');form.id='change-request';const heading=document.createElement('h4');heading.textContent='Local change request (not published)';const label=document.createElement('label');label.htmlFor='change-description';label.textContent='Describe the update';const input=document.createElement('textarea');input.id='change-description';input.required=true;input.maxLength=4000;input.rows=5;input.style.width='100%';const exportButton=document.createElement('button');exportButton.type='submit';exportButton.className='button';exportButton.textContent='Download request';const hint=document.createElement('p');hint.className='quiet';hint.textContent='Downloads a text request for review. Does not edit the app, upload content, or authorize release.';form.append(heading,label,input,exportButton,hint);form.addEventListener('submit',event=>{event.preventDefault();const description=input.value.trim();if(!description)return;const payload={schema_version:1,kind:'mba-v2-content-change-request',app_id:app.app_id,app_version:app.version,description};const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='mba-change-'+String(app.app_id).replace(/[^a-zA-Z0-9_-]/g,'-')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});details.append(form);input.focus();}
 filter.addEventListener('input',drawInventory);drawInventory();
 const key=env.namespace+':issues';let tasks=[];try{tasks=JSON.parse(localStorage.getItem(key)||'[]');}catch{}const list=document.querySelector('#tasks');function draw(){list.replaceChildren();for(const t of tasks){const p=document.createElement('p'),b=document.createElement('button');p.append(document.createTextNode(t.text+' '));b.textContent=t.closed?'Reopen':'Close';b.className='button';b.onclick=()=>{t.closed=!t.closed;save();};p.append(b);list.append(p);}}function save(){try{localStorage.setItem(key,JSON.stringify(tasks));}catch{document.querySelector('#diagnostics').textContent='Local task storage unavailable';}draw();}document.querySelector('#add').onclick=()=>{const input=document.querySelector('#task');if(input.value.trim()){tasks.push({id:crypto.randomUUID(),text:input.value.trim(),closed:false});input.value='';save();}};draw();
 async function status(){try{const [offline,registry,release]=await Promise.all([request('STATUS'),fetch('registry.json').then(r=>r.json()),fetch('release.json').then(r=>r.json())]);document.querySelector('#diagnostics').textContent=JSON.stringify({offline,version:registry.version,release:release.release,apps:registry.apps.map(a=>({id:a.app_id,version:a.version,dependencies:a.dependencies})),tasksOpen:tasks.filter(t=>!t.closed).length},null,2);}catch(e){document.querySelector('#diagnostics').textContent=e.message;}}
 document.querySelector('#update').onclick=async()=>{try{const r=await navigator.serviceWorker.ready;await r.update();await status();}catch(e){document.querySelector('#diagnostics').textContent=e.message;}};document.querySelector('#repair').onclick=async()=>{try{await request('REPAIR');await status();}catch(e){document.querySelector('#diagnostics').textContent=e.message;}};await status();}
