import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SOURCE = Object.freeze({ repository: 'drtforshortaol/MBA-hub', commit: '5c219508d23255080f6b050cefa8092905447d81', directory: 'apps/tree-of-life-origins' });
const APP = 'tree-of-life-origins';
const MEDIA_ID = 'asset-aa9c4cbb67f1dbc2';
const MEDIA = 'shared/media/' + MEDIA_ID + '--icon-192.svg';
const ICON_SHA256 = 'aa9c4cbb67f1dbc2c2dd80d38fd20085dda4a47177ca8664353617d2ec52896e';
// Complete directory + icons listing retrieved read-only at SOURCE.commit.
// Omitted legacy packaging is inventoried; it is not silently treated as runtime.
const PINNED = {
  'README.md': ['bddfa2c80af948dad192ede72c501b8eb10551f9', 1094, 'legacy installation documentation; not runtime'],
  'app.js': ['8593db513cf65a44ec00cc8af2375cfa40810abe', 2507, 'retained executable with exact documented technical adaptations'],
  'hub-registry-entry.js': ['33da409e18d943f7fb77497e66b2e2df64fdb80e', 1626, 'legacy Hub registration replaced by V2 manifest'],
  'icons/icon-192.svg': ['02fccc74094d216c1d353cffc533a30e7170d236', 536, 'byte-identical centralized media'],
  'icons/icon-512.svg': ['02fccc74094d216c1d353cffc533a30e7170d236', 536, 'same bytes deduplicated into centralized media'],
  'index.html': ['74380569842a3aa3c64c3d27b30566b831008bcf', 26667, 'retained complete authored document with exact migration adaptations'],
  'manifest.webmanifest': ['6793564b646ed286cf9f9025a3dd5f19748e8910', 628, 'standalone PWA manifest replaced by isolated Hub packaging'],
  'service-worker.js': ['407ab9b9d8aa615cb50b2e9a6198295a276f162c', 730, 'standalone worker superseded by shared isolated Hub worker'],
  'styles.css': ['af0f8ea2fbfa3987f365f202a32bea231f59798f', 8279, 'complete original stylesheet unchanged'],
  'tree-of-life-origins-index.html': ['f85a278d4e6f077bbfabae3479ed98bfd07bf40f', 62565, 'alternate legacy monolithic document; not the pinned index.html entry']
};
const sha256 = value => createHash('sha256').update(value).digest('hex');
const gitBlob = bytes => createHash('sha1').update('blob ' + Buffer.byteLength(bytes) + '\0').update(bytes).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const semanticHash = value => sha256(JSON.stringify(canonical(value)));
function exactOne(rows, predicate, label) { assert.ok(Array.isArray(rows), label + ': expected array'); const matches = rows.filter(predicate); assert.equal(matches.length, 1, label + ': expected exactly one record'); return matches[0]; }
function safePath(root, relative = '') {
  assert.equal(typeof relative, 'string');
  assert.ok(!path.isAbsolute(relative) && !relative.split('/').some(part => part === '.' || part === '..'), 'unsafe relative path');
  const resolved = path.resolve(root);
  let current = path.parse(resolved).root;
  for (const part of resolved.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    assert.ok(!lstatSync(current).isSymbolicLink(), 'symlinked root component: ' + current);
  }
  for (const part of relative.split('/').filter(Boolean)) {
    current = path.join(current, part);
    assert.ok(!lstatSync(current).isSymbolicLink(), 'symlinked resource component: ' + current);
  }
  return current;
}
function regularBytes(root, relative) { const file = safePath(root, relative); assert.ok(lstatSync(file).isFile(), 'non-file: ' + relative); return readFileSync(file); }
function inventory(root, allowedDirectories = []) {
  const rows = [];
  function walk(relative = '') {
    const directory = safePath(root, relative);
    assert.ok(lstatSync(directory).isDirectory(), 'non-directory inventory root');
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = relative ? relative + '/' + entry.name : entry.name;
      assert.ok(!entry.isSymbolicLink(), 'symlink in inventory: ' + name);
      if (entry.isDirectory()) { assert.ok(allowedDirectories.includes(name), 'unknown inventory directory: ' + name); walk(name); }
      else { assert.ok(entry.isFile(), 'nonregular inventory resource: ' + name); const bytes = regularBytes(root, name); rows.push({ path: name, bytes: bytes.length, git_blob: gitBlob(bytes), sha256: sha256(bytes) }); }
    }
  }
  walk(); return rows.sort((a, b) => a.path.localeCompare(b.path));
}
function replaceOnce(text, before, after, label) { assert.equal(text.split(before).length, 2, label + ': migration must occur exactly once'); return text.replace(before, after); }
const ORIGINAL_TARGET = 'function openTarget(target){if(!target)return;let parent=target;while(parent){if(parent.tagName==="DETAILS")parent.open=true;parent=parent.parentElement}target.scrollIntoView({behavior:"smooth",block:"start"})}';
const FIXED_TARGET = 'function openTarget(target){if(!target)return;let parent=target;while(parent){if(parent.classList.contains("hidden-by-search")){searchInput.value="";runSearch();break}parent=parent.parentElement}parent=target;while(parent){if(parent.tagName==="DETAILS")parent.open=true;parent=parent.parentElement}target.scrollIntoView({behavior:"smooth",block:"start"})}';
const SHARED_REVEAL = 'document.addEventListener("mba:reveal-section",event=>{if(event.detail?.id!==event.target?.id)return;for(let parent=event.target;parent;parent=parent.parentElement){if(parent.classList?.contains("hidden-by-search")){searchInput.value="";runSearch();break}}});';
export function restoreTreeScript(source) {
  let restored = replaceOnce(source,
    'if(false)window.addEventListener("load",()=>Promise.resolve({update:async()=>{},installing:null,waiting:null,active:null}));',
    'if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));', 'isolated worker migration');
  restored = replaceOnce(restored, FIXED_TARGET, ORIGINAL_TARGET, 'search-hidden destination fix');
  const count = restored.split(SHARED_REVEAL).length - 1;
  assert.ok(count <= 1, 'duplicate shared reveal listener');
  if (count) restored = replaceOnce(restored, SHARED_REVEAL + '\n', '', 'shared reveal adapter');
  return restored;
}

