import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {hideIntegratedLegacyHelp,integratedHelpDestination,isIntegratedLegacyHelp} from '../src/core/integrated-help.js';
const cases=[['flamboyant-cuttlefish','Install-Offline-Help'],['gooseneck-barnacle','Install-Offline-Help'],['gray-whale','Install-and-troubleshooting'],['naturalist-field-notes','Troubleshooting-install']];
test('integrated help conceals only legacy maintenance while preserving source DOM handles and animal content',()=>{
 for(const [app,id] of cases){const panel={children:['legacy control handle'],attributes:{},setAttribute(k,v){this.attributes[k]=v;}},biology={hidden:false};const nodes=new Map([[id,panel],['Anatomy',biology]]);hideIntegratedLegacyHelp({getElementById:id=>nodes.get(id)},app);assert.equal(nodes.get(id),panel);assert.deepEqual(panel.children,['legacy control handle']);assert.equal(panel.hidden,true);assert.equal(panel.attributes['aria-hidden'],'true');assert.equal(panel.attributes['data-v2-maintenance-hidden'],'true');assert.equal(biology.hidden,false);}
 assert.doesNotThrow(()=>hideIntegratedLegacyHelp({getElementById(){throw Error('Unrelated guide queried');}},'open-sea'));
});
test('legacy help deep links lead to this Hub help without redirecting scientific sections',()=>{
 const root=new URL('https://example.invalid/private/tester/');for(const [app,id] of cases){assert.equal(integratedHelpDestination(root,app,'#'+id).href,'https://example.invalid/private/tester/index.html#help');assert.equal(integratedHelpDestination(root,app,'#Anatomy'),null);assert.equal(integratedHelpDestination(root,'other', '#'+id),null);}assert.equal(integratedHelpDestination(root,'gray-whale','#%XX'),null);
});
test('both built searches omit obsolete install instructions while preserving every scientific guide target',()=>{
 for(const environment of ['developer','tester']){const index=JSON.parse(fs.readFileSync(`dist/${environment}/search-index.json`));for(const [app,id] of cases){assert(!index.some(e=>e.app_id===app&&e.url.endsWith('#'+id)));const manifest=JSON.parse(fs.readFileSync(`src/apps/${app}/manifest.json`));for(const section of manifest.sections.filter(s=>!isIntegratedLegacyHelp(app,s.id)))assert(index.some(e=>e.app_id===app&&e.url.endsWith(section.query?'?'+new URLSearchParams(section.query):'#'+section.id)),`${environment}:${app}:${section.id}`);}}
});
