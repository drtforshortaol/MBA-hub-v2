# Six inherited applications reconciled — October 23, 2026

Integration baseline: `2c10cb354d056324f9c2b1ed3d3a953bea895bec`. Remote integration and all four draft-track heads matched the owner handoff before work. Pinned sources were recovered read-only: MBA-hub `5c219508d23255080f6b050cefa8092905447d81`, Aquarium Shift Library `9438060bd836c46245e4af45c280e4bb37b0ab94`.

Existing unchanged V1 authorization in GUIDE_CONTENT_RESTORED.md carries forward for Applied Water Science, Interpretation Principles, MBA Leadership, Information Center, Aquarium Library Explorer and MMC Narrations. Six records in config/inherited-v1-fidelity.json bind the reviewed current manifest, app files, offline dependencies and shared content/media bytes. Source status/publication/science flags are unchanged. This is inherited CONTENT reconciliation, not new scientific/image permission, privacy approval, physical acceptance or release authorization.

## Complete reviewed scope

The complete source/current markup, executable differences, styles, links, interactions, search and media are documented in REFERENCE_APP_FIDELITY_20261022.md and INHERITED_DYNAMIC_THREE_RECONCILIATION_20261022.md. Independent fresh diff inspection confirmed their enumerated scope; no new runtime content defect was established. REFERENCE_THREE_SCOPE_REVIEW_20261023.md records the supplementary reference review. The saved evidence was reused and checked against pinned objects and current bytes rather than restarting content authorship.

- Water Science: complete HTML/style/media fidelity; legacy worker disabled; original accordion/hash behavior preserved. All 13 cards and five existing FAQ routes remain indexed.
- Interpretation: exact original data/styles/icon; full six-principle DOM equality, unchanged filters/toggles, reviewed safe link/DOM construction and central offline substitution; original floor reminder retained.
- Leadership: original records/styles, two pinned portraits, full rendered-card equality, preserved IDs/toggles and safe links; empty source install icon replaced by Hub install icon. Existing authorized personal fields retained.
- Information Center: exact data/styles/icon, all 18 sections/47 blocks, complete render structure/text equality apart from documented phone anchor wrappers; source search/toggle/header keyboard behavior preserved. Telephone action is separately covered by regression tests.
- Library: exact 95 source records, complete inline styles/icon, all 78 holdings and 17 Wishlist rendered-card comparisons, preserved fields/links/filter/sort behavior; reviewed entry query allowlist and saved filter/Back restoration.
- MMC: exact data/styles/icon and seven sections/three references; complete render-tree equality; executable changes limited to empty DOM clears and inactive standalone worker registration.

The reference helper now fails closed on added app-local files, symlinks and changed manifests, and emits full current file inventories. Added-file and changed-manifest probes both rejected the changes; restored baseline passed. Supplemental complete six-app file binding and source-derived Interpretation/Leadership search checks are in docs/verification/six-app-file-binding-20261023.json.

Fresh portable machine evidence: docs/verification/reference-app-fidelity-20261023.json and docs/verification/dynamic-inherited-three-20261023.json. Reproduce with:

```sh
python3 scripts/migration/review-reference-app-fidelity.py --sources-dir PATH
node scripts/migration/audit-dynamic-inherited-fidelity.mjs --sources-dir PATH
```

PATH contains pinned read-only fidelity-MBA-hub and fidelity-aquarium-shift-library- Git repositories. Python lxml and Node are required. Lightweight DOM comparisons establish source/model fidelity, not browser layout or physical device acceptance.

## Remaining boundaries

Twenty-four inherited records are supported; 23 release blockers remain: eight inherited reconciliations, Seahorse content review, nine October media permissions and five operational gates. Remaining inherited apps: evolution-timeline, five-senses-pwa, kelp-forest, naturalist-field-notes, northern-elephant-seal, open-sea, tree-of-life-origins, whale-parasites-associates. The three retained dynamic-reference reports do not alone bind every current executable/data/manifest byte; preserve them as supporting evidence until full review binding/reproduction is complete. New October Field Notes content stays separate.

No app source, permanent identifier, media permission, scientific claim, category, operational flag or protected/upstream repository changed. No PR merge, hosted preview, deployment, publication or release occurred. Tester inheritance metadata changes the tester runtime release; the previous 333d922 artifact remains historical and must not be relabeled. A new exact successful CI artifact and fresh NOT TESTED physical record are required.

## Fresh combined verification

Node 839/839 PASS, zero failed/skipped; EVO 35/35 PASS; application preflight 33/33 PASS; fidelity-audit regressions 3/3 PASS; acceptance-record regressions 3/3 PASS; fifteen-app baseline/adversarial fidelity 12/12 PASS. Build, schema validation, security scan, artifact integrity and whitespace checks PASS. Planner has zero additions/errors. Literal media coverage has zero missing registrations and nine expected permission-only findings, not rights clearance.

Local HTTP byte verification: developer 383/383, tester 374/374 PASS. Fourteen simulated offline/navigation/recovery scenarios PASS, each 550/550 targets and complete resources, with zero offline network attempts. Runtime releases: developer e02837b6f3bb023c; tester ddec5240589469ad. These checks do not establish physical acceptance. A matching successful CI artifact remains required.

Exact next task: bind a new successful combined CI artifact and fresh physical NOT TESTED record, then complete full-byte/pinned render reproduction for Five Senses, Kelp and Elephant Seal using the retained evidence before their reconciliation. Preserve all new-content, image, physical/privacy and release gates.
