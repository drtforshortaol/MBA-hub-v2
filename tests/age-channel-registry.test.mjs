import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectCurrentBuild,validateChannelRegistry} from '../scripts/age/channel-registry.mjs';
const a=id=>({app_id:id,title:id,category:'concepts',owner:id,entry_point:'apps/'+id+'/index.html',version:'1.0.0'});
const policy={authority:'src/apps/*/manifest.json',blue_required_apps:['original'],development_only_app_ids:[],approved_retirements:[]};
test('AGE-005–007: real developer/tester bundles have one registry and preserve blue',()=>{
 assert.deepEqual(inspectCurrentBuild(),[]);
});
test('AGE-005: a rogue application cannot be introduced by either channel',()=>{
 assert.match(validateChannelRegistry({manifests:[a('original')],orange:[a('original'),a('rogue')],blue:[a('original')],policy}).join(' '),/rogue orange app/);
});
test('AGE-006: unexplained differences are blocked, development-only is declared',()=>{
 let args={manifests:[a('original'),a('experiment')],orange:[a('original'),a('experiment')],blue:[a('original')],policy};
 assert.match(validateChannelRegistry(args).join(' '),/unexplained blue omission experiment/);
 assert.deepEqual(validateChannelRegistry({...args,policy:{...policy,development_only_app_ids:['experiment']}}),[]);
});
test('AGE-006: no blue-only applications or divergent manifests',()=>{
 const args={manifests:[a('original')],orange:[],blue:[a('original')],policy};
 assert.match(validateChannelRegistry(args).join(' '),/missing from orange original/);
 assert.match(validateChannelRegistry({...args,orange:[{...a('original'),title:'Changed title'}]}).join(' '),/divergent orange contract original.title/);
});
test('AGE-007: missing production apps and unapproved retirements fail closed',()=>{
 const args={manifests:[],orange:[],blue:[],policy};
 assert.match(validateChannelRegistry(args).join(' '),/existing production app missing from canonical registry original/);
 assert.match(validateChannelRegistry(args).join(' '),/existing production app removed original/);
 assert.match(validateChannelRegistry({...args,policy:{...policy,approved_retirements:[{app_id:'original'}]}}).join(' '),/retirement requires explicit owner-approved record original/);
});
test('AGE-005: duplicate application IDs fail',()=>{
 assert.match(validateChannelRegistry({manifests:[a('original'),a('original')],orange:[a('original')],blue:[a('original')],policy}).join(' '),/duplicate canonical app original/);
});

test('AGE-006: Guide review metadata may differ, while listing and content must match',()=>{
 const original={...a('original'),listed:true,sections:[{id:'intro',text:'Approved text'}],
  media:['photo'],offline_assets:['apps/original/index.html'],publication_review:'pending'};
 const guide={...original,publication_review:'inherited-v1-approved'};
 const args={manifests:[original],orange:[original],blue:[guide],policy};
 assert.deepEqual(validateChannelRegistry(args),[]);
 const altered={...guide,listed:false,sections:[{id:'intro',text:'Changed text'}],media:[],offline_assets:[]};
 const errors=validateChannelRegistry({...args,blue:[altered]});
 for(const field of ['listed','sections','media','offline_assets'])
  assert.ok(errors.includes('AGE-005: divergent blue contract original.'+field));
});
