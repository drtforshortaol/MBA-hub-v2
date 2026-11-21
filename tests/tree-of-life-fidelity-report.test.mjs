import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reviewTreeOfLife, restoreTreeHtml, restoreTreeScript } from '../scripts/migration/review-tree-of-life-fidelity.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const app = 'src/apps/tree-of-life-origins';
const icon = 'src/shared/media/asset-aa9c4cbb67f1dbc2--icon-192.svg';
function fixture(t) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'tree-fidelity-report-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const resource of [app, 'src/shared/media/catalog.json', 'config/migration-provenance.json', icon]) {
    const destination = path.join(directory, resource); mkdirSync(path.dirname(destination), { recursive: true });
    cpSync(path.join(root, resource), destination, { recursive: true });
  }
  return directory;
}
function editJson(directory, resource, edit) {
  const file = path.join(directory, resource), data = JSON.parse(readFileSync(file)); edit(data); writeFileSync(file, JSON.stringify(data));
}

test('Tree full-scope report binds complete current manifest, source identity and icon metadata without granting approval', () => {
  const report = reviewTreeOfLife({ root });
  assert.equal(report.current_source_checks_passed, true);
  assert.equal(report.complete_source_inventory_verified, false, 'no retrieved upstream source directory was supplied');
  assert.equal(report.approval_granted, false);
  assert.equal(report.source_inventory.length, 10);
  assert.equal(report.current_inventory.length, 4);
  assert.equal(report.normalized_source.length, 3);
  assert.equal(report.manifest.sections, 53);
  assert.equal(report.manifest.source_derived_sections.count, 53);
  assert.equal(report.manifest.source_derived_sections.complete_equal, true);
  assert.equal(report.media.bytes, 536);
});

test('Tree manifest identity permits only the documented optional shared-icon offline declaration', t => {
  const directory = fixture(t);
  editJson(directory, app + '/manifest.json', manifest => {
    const media = 'shared/media/asset-aa9c4cbb67f1dbc2--icon-192.svg';
    manifest.offline_assets = manifest.offline_assets.filter(value => value !== media);
  });
  const baseline = reviewTreeOfLife({ root: directory }).manifest.semantic_sha256;
  editJson(directory, app + '/manifest.json', manifest => manifest.offline_assets.push('shared/media/asset-aa9c4cbb67f1dbc2--icon-192.svg'));
  assert.equal(reviewTreeOfLife({ root: directory }).manifest.semantic_sha256, baseline);
  editJson(directory, app + '/manifest.json', manifest => manifest.offline_assets.push('shared/media/asset-aa9c4cbb67f1dbc2--icon-192.svg'));
  assert.throws(() => reviewTreeOfLife({ root: directory }), /duplicate offline assets/);
});

for (const [label, resource, mutate, expected] of [
  ['unknown manifest field', app + '/manifest.json', value => { value.extra_script = 'unreviewed.js'; }, /manifest semantics/],
  ['changed section prose', app + '/manifest.json', value => { value.sections[0].text += ' altered'; }, /manifest semantics/],
  ['changed section order', app + '/manifest.json', value => { value.sections.reverse(); }, /manifest semantics/],
  ['changed source pin', app + '/manifest.json', value => { value.source_commit = '0'.repeat(40); }, /manifest semantics/],
  ['added offline executable', app + '/manifest.json', value => { value.offline_assets.push('apps/tree-of-life-origins/extra.js'); }, /manifest semantics/],
  ['changed app provenance', 'config/migration-provenance.json', value => { value.apps.find(row => row.app_id === 'tree-of-life-origins').source_repository = 'another/repo'; }, /app provenance/],
  ['duplicate app provenance', 'config/migration-provenance.json', value => { value.apps.push(value.apps.find(row => row.app_id === 'tree-of-life-origins')); }, /exactly one record/],
  ['changed media provenance', 'config/migration-provenance.json', value => { value.media.find(row => row.asset_id === 'asset-aa9c4cbb67f1dbc2').source_path = 'icons/elsewhere.svg'; }, /media provenance/],
  ['removed source icon alias', 'src/shared/media/catalog.json', value => { value.assets.find(row => row.asset_id === 'asset-aa9c4cbb67f1dbc2').uses.pop(); }, /catalog metadata/],
  ['changed permission evidence', 'src/shared/media/catalog.json', value => { value.assets.find(row => row.asset_id === 'asset-aa9c4cbb67f1dbc2').permission_evidence = 'unreviewed'; }, /catalog metadata/]
]) test('Tree full-scope audit rejects ' + label, t => {
  const directory = fixture(t); editJson(directory, resource, mutate);
  assert.throws(() => reviewTreeOfLife({ root: directory }), expected);
});

for (const [label, resource, suffix] of [
  ['HTML', app + '/index.html', '<p>unreviewed scientific prose</p>'],
  ['executable', app + '/app.js', '\nconsole.log("unreviewed");'],
  ['stylesheet', app + '/styles.css', '\nbody{display:none}'],
  ['icon', icon, '<!-- unreviewed bytes -->']
]) test('Tree full-scope audit rejects unreviewed ' + label + ' bytes', t => {
  const directory = fixture(t), file = path.join(directory, resource);
  writeFileSync(file, Buffer.concat([readFileSync(file), Buffer.from(suffix)]));
  assert.throws(() => reviewTreeOfLife({ root: directory }), /normalized source byte count|source bytes|icon bytes/);
});

for (const directoryEntry of [false, true]) test('Tree full-scope audit rejects unknown app ' + (directoryEntry ? 'empty directories' : 'files'), t => {
  const directory = fixture(t), unexpected = path.join(directory, app, 'unknown');
  if (directoryEntry) mkdirSync(unexpected); else writeFileSync(unexpected, '');
  assert.throws(() => reviewTreeOfLife({ root: directory }), /inventory/);
});

for (const resource of [app, app + '/app.js', 'src/shared/media', 'src/shared/media/catalog.json', 'config/migration-provenance.json']) {
  test('Tree full-scope audit rejects identical-byte symlink substitution: ' + resource, t => {
    const directory = fixture(t), destination = path.join(directory, resource), backup = path.join(directory, 'backed-up');
    cpSync(destination, backup, { recursive: true }); rmSync(destination, { recursive: true, force: true }); symlinkSync(backup, destination);
    assert.throws(() => reviewTreeOfLife({ root: directory }), /symlink/);
  });
}

test('Tree full-scope report refuses incomplete upstream inventory rather than claiming source verification', t => {
  const sourceRoot = mkdtempSync(path.join(os.tmpdir(), 'tree-source-incomplete-'));
  t.after(() => rmSync(sourceRoot, { recursive: true, force: true }));
  writeFileSync(path.join(sourceRoot, 'app.js'), restoreTreeScript(readFileSync(path.join(root, app, 'app.js'), 'utf8')));
  assert.throws(() => reviewTreeOfLife({ root, sourceRoot }), /complete pinned source inventory/);
});

test('Tree complete-byte normalizers reject duplicate known migration fragments', () => {
  const html = readFileSync(path.join(root, app, 'index.html'), 'utf8');
  const script = readFileSync(path.join(root, app, 'app.js'), 'utf8');
  assert.throws(() => restoreTreeHtml(html + '<link rel="icon"'), /exactly once/);
  assert.throws(() => restoreTreeScript(script + '\n' + script), /exactly once/);
});
