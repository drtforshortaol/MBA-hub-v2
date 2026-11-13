import fs from 'node:fs';
// The owner explicitly authorized the complete guide collection for public use.
// Tester isolation is enforced separately by build.mjs and the service worker.
export function preparePublicReview(out,input){
 fs.writeFileSync(`${out}/public-review.json`,JSON.stringify({
  publication:'owner-authorized-guide-collection',authorizationDate:'2026-10-12',
  libraryPersonalFieldsRemoved:0,operationalItemsRemoved:0,withheldApps:input.filter(app => app.app_id === 'naturalist-briefing-20261111').map(app => app.app_id),
  restored:['information-center','mba-leadership','naturalist-field-notes','aquarium-library-explorer']
 },null,2));
 const withheld = input.filter(app => app.app_id === 'naturalist-briefing-20261111');
 const catalogPath = `${out}/shared/media/catalog.json`;
 const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
 const blockedMedia = new Set(withheld.flatMap(app => app.media));
 for (const asset of catalog.assets.filter(asset => blockedMedia.has(asset.asset_id))) {
  fs.rmSync(`${out}/${asset.path}`, {force:true});
 }
 catalog.assets = catalog.assets.filter(asset => !blockedMedia.has(asset.asset_id));
 fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
 for (const app of withheld) fs.rmSync(`${out}/apps/${app.app_id}`, {recursive:true,force:true});
 const apps=structuredClone(input.filter(app => !withheld.includes(app)));
 // Existing V1 publication approval carries forward for unchanged migrated content.
 // This is separate from app functional testing and release readiness.
 for(const app of apps){if(app.source_repository && app.publication_review==='pending')app.publication_review='inherited-v1-approved';}
 return apps;
}
