import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// Parse the actual document, retaining every element and parent. This bounded
// event/DOM model tests inherited handlers; native layout/device QA stays open.
const app = new URL('../src/apps/tree-of-life-origins/', import.meta.url);
const source = readFileSync(new URL('app.js', app), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('manifest.json', app), 'utf8'));
const parsed = spawnSync('python3', ['-c', `
import json,sys
from html.parser import HTMLParser
class DocumentParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.nodes=[]
        self.stack=[]
    def handle_starttag(self,tag,attrs):
        index=len(self.nodes)
        self.nodes.append({'tag':tag.upper(),'attrs':dict(attrs),'text':'','parent':self.stack[-1] if self.stack else None})
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            self.stack.append(index)
    def handle_endtag(self,tag):
        for position in range(len(self.stack)-1,-1,-1):
            if self.nodes[self.stack[position]]['tag']==tag.upper():
                self.stack=self.stack[:position]
                break
    def handle_data(self,data):
        for index in self.stack:
            self.nodes[index]['text']+=data
parser=DocumentParser()
parser.feed(sys.stdin.read())
parser.close()
print(json.dumps(parser.nodes))
`], { input: readFileSync(new URL('index.html', app), 'utf8'), encoding: 'utf8' });
assert.equal(parsed.status, 0, parsed.stderr);
const inventory = JSON.parse(parsed.stdout);

function documentFixture(hash = '') {
  const nodes = inventory.map(record => {
    const classes = new Set((record.attrs.class || '').split(/\s+/).filter(Boolean));
    const listeners = {};
    return { tagName: record.tag, attrs: record.attrs, textContent: record.text,
      dataset: Object.fromEntries(Object.entries(record.attrs).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5), value])),
      open: Object.hasOwn(record.attrs, 'open'), value: record.attrs.value || '', listeners,
      classList: { remove(...names) { for (const name of names) classes.delete(name); }, toggle(name, force) { force ? classes.add(name) : classes.delete(name); }, contains(name) { return classes.has(name); } },
      getAttribute(name) { return this.attrs[name] ?? null; },
      addEventListener(name, handler) { listeners[name] = handler; },
      scrollIntoView(options) { this.scrollOptions = options; }, focus() { this.focused = true; }
    };
  });
  nodes.forEach((node, i) => { node.parentElement = inventory[i].parent === null ? null : nodes[inventory[i].parent]; });
  const ids = new Map(nodes.filter(node => node.attrs.id).map(node => [node.attrs.id, node]));
  const searchable = nodes.filter(node => node.classList.contains('searchable'));
  const details = nodes.filter(node => node.tagName === 'DETAILS');
  const links = nodes.filter(node => node.tagName === 'A' && node.attrs.href?.startsWith('#'));
  const buttons = nodes.filter(node => node.tagName === 'BUTTON' && node.attrs['data-target'] && node.parentElement.classList.contains('fast-tools'));
  const lists = { '.searchable': searchable, details, 'a[href^="#"]': links, '.fast-tools button[data-target]': buttons };
  const windowHandlers = {}, history = { replaceState(...args) { this.args = args; } };
  const document = { getElementById(id) { return ids.get(id) || null; },
    querySelectorAll(selector) { assert.ok(Object.hasOwn(lists, selector), 'unsupported selector: ' + selector); return lists[selector]; },
    querySelector(selector) { assert.equal(selector, '.hero-card'); return nodes.find(node => node.classList.contains('hero-card')); }
  };
  vm.runInNewContext(source, { document, history, location: { hash }, navigator: { onLine: true }, window: { addEventListener(name, handler) { windowHandlers[name] = handler; } } }, { timeout: 3000 });
  return { nodes, ids, searchable, details, links, buttons, windowHandlers, history };
}

function assertRevealed(node) {
  assert.equal(node.scrollOptions?.block, 'start', 'destination was not scrolled into view: ' + node.attrs.id);
  for (let parent = node; parent; parent = parent.parentElement) {
    assert.equal(parent.classList.contains('hidden-by-search'), false, 'search-hidden ancestor: ' + parent.attrs.id);
    if (parent.tagName === 'DETAILS') assert.equal(parent.open, true, 'closed ancestor: ' + parent.attrs.id);
  }
}

test('every registered Tree of Life destination reveals its actual ancestor disclosures on load', () => {
  assert.deepEqual(readdirSync(app).sort(), ['app.js', 'index.html', 'manifest.json', 'styles.css']);
  assert.equal(manifest.sections.length, 53);
  const ids = inventory.map(record => record.attrs.id).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, 'duplicate HTML identifiers');
  assert.equal(inventory.filter(record => record.tag === 'DETAILS').length, 48);
  for (const section of manifest.sections) {
    const fixture = documentFixture('#' + section.id);
    const target = fixture.ids.get(section.id);
    assert.ok(target, 'unreachable registered destination: ' + section.id);
    fixture.windowHandlers.load();
    assertRevealed(target);
  }
});

