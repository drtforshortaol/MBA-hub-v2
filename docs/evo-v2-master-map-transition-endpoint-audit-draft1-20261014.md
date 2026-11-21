# EVO V2 — Master Map Relationship and Transition Endpoint Audit (Draft 1)
Date: 2026-10-14
Status: Source-inspected; candidate relationship audit only; scientific approval pending.

## Sources actually inspected
- Original `drtforshortaol/master-evolution-map-test/index.html` (Master Evolution Map v1.5).
- MBA V2 `docs/evo-v2-complete-migration-registry-draft-20261014.json`.
- MBA V2 `docs/evo-v2-recovered-registry-semantic-crosswalk-20261014.md`.
- MBA V2 `docs/evo-v2-scientific-relationship-reconciliation-draft2-20261014.md`.

## Structural findings
1. Original Master Map computes `conceptRegistry` and `transitionRegistry` at runtime from unique `data-kind`/`data-key` nodes and transition controls in DOM encounter order. Therefore apparent permanent IDs are **position-sensitive** if the DOM order changes. The migration JSON is a captured mapping, not independent proof of immutable identifiers.
2. The source declares `relationshipType` by transition key, and defaults unlisted transitions to `continuation`. This default must not be treated as scientific approval of continuation.
3. There is no explicit canonical directed graph of `sourceConceptIds` and `targetConceptIds` in the inspected runtime registry. DOM placement and drawn branches imply some paths, but visually adjacent controls cannot establish authoritative endpoints.
4. `visualRegistry` also generates IDs by traversal of `content` entries with `miniMap`; visual IDs must likewise be preserved as captured candidates until independence from source order is validated.
5. The recovered JSON describes 49 concept IDs and 37 transition IDs. These identities are draft mappings, not scientific endorsements.

## Priority endpoint and semantic reconciliation
| Timeline event | Existing mapping | Map relationship / adjacent objects | Audit verdict | Required action |
|---|---|---|---|---|
| 11 Cyanobacteria | EV-0122 `cyanobacteria` | `oxygenic-photosynthesis` TR-0117 leads visually to EV-0123 `oxygen-producing-cyano` | Concept/process mismatch if event title is innovation | Distinguish lineage origin from evolution of oxygenic photosynthesis; confirm intended event description |
| 12 GOE | EV-0125 `goe` | TR-0119 `planetary-effect` identifies environmental impact following oxygenic photosynthesis | Environmental effect, not daughter lineage | Model causal/planetary-effect edge distinctly from ancestry |
| 13–14 Alphaproteobacteria | EV-0103 `alphaproteobacteria` twice | Source contains mitochondrial endosymbiosis TR-0104 and host/mitochondrion milestone | Lineage existence and persistence do not establish aerobic-respiration innovation | Preserve one concept ID and mark event 14 as persistence; no inferred physiology |
| 15 Mitochondrial endosymbiosis | TR-0104 `endosymbiosis` | Merger-style transition visually precedes EV-0108 `mitochondrion`; host EV-0107 exists | Multiple ancestral inputs plausible, but explicit endpoint set absent | Validate host and alphaproteobacterial contributor endpoints independently before graph promotion |
| 17 Opisthokonta | EV-0112 `opisthokonta` | Branching controls lead toward fungi and animals | Broader clade, not date of animal/fungal split | Mark as clade-context only |
| 18–19 Ediacaran / Cambrian | EV-0114 `animals` twice | `opisthokont-branch` branches toward animal lineage | Neither milestone equals animal origin | Define separate occurrence/diversification events, no conflation with clade node |
| 26 Primary plastid | TR-0120 `primary-plastid-endo` | Merger, with EV-0126 `plastid-cyano`, EV-0127 `euk-host`, and EV-0128 `primary-plastid` in map | Candidate multiple-input endosymbiosis | Verify contributor and resulting plastid concept endpoints |
| 27 Red and green algae | EV-0116 `red-summary` | Separate `green-summary` EV-0117; later red/green detailed branches | Single red ID insufficient for combined lineage description | Preserve separate red and green IDs; represent shared ancestry only when evidence and endpoints verified |
| 28 Land plants | EV-0118 `land-summary` | Detailed EV-0135 `land-plants` and TR-0126 `land-transition` also exist | Summary-versus-lineage mismatch | Keep contextual summary separate from evolutionary terrestrialization event |
| 33 Red-derived plastid | TR-0133 `red-derived-plastid` | Relationship type `secondary-endosymbiosis`; red-derived plastids within stramenopile path | One generic link risks implying universal single origin | Require lineage-specific endpoint and uncertainty review |
| 34 Brown algae | EV-0121 `brown-summary` | EV-0146 `brown-algae` detailed, TR-0134 `brown-branch` | Summary is not detailed origin/diversification | Maintain distinction |
| 35 Kelps | EV-0147 `kelps` | TR-0135 `kelp-transition`; EV-0148 `giant-kelp` separate | Concept versus transition distinction | Preserve independent IDs and endpoints |

## Endpoint verification status
- **Explicit endpoint pairs verified from canonical source data: 0.** The inspected Master Map supplies relationship-type annotations and a visual DOM diagram, not a fully serialized canonical edge list.
- **Visual endpoint hypotheses:** proposed above for follow-up, not authoritative graph edges.
- **Semantic mismatches directly corroborated by source elements:** oxygenic process vs cyanobacterial node; animal clade vs Ediacaran/Cambrian events; red vs green summary; environmental effect vs biological descent.
- **Do not silently convert DOM adjacency into genealogy.**

## Next engineering step
1. Create a **separate draft endpoint manifest** with fields `transitionId`, `sourceConceptIds`, `targetConceptIds`, `relationshipType`, `sourceKey`, `evidenceStatus`, `confidence`, and `reviewNotes`, using null endpoints where unconfirmed.
2. Compare every one of the 37 transition keys against visual order and detailed content. Preserve branching/merger/polyphyly distinctions.
3. Check original Timeline v11 descriptions against all 35 events and pin both source commits.
4. Add read-only validators for identifier uniqueness, referential integrity, valid relationship types, endpoint existence and unknown endpoints; then perform external scientific evidence review.
5. Do not change original apps, public tester, production, draft scientific definitions or canonical IDs until review and approval.

## Change control
Only this audit document added to MBA V2 development branch. No production changes, app edits, deployment, or scientific approvals. CI not run for this documentation-only step.
