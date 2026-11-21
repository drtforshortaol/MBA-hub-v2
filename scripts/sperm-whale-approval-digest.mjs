import fs from 'node:fs';
import { inheritedContentDigest, ownerTextApprovalSupported } from './public-review.mjs';
const app=JSON.parse(fs.readFileSync('src/apps/sperm-whale/manifest.json','utf8'));
const evidence=JSON.parse(fs.readFileSync('docs/verification/sperm-whale-text-approval-20261101.json','utf8'));
const source=fs.readFileSync('src/apps/sperm-whale/index.html','utf8');
if(evidence.sections.length!==7)throw Error('Expected seven explicitly approved sections');
for(const row of evidence.sections){
 if(!source.includes(row.html))throw Error('Approved source section changed: '+row.id);
 if(!app.sections.some(section=>section.id===row.id&&section.text===row.body))throw Error('Approved searchable text changed: '+row.id);
}
console.log('SPERM_WHALE_CONTENT_SHA256='+inheritedContentDigest(app,{sourceRoot:'src'}));
console.log('SPERM_WHALE_APPROVAL_GUARD='+ownerTextApprovalSupported(app,{sourceRoot:'src'}));
