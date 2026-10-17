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
 assert.match(developer,/entry\.route\?\.section_id/);
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
 assert.match(developer,/route:result\.entries\[e\.index\]\?\.route/);
 assert.match(developer,/app_version:registry\.apps\.find/);
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
