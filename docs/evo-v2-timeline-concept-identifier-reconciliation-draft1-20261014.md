# EVO V2 — Timeline/Map Identifier and Event-Semantics Reconciliation, Draft 1
Date: 2026-10-14
Status: Structural read-only reconciliation; no scientific approvals or canonical edits.

## Evidence inspected
- `docs/evo-v2-complete-migration-registry-draft-20261014.json`
- `docs/evo-v2-permanent-id-registry-candidate-20261014.json`
- `docs/evo-v2-scientific-validation-triage-20261014.json`
- `docs/evo-v2-scientific-cross-reference-draft1-20261014.md`
- `docs/evo-v2-source-chronology-discrepancy-ledger-draft1-20261014.md`

## Identifier findings
The recovered migration registry and permanent-ID candidate registry agree on the following concept IDs/keys:
- EV-0103 = alphaproteobacteria
- EV-0114 = animals
- EV-0116 = red-summary
- EV-0136 = vascular-plants
- EV-0137 = seed-plants
- EV-0138 = flowering-plants
- EV-0147 = kelps

These matches verify *registry identity*, not event equivalence, biological inference, or scientific approval.

## Higher-priority event distinctions
| Timeline event | Concept reference | Structural observation | Required action before scientific approval |
|---|---|---|---|
| 13 Aerobic Alphaproteobacteria — extract stored energy | EV-0103 | Concept represents a lineage, not a proof of ancestral aerobic metabolism or a dated innovation | Reassess metabolic claim and date; link concept contextually only |
| 14 Alphaproteobacteria continue to the present | EV-0103 | Reuses the concept correctly as a possible topic reference, but is a temporal span rather than a dated origin event | Model as persistence/range or narrative rather than another dated node |
| 18 Marine animals become conspicuous | EV-0114 | Animal concept exists; contested placement/identity of Ediacaran forms remains | Keep separate from origin of animals; qualify fossil evidence |
| 19 Cambrian marine diversification | EV-0114 | Same animal concept can contextualize a different radiation event | Retain independent event identity; do not treat as animal-origin date |
| 27 Red and green algal lineages | EV-0116 red-summary | Red-specific summary is narrower than a red+green divergence statement | Flag incomplete concept coverage; review distinct red and green candidates |
| 29 Vascular plants | EV-0136 | Former cross-reference was unmatched despite existing registry key | Add candidate cross-reference only; date remains unapproved |
| 30 Seed plants | EV-0137 | Former cross-reference was unmatched despite existing registry key | Add candidate cross-reference only |
| 32 Flowering plants | EV-0138 | Former cross-reference was unmatched despite existing registry key | Add candidate cross-reference only |
| 35 Kelp emerges | EV-0147 | Existing kelps concept is not itself proof of a precise emergence age | Add candidate reference only; distinguish fossils and inferred origin |

## Provisional data model guidance (NOT an authorized schema change)
Use separate IDs for Timeline events and Map concepts. Support a non-exclusive event-to-concept relation that states context (subject, exemplar, process participant) rather than presuming a same-as or biological parent relation. Allow multiple events to refer to one concept and one event to reference several concepts. Do not equate chronology event ID with EV/TR/VM namespace. This guidance needs architectural approval before implementation.

## Discrepancy disposition
- Registry key identity: verified for the seven concept IDs above.
- Event semantics, source chronology and biological classification: unapproved.
- Events 13/14 and 18/19 must remain distinct.
- Event 27 is a high-priority scope mismatch.
- Events 29/30/32/35 have candidate keys recovered; do not silently overwrite the original cross-reference draft.
- No permanent identifiers or canonical source/target endpoints altered.
- No original Timeline or Map source modified.
- No physical-device offline testing was conducted for this documentation change.

## Next
Create a proposed event-to-concept crosswalk with explicit relation roles, confidence, source provenance, and separate scientific approval fields; review event 27 and the chronology source claims before merging or publication.
