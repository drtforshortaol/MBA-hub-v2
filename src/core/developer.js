import {createDraft,loadDraft,saveDraft,validateDraft} from './content-drafts.js';
import {request} from './worker-channel.js';
import {newReviewDecisions,validateReviewDecisions,reviewProgress,reviewStorageKey,readReview,writeReview} from './naturalist-review-state.js';
const env=await fetch('environment.json').then(r=>r.json());if(!env.developer)throw Error('Developer module prohibited in this environment');
const panel=document.querySelector('#developer'),title=document.querySelector('#title');let taps=0,last=0;
title.addEventListener('click',()=>{if(Date.now()-last>2200)taps=0;last=Date.now();if(++taps===5){taps=0;panel.hidden=!panel.hidden;if(!panel.hidden)render();}});
async function render(){panel.replaceChildren(...[['h2','Developer mode'],['p','Diagnostics only. Publishing authority remains outside this app.'],['button','Update Now','update'],['button','Repair offline files','repair'],['pre','Checking…','diagnostics'],['h2','Application inventory'],['label','Filter applications'],['input','','app-filter'],['div','','app-inventory'],['div','','app-details'],['h2','Tasks'],['label','Capture an item to fix later'],['input','','task'],['button','Add task','add'],['div','','tasks']].map(([tag,label,id])=>{const el=document.createElement(tag);if(id)el.id=id;if(tag==='label')el.htmlFor=label==='Filter applications'?'app-filter':'task';if(tag==='p')el.className='quiet';if(tag==='button')el.className='button';if(tag!=='input')el.textContent=label;return el;}));

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
  const payload={schema_version:1,kind:'mba-v2-naturalist-intake',original_source:source,scientific_verification:'required',editorial_review:'required',approval_state:'pending',classified:false,committed:false,published:false};
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
 intakeText.addEventListener('input',()=>{reviewOutput.replaceChildren();intakeStatus.textContent='Source changed. Generate a new review packet before downloading.';});
 reviewButton.addEventListener('click',async()=>{
  reviewOutput.replaceChildren();
  const source=intakeText.value;
  if(!source.trim()){intakeStatus.textContent='Source notes are required.';return;}
  intakeStatus.textContent='Preparing review-only classification…';
  try{
   const [{classifyUpdateBatch},{summarizeNaturalistReview}]=await Promise.all([
    import('./naturalist-engine/classify-update-batch.js'),
    import('./naturalist-engine/summarize-naturalist-review.js')
   ]);
   const result=classifyUpdateBatch(source,registry.apps);
   if(!result.valid){intakeStatus.textContent=(result.errors||['Invalid source']).join('; ');return;}
   const packet={schema_version:1,kind:'mba-v2-naturalist-review-packet',original_source:source,review_summary:summarizeNaturalistReview(result.entries),entries:result.entries.map(entry=>({index:entry.index,duplicate_of:entry.duplicate_of,source_text:entry.text,source_block:entry.source_block,extraction:entry.extraction,placement:entry.placement,review:entry.review,existing_content:entry.existing_content,review_required:true})),scientific_verification:'required',editorial_review:'required',requires_review:true,prepared:false,committed:false,published:false};
   // Review decisions are annotations only: never mutate canonical classifications.
   // Include the classification outcome in the review key: a registry or routing
   // change must not silently reattach decisions to different proposed targets.
   const reviewIdentity=JSON.stringify({source,entries:packet.entries.map(e=>({text:e.source_text,placement:e.placement,review_flags:e.review.flags,existing_content:e.existing_content}))});
   const sourceFingerprint=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(reviewIdentity)).then(bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join(''));
   if(intakeText.value!==source){intakeStatus.textContent='Source changed while classification was running. Generate again.';return;}
   const reviewKey=reviewStorageKey(env.namespace,sourceFingerprint);
   const legacySourceFingerprint=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source)).then(bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join(''));
   const legacyReviewKey=reviewStorageKey(env.namespace,legacySourceFingerprint);
   packet.review_context_sha256=sourceFingerprint;
   packet.review_decisions=newReviewDecisions(packet.entries);
   const saved=readReview(localStorage,reviewKey,sourceFingerprint,packet.entries);
   if(saved)packet.review_decisions=saved;
   function reviewDecisionSummary(){
    const progress=reviewProgress(packet.review_decisions);
    return progress.completed+' of '+progress.total+' reviewed in both stages; '+progress.revisions+' flagged for revision. Publication remains disabled.';
   }
   const reviewProgressDisplay=document.createElement('p');reviewProgressDisplay.setAttribute('role','status');
   const updateReviewSummary=()=>{reviewProgressDisplay.textContent=reviewDecisionSummary();};
   updateReviewSummary();
   reviewOutput.append(reviewProgressDisplay);
   const validateDecisions=()=>validateReviewDecisions(packet.review_decisions,packet.entries);
   // Retire legacy source-only review keys without importing their decisions:
   // the old key did not bind approvals to the current routing context.
   if(legacyReviewKey!==reviewKey){try{localStorage.removeItem(legacyReviewKey);}catch{/* storage may be unavailable */}}
   const saveReview=()=>{
    if(intakeText.value!==source){intakeStatus.textContent='Source changed. Regenerate before saving.';return;}
    if(!validateDecisions()){intakeStatus.textContent='Review decisions invalid. Nothing saved.';return;}
    intakeStatus.textContent=writeReview(localStorage,reviewKey,sourceFingerprint,packet.review_decisions,packet.entries)?'Review decisions saved on this device. Publication remains disabled.':'Local storage unavailable; download the review packet to retain decisions.';
   };
   const heading=document.createElement('h4');heading.textContent='Proposed updates — review required';
   const summary=document.createElement('p');summary.textContent=packet.review_summary.statement_count+' statements; '+packet.review_summary.duplicate_statement_count+' repeated within submission.';
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
    const warning=document.createElement('p');warning.className='quiet';
    warning.textContent='Pending scientific verification and editorial approval. This packet cannot publish updates.';
    const decision=packet.review_decisions[entry.index];
    const form=document.createElement('div');
    function selectDecision(title,key,options){
     const wrapper=document.createElement('label');wrapper.textContent=title+' ';
     const select=document.createElement('select');
     for(const [value,name] of options){const option=document.createElement('option');option.value=value;option.textContent=name;select.append(option);}
     select.value=decision[key];select.addEventListener('change',()=>{decision[key]=select.value;updateProgress();updateReviewSummary();saveReview();});
     wrapper.append(select);form.append(wrapper);
    }
    selectDecision('Scientific review','scientific_status',[['pending','Pending'],['needs-revision','Needs revision'],['verified','Verified by reviewer']]);
    selectDecision('Editorial review','editorial_status',[['pending','Pending'],['needs-revision','Needs revision'],['approved','Approved by editor']]);
    selectDecision('Proposed action','proposed_action',[['needs-review','Needs review'],['update-existing','Update existing'],['new-content','Propose new content'],['no-change','No change']]);
    const progress=document.createElement('p');progress.setAttribute('role','status');
    function updateProgress(){
     const scientific=decision.scientific_status==='verified';
     const editorial=decision.editorial_status==='approved';
     progress.textContent=scientific&&editorial?'Both reviews recorded locally. Publication remains prohibited.':'Review incomplete — scientific and editorial decisions are required.';
    }
    form.append(progress);
    updateProgress();
    const notesLabel=document.createElement('label');notesLabel.textContent='Reviewer notes';
    const notes=document.createElement('textarea');notes.rows=3;notes.maxLength=4000;notes.style.width='100%';
    notes.value=decision.reviewer_notes;notes.addEventListener('input',()=>{decision.reviewer_notes=notes.value;saveReview();});
    notesLabel.append(notes);form.append(notesLabel);
    item.append(label,body,flags,details,warning,form);reviewOutput.append(item);
   }
   const clearButton=document.createElement('button');clearButton.type='button';clearButton.className='button';clearButton.textContent='Reset saved review decisions';
   clearButton.addEventListener('click',()=>{
    if(intakeText.value!==source){intakeStatus.textContent='Source changed. Regenerate before resetting.';return;}
    if(!confirm('Reset review decisions for this Naturalist submission? Original notes will remain in the input.'))return;
    try{localStorage.removeItem(reviewKey);}catch{intakeStatus.textContent='Unable to clear local storage.';return;}
    reviewOutput.replaceChildren();intakeStatus.textContent='Saved review decisions cleared. Generate a new packet to start pending reviews.';
   });
   reviewOutput.append(clearButton);
   const saveButton=document.createElement('button');saveButton.type='button';saveButton.className='button';saveButton.textContent='Save review decisions on this device';saveButton.addEventListener('click',saveReview);
   reviewOutput.append(saveButton);
   const download=document.createElement('button');download.type='button';download.className='button';download.textContent='Download review packet';
   download.onclick=()=>{
    if(intakeText.value!==source){intakeStatus.textContent='Source changed. Regenerate the review packet.';reviewOutput.replaceChildren();return;}
    if(!validateDecisions()){intakeStatus.textContent='Review decisions invalid. Nothing downloaded.';return;}
    const blob=new Blob([JSON.stringify(packet,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='mba-naturalist-review-packet.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   };
   reviewOutput.append(download);intakeStatus.textContent='Review packet ready. Nothing approved, committed, or published.';
  }catch(error){intakeStatus.textContent='Review generation unavailable: '+error.message;}
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
