import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../src/apps/california-kelp-field-guide/index.html', import.meta.url), 'utf8');

test('field guide contains all 21 species cards', () => {
  assert.equal((html.match(/class="card"/g) || []).length, 21);
});

test('field guide includes 21 embedded individual illustrations before release', () => {
  assert.equal((html.match(/<div class="specimen-frame"><img\b/g) || []).length, 21, 'The accepted illustrated candidate has not been integrated');
});

test('field guide preserves descriptions for all species', () => {
  assert.equal((html.match(/class="restored-description"/g) || []).length, 21);
});

test('field guide retains exactly two bulk action controls', () => {
  assert.match(html, /id="expand"/);
  assert.match(html, /id="collapse"/);
  assert.doesNotMatch(html, /id="individual"/);
});
