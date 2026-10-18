import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {stageSubmissionPacket} from '../scripts/stage-submission-packet.mjs';
import {AUTHORIZED_REPOSITORY,AUTHORIZED_BRANCH} from '../scripts/verify-submission-packet.mjs';
const original={app_id:'ray',version:'1',title:'Ray',sections:[{id:'habitat',title:'Habitat',text:'Old'}],offline_assets:[]};
const bytes=JSON.stringify(original);
const packet=()=>({schema_version:1,kind:'mba-v2-review-packet',target_repository:AUTHORIZED_REPOSITORY,target_branch:AUTHORIZED_BRANCH,app_id:'ray',app_version:'1',manifest_path:'src/apps/ray/manifest.json',base_manifest_sha256:createHash('sha256').update(bytes).digest('hex'),changes:['title'],photo_proposals:[],proposed_manifest:{...structuredClone(original),title:'Rays'},requires_review:true,approved:false,committed:false,published:false});
test('stage produces reviewable content but no publication authorization',()=>{
 const result=stageSubmissionPacket(packet(),bytes);
 assert.equal(result.valid,true);assert.equal(result.approved,false);assert.equal(result.committed,false);assert.equal(result.published,false);
 assert.equal(JSON.parse(result.proposed_content).title,'Rays');
});
test('stage rejects stale manifests and unauthorized destinations',()=>{
 assert.equal(stageSubmissionPacket(packet(),bytes+' ').valid,false);
 assert.equal(stageSubmissionPacket({...packet(),target_branch:'main'},bytes).valid,false);
});
test('stage rejects modified identifiers and approval bypass',()=>{
 const changed=packet();changed.proposed_manifest.app_id='other';
 assert.equal(stageSubmissionPacket(changed,bytes).valid,false);
 assert.equal(stageSubmissionPacket({...packet(),approved:true},bytes).valid,false);
});
