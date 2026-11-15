// One Hub topic, with both historical app routes and one shared profile data source.
export const whaleTopic={id:'whale-associated-organisms',legacyId:'whale-parasites-associates',title:'Whales — Hitchhikers & Parasites',path:'apps/whale-associated-organisms/index.html'};
export function listedHubApps(apps){return apps.filter(a=>a.app_id!==whaleTopic.legacyId);}
export function whaleSearchEntries(index){
 return index.flatMap(row=>{
  if(row.app_id===whaleTopic.legacyId){
   const fragment=row.url.split('#')[1];if(!fragment)return [];
   const destination=['Fast-field-cues','References'].includes(fragment)?'Detailed-species-reference':fragment;
   return [{...row,app_id:whaleTopic.id,title:row.title.replace(/^Whale Parasites & Associates/,whaleTopic.title),url:whaleTopic.path+'#'+destination}];
  }
  return [{...row,...(row.app_id===whaleTopic.id?{title:row.title.replace(/^Whale-Associated Organisms/,whaleTopic.title),text:row.text+' '+whaleTopic.title}: {})}];
 });
}
export function enhanceWhaleReference(document,profiles=[]){
 const main=document.querySelector('main'),photo=document.getElementById('Photo-field-guide'),profileHeading=document.getElementById('Detailed-species-reference'),profileBody=document.getElementById('detailedSpecies');
 if(!main||!photo||!profileHeading||!profileBody||main.dataset.whaleCombined)return;
 main.dataset.whaleCombined='true';document.title=whaleTopic.title;const h1=document.querySelector('h1');if(h1)h1.textContent=whaleTopic.title;
 const makeGroup=(title,id)=>{const details=document.createElement('details'),summary=document.createElement('summary');details.className='entry whale-group';details.id=id;summary.textContent=title;details.append(summary);return details;};
 const photographs=makeGroup('Photo field guide','whale-photo-guide'),challenges=makeGroup('Identification challenges','whale-challenges'),organisms=makeGroup('Organism profiles','whale-organism-profiles');
 let cursor=photo.nextElementSibling;const content=[];while(cursor&&cursor!==profileHeading){content.push(cursor);cursor=cursor.nextElementSibling;}
 main.insertBefore(photographs,photo);photographs.append(photo);for(const item of content){(item.id.startsWith('Whale-lice-')?challenges:photographs).append(item);}
 main.insertBefore(organisms,profileHeading);organisms.append(profileHeading,profileBody);const legacyLinks=document.createElement('p');for(const [label,fragment] of [['Quick field cues','Fast-field-cues'],['Original reference sources','References']]){const a=document.createElement('a');a.textContent=label;a.href='../whale-parasites-associates/index.html#'+fragment;legacyLinks.append(a,document.createTextNode(' · '));}organisms.append(legacyLinks);main.append(challenges);
 // Keep the original section anchors and expose old profile deep links here as well.
 [...profileBody.querySelectorAll('details')].forEach((entry,i)=>{if(profiles[i]?.id)entry.id=profiles[i].id;});
}
