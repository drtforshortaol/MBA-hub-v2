#!/usr/bin/env node
// Read-only scope triage. No category is a scientific/editorial approval.
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const mediaPattern = /\.(?:jpe?g|png|gif|webp|svg|mp3|mp4|wav|ogg|webm)$/i;
const safePath = path => typeof path === 'string' && !path.includes('\\') && !path.startsWith('/') && path.split('/').every(part => part && part !== '.' && part !== '..');

export function assessContentReviewScope({ provenance, fidelity, manifests, files, catalog }) {
  const errors = [], apps = [];
  if (fidelity.schema_version !== 1 || !Array.isArray(fidelity.apps)) throw new Error('Unsupported fidelity evidence');
  if (JSON.stringify(fidelity.source_commits) !== JSON.stringify(provenance.source_commits)) errors.push('Pinned source commits differ from provenance');
  const seen = new Set();
  for (const manifest of [...manifests].sort((a, b) => a.app_id.localeCompare(b.app_id))) {
    const aid = manifest.app_id;
    if (!safePath(aid) || aid.includes('/') || seen.has(aid)) throw new Error('Unsafe or duplicate app ID');
    seen.add(aid);
    const prefix = `src/apps/${aid}/`;
    const sourceRows = provenance.apps.filter(row => row.app_id === aid);
    const evidenceRows = fidelity.apps.filter(row => row.app_id === aid);
    const inheritedCandidate = sourceRows.length === 1 && evidenceRows.length === 1 &&
      sourceRows[0].source_repository === evidenceRows[0].source_repository && sourceRows[0].source_commit === evidenceRows[0].source_commit &&
      sourceRows[0].source_repository === manifest.source_repository && sourceRows[0].source_commit === manifest.source_commit;
    if (sourceRows.length && !inheritedCandidate) errors.push(`${aid}: unique matching provenance/fidelity/manifest required`);
    const evidence = inheritedCandidate ? evidenceRows[0] : null;
    const mapped = new Map();
    for (const item of evidence?.files ?? []) {
      if (!safePath(item.local_path) || !item.local_path.startsWith(prefix) || mapped.has(item.local_path)) throw new Error('Unsafe or duplicate fidelity path');
      mapped.set(item.local_path, item);
      const bytes = files.get(item.local_path);
      if (item.current_sha256 && (!bytes || sha256(bytes) !== item.current_sha256)) errors.push(`${item.local_path}: stale current-byte evidence`);
      if (!item.current_sha256 && bytes) errors.push(`${item.local_path}: file appeared after missing-file evidence`);
    }
    const scopes = [];
    for (const [path, bytes] of [...files].filter(([path]) => path.startsWith(prefix)).sort(([a], [b]) => a.localeCompare(b))) {
      const item = mapped.get(path), name = path.slice(prefix.length);
      let classification;
      if (name === 'manifest.json') classification = 'registration-and-search-metadata-review';
      else if (!item) classification = inheritedCandidate ? 'local-addition-review' : 'new-app-content-review';
      else if (item.status === 'exact-pinned-bytes' && item.pinned_sha256 === sha256(bytes)) classification = 'exact-pinned-bytes-evidence';
      else if (item.content_data_comparison?.equal_after_only_image_url_normalization === true) classification = 'content-preserved-image-url-migration-evidence';
      else if (item.static_text_equal === true) classification = 'static-text-preserved-technical-diff-review';
      else if (/\.css$/i.test(name)) classification = 'style-diff-review';
      else classification = 'changed-content-or-code-review';
      scopes.push({ path, sha256: sha256(bytes), classification, inherited_approval_asserted: false });
    }
    const media = [...new Set((manifest.offline_assets ?? []).filter(path => mediaPattern.test(path)))].sort().map(path => {
      if (!safePath(path)) throw new Error('Unsafe media path');
      const bytes = files.get(`src/${path}`);
      if (!bytes) errors.push(`${aid}: missing offline media ${path}`);
      const registered = catalog.assets.filter(asset => asset.path === path);
      const rightsPending = registered.length !== 1 || !['owner-approved-v1', 'approved', 'licensed', 'public-domain'].includes(registered[0]?.permission);
      return { path, sha256: bytes ? sha256(bytes) : null, catalog_registered: registered.length === 1,
        permission_states: registered.map(asset => asset.permission), permission_review_pending: rightsPending,
        classification: registered.length !== 1 ? 'unregistered-media-rights-review' : rightsPending ? 'registered-media-rights-review' : 'catalog-record-not-new-permission', inherited_approval_asserted: false };
    });
    apps.push({ app_id: aid, inherited_provenance_candidate: inheritedCandidate,
      whole_app_inherited_approval_asserted: false, files: scopes, offline_media: media });
  }
  for (const app of provenance.apps) if (!seen.has(app.app_id)) errors.push(`${app.app_id}: provenance app missing from current manifests`);
  return { schema_version: 1, scope: 'File-level review triage; no approval grants or eligibility changes',
    fidelity_source_commit: fidelity.audited_source_commit, errors, apps,
    summary: { apps: apps.length, local_additions: apps.flatMap(a => a.files).filter(f => f.classification === 'local-addition-review').length,
      new_app_files: apps.flatMap(a => a.files).filter(f => f.classification === 'new-app-content-review').length,
      unregistered_media_uses: apps.flatMap(a => a.offline_media).filter(m => !m.catalog_registered).length,
      media_rights_review_uses: apps.flatMap(a => a.offline_media).filter(m => m.permission_review_pending).length,
      approval_flags_changed: false },
    limitations: ['All classifications are evidence/review scope, not approval.',
      'Matching app provenance never covers local additions or changed claims.',
      'Static-text equality excludes script-generated prose and embedded image claims.',
      'Registration metadata includes search wording and requires separate reviewed differences.',
      'Exact bytes establish fidelity only; source approval scope remains separately recorded.'] };
}

export async function auditContentReviewScope(root) {
  const files = new Map();
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symlinks not supported in content audit');
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) files.set(relative(root, path).split(sep).join('/'), await readFile(path));
    }
  }
  await walk(resolve(root, 'src'));
  const json = path => JSON.parse(files.get(path)?.toString() ?? 'null');
  const manifests = [...files].filter(([path]) => /^src\/apps\/[^/]+\/manifest\.json$/.test(path)).map(([, bytes]) => JSON.parse(bytes));
  return assessContentReviewScope({ files, manifests, catalog: json('src/shared/media/catalog.json'),
    provenance: JSON.parse(await readFile(resolve(root, 'config/migration-provenance.json'), 'utf8')),
    fidelity: JSON.parse(await readFile(resolve(root, 'docs/verification/migration-fidelity-20261021.json'), 'utf8')) });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length > 2) throw new Error('Usage: node scripts/audit-content-review-scope.mjs');
    const report = await auditContentReviewScope(resolve(fileURLToPath(new URL('..', import.meta.url))));
    console.log(JSON.stringify(report, null, 2));
    if (report.errors.length) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
