import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const app = new URL('../src/apps/whale-parasites-associates/', import.meta.url);
const source = readFileSync(new URL('app.js', app), 'utf8');
const dataSource = readFileSync(new URL('data.js', app), 'utf8');
function fixture() {
  const ids = {}, listeners = {}, cards = [], tabs = [];
  function element(tagName = 'DIV') {
    const handlers = {}, classes = new Set();
    return { tagName, dataset: {}, handlers, value: '', textContent: '', open: false, children: [],
      addEventListener(type, handler) { handlers[type] = handler; },
      setAttribute(name, value) { this[name] = value; },
      classList: { add(name) { classes.add(name); }, remove(name) { classes.delete(name); }, contains(name) { return classes.has(name); } },
      appendChild(child) { this.children.push(child); },
      replaceChildren(...children) { this.children = children; if (this === ids.cardList) cards.splice(0, cards.length, ...children); if (this === ids.filterTabs) tabs.splice(0, tabs.length, ...children); },
      scrollIntoView(options) { this.scrolled = options; }
    };
  }
  for (const id of ['jumpSelect', 'filterTabs', 'cardList', 'searchInput', 'resultCount']) ids[id] = element();
  const decode = value => value.replaceAll('&quot;', '"').replaceAll('&#039;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
  // A bounded attribute/event model, not a browser parser or full DOM fidelity audit.
  class DOMParser {
    parseFromString(markup) {
      const tag = markup.includes('<details') ? 'details' : 'button';
      const children = [...markup.matchAll(new RegExp('<' + tag + '\\b([^>]*)>', 'g'))].map(match => {
        const node = element(tag.toUpperCase());
        for (const [, name, raw] of match[1].matchAll(/([\w-]+)="([^"]*)"/g)) {
          const value = decode(raw);
          if (name.startsWith('data-')) node.dataset[name.slice(5)] = value;
          else if (name === 'id') { node.id = value; ids[value] = node; }
          else if (name === 'class') value.split(/\s+/).filter(Boolean).forEach(c => node.classList.add(c));
          else node[name] = value;
        }
        return node;
      });
      return { body: { children } };
    }
  }
  const document = {
    addEventListener(type, handler) { listeners[type] = handler; }, getElementById(id) { return ids[id] || null; },
    querySelectorAll(selector) { return selector === '.card' ? cards : selector === '.filter-tab' ? tabs : []; },
    createElement(tag) { return element(tag.toUpperCase()); }
  };
  const context = vm.createContext({ document, window: {}, DOMParser, setTimeout(fn) { fn(); } });
  vm.runInContext(dataSource + '\n' + source, context);
  const records = JSON.parse(vm.runInContext('JSON.stringify(PARASITES)', context));
  const filters = JSON.parse(vm.runInContext('JSON.stringify(FILTERS)', context));
  listeners.DOMContentLoaded();
  return { ids, cards, tabs, records, filters,
    reveal(id, target = ids[id]) { listeners['mba:reveal-section']?.({ detail: { id }, target }); }
  };
}
const shown = f => f.cards.filter(c => c.dataset.hidden === 'false');

test('seven parasite cards and all five filters retain executable search/filter behavior', () => {
  const f = fixture();
  assert.equal(f.cards.length, 7); assert.equal(f.tabs.length, 5);
  assert.deepEqual(f.cards.map(c => c.id), f.records.map(r => r.id));
  assert.equal(f.ids.resultCount.textContent, '7 entries shown.');
  for (const [filter] of f.filters) {
    const tab = f.tabs.find(t => t.dataset.filter === filter); tab.handlers.click();
    assert.equal(tab['aria-pressed'], 'true');
    assert.equal(f.tabs.filter(t => t.classList.contains('active')).length, 1);
    for (const query of ['', ' WHALE ', 'cookiecutter', 'not-a-real-result', ...f.records.map(r => r.sci)]) {
      f.ids.searchInput.value = query; f.ids.searchInput.handlers.input();
      const normalized = query.toLowerCase().trim();
      const expected = f.records.filter(r => {
        const searchable = [r.name, r.sci, r.tag, r.hostsTitle, r.harm, ...r.paragraphs, ...r.hosts, ...r.facts.flat()].join(' ').toLowerCase().trim();
        return (filter === 'all' || r.categories.includes(filter)) && (!normalized || searchable.includes(normalized));
      });
      assert.deepEqual(shown(f).map(c => c.id), expected.map(r => r.id));
      const n = expected.length;
      assert.equal(f.ids.resultCount.textContent, n === 7 && !normalized && filter === 'all' ? '7 entries shown.' : `${n} matching entr${n === 1 ? 'y' : 'ies'} shown.`);
    }
  }
});