const reviewedAddedAnchors = new Set([
    "How-did-chemistry-become-life-and-how-did-life-become-everything-we-see-today",
    "HORGASM-seven-characteristics",
    "Are-viruses-alive",
    "Formation-of-the-Early-Earth",
    "The-Earliest-Evidence-of-Life",
    "Possible-Greenland-evidence",
    "Stronger-microbial-evidence",
    "Life-Was-Microbial",
    "Why-Earth-could-support-long-term-evolution",
    "Likely-present",
    "Not-yet-present-as-eukaryotic-organelles",
    "Cyanobacteria-Changed-the-Planet",
    "Why-oxygen-was-initially-a-pollutant",
    "Why-oxygen-did-not-accumulate-immediately",
    "The-Great-Oxidation-Event",
    "Oxygen-levels-rose-in-stages",
    "Why-oxygen-became-an-opportunity",
    "Why-mitochondria-matter",
    "All-plants-have-mitochondria",
    "Red-algae",
    "Evolution-is-a-tree-not-a-ladder",
    "Plants-and-animals-are-separate-branches",
    "What-the-common-ancestor-tells-us",
    "Taxonomic-rank-versus-evolutionary-divergence",
    "REFERENCE-Scientific-Cautions-Guide-level"
]);
export function restoreTreeHtml(html) {
  let restored = replaceOnce(html, '<link rel="icon"', '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon"', 'standalone manifest replacement');
  const mediaPath = '../../' + MEDIA;
  assert.equal(restored.split(mediaPath).length - 1, 2, 'expected exactly two relocated icon references');
  restored = restored.replaceAll(mediaPath, 'icons/icon-192.svg');
  for (const [before, after, label] of [
    ['<style>[data-v2-maintenance-hidden="true"]{display:none!important}</style></head>', '</head>', 'maintenance style'],
    ['<button id="installButton" class="install-button" hidden="hidden" data-v2-maintenance-hidden="true" aria-hidden="true" disabled>', '<button id="installButton" class="install-button" hidden>', 'Hub install ownership'],
    ['<p id="offlineStatus" data-v2-maintenance-hidden="true" hidden="hidden" aria-hidden="true">', '<p id="offlineStatus">', 'Hub offline ownership'],
    ['<script type="module" src="../../core/app-contract.js"></script></body>', '</body>', 'shared app contract']
  ]) restored = replaceOnce(restored, before, after, label);
  for (const id of reviewedAddedAnchors) {
    const attribute = ' id="' + id + '"';
    restored = replaceOnce(restored, attribute, '', 'stable section anchor ' + id);
  }
  return restored;
}

