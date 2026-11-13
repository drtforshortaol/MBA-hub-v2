# EVO V2 — Unmatched Timeline Event Classification (Draft 1)
Date: 2026-10-14
Status: scientific triage only; NOT APPROVED. No canonical ID allocation, no replacement of existing timeline, no publication.

## Classification policy
- **external-domain**: outside the existing biological Master Map scope; preserve timeline event as independent timeline-owned content.
- **origin/uncertain**: biological event not equivalent to LUCA or any current map node; scientific review required.
- **continuation**: persistence of a lineage is not a new evolutionary origin or split.
- **new-lineage**: map has only a broader ancestor; do not reuse its ID for the more specific event.
- **existing-concept-candidate**: exact source-key candidate exists, but mapping and chronology remain unapproved.
- **diversification-specific**: a later radiation/expansion must not be conflated with lineage origin.

| Event | Timeline title | Classification | Candidate map link | Scientific / architecture gate |
|---|---|---|---|---|
| 1 | Universe begins | external-domain | none | Cosmology; timeline-owned |
| 2 | First stars and galaxies | external-domain | none | Cosmology; timeline-owned |
| 3 | Sun and Solar System form | external-domain | none | Astronomy; timeline-owned |
| 4 | Earth forms | external-domain | none | Planetary geology; timeline-owned |
| 5 | Moon forms — giant impact | external-domain | none | Planetary geology; distinguish model from settled certainty |
| 6 | Early crust and liquid water | external-domain | none | Earth history; evidence and dating uncertainties |
| 7 | Origin of life | origin/uncertain | none | Do not equate origin of life with LUCA (EV-0100) |
| 8 | FUCA-type stage (?) | origin/uncertain | none | FUCA concept is uncertain; terminology and evidence review |
| 14 | Alphaproteobacteria continue to the present | continuation | EV-0103 (context only) | Not a new branch; do not conflate persistence with mitochondrial endosymbiosis |
| 20 | Some arthropods colonize land | new-lineage | EV-0114 (ancestor context only) | Arthropod terrestrialization needs distinct event; avoid implying a single universal colonization |
| 21 | Vertebrates begin the transition onto land | new-lineage | EV-0114 (ancestor context only) | Tetrapod transition requires distinct event and chronology |
| 22 | Early primates | new-lineage | EV-0114 (ancestor context only) | Distinguish crown primates from stem relatives |
| 23 | Hominin lineage diverges from chimpanzee/bonobo lineage | new-lineage | EV-0114 (ancestor context only) | Divergence is not a single fossil date; uncertainty |
| 24 | Earliest Homo | new-lineage | EV-0114 (ancestor context only) | Genus attribution and earliest fossil evidence require review |
| 25 | Homo sapiens | new-lineage | EV-0114 (ancestor context only) | Species emergence vs oldest known fossils |
| 29 | Vascular plants | existing-concept-candidate | EV-0136 (vascular-plants); TR-0127 (vascular-transition) | Choose concept vs transition deliberately; do not auto-approve |
| 30 | Seed plants | existing-concept-candidate | EV-0137 (seed-plants); TR-0128 (seed-transition) | Distinguish seed origins and later diversification |
| 31 | Gymnosperm lineages expand | diversification-specific | EV-0137 (broader ancestor context only) | Expansion is not seed-plant origin; no exact node |
| 32 | Flowering plants | existing-concept-candidate | EV-0138 (flowering-plants); TR-0129 (flower-transition) | Distinguish origin from radiation |
| 35 | Kelp emerges | existing-concept-candidate | EV-0147 (kelps); TR-0135 (kelp-transition) | Distinguish kelp origin from diversification and giant kelp |

## Integrity and approval gates
1. Preserve all 35 timeline events, original titles, source keys, and existing 15 candidate matches.
2. This document adds *suggestions only* for the 20 unmatched events. No new permanent IDs are minted.
3. Cross-reference source material, dates, uncertainty, and scientific interpretation before approving a mapping.
4. Keep cosmology/geology timeline-owned unless EVO V2 architecture explicitly adds separate scientific domains.
5. Do not equate a lineage with a transition, its emergence, or later diversification.
6. Maintain registry scientificReview.status = pending until explicit scientific approval.
7. Build, security, offline, and committed Node.js test suite still require actual execution before publication.
