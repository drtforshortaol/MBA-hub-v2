import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createNaturalistIntakePacket,readNaturalistIntakePacket} from '../src/core/naturalist-intake.js';

test('intake exchange preserves exact source and restores no approvals',()=>{
 const source='  Hey y’all!\r\n\r\nOriginal source, 日本語, 🐙.  ';
 const packet=createNaturalistIntakePacket(source);
 const restored=readNaturalistIntakePacket(JSON.parse(JSON.stringify(packet)));
 assert.deepEqual(restored,{valid:true,source,requires_review:true,published:false,can_auto_publish:false});
 assert.equal(packet.classified,false);
 assert.equal(packet.approval_state,'pending');
});
test('intake imports reject authority changes, missing fields and unexpected data',()=>{
 const packet=createNaturalistIntakePacket('Naturalist notes');
 for(const key of Object.keys(packet)){
  const missing={...packet};delete missing[key];
  assert.equal(readNaturalistIntakePacket(missing).valid,false,key);
 }
 for(const [key,value] of Object.entries({published:true,committed:1,classified:true,approval_state:'approved',scientific_verification:'verified',editorial_review:'approved',schema_version:2,kind:'mba-v2-naturalist-review-packet',review_decisions:[],prepared:true,can_auto_publish:true})){
  assert.equal(readNaturalistIntakePacket({...packet,[key]:value}).valid,false,key);
 }
 for(const invalid of [null,[],{},'source'])assert.equal(readNaturalistIntakePacket(invalid).valid,false);
});
test('source packet boundaries match canonical extraction and reject silent coercion',()=>{
 for(const source of ['', ' \n ',null,23,{},'x'.repeat(60001)])assert.throws(()=>createNaturalistIntakePacket(source));
 const source='x'.repeat(60000);
 assert.equal(readNaturalistIntakePacket(createNaturalistIntakePacket(source)).source,source);
 assert.equal(readNaturalistIntakePacket({...createNaturalistIntakePacket('ok'),original_source:'x'.repeat(60001)}).valid,false);
});
test('developer import invalidates existing review and guards stale file completion',()=>{
 const code=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
 assert.match(code,/readNaturalistIntakePacket\(JSON\.parse\(await file\.text\(\)\)\)/);
 assert.match(code,/importGeneration!==activeIntakeImport\|\|generation!==activeReviewGeneration\|\|intakeText\.value!==source/);
 assert.match(code,/intakeText\.value=restored\.source;\s*intakeText\.dispatchEvent\(new Event\('input'\)\)/);
 assert.match(code,/file\.size>400000/);
});

test('restored source runs canonical classification with fresh pending decisions',async()=>{
 const {createNaturalistIntake,updateNaturalistDecision}=await import('../scripts/naturalist-intake-workflow.mjs');
 const source='Sea otters use tools. Sea otters use tools.';
 const earlier=createNaturalistIntake(source,[]);
 const reviewed=updateNaturalistDecision(earlier,0,{scientific_status:'verified',editorial_status:'approved',proposed_action:'new-content'});
 assert.equal(reviewed.decisions[0].scientific_status,'verified');
 const restored=readNaturalistIntakePacket(JSON.parse(JSON.stringify(createNaturalistIntakePacket(source))));
 const fresh=createNaturalistIntake(restored.source,[]);
 assert.deepEqual(fresh.classification,earlier.classification);
 assert.equal(fresh.classification.entries[1].duplicate_of,0);
 assert.ok(fresh.decisions.every(d=>d.scientific_status==='pending'&&d.editorial_status==='pending'));
 assert.equal(fresh.progress.can_auto_publish,false);
});