export function reviewTreeOfLife({ root = process.cwd(), sourceRoot = null } = {}) {
  root = path.resolve(root);
  const directory = safePath(root, 'src/apps/' + APP);
  const current = inventory(directory);
  assert.deepEqual(current.map(row => row.path), ['app.js', 'index.html', 'manifest.json', 'styles.css'], 'unknown/missing complete current app inventory');
  const read = name => regularBytes(directory, name);
  const restored = { 'app.js': Buffer.from(restoreTreeScript(read('app.js').toString('utf8'))), 'index.html': Buffer.from(restoreTreeHtml(read('index.html').toString('utf8'))), 'styles.css': read('styles.css') };
  for (const [name, bytes] of Object.entries(restored)) {
    assert.equal(bytes.length, PINNED[name][1], 'normalized source byte count: ' + name);
    assert.equal(gitBlob(bytes), PINNED[name][0], 'unreviewed complete source bytes: ' + name);
  }
  const manifest = JSON.parse(read('manifest.json'));
  assert.ok(Array.isArray(manifest.offline_assets) && manifest.offline_assets.every(value => typeof value === 'string'), 'malformed offline assets');
  assert.equal(new Set(manifest.offline_assets).size, manifest.offline_assets.length, 'duplicate offline assets');
  const normalizedManifest = structuredClone(manifest);
  normalizedManifest.offline_assets = normalizedManifest.offline_assets.filter(value => value !== MEDIA);
  assert.equal(semanticHash(normalizedManifest), '6fc03090bbbb3e3b259cce504c8f86d7f9ad0b46ea39353a1167a6f0c4b5dc05',
    'unreviewed complete V2 manifest semantics (all fields, sections and order)');
  const provenance = JSON.parse(regularBytes(root, 'config/migration-provenance.json'));
  assert.equal(provenance.source_commits['MBA-hub'], SOURCE.commit, 'upstream source pin');
  const provenanceApp = exactOne(provenance.apps, row => row?.app_id === APP, 'app provenance');
  assert.deepEqual(provenanceApp, { app_id: APP, source_repository: SOURCE.repository, source_commit: SOURCE.commit, source_version: 'preserved-v1', listed: false }, 'complete app provenance');
  const provenanceMedia = exactOne(provenance.media, row => row?.asset_id === MEDIA_ID, 'media provenance');
  assert.deepEqual(provenanceMedia, { asset_id: MEDIA_ID, path: MEDIA, source_repository: SOURCE.repository, source_commit: SOURCE.commit, source_path: SOURCE.directory + '/icons/icon-192.svg', sha256: ICON_SHA256 }, 'complete media provenance');
  const catalog = JSON.parse(regularBytes(root, 'src/shared/media/catalog.json'));
  const asset = exactOne(catalog.assets, row => row?.asset_id === MEDIA_ID, 'catalog media');
  assert.equal(semanticHash(asset), '16ce974149184f05503c50c5c3290a300a946ce6036acedae2dc1468fabdc791', 'complete icon catalog metadata/recorded permission changed');
  const icon = regularBytes(root, 'src/' + MEDIA);
  assert.equal(sha256(icon), ICON_SHA256, 'icon bytes');
  assert.equal(gitBlob(icon), PINNED['icons/icon-192.svg'][0], 'pinned icon blob');
  let sourceFiles = null;
  if (sourceRoot) {
    sourceFiles = inventory(path.resolve(sourceRoot), ['icons']);
    assert.deepEqual(sourceFiles.map(row => row.path).sort(), Object.keys(PINNED).sort(), 'unknown/missing complete pinned source inventory');
    for (const row of sourceFiles) {
      assert.equal(row.bytes, PINNED[row.path][1], 'pinned source byte count: ' + row.path);
      assert.equal(row.git_blob, PINNED[row.path][0], 'pinned source blob: ' + row.path);
    }
    for (const [name, bytes] of Object.entries(restored)) assert.deepEqual(bytes, regularBytes(sourceRoot, name), 'complete restored source comparison: ' + name);
    assert.deepEqual(icon, regularBytes(sourceRoot, 'icons/icon-192.svg'));
    assert.deepEqual(icon, regularBytes(sourceRoot, 'icons/icon-512.svg'));
  }
  return {
    schema_version: 1, application: APP, source: SOURCE,
    scope: 'Engineering byte/inventory/manifest identity evidence; no scientific, image-rights, native-browser, device or release approval',
    current_source_checks_passed: true,
    complete_source_inventory_verified: Boolean(sourceFiles),
    source_inventory: Object.entries(PINNED).map(([name, [blob, bytes, disposition]]) => ({ path: name, git_blob: blob, bytes, disposition })),
    retrieved_source_inventory: sourceFiles,
    current_inventory: current,
    normalized_source: Object.entries(restored).map(([name, bytes]) => ({ path: name, git_blob: gitBlob(bytes), sha256: sha256(bytes), bytes: bytes.length })),
    manifest: { semantic_sha256: semanticHash(normalizedManifest), sections: manifest.sections.length, declared_offline_assets: manifest.offline_assets },
    media: { asset_id: MEDIA_ID, path: MEDIA, bytes: icon.length, sha256: sha256(icon), catalog_semantic_sha256: semanticHash(asset), recorded_permission: asset.permission },
    approval_granted: false,
    remaining: ['Shared-navigation end-to-end evidence and independent technical reconciliation review', 'Physical browser/device/layout/accessibility acceptance', 'Existing scientific/editorial, permission and operational approval gates']
  };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2); let root = process.cwd(), sourceRoot = null;
  for (let i = 0; i < args.length; i++) {
    assert.ok(['--root', '--source-root'].includes(args[i]), 'unknown argument: ' + args[i]);
    assert.ok(args[i + 1] && !args[i + 1].startsWith('--'), 'missing argument value');
    if (args[i] === '--root') root = args[++i]; else sourceRoot = args[++i];
  }
  console.log(JSON.stringify(reviewTreeOfLife({ root, sourceRoot }), null, 2));
}