test('all actual Tree of Life quick controls and internal links execute to their real destinations', () => {
  const fixture = documentFixture();
  assert.equal(fixture.buttons.length, 9);
  assert.equal(fixture.links.length, 18);
  for (const control of [...fixture.buttons, ...fixture.links]) {
    fixture.details.forEach(node => { node.open = false; });
    let prevented = false;
    control.listeners.click({ preventDefault() { prevented = true; } });
    const id = control.attrs['data-target'] || control.attrs.href.slice(1);
    assertRevealed(fixture.ids.get(id));
    if (control.tagName === 'A') {
      assert.equal(prevented, true);
      assert.equal(fixture.history.args[2], '#' + id);
    }
  }
});

test('actual Tree of Life document search preserves multi-chapter matches, tags, clear and collapse', () => {
  const fixture = documentFixture();
  assert.equal(fixture.searchable.length, 10);
  const input = fixture.ids.get('searchInput');
  for (const [query, expected] of [
    ['  HORGASM  ', ['chapter-0']], ['RIBOSOMES', ['chapter-3']],
    ['chloroplast', ['overview', 'chapter-3', 'chapter-5', 'chapter-6', 'guide-talk']],
    ['hydrothermal', ['chapter-2', 'chapter-3']], ['no-such-chapter-92831', []]
  ]) {
    input.value = query; input.listeners.input();
    const matched = fixture.searchable.filter(node => node.classList.contains('search-match'));
    assert.deepEqual(matched.map(node => node.attrs.id), expected, query);
    assert.equal(fixture.ids.get('searchStatus').textContent, `${expected.length} matching chapter${expected.length === 1 ? '' : 's'}.`);
    for (const node of fixture.searchable) {
      assert.equal(node.classList.contains('hidden-by-search'), !expected.includes(node.attrs.id));
      if (expected.includes(node.attrs.id)) assert.equal(node.open, true);
    }
  }
  fixture.ids.get('clearSearch').listeners.click();
  assert.equal(input.value, ''); assert.equal(input.focused, true);
  assert.equal(fixture.ids.get('searchStatus').textContent, '');
  for (const node of fixture.searchable) {
    assert.equal(node.classList.contains('hidden-by-search'), false);
    assert.equal(node.classList.contains('search-match'), false);
  }
  fixture.details.forEach(node => { node.open = true; });
  fixture.ids.get('collapseAll').listeners.click();
  assert.ok(fixture.details.every(node => !node.open));
  assert.equal(fixture.nodes.find(node => node.classList.contains('hero-card')).scrollOptions.behavior, 'smooth');
});

test('both built releases bind Tree of Life app, icon and shared contract resources to current source bytes', () => {
  const required = ['apps/tree-of-life-origins/index.html', 'apps/tree-of-life-origins/app.js', 'apps/tree-of-life-origins/styles.css',
    'shared/media/asset-aa9c4cbb67f1dbc2--icon-192.svg', 'core/app-contract.js'];
  for (const environment of ['developer', 'tester']) {
    const root = new URL('../dist/' + environment + '/', import.meta.url);
    const release = JSON.parse(readFileSync(new URL('release.json', root), 'utf8'));
    for (const path of required) {
      const sourceBytes = readFileSync(new URL('../src/' + path, import.meta.url));
      const resource = release.resources.filter(resource => resource.url === path);
      assert.equal(resource.length, 1, `${environment}: missing/duplicate offline resource ${path}`);
      assert.equal(resource[0].bytes, sourceBytes.length, path);
      assert.equal(resource[0].sha256, createHash('sha256').update(sourceBytes).digest('hex'), path);
      assert.deepEqual(readFileSync(new URL(path, root)), sourceBytes, path);
    }
  }
});


test('Tree of Life navigation clears a search only when it hides the actual destination', () => {
  for (const action of ['quick', 'link', 'load']) {
    const fixture = documentFixture('#mitochondria');
    const input = fixture.ids.get('searchInput');
    input.value = 'HORGASM'; input.listeners.input();
    const chapter = fixture.ids.get('chapter-5');
    assert.equal(chapter.classList.contains('hidden-by-search'), true);
    let target;
    if (action === 'quick') {
      const control = fixture.buttons.find(node => node.attrs['data-target'] === 'chapter-5');
      target = chapter; control.listeners.click();
    } else if (action === 'link') {
      const control = fixture.links.find(node => node.attrs.href === '#mitochondria');
      target = fixture.ids.get('mitochondria'); control.listeners.click({ preventDefault() {} });
    } else {
      target = fixture.ids.get('mitochondria'); fixture.windowHandlers.load();
    }
    assertRevealed(target);
    assert.equal(input.value, '', action);
    assert.equal(fixture.ids.get('searchStatus').textContent, '', action);
    assert.ok(fixture.searchable.every(node => !node.classList.contains('hidden-by-search') && !node.classList.contains('search-match')), action);
    assert.notEqual(input.focused, true, 'navigation must not steal focus into the search field');
  }
  const fixture = documentFixture();
  const input = fixture.ids.get('searchInput');
  input.value = 'HORGASM'; input.listeners.input();
  fixture.buttons.find(node => node.attrs['data-target'] === 'chapter-0').listeners.click();
  assertRevealed(fixture.ids.get('chapter-0'));
  assert.equal(input.value, 'HORGASM', 'a visible destination must retain the current search');
  assert.equal(fixture.ids.get('searchStatus').textContent, '1 matching chapter.');
  assert.equal(fixture.ids.get('chapter-5').classList.contains('hidden-by-search'), true);
});
