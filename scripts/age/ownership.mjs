import path from 'node:path';

/** AGE-001: apps own only their app directory and consume shared services by contract. */
export function validateAppOwnership(apps) {
 const failures=[];
 for(const app of apps){
  const id=app.app_id;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id||'')) {failures.push(`invalid app id: ${id}`);continue;}
  if(app.owner!==id) failures.push(`${id}: owner must match app_id`);
  const root=`apps/${id}/`;
  const entry=app.entry_point||'';
  if(!entry.startsWith(root)||!entry.endsWith('.html')) failures.push(`${id}: entry_point outside app ownership`);
  for(const asset of app.offline_assets||[]){
   if(asset.includes('..')||path.posix.isAbsolute(asset)||asset.startsWith('core/')||asset.startsWith('apps/')&&!asset.startsWith(root))
    failures.push(`${id}: unauthorized offline asset ${asset}`);
   else if(!asset.startsWith(root)&&!asset.startsWith('shared/')) failures.push(`${id}: asset outside owned or shared scope ${asset}`);
  }
 }
 return failures;
}
