import test from 'node:test';import assert from 'node:assert/strict';import {animalIndexEntries,animalGroups,animalGroupFor,animalSearchTerms} from '../src/core/animal-index.js';import {bindAnimalFilter} from '../src/core/animal-filter.js';import {restoredHubState,mainHubURL,captureVisit,visitContext,returnToVisit} from '../src/core/navigation.js';import {searchHub} from '../src/core/search.js';
const ids=['big-bellied-seahorse','bluespotted-ribbontail-ray','california-flying-fish','california-sheephead','gooseneck-barnacle','gray-whale','green-falsejingle','hopkins-rose-nudibranch','northern-elephant-seal','sea-slugs-nudibranchs','stargazer-species-guide','whale-associated-organisms'];
const apps=ids.map(app_id=>({app_id,title:app_id,category:'animals',entry_point:'apps/'+app_id+'/index.html'}));
test('all twelve agreed guides have one broad group and exact alternate letters',()=>{
 const rows=animalIndexEntries(apps);assert.equal(new Set(rows.map(r=>r.app.app_id)).size,12);
 assert.deepEqual(animalGroups.map(g=>[g.title,new Set(rows.filter(r=>r.group===g.id).map(r=>r.app.app_id)).size]),[['Fishes',4],['Sharks & Rays',1],['Marine Mammals',3],['Invertebrates',4]]);
 for(const [id,letters,label] of [['bluespotted-ribbontail-ray',['B','R'],'Ribbontail Ray, Blue-spotted'],['gooseneck-barnacle',['B','G'],'Barnacle, Gooseneck'],['green-falsejingle',['F','G'],'Falsejingle, Green'],['hopkins-rose-nudibranch',['H','N'],'Nudibranch, Hopkins’ Rose'],['sea-slugs-nudibranchs',['N','S'],'Sea Slugs & Nudibranchs']]){const r=rows.filter(r=>r.app.app_id===id);assert.deepEqual(r.map(r=>r.letter).sort(),letters);assert.equal(r.find(r=>!r.crossReference).label,label);}
 assert(!animalSearchTerms('bluespotted-ribbontail-ray').toLowerCase().includes('stingray'));assert(!animalSearchTerms('gray-whale').toLowerCase().includes('grey'));assert.equal(animalGroupFor('california-sheephead'),'fishes');
});
function fixture(){
 const onLetters=[],onGroups=[],button=(textContent,dataset={})=>({textContent,dataset,setAttribute(k,v){this[k]=v;},addEventListener(t,f){this.click=f;}}),letters=['All','B','E','F','G','H','N','R','S','W'].map(l=>button(l)),groups=[button('All animals',{group:'',label:'All groups'}),...animalGroups.map(g=>button(g.title,{group:g.id,label:g.title}))],entries=animalIndexEntries(apps).map(r=>({dataset:{letter:r.letter,group:r.group,appId:r.app.app_id}})),status={};
 const parent={querySelectorAll:s=>s==='.entry'?entries:groups,querySelector:()=>status},row={querySelectorAll:()=>letters,parentElement:parent};
 bindAnimalFilter({querySelectorAll:()=>[row]},{letter:'B',onChange:l=>onLetters.push(l),onGroupChange:g=>onGroups.push(g)});return {letters,groups,entries,status,onLetters,onGroups};
}
test('group changes reset letters, omit empty letters, count unique guides, and All respects its group',()=>{
 const f=fixture();f.groups.find(g=>g.dataset.group==='invertebrates').click();assert.deepEqual(f.onGroups,['invertebrates']);assert.equal(f.onLetters.at(-1),'');assert.equal(f.status.textContent,'Invertebrates · 4 guides');assert.deepEqual(f.letters.filter(b=>!b.hidden).map(b=>b.textContent),['All','B','F','G','H','N','S']);
 f.letters.find(b=>b.textContent==='N').click();assert.equal(f.status.textContent,'Invertebrates · 2 guides');assert(f.entries.filter(e=>!e.hidden).every(e=>e.dataset.letter==='N'));
 f.letters[0].click();assert.equal(f.status.textContent,'Invertebrates · 4 guides');f.groups[0].click();assert.equal(f.status.textContent,'All groups · 12 guides');assert(f.entries.every(e=>!e.hidden));
});
test('contextual Back restores group browsing; Return to Hub clears it',()=>{
 const root='https://example.test/v2/',values=new Map(),storage={setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k)},state={open:['animals'],animalGroup:'invertebrates',animalGroupsOpen:true,animalLetter:'N',scroll:240};
 const target=captureVisit('apps/one/index.html',root,root+'index.html',state,storage,'tester','groups');const back=returnToVisit(root,target,storage,'tester'),saved=visitContext(root,new URL(back).searchParams.get('restore'),storage,'tester').state;assert.equal(saved.animalGroup,'invertebrates');assert.equal(saved.animalLetter,'N');assert.equal(saved.animalGroupsOpen,true);
 const home=restoredHubState(saved,mainHubURL(root));assert.equal(home.animalGroup,'');assert.equal(home.animalLetter,'');assert.equal(home.animalGroupsOpen,false);assert.deepEqual(home.open,[]);
});
test('search recognizes approved browse groups and wrasse without inventing group buttons',()=>{
 const index=apps.map(a=>({app_id:a.app_id,title:a.title,text:a.title,url:a.entry_point}));assert(searchHub(index,'wrasse',{apps}).some(r=>r.app_id==='california-sheephead'));assert.equal(searchHub(index,'invertebrates',{apps}).length,4);assert(!animalGroups.some(g=>/wrasse|seahorse|flying/i.test(g.title)));
});
