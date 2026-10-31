import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../src/apps/big-bellied-seahorse/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'));
const html = readFileSync(new URL('index.html', root), 'utf8');

test('Seahorse draft retains explicit content and publication gates', () => {
  assert.equal(manifest.app_id, 'big-bellied-seahorse');
  assert.equal(manifest.status, 'testing');
  assert.equal(manifest.publication_review, 'owner-approved-text');
  assert.match(html, /Image permissions and release acceptance pending\./);
  assert.match(html, /AI-generated illustration supplied and approved for replacement by the hub owner\./);
  assert.match(html, /Check authoritative listings again before publication\./);
  assert.match(html, /MBA Species Guide • Draft/);
});

test('Seahorse search sections remain identical to their displayed draft text', () => {
  assert.equal(manifest.sections.length, 12);
  const ids = new Set();
  for (const { id, title, text } of manifest.sections.slice(0,10)) {
    assert.ok(!ids.has(id), `duplicate section: ${id}`);
    ids.add(id);
    const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`<details id="${escape(id)}"><summary>${escape(title)}</summary><p>${escape(text.replaceAll('&','&amp;'))}</p>`);
    if (id === 'References') { assert.match(html, /<details id="References"><summary>References<\/summary><p>Source: October 8–14, 2026 Naturalist update\./); assert.match(html, /animaldiversity\.org\/accounts\/Hippocampus_abdominalis/); } else assert.match(html, pattern, `manifest/display mismatch: ${id}`);
  }
});

test('Seahorse photos remain registered for offline review without implying permission', () => {
  const images = [...html.matchAll(/<(?:img|image)\b[^>]*\b(?:src|href)="\.\.\/(IMG_\d+\.jpeg)"/g)].map(match => match[1]);
  const paths = [...new Set(images.map(image => `apps/${image}`))].sort();
  assert.deepEqual(paths, manifest.offline_assets.filter(path => /IMG_\d+\.jpeg$/.test(path)).sort());
  assert.equal(paths.length, 3);
  assert.ok(manifest.offline_assets.includes('apps/seahorse-takenaga.jpeg'));
  assert.equal(manifest.media.length, 4);
});
