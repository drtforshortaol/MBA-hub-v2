import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {listedHubApps,whaleTopic,whaleSearchEntries} from '../src/core/whale-reference.js';import {animalIndexEntries} from '../src/core/animal-index.js';
test('one listed whale topic preserves both canonical routes and all shared resources',()=>{
 const apps=fs.readdirSync('src/apps',{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>JSON.parse(fs.readFileSync('src/apps/'+d.name+'/manifest.json'))),snapshot=JSON.stringify(apps);
 const visible=listedHubApps(apps);assert(visible.some(a=>a.app_id===whaleTopic.id));assert(!visible.some(a=>a.app_id===whaleTopic.legacyId));assert.equal(JSON.stringify(apps),snapshot);
 const rows=animalIndexEntries(apps);assert.equal(rows.filter(r=>r.app.app_id===whaleTopic.id).length,1);assert.equal(rows.find(r=>r.app.app_id===whaleTopic.id).label,whaleTopic.title);assert(!rows.some(r=>r.app.app_id===whaleTopic.legacyId));
 for(const id of [whaleTopic.id,whaleTopic.legacyId])assert(fs.existsSync('src/apps/'+id+'/index.html'));
 const h=fs.readFileSync('src/apps/'+whaleTopic.id+'/index.html','utf8');assert(h.includes('../whale-parasites-associates/data.js'));assert.equal((h.match(/<figure>/g)||[]).length,8);
});
test('search exposes one whale app summary and retains each profile anchor on the combined page',()=>{
 const input=[{app_id:whaleTopic.id,title:'Whale-Associated Organisms',text:'whales',url:whaleTopic.path},{app_id:whaleTopic.legacyId,title:'Whale Parasites & Associates',text:'whales',url:'apps/'+whaleTopic.legacyId+'/index.html'},{app_id:whaleTopic.legacyId,title:'Whale Parasites & Associates · Whale Lice',text:'lice',url:'apps/'+whaleTopic.legacyId+'/index.html#whalelice'}];
 const rows=whaleSearchEntries(input);assert.equal(rows.length,2);assert.equal(rows[0].title,whaleTopic.title);assert.equal(rows[1].app_id,whaleTopic.id);assert.equal(rows[1].url,whaleTopic.path+'#whalelice');assert.equal(input.length,3);
});
