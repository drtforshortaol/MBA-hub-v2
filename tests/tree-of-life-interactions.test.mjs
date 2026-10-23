import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/apps/tree-of-life-origins/app.js', import.meta.url), 'utf8');
function fixture(hash = '') {
  const element = (tagName = 'DIV', textContent = '') => {
    const classes = new Set(), handlers = {};
    return { tagName, textContent, dataset: {}, value: '', open: false, handlers,
      classList: { remove(...names) { names.forEach(n => classes.delete(n)); }, toggle(n, on) { on ? classes.add(n) : classes.delete(n); }, contains(n) { return classes.has(n); } },
      addEventListener(type, handler) { handlers[type] = handler; },
      scrollIntoView(options) { this.scrolled = options; }, focus() { this.focused = true; }
    };
  };
  const ids = Object.fromEntries(['searchInput', 'searchStatus', 'clearSearch', 'collapseAll', 'installButton', 'offlineStatus'].map(id => [id, element()]));
  const outer = element('DETAILS', 'Mitochondria and energy'), inner = element('DETAILS', 'Red algae');
  inner.parentElement = outer; inner.dataset.tags = 'chloroplast';
  const target = element(); target.parentElement = inner; ids.target = target;
  const button = element('BUTTON'); button.dataset.target = 'target';
  const link = element('A'); link.getAttribute = () => '#target';
  const hero = element(), handlers = {}, history = { replaceState(...args) { this.args = args; } };
  const document = { getElementById: id => ids[id] || null,
    querySelectorAll: selector => ({ '.searchable': [outer, inner], 'details': [outer, inner], '.fast-tools button[data-target]': [button], 'a[href^="#"]': [link] }[selector] || []),
    querySelector: () => hero };
  vm.runInNewContext(source, { document, window: { addEventListener(type, handler) { handlers[type] = handler; } }, navigator: { onLine: true }, location: { hash }, history });
  return { ids, outer, inner, target, button, link, hero, handlers, history };
}

test('inherited search executes case-insensitive text/tag filtering and clears it', () => {
  const f = fixture();
  f.ids.searchInput.value = '  CHLOROPLAST  ';
  f.ids.searchInput.handlers.input();
  assert.equal(f.outer.classList.contains('hidden-by-search'), true);
  assert.equal(f.inner.classList.contains('search-match'), true);
  assert.equal(f.inner.open, true);
  assert.equal(f.ids.searchStatus.textContent, '1 matching chapter.');
  f.ids.searchInput.value = 'no-such-chapter'; f.ids.searchInput.handlers.input();
  assert.equal(f.ids.searchStatus.textContent, '0 matching chapters.');
  f.ids.clearSearch.handlers.click();
  assert.equal(f.ids.searchInput.value, '');
  assert.equal(f.ids.searchInput.focused, true);
  assert.equal(f.ids.searchStatus.textContent, '');
  for (const el of [f.outer, f.inner]) {
    assert.equal(el.classList.contains('hidden-by-search'), false);
    assert.equal(el.classList.contains('search-match'), false);
  }
});

test('fast navigation, fragment links and load links reveal nested chapters', () => {
  for (const action of ['button', 'link', 'load']) {
    const f = fixture('#target'); let prevented = false;
    if (action === 'button') f.button.handlers.click();
    if (action === 'link') f.link.handlers.click({ preventDefault() { prevented = true; } });
    if (action === 'load') f.handlers.load();
    assert.equal(f.outer.open, true); assert.equal(f.inner.open, true);
    assert.equal(f.target.scrolled.block, 'start');
    if (action === 'link') { assert.equal(prevented, true); assert.equal(f.history.args[2], '#target'); }
  }
});

test('collapse closes nested disclosures and missing load targets are harmless', () => {
  const f = fixture('#missing');
  assert.doesNotThrow(() => f.handlers.load());
  f.outer.open = f.inner.open = true;
  f.ids.collapseAll.handlers.click();
  assert.equal(f.outer.open, false); assert.equal(f.inner.open, false);
  assert.equal(f.hero.scrolled.behavior, 'smooth');
});

// Retrieved read-only from MBA-hub 5c219508d23255080f6b050cefa8092905447d81,
// apps/tree-of-life-origins/icons/icon-192.svg; binds the entire original asset.
test('inherited Tree of Life icon retains exact pinned V1 bytes', () => {
  const bytes = readFileSync(new URL('../src/shared/media/asset-aa9c4cbb67f1dbc2--icon-192.svg', import.meta.url));
  const blob = createHash('sha1').update('blob ' + bytes.length + String.fromCharCode(0)).update(bytes).digest('hex');
  assert.equal(blob, '02fccc74094d216c1d353cffc533a30e7170d236');
});
