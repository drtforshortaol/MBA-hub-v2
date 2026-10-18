import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const developer=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
test('Developer Mode exposes replacement drafts without publishing',()=>{
 assert.match(developer,/replacementDrafts=new Map\(\)/);
 assert.match(developer,/Proposed replacement text \(scientific verification required\) for statement/);
 assert.match(developer,/draft-validation-required/);
 assert.match(developer,/replacement_text:/);
 assert.match(developer,/reviewActionQueue\(packet.review_decisions,packet.entries\)/);
 assert.match(developer,/can_auto_publish:false/);
});

test('Developer Mode validates drafts against canonical schema and blocks conflicts',()=>{
 assert.match(developer,/Check replacement drafts/);
 assert.match(developer,/validateDraft\(draft,app\)/);
 assert.match(developer,/entry\.duplicate_of!=null/);
 assert.match(developer,/route\.section_id/);
 assert.match(developer,/function reviewedTarget\(entry\)/);
 assert.match(developer,/reviewed_section_snapshot!==JSON\.stringify\(section\)/);
 assert.match(developer,/validation only, nothing saved or published/);
});

test('validated Naturalist proposals export without changing content',()=>{
 assert.match(developer,/Download validated draft proposals/);
 assert.match(developer,/mba-v2-naturalist-draft-proposals/);
 assert.match(developer,/validateDraft\(draft,app\)\.valid/);
 assert.match(developer,/No valid reviewed replacement drafts available for export/);
 assert.match(developer,/committed:false,published:false,can_auto_publish:false/);
});

test('review recovery fingerprint includes routing and target version',()=>{
 assert.match(developer,/route:e\.route/);
 assert.match(developer,/app_version:e\.reviewed_app_version/);
 assert.match(developer,/section_snapshot:e\.reviewed_section_snapshot/);
 assert.match(developer,/source_snapshot:e\.reviewed_source_snapshot/);
 assert.match(developer,/reviewStorageKey\(env\.namespace,sourceFingerprint\)/);
});

test('draft export requires all scientific and editorial decisions complete',()=>{
 assert.match(developer,/Complete every scientific and editorial decision before exporting draft proposals/);
 assert.match(developer,/packet\.review_decisions\.some\(decision=>/);
 assert.match(developer,/if\(typeof showQueue==='function'\)showQueue\(\)/);
});

test('Naturalist export fails closed instead of silently omitting invalid updates',()=>{
 assert.match(developer,/drafts\.length!==pendingUpdates\.length/);
 assert.match(developer,/Export blocked:/);
 assert.match(developer,/Resolve all updates before exporting/);
 assert.match(developer,/scientific verification required/);
});

test('Developer Mode surfaces blocked review actions in draft checks and portable exports',()=>{
 assert.match(developer,/queue\.blocked_items\.map\(item=>'blocked statement '/);
 assert.match(developer,/const blocked_actions=queue\.blocked_items\.map/);
 assert.match(developer,/actions,blocked_actions,scientific_verification/);
 assert.match(developer,/preparation_status:'blocked-review'/);
 assert.match(developer,/block_reasons:\[\.\.\.item\.block_reasons\]/);
});

test('reviewed action packet downloads contain valid JSON rather than escaped trailing characters',()=>{
 const start=developer.indexOf("kind:'mba-v2-naturalist-reviewed-action-packet'");
 assert.ok(start>=0);
 const tail=developer.slice(start,start+800);
 assert.ok(tail.includes("JSON.stringify(payload,null,2)+'\\n'"));
 assert.ok(!tail.includes("JSON.stringify(payload,null,2)+'\\\\n'"));
});

test('review navigation treats missing proposed action as incomplete',()=>{
 assert.match(developer,/const incomplete=index=>\{const decision=packet\.review_decisions\[index\];return decision\.scientific_status!==/);
 assert.match(developer,/decision\.proposed_action==='needs-review'/);
 assert.match(developer,/Choose a proposed action to complete this review/);
 assert.match(developer,/All statements have scientific, editorial, and action decisions recorded/);
});

test('Developer Mode provides read-only live before-and-after section preview',()=>{
 assert.match(developer,/Preview existing section and proposed replacement/);
 assert.match(developer,/before\.textContent=target\?'CURRENT/);
 assert.match(developer,/after\.textContent='PROPOSED/);
 assert.match(developer,/replacementDrafts\.set\(item\.index,replacementInput\.value\);refreshPreview\(\)/);
 assert.match(developer,/comparison\.append\(comparisonHeading,before,after\)/);
});
