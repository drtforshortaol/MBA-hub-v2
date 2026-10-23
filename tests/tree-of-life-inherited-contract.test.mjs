import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const app = new URL('../src/apps/tree-of-life-origins/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', app), 'utf8'));
const html = readFileSync(new URL('index.html', app), 'utf8');
const script = readFileSync(new URL('app.js', app), 'utf8');

test('Tree of Life manifest search destinations have unique real HTML anchors', () => {
  assert.equal(manifest.app_id, 'tree-of-life-origins');
  assert.ok(manifest.sections.length >= 53, 'reviewed inherited section inventory unexpectedly shrank');
  const ids = new Set();
  for (const section of manifest.sections) {
    assert.equal(typeof section.id, 'string');
    assert.ok(section.id && !ids.has(section.id), 'duplicate/empty section: ' + section.id);
    ids.add(section.id);
    assert.ok(section.title?.trim(), 'missing section title: ' + section.id);
    assert.ok(section.text?.trim(), 'missing section search text: ' + section.id);
    assert.ok(html.includes('id="' + section.id + '"'), 'unreachable section: ' + section.id);
  }
});

test('Tree of Life deep links and offline entry retain existing app contract', () => {
  assert.equal(manifest.entry_point, 'apps/tree-of-life-origins/index.html');
  assert.ok(manifest.offline_assets.includes(manifest.entry_point));
  assert.ok(manifest.offline_assets.includes('apps/tree-of-life-origins/app.js'));
  assert.ok(manifest.offline_assets.includes('apps/tree-of-life-origins/styles.css'));
  assert.equal(new Set(manifest.offline_assets).size, manifest.offline_assets.length);
  assert.match(script, /if\(location\.hash\)openTarget\(document\.getElementById/);
  assert.match(script, /while\(parent\).*?parent\.open=true/);
  assert.match(script, /history\.replaceState/);
});
