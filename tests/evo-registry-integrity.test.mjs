import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const registry = JSON.parse(readFileSync(new URL('../docs/evo-v2-permanent-id-registry-candidate-20261014.json', import.meta.url), 'utf8'));
const triage = JSON.parse(readFileSync(new URL('../docs/evo-v2-scientific-validation-triage-20261014.json', import.meta.url), 'utf8'));
const concepts = registry.concepts;
const transitions = registry.transitions;
const visuals = registry.visuals;
const all = [...concepts, ...transitions, ...visuals];

test('expected source-derived record counts are preserved', () => {
  assert.equal(concepts.length, 49);
  assert.equal(transitions.length, 37);
  assert.equal(visuals.length, 73);
  assert.equal(all.length, 159);
});
test('identifiers are unique, explicit and namespaced', () => {
  assert.equal(new Set(all.map(x => x.id)).size, all.length);
  for (const [entries, prefix] of [[concepts, 'EV'], [transitions, 'TR'], [visuals, 'VM']]) {
    for (const x of entries) assert.match(x.id, new RegExp('^' + prefix + '-[0-9]{3,4}$'));
  }
  for (const x of [...concepts, ...transitions]) assert.equal(x.canonicalId, x.id);
});
test('source keys are unique within concept and transition namespaces', () => {
  for (const group of [concepts, transitions]) assert.equal(new Set(group.map(x => x.key)).size, group.length);
});
test('visual targets resolve to the exact matching source key and namespace', () => {
  const index = new Map([...concepts.map(x => [x.id, { key: x.key, kind: 'concept' }]), ...transitions.map(x => [x.id, { key: x.key, kind: 'transition' }])]);
  for (const v of visuals) {
    const target = index.get(v.targetId);
    assert.ok(target, 'Missing visual target: ' + v.id);
    assert.equal(v.key, target.key);
    assert.equal(v.targetKind, target.kind);
  }
});
test('visual coverage exceptions are exact, non-duplicated and traceable', () => {
  const linked = new Set(visuals.map(x => x.targetId));
  const absent = [...concepts, ...transitions].filter(x => !linked.has(x.id)).map(x => x.id).sort();
  const declared = registry.visualCoverage.withoutVisual.map(x => x.id).sort();
  assert.deepEqual(absent, declared);
  assert.equal(absent.length, 13);
  for (const item of registry.visualCoverage.withoutVisual) assert.ok(item.review);
});
test('timeline references resolve, while scientific approval remains pending', () => {
  assert.equal(triage.events.length, 35);
  assert.deepEqual(triage.events.map(x => x.event), Array.from({length: 35}, (_, i) => i + 1));
  const ids = new Set([...concepts, ...transitions].map(x => x.id));
  for (const event of triage.events) if (event.candidateId) assert.ok(ids.has(event.candidateId));
  assert.equal(triage.events.filter(x => x.candidateId).length, 15);
  assert.equal(triage.events.filter(x => !x.candidateId).length, 20);
  assert.equal(registry.scientificReview.status, 'pending');
});
