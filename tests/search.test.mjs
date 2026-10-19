import test from 'node:test';
import assert from 'node:assert/strict';
import {searchHub} from '../src/core/search.js';
const apps=[{app_id:'seahorse',category:'animals'},{app_id:'guide',category:'guides'}];
const records=[
 {app_id:'guide',title:'Field guide',text:'Seahorse habitat and range',url:'apps/guide/index.html'},
 {app_id:'seahorse',title:'Seahorse · Habitat',text:'Temperate kelp forests',url:'apps/seahorse/index.html#habitat'},
 {app_id:'seahorse',title:'Seahorse',text:'Seahorse',url:'apps/seahorse/index.html'}
];
test('exact app titles rank ahead of title phrases and body mentions',()=>{
 assert.deepEqual(searchHub(records,'seahorse').map(item=>item.url),[records[2].url,records[1].url,records[0].url]);
});
test('species title and section body jointly satisfy multiword guide queries',()=>{
 assert.deepEqual(searchHub(records,'seahorse kelp'),[records[1]]);
});
test('title matches rank ahead of body phrases and preserve deep-link records',()=>{
 assert.deepEqual(searchHub(records,'seahorse habitat'),[records[1],records[0]]);
});
test('category selection restricts results by canonical app ownership',()=>{
 assert.deepEqual(searchHub(records,'seahorse',{category:'animals',apps}),[records[2],records[1]]);
 assert.deepEqual(searchHub(records,'seahorse',{category:'guides',apps}),[records[0]]);
 assert.deepEqual(searchHub(records,'seahorse',{category:'missing',apps}),[]);
});
test('empty queries, case and whitespace retain predictable matching',()=>{
 assert.deepEqual(searchHub(records,'  '),[]);assert.deepEqual(searchHub(records,' SEAHORSE  KELP '),[records[1]]);
 assert.deepEqual(searchHub(records,'seahorse missing'),[]);
});
test('ranking leaves source records unchanged and uses original order for ties',()=>{
 const before=JSON.stringify(records),input=[records[1],{...records[1],url:'apps/seahorse/index.html#other'}];
 assert.deepEqual(searchHub(input,'seahorse'),input);assert.equal(JSON.stringify(records),before);
});

test('compatibility Unicode forms match normalized titles and section text',()=>{
 const entries=[{app_id:'guide',title:'Ｋｅｌｐ Guide',text:'The ﬁsh inhabit kelp forests.',url:'apps/guide/index.html'}];
 assert.deepEqual(searchHub(entries,'kelp'),entries);
 assert.deepEqual(searchHub(entries,'fish'),entries);
 assert.deepEqual(searchHub(entries,'ＫＥＬＰ'),entries);
});
