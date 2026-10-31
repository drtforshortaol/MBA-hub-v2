import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {animalIndexEntries} from '../src/core/animal-index.js';
const apps=[['northern-elephant-seal','Northern Elephant Seal'],['california-flying-fish','California Flying Fish'],['california-sheephead','California Sheephead'],['gray-whale','Gray Whale'],['sperm-whale','🐋 Sperm Whale']].map(([app_id,title])=>({app_id,title,category:'animals'}));
test('agreed main names and selective references resolve to the same unique animals',()=>{
 const animals=apps.filter(a=>a.category==='animals'&&a.listed!==false),snapshot=JSON.stringify(apps),rows=animalIndexEntries(apps);
 assert.equal(new Set(rows.map(r=>r.app.app_id)).size,animals.length);assert.equal(rows.length,animals.length+3);assert.equal(JSON.stringify(apps),snapshot);
 for(const [id,letter,label] of [['northern-elephant-seal','E','Elephant Seal, Northern'],['california-flying-fish','F','Flying Fish, California'],['california-sheephead','S','Sheephead, California'],['gray-whale','G','Gray Whale']]){const r=rows.find(r=>r.app.app_id===id&&!r.crossReference);assert.equal(r.letter,letter);assert.equal(r.label,label);}
 const seal=rows.filter(r=>r.app.app_id==='northern-elephant-seal');assert.equal(seal.length,2);assert.equal(seal.find(r=>r.crossReference).letter,'S');assert.equal(seal[0].app,seal[1].app);
 assert.deepEqual(rows.filter(r=>r.crossReference).map(r=>r.label).sort(),['Seal → Elephant Seal, Northern','Whale → Gray Whale','Whale → Sperm Whale']);
 assert.equal(rows.filter(r=>r.app.app_id==='california-flying-fish').length,1);assert.equal(rows.filter(r=>r.app.app_id==='california-sheephead').length,1);
 assert.equal(rows.find(r=>r.app.app_id==='sperm-whale').letter,'S');assert.equal(animalIndexEntries([...animals,...animals]).length,rows.length);
});
