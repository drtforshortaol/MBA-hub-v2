import test from 'node:test';
import { createHash } from 'node:crypto';
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

test('Tree of Life in-app links and fast tools resolve to existing targets', () => {
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
  const links = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  const quickTools = [...html.matchAll(/data-target="([^"]+)"/g)].map(match => match[1]);
  assert.ok(links.length >= 18, 'inherited in-app navigation unexpectedly shrank');
  assert.ok(quickTools.length >= 9, 'inherited fast tools unexpectedly shrank');
  for (const target of [...links, ...quickTools]) {
    assert.ok(ids.has(target), 'broken in-app navigation target: ' + target);
  }
});

test('Tree of Life search and expand/collapse controls remain wired', () => {
  for (const id of ['searchInput', 'searchStatus', 'clearSearch', 'collapseAll']) {
    assert.ok(html.includes('id="' + id + '"'), 'missing interactive control: ' + id);
    assert.ok(script.includes('getElementById("' + id + '")'), 'unwired interactive control: ' + id);
  }
  assert.ok(script.includes('addEventListener("input",runSearch)'), 'search input handler missing');
  assert.ok(script.includes('classList.toggle("hidden-by-search",!hit)'), 'search filtering missing');
  assert.ok(script.includes('$$("details").forEach(d=>d.open=false)'), 'collapse behavior missing');
});

test('Tree of Life executable and stylesheet match pinned V1 except isolated Hub worker migration', () => {
  // Read-only MBA-hub commit 5c219508d23255080f6b050cefa8092905447d81.
  // A Git blob hash binds the complete upstream bytes without network access in CI.
  const gitBlobSha = bytes => createHash('sha1')
    .update('blob ' + Buffer.byteLength(bytes) + '\0')
    .update(bytes).digest('hex');
  const disabledWorker = 'if(false)window.addEventListener("load",()=>Promise.resolve({update:async()=>{},installing:null,waiting:null,active:null}));';
  const originalWorker = 'if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));';
  assert.equal(script.split(disabledWorker).length, 2, 'worker migration must occur exactly once');
  const restoredSource = script.replace(disabledWorker, originalWorker);
  assert.equal(gitBlobSha(restoredSource), '8593db513cf65a44ec00cc8af2375cfa40810abe',
    'unreviewed executable change relative to pinned V1');
  const css = readFileSync(new URL('styles.css', app));
  assert.equal(gitBlobSha(css), 'af0f8ea2fbfa3987f365f202a32bea231f59798f',
    'unreviewed stylesheet change relative to pinned V1');
});

test('Tree of Life inherited static text, sections and headings remain byte-bound', () => {
  // The complete HTML is separately reviewed; these checks prevent content
  // truncation without interpreting or newly approving scientific claims.
  const headings = [...html.matchAll(/<summary>/g)];
  const chapters = [...html.matchAll(/class="major-dropdown searchable"/g)];
  const subchapters = [...html.matchAll(/class="sub-dropdown"/g)];
  assert.equal(chapters.length, 10, 'inherited major chapters changed');
  assert.equal(subchapters.length, 37, 'inherited subchapter structure changed');
  assert.ok(headings.length >= 47, 'inherited disclosure headings missing');
  for (const phrase of [
    'How did chemistry become life',
    'The Origin of Life Flowchart',
    'HORGASM: seven characteristics',
    'Scientific Cautions',
    'Tree of Life Origins · MBA Hub · Version 2.0.0'
  ]) {
    assert.ok(html.includes(phrase), 'inherited section text missing: ' + phrase);
  }
});

test('Tree of Life V2 anchor additions preserve original authored markup', () => {
  // Source baseline: MBA-hub 5c219508d23255080f6b050cefa8092905447d81,
  // apps/tree-of-life-origins/index.html. The baseline is content-only:
  // original HTML gained 25 stable anchors and V2 maintenance integration.
  const gitBlobSha = bytes => createHash('sha1')
    .update('blob ' + Buffer.byteLength(bytes) + String.fromCharCode(0))
    .update(bytes).digest('hex');
  let restored = html
    .replace('<link rel="icon"', '<link rel="manifest" href="manifest.webmanifest">\\n<link rel="icon"')
    .replaceAll('../../shared/media/asset-aa9c4cbb67f1dbc2--icon-192.svg', 'icons/icon-192.svg')
    .replace('<style>[data-v2-maintenance-hidden="true"]{display:none!important}</style></head>', '</head>')
    .replace('<button id="installButton" class="install-button" hidden="hidden" data-v2-maintenance-hidden="true" aria-hidden="true" disabled>', '<button id="installButton" class="install-button" hidden>')
    .replace('<p id="offlineStatus" data-v2-maintenance-hidden="true" hidden="hidden" aria-hidden="true">', '<p id="offlineStatus">')
    .replace('<script type="module" src="../../core/app-contract.js"></script></body>', '</body>');
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
  assert.equal(reviewedAddedAnchors.size, 25);
  restored = restored.replace(/\\s+id="([^"]+)"/g, (attribute, id) =>
    reviewedAddedAnchors.has(id) ? '' : attribute);
  assert.equal(gitBlobSha(restored), '74380569842a3aa3c64c3d27b30566b831008bcf',
    'Tree of Life inherited HTML changed outside reviewed anchor and Hub migration scope');
});
