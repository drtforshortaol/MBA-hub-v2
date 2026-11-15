import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {assessProductionContent} from '../scripts/age/blue-content-fidelity.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mba-age-008-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const baseline = path.join(root, 'baseline');
  const candidate = path.join(root, 'candidate');
  for (const dir of [baseline, candidate]) fs.mkdirSync(path.join(dir, 'src', 'apps'), {recursive: true});
  function put(dir, relative, value) {
    const full = path.join(dir, 'src', relative);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  }
  const manifest = {
    app_id: 'existing-guide', version: 1, sections: [{id: 'first', title: 'First', body: 'Original'}],
    media: ['photo-1'], offline_assets: ['apps/existing-guide/photo.png'], listed: true
  };
  for (const dir of [baseline, candidate]) {
    put(dir, 'apps/existing-guide/manifest.json', manifest);
    put(dir, 'apps/existing-guide/photo.png', 'picture bytes');
    put(dir, 'shared/core.js', 'export const VERSION = 1;');
  }
  return {baseline, candidate, put, manifest};
}

test('preserving deployed Blue content passes with additional new apps', t => {
  const f = fixture(t);
  f.put(f.candidate, 'apps/new-guide/manifest.json', {
    app_id: 'new-guide', sections: [{id:'intro', title:'Intro'}], offline_assets: []
  });
  const result = assessProductionContent(f.baseline, f.candidate);
  assert.equal(result.baseline_app_count, 1);
  assert.equal(result.candidate_app_count, 2);
  assert.equal(result.content_inventory_preserved, true);
  assert.equal(result.release_eligible, true);
});

test('removing an existing Blue guide fails closed', t => {
  const f = fixture(t);
  fs.rmSync(path.join(f.candidate, 'src/apps/existing-guide'), {recursive:true});
  const result = assessProductionContent(f.baseline, f.candidate);
  assert.equal(result.release_eligible, false);
  assert.ok(result.blockers.some(b => b.kind === 'missing-production-application'));
  assert.ok(result.missing_source_files.length > 0);
});

test('missing a section, offline asset association, or media ID blocks release', t => {
  const f = fixture(t);
  f.put(f.candidate, 'apps/existing-guide/manifest.json', {
    ...f.manifest, sections: [], media: [], offline_assets: []
  });
  const result = assessProductionContent(f.baseline, f.candidate);
  assert.equal(result.content_inventory_preserved, false);
  assert.equal(result.release_eligible, false);
  assert.deepEqual(result.app_differences[0].missing_sections.map(x => x.id), ['first']);
  assert.deepEqual(result.app_differences[0].missing_media_ids, ['photo-1']);
  assert.deepEqual(result.app_differences[0].missing_offline_asset_paths, ['apps/existing-guide/photo.png']);
});

test('editing an existing section requires review even without deleting it', t => {
  const f = fixture(t);
  f.put(f.candidate, 'apps/existing-guide/manifest.json', {
    ...f.manifest, sections: [{id:'first', title:'First', body:'Rewritten'}]
  });
  const result = assessProductionContent(f.baseline, f.candidate);
  assert.equal(result.release_eligible, false);
  assert.equal(result.app_differences[0].altered_sections.length, 1);
});

test('changing shared source requires independent code review', t => {
  const f = fixture(t);
  f.put(f.candidate, 'shared/core.js', 'export const VERSION = 2;');
  const result = assessProductionContent(f.baseline, f.candidate);
  assert.equal(result.content_inventory_preserved, true);
  assert.equal(result.release_eligible, false);
  assert.deepEqual(result.unreviewed_source_changes, ['src/shared/core.js']);
});

test('hiding a previously listed guide fails closed', t => {
  const f = fixture(t);
  f.put(f.candidate, 'apps/existing-guide/manifest.json', {...f.manifest, listed: false});
  const result = assessProductionContent(f.baseline, f.candidate);
  assert.equal(result.release_eligible, false);
  assert.ok(result.blockers.some(b => b.kind === 'hidden-production-app'));
});
