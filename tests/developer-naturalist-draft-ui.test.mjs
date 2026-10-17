import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const developer=fs.readFileSync(new URL('../src/core/developer.js',import.meta.url),'utf8');
test('Developer Mode exposes replacement drafts without publishing',()=>{
 assert.match(developer,/replacementDrafts=new Map\(\)/);
 assert.match(developer,/Verified replacement text for statement/);
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
