import {animalCatalog,animalRecordForApp} from '../shared/animal-records.js';
import {listedHubApps} from './whale-reference.js';
export const classificationRanks=['phylum','class','order','family'];
const explanations={Chordata:'Chordates',Arthropoda:'Arthropods',Mollusca:'Mollusks',Actinopterygii:'Ray-finned fishes',Chondrichthyes:'Cartilaginous fishes',Mammalia:'Mammals',Thecostraca:'Barnacles and relatives',Bivalvia:'Bivalves',Gastropoda:'Snails and slugs',Syngnathiformes:'Seahorses and relatives',Myliobatiformes:'Rays',Carnivora:'Carnivores',Beloniformes:'Flying-fish relatives',Syngnathidae:'Pipefishes and seahorses',Dasyatidae:'Rays',Exocoetidae:'Flying fishes',Labridae:'Wrasses',Pollicipedidae:'Gooseneck barnacles',Anomiidae:'Jingle shells',Goniodorididae:'Nudibranch family',Phocidae:'True seals'};
export function classificationModel(apps,catalog=animalCatalog){
 const root={id:'classification-tree',children:[],leaves:[],count:0},references=[],pending=[];
 const unique=[...new Map(listedHubApps(apps).filter(a=>a.category==='animals'&&a.listed!==false).map(a=>[a.app_id,a])).values()];
 for(const app of unique){
  const record=catalog.records.find(r=>r.app_id===app.app_id||r.app_aliases?.includes(app.app_id)),leaf={app,record,label:record?.index.primary||app.title};
  if(record&&record.record_type!=='species'){references.push(leaf);continue;}
  if(!record?.taxonomy.phylum||record.review.status==='pending'){pending.push(leaf);continue;}
  let branch=root;root.count++;
  for(const rank of classificationRanks){const name=record.taxonomy[rank];if(!name)continue;const id=branch.id+'/'+rank+':'+name;let child=branch.children.find(c=>c.id===id);if(!child){child={id,rank,name,explanation:explanations[name]||'',count:0,children:[],leaves:[]};branch.children.push(child);}child.count++;branch=child;}
  branch.leaves.push(leaf);
 }
 const sort=n=>{n.children.sort((a,b)=>a.name.localeCompare(b.name));n.leaves.sort((a,b)=>a.label.localeCompare(b.label));n.children.forEach(sort);};sort(root);
 references.sort((a,b)=>a.label.localeCompare(b.label));pending.sort((a,b)=>a.label.localeCompare(b.label));return {root,references,pending,total:unique.length,species:unique.length-references.length};
}
export function renderClassification(apps,{node,safeHref,openIds=[]}){
 const model=classificationModel(apps),opened=new Set(openIds);
 const leaf=entry=>node('a',{class:'classification-link',href:safeHref(entry.app.entry_point),text:entry.label});
 const branch=b=>node('details',{'data-classification-id':b.id,open:opened.has(b.id)},node('summary',{text:b.rank[0].toUpperCase()+b.rank.slice(1)+': '+b.name+(b.explanation?' — '+b.explanation:'')+' ('+b.count+')'}),node('div',{class:'classification-children'},...b.children.map(branch),...b.leaves.map(leaf)));
 const root=node('details',{class:'animal-classification','data-classification-id':'classification',open:opened.has('classification')},node('summary',{text:'Browse by classification'}),node('p',{class:'classification-note',text:model.species+' species guides · '+model.references.length+' group/topic references. Expand the branches to browse. Names and sources are inside each guide; common and scientific names are searchable. Classification is being completed where ranks are not yet reviewed.'}),...model.root.children.map(branch));
 for(const [id,title,entries] of [['classification-pending','Classification not yet reviewed',model.pending],['classification-references','Group & topic references',model.references]])if(entries.length)root.append(node('details',{'data-classification-id':id,open:opened.has(id)},node('summary',{text:title+' ('+entries.length+')'}),node('div',{class:'classification-children'},...entries.map(leaf))));
 return root;
}
export function enhanceAnimalIdentity(document,appId){
 const record=animalRecordForApp(appId),main=document.querySelector('main');if(!record||record.app_id!==appId||!main||document.getElementById('Names-and-classification'))return;
 const make=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;},details=make('details');details.id='Names-and-classification';details.className='animal-identity';details.append(make('summary','Names & classification'));const list=make('dl'),row=(title,value)=>{if(value){list.append(make('dt',title),make('dd',value));}};
 row('Guide type',record.record_type==='species'?'Species guide':record.record_type==='group'?'Group guide':'Topic reference');row('Common name',record.common_names.primary);row(record.record_type==='species'?'Scientific name used in this guide':'Scientific group name',record.scientific_names.primary);row('Other scientific names',record.scientific_names.aliases.join('; '));
 for(const rank of animalCatalog.ranks)row(rank[0].toUpperCase()+rank.slice(1),record.taxonomy[rank]);details.append(list);
 if(record.review.status!=='source-checked')details.append(make('p',record.record_type==='species'?'Some classification ranks are still being reviewed. This does not limit browsing or offline use.':'This reference covers a group or topic; it is not counted as a single species.'));
 if(record.review.note)details.append(make('p',record.review.note));
 for(const id of record.review.source_ids){const source=animalCatalog.sources[id];if(!source)continue;const p=make('p'),a=make('a',source.title);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);details.append(p);}
 details.style.cssText='margin:16px 0;padding:12px;border:1px solid #c8dcdf;border-radius:10px;background:#f7fbfb;color:#173746';main.append(details);
}
