export function validateAnimalRecords(catalog,apps=[]){
 const errors=[],ids=new Set(),animals=new Set(),routes=new Set(),appIds=new Set(apps.map(a=>a.app_id));
 if(catalog?.schema_version!==1||!Array.isArray(catalog.records)||!catalog.sources)return ['invalid animal catalog'];
 for(const [id,source] of Object.entries(catalog.sources)){try{if(new URL(source.url).protocol!=='https:'||!source.title||!/^\d{4}-\d{2}-\d{2}$/.test(source.checked_on||''))errors.push('invalid taxonomy source '+id);}catch{errors.push('invalid taxonomy source '+id);}}
 const ranks=['phylum','class','order','family','genus','species'];
 for(const r of catalog.records){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.record_id||'')||ids.has(r.record_id))errors.push('invalid/duplicate record identity');ids.add(r.record_id);
  if(!['species','group','topic'].includes(r.record_type))errors.push('invalid record type '+r.record_id);
  if(r.record_type==='species'){if(r.animal_id!==r.record_id||animals.has(r.animal_id))errors.push('invalid/duplicate animal identity');animals.add(r.animal_id);}else if(r.animal_id!==null)errors.push('reference has species identity '+r.record_id);
  for(const id of [r.app_id,...r.app_aliases||[]]){if(routes.has(id)||!appIds.has(id))errors.push('duplicate/unknown app route '+id);routes.add(id);}
  if(!r.common_names?.primary||!Array.isArray(r.common_names.aliases)||!Array.isArray(r.scientific_names?.aliases)||!(r.scientific_names.primary===null||typeof r.scientific_names.primary==='string')||!r.index?.primary||!Array.isArray(r.index.alternate)||!Array.isArray(r.search_aliases))errors.push('invalid names/index '+r.record_id);
  if(!['source-checked','partial','pending'].includes(r.review?.status)||!Array.isArray(r.review.source_ids))errors.push('invalid review '+r.record_id);
  for(const rank of ranks){if(!Object.hasOwn(r.taxonomy||{},rank)||!(r.taxonomy[rank]===null||typeof r.taxonomy[rank]==='string'&&r.taxonomy[rank].trim()))errors.push('invalid taxonomy rank '+r.record_id+':'+rank);if(r.taxonomy?.[rank]&&(!r.taxonomy_sources?.[rank]?.length||r.taxonomy_sources[rank].some(id=>!catalog.sources[id])))errors.push('unsourced rank '+r.record_id+':'+rank);}
  for(const id of r.review.source_ids||[])if(!catalog.sources[id])errors.push('unknown review source '+id);
  if(r.record_type==='species'&&r.review.status==='source-checked'&&ranks.some(rank=>!r.taxonomy[rank]))errors.push('incomplete record claims full review '+r.record_id);
 }
 for(const app of apps.filter(a=>a.category==='animals'))if(!routes.has(app.app_id))errors.push('animal app lacks permanent record '+app.app_id);
 return errors;
}
