import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {verifySubmissionPacket,AUTHORIZED_REPOSITORY,AUTHORIZED_BRANCH} from '../scripts/verify-submission-packet.mjs';
const original={app_id:'ray',version:'1',title:'Ray',sections:[{id:'habitat',title:'Habitat',text:'Old',aliases:['coast']}],offline_assets:['apps/ray/photo.jpg']};
const bytes=JSON.stringify(original);
const packet=()=>({schema_version:1,kind:'mba-v2-review-packet',target_repository:AUTHORIZED_REPOSITORY,target_branch:AUTHORIZED_BRANCH,app_id:'ray',app_version:'1',manifest_path:'src/apps/ray/manifest.json',base_manifest_sha256:createHash('sha256').update(bytes).digest('hex'),changes:['title'],photo_proposals:[],proposed_manifest:{...structuredClone(original),title:'Rays'},requires_review:true,approved:false,committed:false,published:false});
test('valid review-only packet passes integrity verification',()=>assert.equal(verifySubmissionPacket(packet(),bytes).valid,true));
test('reject stale base and unauthorized branch',()=>{
 assert.equal(verifySubmissionPacket(packet(),bytes+' ').valid,false);
 assert.equal(verifySubmissionPacket(packet(),bytes,{branch:'main'}).valid,false);
});
test('reject bypassed review gate and protected manifest edits',()=>{
 assert.equal(verifySubmissionPacket({...packet(),approved:true},bytes).valid,false);
 const changed=packet();changed.proposed_manifest.offline_assets=[];
 assert.equal(verifySubmissionPacket(changed,bytes).valid,false);
});
test('reject section identifier and protected metadata mutations',()=>{
 const changed=packet();changed.proposed_manifest.sections[0].id='other';
 assert.equal(verifySubmissionPacket(changed,bytes).valid,false);
 const changed2=packet();changed2.proposed_manifest.sections[0].aliases=[];
 assert.equal(verifySubmissionPacket(changed2,bytes).valid,false);
});
test('reject malformed packet and manifest path traversal',()=>{
 assert.equal(verifySubmissionPacket(null,bytes).valid,false);
 assert.equal(verifySubmissionPacket({...packet(),manifest_path:'../manifest.json'},bytes).valid,false);
});
