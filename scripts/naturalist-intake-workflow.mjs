import {classifyUpdateBatch} from './classify-update-batch.mjs';
import {prepareReviewedNaturalistActions} from './prepare-reviewed-naturalist-actions.mjs';
import {newReviewDecisions,reviewRecoveryCheck,reviewActionQueue,validateReviewDecisions} from '../src/core/naturalist-review-state.js';

// Developer-facing read-only workflow orchestration. No writes or publication.
export function createNaturalistIntake(text,applications){
 const classification=classifyUpdateBatch(text,applications);
 if(!classification.valid)return {valid:false,errors:classification.errors??['classification failed'],published:false};
 const decisions=newReviewDecisions(classification.entries);
 return {valid:true,classification,decisions,progress:reviewRecoveryCheck(decisions,classification.entries),published:false};
}
export function updateNaturalistDecision(intake,index,patch){
 if(!intake?.valid||!Array.isArray(intake.classification?.entries)||!validateReviewDecisions(intake.decisions,intake.classification.entries))
  return {valid:false,reason:'invalid-intake'};
 if(!Number.isInteger(index)||index<0||index>=intake.decisions.length||!patch||typeof patch!=='object'||Array.isArray(patch))
  return {valid:false,reason:'invalid-decision'};
 const decisions=intake.decisions.map(d=>({...d}));
 decisions[index]={...decisions[index],...patch};
 if(!validateReviewDecisions(decisions,intake.classification.entries))return {valid:false,reason:'invalid-decision'};
 return {...intake,decisions,progress:reviewRecoveryCheck(decisions,intake.classification.entries),published:false};
}
export function previewNaturalistDrafts(intake,applications,replacements={}){
 if(!intake?.valid||!intake.classification?.valid)return {valid:false,reason:'invalid-intake',published:false};
 return prepareReviewedNaturalistActions(intake.classification,intake.decisions,applications,replacements);
}
export function naturalistWorkQueue(intake){
 if(!intake?.valid||!intake.classification?.valid)return {valid:false,reason:'invalid-intake',items:[],can_auto_publish:false};
 return reviewActionQueue(intake.decisions,intake.classification.entries);
}
