// Published interface: configuration + owned sections + read-only catalogs -> DOM.
// No app may mutate another app's data through this renderer.
export function mergeSettings(global,template,app,photo={}){return {...global,...template,...app,...photo};}
export function renderContent(target,app,{media,knowledge,settings={}}){
 const catalogs=new Map(media.assets.map(a=>[a.asset_id,a])),facts=new Map(knowledge.records.map(k=>[k.id,k]));target.replaceChildren();
 const heading=document.createElement('h1');heading.textContent=app.title;target.append(heading);
 const sections=[...app.sections,...(app.knowledge||[]).flatMap(id=>facts.get(id)?.sections||[])];
 for(const section of sections){const block=document.createElement('details'),title=document.createElement('summary');block.id=section.id;title.textContent=section.title;block.append(title);for(const paragraph of section.paragraphs||[section.text||'']){const p=document.createElement('p');p.textContent=paragraph;block.append(p);}
  for(const use of section.photos||[]){const asset=catalogs.get(use.asset_id);if(!asset)throw Error('Unknown asset '+use.asset_id);const options=mergeSettings({fit:'contain',maxWidth:720},settings.template||{},settings.app||{},use.settings||{}),figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption');image.src=new URL('../'+asset.path,import.meta.url);image.alt=asset.alt;image.style.cssText=`width:100%;height:auto;max-width:${Number(options.maxWidth)||720}px;object-fit:${options.fit==='cover'?'cover':'contain'}`;caption.textContent=use.caption||asset.credit;figure.append(image,caption);block.append(figure);}
 target.append(block);}
}
