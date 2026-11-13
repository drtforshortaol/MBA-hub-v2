# EVO V2 — Permanent Identifier Semantic Audit Draft 1
Date: 2026-10-14
Status: Structural mapping verified against approval matrix; authoritative identifier definitions NOT YET RECOVERED. No changes to canonical data.

## Verified source provenance
- MBA V2 `config/migration-provenance.json` pins EVO Timeline v11 to `drtforshortaol/evolution-timeline` commit `c6d782d3a8a03e407861a0fbc3aab76e5fbf8d0c`.
- The 35-event source chronology was extracted from legacy `app.js` on `main`; source title comparisons matched 35/35.
- Do not conflate the current legacy main branch with the pinned commit until their contents are compared.

## Identifier coverage
- 35 total timeline events.
- 20 event-to-ID references.
- 18 unique EV/TR identifiers.
- 15 events intentionally have no candidate/context ID in the approval matrix: 1–8, 20–25, 31.
- Reused IDs: `EV-0103` assigned to events 13 and 14; `EV-0114` assigned to events 18 and 19.
- This is an internal matrix structural count only; it does NOT verify that the 18 IDs exist in canonical source or match intended semantics.

## Semantic risks requiring review
| Event(s) | Candidate ID | Risk | Required check |
|---|---|---|---|
| 13, 14 | EV-0103 | Aerobic bacterial trait vs continuation of a living lineage are distinct claims. | Determine whether one canonical concept supports both, or whether event 14 needs an explicit relationship instead of a second ID assignment. |
| 18, 19 | EV-0114 | Ediacaran marine animals vs Cambrian diversification are distinct chronological phenomena. | Determine whether canonical node is general animal evolution or a specific radiation. |
| 27 | EV-0116 | Red and green algae are independent descendant lineages of primary plastid ancestors. | Inspect canonical definition; do not silently relabel a red-algal node as combined red+green. |
| 10 | TR-0100 | Rooted two-domain divergence may be oversimplified. | Inspect transition endpoints and scientific qualification. |
| 15 | TR-0104 | Mitochondrial ancestry, oxygen use and host relationship may be conflated. | Inspect transition endpoints and qualifiers. |
| 26 | TR-0120 | Primary plastid event must not be conflated with secondary plastid transfer. | Verify endosymbiosis partner/descendant mapping. |
| 33 | TR-0133 | A single red secondary endosymbiosis may not explain all complex plastids. | Verify lineage scope. |
| 34, 35 | EV-0121, EV-0147 | Brown algae and kelp are nested but not interchangeable. | Inspect canonical concept definitions and chronology. |

## Verification and limitations
- Source files retrieved: `docs/evo-v2-scientific-approval-matrix-draft1-20261014.md`, `docs/evo-v2-source-chronology-discrepancy-ledger-draft1-20261014.md`, and `config/migration-provenance.json`.
- Automated matrix ID counting: PASS (20 references, 18 unique, 2 reused identifiers).
- Exact canonical ID definitions and relationship edges: NOT VERIFIED.
- Original pinned EVO source commit contents: NOT VERIFIED.
- Scientific approvals: 0/35; no content promotion.
- Production/tester repositories and legacy upstream: no writes.
- CI/security/build/offline tests: not run for documentation-only audit.

## Exact next task
Recover the canonical EVO migration registry and the 86 concept/transition definitions from the MBA V2 working branch; compare definitions and relationship endpoints against each of the 20 mapped timeline events, especially reused and semantically risky IDs. Confirm legacy timeline source at pinned commit before proposing changes.
