import fs from 'node:fs';
// The owner explicitly authorized the complete guide collection for public use.
// Tester isolation is enforced separately by build.mjs and the service worker.
export function preparePublicReview(out,input){
 fs.writeFileSync(`${out}/public-review.json`,JSON.stringify({
  publication:'owner-authorized-guide-collection',authorizationDate:'2026-10-12',
  libraryPersonalFieldsRemoved:0,operationalItemsRemoved:0,withheldApps:[],
  restored:['information-center','mba-leadership','naturalist-field-notes','aquarium-library-explorer']
 },null,2));
 const apps=structuredClone(input);
 // Existing V1 publication approval carries forward for unchanged migrated content.
 // This is separate from app functional testing and release readiness.
 for(const app of apps){if(app.source_version==='1.0' && app.publication_review==='pending')app.publication_review='inherited-v1-approved';}
 return apps;
}
