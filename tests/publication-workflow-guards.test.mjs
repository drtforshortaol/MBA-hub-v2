import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// These known publication jobs must remain unconditionally disabled until owner authorization.
for (const [file,job] of [['iphone-preview-build.yml','deploy'],['seahorse-preview.yml','preview']]) {
 test(`${file} cannot publish on push, pull request or manual invocation`,()=>{
  const workflow=fs.readFileSync(`.github/workflows/${file}`,'utf8');
  const block=workflow.split(new RegExp(`^  ${job}:\\s*$`,'m'))[1]?.split(/^  [a-zA-Z][\w-]*:\s*$/m)[0];
  assert(block,`missing known publication job ${job}`);
  assert.match(block,/^    if: \$\{\{ false \}\}\s*$/m,'publication job must be unconditionally disabled');
  assert.match(block,/uses: actions\/deploy-pages@/);
 });
}
test('validation workflow enforces artifact integrity after regression tests',()=>{
 const workflow=fs.readFileSync('.github/workflows/october-v2-validation.yml','utf8');
 assert.match(workflow,/run: node scripts\/verify-build-artifacts\.mjs/);
 assert(workflow.indexOf('run: node scripts/verify-build-artifacts.mjs') > workflow.indexOf('run: npm test'));
});
