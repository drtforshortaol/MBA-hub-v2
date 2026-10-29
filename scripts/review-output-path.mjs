import fs from 'node:fs';
import path from 'node:path';

// Review tools write generated artifacts, never repository source, approvals or
// retained verification records. In-checkout destinations use explicit scratch
// namespaces; callers may also choose an external scratch directory. Checking
// extension/src alone is insufficient: a template could replace config/platform.json.
const outputDirectories=new Set(['dist','review','review-drafts','reviewdrafts']);
export function checkedReviewOutputPath(root,filename,extension){
 const repository=path.resolve(root),target=path.resolve(filename);
 if(path.extname(target)!==extension)throw Error('Unsafe review output extension');
 let current=path.parse(target).root;
 for(const part of target.slice(current.length).split(path.sep)){
  current=path.join(current,part);let stat;
  try{stat=fs.lstatSync(current);}catch(error){if(error.code==='ENOENT')break;throw error;}
  if(stat.isSymbolicLink())throw Error('Symlink prohibited in review output');
  // A scratch filename can be another directory entry for protected source or
  // attached evidence. Path allowlists alone cannot distinguish those aliases.
  if(current===target&&(!stat.isFile()||stat.nlink!==1))throw Error('Review output must be a singly linked regular file');
 }
 const relative=path.relative(repository,target);
 if(relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative))){
  const parts=relative.split(path.sep);
  if(parts.length<2||!outputDirectories.has(parts[0])||parts[0]==='dist'&&['developer','tester'].includes(parts[1]))throw Error('Unsafe review output path: use dist/, review/, review-drafts/ or external scratch');
 }
 return target;
}
