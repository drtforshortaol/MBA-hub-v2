import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const manifest = JSON.parse(read('src/apps/evolution-timeline/manifest.json'));
const interfaces = JSON.parse(read('src/shared/interfaces.json'));
const html = read('src/apps/evolution-timeline/index.html');
const adapted = read('src/apps/evolution-timeline/app.js');
const bridge = read('src/shared/knowledge/evo-interface.js');
const knowledge = JSON.parse(read('src/shared/knowledge.json'));

test('EVO v11 integration keeps independent upstream provenance and read-only staging', () => {
  assert.equal(manifest.source_repository, 'drtforshortaol/evolution-timeline');
  assert.match(manifest.source_commit, /^[0-9a-f]{40}$/);
  assert.equal(manifest.publication_review, 'pending');
  assert.equal(manifest.integration.mode, 'read-only-offline-distribution');
  assert.equal(manifest.integration.development_remains_independent, true);
  assert.equal(manifest.integration.snapshot_commit, manifest.source_commit);
});

test('the timeline consumes exactly one declared versioned knowledge contract', () => {
  const dependency = manifest.dependencies.find(d => d.id === 'evo-knowledge');
  const contract = interfaces.interfaces.find(d => d.id === 'evo-knowledge');
  assert.ok(dependency);
  assert.ok(contract);
  assert.equal(dependency.version, contract.version);
  assert.equal(manifest.integration.interface_version, contract.version);
  assert.deepEqual(manifest.knowledge, ['evo-evolution-knowledge']);
  const record = knowledge.records.find(r => r.id === 'evo-evolution-knowledge');
  assert.ok(record);
  assert.equal(record.interface_version, contract.version);
  assert.equal(record.source_commit, manifest.source_commit);
  assert.equal(record.status, 'testing');
});

test('the application loads the pinned data before its original UI script', () => {
  const dataScript = '<script src="../../shared/knowledge/evo-interface.js"></script>';
  const uiScript = '<script src="app.js" defer></script>';
  assert.ok(html.includes(dataScript));
  assert.ok(html.includes(uiScript));
  assert.ok(html.indexOf(dataScript) < html.indexOf(uiScript));
  assert.ok(bridge.includes('window.EVO_APPROVED_DATA=Object.freeze('));
  assert.ok(adapted.includes('window.EVO_APPROVED_DATA.'));
  assert.ok(!html.includes('https://raw.githubusercontent.com/'));
});

test('both built environments preserve EVO pinned data for offline use', () => {
  for (const environment of ['developer', 'tester']) {
    const release = JSON.parse(read('dist/' + environment + '/release.json'));
    const urls = release.resources.map(r => r.url);
    assert.ok(urls.some(x => x.endsWith('shared/knowledge/evo-interface.js')),
      environment + ' missing pinned EVO dataset in offline release');
    assert.ok(urls.some(x => x.endsWith('apps/evolution-timeline/app.js')),
      environment + ' missing timeline application script');
  }
});
