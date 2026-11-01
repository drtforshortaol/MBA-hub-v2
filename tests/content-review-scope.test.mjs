import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { assessContentReviewScope, auditContentReviewScope } from '../scripts/audit-content-review-scope.mjs';
import { fileURLToPath } from 'node:url';
const digest = value => createHash('sha256').update(value).digest('hex');
function fixture() {
  const bytes = Buffer.from('old content');
  return { provenance: { source_commits: { upstream: 'abc' }, apps: [{ app_id: 'notes', source_repository: 'owner/upstream', source_commit: 'abc' }] },
    fidelity: { schema_version: 1, source_commits: { upstream: 'abc' }, apps: [{ app_id: 'notes', source_repository: 'owner/upstream', source_commit: 'abc', files: [
      { local_path: 'src/apps/notes/data.js', current_sha256: digest(bytes), pinned_sha256: digest(bytes), status: 'exact-pinned-bytes' }
    ] }] }, manifests: [{ app_id: 'notes', source_repository: 'owner/upstream', source_commit: 'abc', publication_review: 'approved', offline_assets: ['apps/new.jpeg'] }],
    files: new Map([['src/apps/notes/data.js', bytes], ['src/apps/notes/new.js', Buffer.from('new claims')], ['src/apps/new.jpeg', Buffer.from('image')]]), catalog: { assets: [] } };
}
test('inherited app-level status cannot cover new content or media and audit leaves inputs unchanged', () => {
  const input = fixture(), before = structuredClone(input);
  const report = assessContentReviewScope(input), app = report.apps[0];
  assert.equal(app.inherited_provenance_candidate, true);
  assert.equal(app.whole_app_inherited_approval_asserted, false);
  assert.equal(app.files.find(f => f.path.endsWith('new.js')).classification, 'local-addition-review');
  assert.equal(app.offline_media[0].classification, 'unregistered-media-rights-review');
  assert.deepEqual(structuredClone(input), before);
});
test('stale fidelity bytes and duplicate provenance fail evidence validation', () => {
  const input = fixture();
  input.files.set('src/apps/notes/data.js', Buffer.from('changed claims'));
  assert.match(assessContentReviewScope(input).errors.join(), /stale current-byte evidence/);
  input.provenance.apps.push({ ...input.provenance.apps[0] });
  const report = assessContentReviewScope(input);
  assert.equal(report.apps[0].inherited_provenance_candidate, false);
  assert.match(report.errors.join(), /unique matching/);
});
test('HTML static equality is technical review only; JS equality after media relocation is scoped evidence', () => {
  const input = fixture();
  input.fidelity.apps[0].files[0] = { ...input.fidelity.apps[0].files[0], status: 'changed', static_text_equal: true };
  assert.equal(assessContentReviewScope(input).apps[0].files[0].classification, 'static-text-preserved-technical-diff-review');
  input.fidelity.apps[0].files[0].content_data_comparison = { equal_after_only_image_url_normalization: true };
  assert.equal(assessContentReviewScope(input).apps[0].files[0].classification, 'content-preserved-image-url-migration-evidence');
});
test('unsafe or duplicated evidence paths are rejected', () => {
  const input = fixture();
  input.fidelity.apps[0].files.push({ local_path: 'src/apps/notes/../escape' });
  assert.throws(() => assessContentReviewScope(input), /Unsafe or duplicate fidelity path/);
});
test('current collection keeps October additions and three remaining media rights reviews explicit', async () => {
  const report = await auditContentReviewScope(fileURLToPath(new URL('..', import.meta.url)));
  assert.deepEqual(report.errors, []);
  const notes = report.apps.find(a => a.app_id === 'naturalist-field-notes');
  for (const name of ['october-2026-note.js', 'october-2026-08-14.html']) {
    assert.equal(notes.files.find(f => f.path.endsWith(name)).classification, 'local-addition-review');
  }
  assert.equal(notes.offline_media.filter(m => m.permission_review_pending).length, 0);
  assert.equal(report.apps.find(a => a.app_id === 'big-bellied-seahorse').offline_media.filter(m => m.permission_review_pending).length, 0);
  assert.equal(report.summary.media_rights_review_uses, 0);
});
