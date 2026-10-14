# EVO V2 — Scientific Cross-Reference Matrix Draft 1
Date: 2026-10-14
Status: Working inventory; NOT approved scientific mapping.

Sources: evolution-timeline/main/app.js (35 title-bearing events); master-evolution-map-test/main/index.html (legacy data-key map). Titles and map keys are source-extracted. Candidate matches are lexical/semantic proposals, NOT verified permanent concept IDs. Do not migrate or overwrite content based on this table.

| # | Timeline event (verbatim) | Master Map data-key candidate | Status |
|---:|---|---|---|
| 1 | Universe begins | — | Unmatched |
| 2 | First stars and galaxies | — | Unmatched |
| 3 | Sun and Solar System form | — | Unmatched |
| 4 | Earth forms | — | Unmatched |
| 5 | Moon forms — giant impact | — | Unmatched |
| 6 | Early crust and liquid water | — | Unmatched |
| 7 | Origin of life | — | Unmatched |
| 8 | FUCA-type stage (?) | — | Unmatched |
| 9 | LUCA — Last Universal Common Ancestor | luca | Candidate only |
| 10 | The Great Split — Bacteria and Archaea | great-split | Candidate only |
| 11 | Cyanobacteria harness sunlight | cyanobacteria | Candidate only |
| 12 | Great Oxidation Event — oxygen changes the planet | goe | Candidate only |
| 13 | Aerobic Alphaproteobacteria — extract stored energy | alphaproteobacteria | Candidate only |
| 14 | Alphaproteobacteria continue to the present | — | Unmatched |
| 15 | Mitochondrial endosymbiosis — the energy partnership | endosymbiosis | Candidate only |
| 16 | LECA — Last Eukaryotic Common Ancestor | leca | Candidate only |
| 17 | Animals and fungi are established lineages | opisthokonta | Candidate only |
| 18 | Marine animals become conspicuous | animals | Candidate only |
| 19 | Cambrian marine diversification | animals | Candidate only |
| 20 | Some arthropods colonize land | — | Unmatched |
| 21 | Vertebrates begin the transition onto land | — | Unmatched |
| 22 | Early primates | — | Unmatched |
| 23 | Hominin lineage diverges from the chimpanzee/bonobo lineage | — | Unmatched |
| 24 | Earliest Homo | — | Unmatched |
| 25 | Homo sapiens | — | Unmatched |
| 26 | Primary endosymbiosis | primary-plastid-endo | Candidate only |
| 27 | Red and green algal lineages | red-summary | Candidate only |
| 28 | Land plants | land-summary | Candidate only |
| 29 | Vascular plants | — | Unmatched |
| 30 | Seed plants | — | Unmatched |
| 31 | Gymnosperm lineages expand | — | Unmatched |
| 32 | Flowering plants | — | Unmatched |
| 33 | Secondary endosymbiosis involving a red alga | red-derived-plastid | Candidate only |
| 34 | Brown-algal lineage develops and diversifies | brown-summary | Candidate only |
| 35 | Kelp emerges | — | Unmatched |

## Reconciliation gates
1. Read the dynamically assigned conceptRegistry, transitionRegistry and visualRegistry in the map source; record actual permanent IDs, not DOM ids or data-key values.
2. Inspect any prior migration registry and reconcile without renumbering.
3. Distinguish contextual cosmic/planetary events from biological nodes and transition edges.
4. Verify chronology, scientific uncertainty, branch continuation, and secondary endosymbiosis against approved source descriptions.
5. Resolve unmatched entries; review duplicate candidates (e.g. multiple animal milestones) before declaring 1:1 mappings.
6. Run duplicate-ID, dangling-reference, source-coverage, and offline/build tests before promotion.

No changes to legacy apps, production, tester, or scientific text.