test('jump reveals each hidden card and keeps the visible-result count accurate', () => {
  for (let index = 0; index < 7; index++) {
    const f = fixture();
    f.ids.searchInput.value = 'not-a-real-result'; f.ids.searchInput.handlers.input();
    assert.equal(shown(f).length, 0);
    f.ids.jumpSelect.value = f.records[index].id; f.ids.jumpSelect.handlers.change();
    assert.equal(shown(f).length, 1);
    assert.equal(f.ids.resultCount.textContent, '1 entry shown.');
    assert.equal(f.cards[index].open, true);
    assert.equal(f.cards[index].scrolled.block, 'start');
    assert.equal(f.ids.jumpSelect.value, '');
    f.ids.searchInput.handlers.input();
    assert.equal(shown(f).length, 0);
    assert.equal(f.ids.resultCount.textContent, '0 matching entries shown.');
  }
});

test('jump options preserve all authored names and invalid destinations do not reveal cards', () => {
  const f = fixture();
  assert.deepEqual(f.ids.jumpSelect.children.map(o => [o.value, o.textContent]), f.records.map(r => [r.id, r.name]));
  f.ids.jumpSelect.value = 'missing';
  assert.doesNotThrow(() => f.ids.jumpSelect.handlers.change());
  assert.equal(shown(f).length, 7);
  assert.equal(f.cards.some(c => c.open), false);
});


test('successive jumps count every revealed card until a search/filter recomputes visibility', () => {
  const f = fixture();
  f.ids.searchInput.value = 'not-a-real-result'; f.ids.searchInput.handlers.input();
  for (let index = 0; index < 2; index++) {
    f.ids.jumpSelect.value = f.records[index].id; f.ids.jumpSelect.handlers.change();
  }
  assert.equal(shown(f).length, 2);
  assert.equal(f.ids.resultCount.textContent, '2 entries shown.');
  f.tabs.find(t => t.dataset.filter === 'all').handlers.click();
  assert.equal(shown(f).length, 0);
  assert.equal(f.ids.resultCount.textContent, '0 matching entries shown.');
});


test('shared section navigation reveals each excluded parasite without clearing active controls', () => {
  for (const id of fixture().records.map(record => record.id)) {
    const f = fixture();
    const filter = f.tabs.find(tab => tab.dataset.filter === 'specific');
    filter.handlers.click();
    f.ids.searchInput.value = 'not-a-real-result'; f.ids.searchInput.handlers.input();
    assert.equal(shown(f).length, 0);
    f.reveal(id);
    assert.deepEqual(shown(f).map(card => card.id), [id]);
    assert.equal(f.ids[id].open, true);
    assert.equal(f.ids.resultCount.textContent, '1 entry shown.');
    assert.equal(f.ids.searchInput.value, 'not-a-real-result');
    assert.equal(filter['aria-pressed'], 'true');
    assert.equal(f.ids[id].scrolled, undefined, 'shared navigator owns focus and scrolling');
    f.ids.searchInput.handlers.input();
    assert.equal(shown(f).length, 0, 'a deliberate filter/search update recomputes visibility');
  }
});

test('section reveal is limited to the resolved authored card and is idempotent', () => {
  const f = fixture();
  f.ids.searchInput.value = 'not-a-real-result'; f.ids.searchInput.handlers.input();
  const id = f.records[0].id;
  f.reveal(id, f.ids.searchInput);
  f.reveal('References', f.ids[id]);
  f.reveal('missing');
  f.reveal(undefined);
  assert.equal(shown(f).length, 0);
  assert.equal(f.ids.resultCount.textContent, '0 matching entries shown.');
  f.reveal(id); f.reveal(id);
  assert.equal(shown(f).length, 1);
  assert.equal(f.ids.resultCount.textContent, '1 entry shown.');
});
