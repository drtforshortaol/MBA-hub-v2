import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Independently retrieved evolution-timeline c6d782d3a8a03e407861a0fbc3aab76e5fbf8d0c,
// app.js Git blob 82f6edd91c7db816346f4905171b31ce773e27bb.
// Evaluate only the original data/function prefix before const storyView.
// These hashes bind every field and array order, not just event titles.
// Engineering inheritance evidence does not independently approve scientific claims.
const pinned = {
  early: '459ba982525cdbf809d12b2b84ebb65519d7cb8846bc18cce78d4761884e9e32',
  groups: '508aea509fda0cfa248f8e85a5f3e3027d7370fc46cf04cc96da6f46a1db87e0',
  earthDayRows: '2263bd8cb1df9494ce283246022aaf4ac9862c749a9d4ad9005b38758f86f646',
  otherDetails: 'e33076dea1ddab411d982b4b726b35584a135a474066349effea9fbce943266f',
  timeRows: '7366a13e0c6f03316c543bbc2cb042c0499c6450e63a2ac0b505e03dd22ff041'
};
const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('../src/shared/knowledge/evo-interface.js', import.meta.url), 'utf8'), context, { timeout: 3000 });
const data = context.window.EVO_APPROVED_DATA;
test('Timeline shared interface retains exactly the five pinned source data collections', () => {
  assert.deepEqual(Object.keys(data).sort(), Object.keys(pinned).sort());
});
for (const [name, expected] of Object.entries(pinned)) {
  test('Timeline complete pinned source collection: ' + name, () => {
    assert.equal(createHash('sha256').update(JSON.stringify(data[name])).digest('hex'), expected,
      'source data changed: review complete fields against the independent pinned repository');
  });
}
