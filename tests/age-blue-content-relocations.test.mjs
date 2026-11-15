import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {assessProductionContent} from '../scripts/age/blue-content-fidelity.mjs';

const write=(root,p,content)=>{
 const file=path.join(root,p);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,typeof content==='string'||Buffer.isBuffer(content)?content:JSON.stringify(content));
};
function makeFixture({tamper=false,permission='approved',registerAsset=true,declareRelocation=true}={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'mba-age008-'));
 const blue=path.join(root,'blue'),orange=path.join(root,'candidate');
 const data=Buffer.from('original-owner-image-123');
 const oldAsset='apps/old.jpg',newAsset='apps/animal/images/old.jpg';
 const manifest=(p,assets)=>({app_id:'animal',title:'Animal',version:'1.0.0',category:'animals',
  owner:'animal',entry_point:'apps/animal/index.html',sections:[],media:['photo'],offline_assets:assets,listed:true});
 write(blue,'src/apps/animal/manifest.json',manifest(blue,[oldAsset]));
 write(orange,'src/apps/animal/manifest.json',manifest(orange,registerAsset?[newAsset]:[]));
 write(blue,'src/apps/old.jpg',data);
 write(orange,'src/apps/animal/images/old.jpg',tamper?Buffer.from('modified'):data);
 const m=(p,allowed)=>({asset_id:'photo',path:p,permission:allowed,credit:'Original photographer'});
 write(blue,'src/shared/media/catalog.json',{assets:[m(oldAsset,'approved')]});
 write(orange,'src/shared/media/catalog.json',{assets:[m(newAsset,permission)]});
 const relocation={from:'src/apps/old.jpg',to:'src/apps/animal/images/old.jpg',app_id:'animal',asset_id:'photo'};
 write(orange,'config/age-source-relocations.json',{schema_version:1,
  blue_baseline_sha:'40e1826166f0ea61f406e1193390272029428734',
  relocations:declareRelocation?[relocation]:[]});
 return {root,blue,orange};
}
function runCase(options){
 const dirs=makeFixture(options);
 try{return assessProductionContent(dirs.blue,dirs.orange);}
 finally{fs.rmSync(dirs.root,{recursive:true,force:true});}
}
test('AGE-008 accepts verified same-byte, registered and equally licensed move',()=>{
 const result=runCase();
 assert.equal(result.release_eligible,true);
 assert.equal(result.verified_relocations.length,1);
 assert.equal(result.blockers.length,0);
 assert.equal(result.missing_source_files.length,0);
});
test('AGE-008 blocks a photo modified in transit',()=>{
 const result=runCase({tamper:true});
 assert.equal(result.release_eligible,false);
 assert.ok(result.blockers.some(b=>b.kind==='unverified-asset-relocation'));
});
test('AGE-008 blocks an altered photographer permission',()=>{
 const result=runCase({permission:'review-required'});
 assert.equal(result.release_eligible,false);
 assert.ok(result.rejected_relocations.some(b=>b.checks.permissions===false));
});
test('AGE-008 blocks a move missing from app offline inventory',()=>{
 const result=runCase({registerAsset:false});
 assert.equal(result.release_eligible,false);
 assert.ok(result.rejected_relocations.some(b=>b.checks.newRegistered===false));
});
test('AGE-008 blocks undeclared disappearing source files',()=>{
 const result=runCase({declareRelocation:false});
 assert.equal(result.release_eligible,false);
 assert.equal(result.missing_source_files.length,1);
});
