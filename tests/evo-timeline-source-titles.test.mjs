import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Pinned verbatim from evolution-timeline/app.js (v11), inspected 2026-10-14.
// Changes require explicit scientific review; do not silently regenerate this baseline.
const approvedTitles = [
  "Universe begins",
  "First stars and galaxies",
  "Sun and Solar System form",
  "Earth forms",
  "Moon forms — giant impact",
  "Early crust and liquid water",
  "Origin of life",
  "FUCA-type stage (?)",
  "LUCA — Last Universal Common Ancestor",
  "The Great Split — Bacteria and Archaea",
  "Cyanobacteria harness sunlight",
  "Great Oxidation Event — oxygen changes the planet",
  "Aerobic Alphaproteobacteria — extract stored energy",
  "Alphaproteobacteria continue to the present",
  "Mitochondrial endosymbiosis — the energy partnership",
  "LECA — Last Eukaryotic Common Ancestor",
  "Animals and fungi are established lineages",
  "Marine animals become conspicuous",
  "Cambrian marine diversification",
  "Some arthropods colonize land",
  "Vertebrates begin the transition onto land",
  "Early primates",
  "Hominin lineage diverges from the chimpanzee/bonobo lineage",
  "Earliest Homo",
  "Homo sapiens",
  "Primary endosymbiosis",
  "Red and green algal lineages",
  "Land plants",
  "Vascular plants",
  "Seed plants",
  "Gymnosperm lineages expand",
  "Flowering plants",
  "Secondary endosymbiosis involving a red alga",
  "Brown-algal lineage develops and diversifies",
  "Kelp emerges"
];
const triage = JSON.parse(readFileSync(new URL('../docs/evo-v2-scientific-validation-triage-20261014.json', import.meta.url), 'utf8'));
const interfaceSource = readFileSync(new URL('../src/shared/knowledge/evo-interface.js', import.meta.url), 'utf8');
const prefix = 'window.EVO_APPROVED_DATA=Object.freeze(';
const start = interfaceSource.indexOf(prefix);
assert.ok(start >= 0, 'Approved EVO data export is missing');
const end = interfaceSource.indexOf(');', start + prefix.length);
assert.ok(end > start, 'Approved EVO data export terminator is missing');
const approvedData = JSON.parse(interfaceSource.slice(start + prefix.length, end));
const importedTitles = [
  ...approvedData.early.map(event => event.title),
  ...Object.values(approvedData.groups).flatMap(group => group.events.map(event => event.title)),
];

test('all 35 original EVO v11 event titles remain exact and in source order', () => {
  assert.equal(approvedTitles.length, 35);
  assert.equal(new Set(approvedTitles).size, 35);
  assert.deepEqual(triage.events.map(event => event.event), Array.from({ length: 35 }, (_, i) => i + 1));
  assert.deepEqual(triage.events.map(event => event.title), approvedTitles);
});

test('approved imported EVO data preserves all 35 source event titles', () => {
  assert.deepEqual(importedTitles, approvedTitles);
});
