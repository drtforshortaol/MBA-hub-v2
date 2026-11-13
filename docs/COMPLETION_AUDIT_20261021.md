# MBA Hub V2 completion audit — October 21, 2026

## Conclusion and scope

The requirements recorded in the repository support moving from feature development to acceptance. No missing core A–D feature was confirmed. This is not a full-release certification or a completion percentage. The original two owner-provided planning documents referenced by the old README are absent from this checkout; complete equivalence to unseen documents cannot be certified.

Audit baseline: `96a9303ef54f0d0fc6cccb8ef0da2fed9f8609de`, tree `1e5046878d64ab14dd018043147aaed26d359570`. No approved scientific wording, canonical identifier, source approval record, production/tester repository or deployment changed in this audit.

## Requirement evidence

| Recorded requirement | Evidence in current repository | Remaining acceptance |
| --- | --- | --- |
| Preserve V1, separate environments and modular ownership | ARCHITECTURE.md; manifest-generated registry; environment/cache and security suites | Verify candidate on isolated URL; retain V1 fallback |
| Migrate existing applications and media | 33 manifests; all 25 V1 inventory entries included; 203 catalog assets; content preflight | Per-app content fidelity, images and visible interactions |
| Contextual navigation and search | Hub/A–Z; section-navigation and app-navigation modules; corresponding behavior suites | iPhone Back/Return, slow search, focus/VoiceOver |
| Naturalist intake through reviewed draft/export | developer.js and focused Naturalist modules/suites; manual approvals preserved | Physical file picker, recovery/downloads, long review usability |
| Offline, complete updates, recovery and rollback | SHA-256 inventories; generated-worker HTTP/offline and recovery suites | Real Safari installation, restart, interruption, update and whole-bundle rollback |
| Evidence/security/reproducibility | security scan; artifact verification; per-resource HTTP/offline checks; evidence binding | Growth/performance measurements and physical/browser coverage |

## Hosted CI and fixed review build

[Combined iPhone Review Build run 39717669206](https://github.com/drtforshortaol/MBA-hub-v2/actions/runs/39717669206) completed successfully for the exact baseline SHA. Queried the full Actions runs endpoint filtered by head SHA, then inspected job steps and artifact metadata. Earlier PR-only lookup excluded push-triggered runs; no synchronization defect was established.

All build/test, HTTP, offline simulation, evidence-binding and upload steps succeeded. Fixed artifact ID `12399387211`, name `mba-v2-combined-iphone-review`, size 128,029,418 bytes, ZIP SHA-256 `ec47c591c187752fcea183703e7005fe910e7c2756913b6cd935575085884dd4`. Artifact retention expires November 20, 2026 at 7:36 p.m. Pacific (November 21 03:36 UTC); source SHA remains the reproducible reference. Do not substitute a newer artifact silently.

Downloaded ZIP digest verified; source marker and retained HTTP/offline evidence reverified locally against the exact baseline SHA. Developer release `d0a9e2c124319d67` (383 resources); tester `396e7065d45407d5` (374). All 14 offline scenarios contain507/507 navigation targets each and zero offline network attempts. Current build's original combined Node 788/788, EVO 35/35 and app preflight 33/33 passed. A later audit-only commit does not replace the fixed device candidate.

Measured fixed-build offline payload: developer 67,159,466 bytes; tester 67,078,345 bytes (about 64 MiB each), excluding browser/cache overhead and retained prior bundles. Search index: 437,438 bytes. These are inventory measurements, not phone storage or timing guarantees. Machine-readable CI evidence is in `verification/completion-ci-20261021.json`.

See [fixed-build acceptance checklist](FIXED_BUILD_ACCEPTANCE_20261021.md). No new hosting URL was created. Do not use the existing preview or protected tester as if it contained this candidate.

## Approval reconciliation

`GUIDE_CONTENT_RESTORED.md` explicitly supersedes alpha.6 privacy/filtering findings and preserves approval for unchanged V1 content, operational information, photographs and permissions. All 32 migrated source manifests match migration-provenance.json by app ID, repository and source commit. All 203 catalog assets record owner-approved-v1. Matching provenance is not proof that content has remained unchanged.

The 38 canonical blockers currently mean:

- 32 inherited-approval reconciliation candidates: verify fidelity and identify material changes; reconcile source pending metadata with tester inherited metadata. Do not ask the owner to approve identical V1 material again.
- 1 new content review: big-bellied-seahorse, including scientific/numerical claims and five local images not represented in the 203-asset catalog. Keep pending until appropriate evidence exists.
- 5 operational gates: full-release owner authorization, pilot, current-build device offline, device rollback and final privacy review. Historical guide-distribution authorization is already recorded; the final privacy record should verify current distribution scope and changes, not restart the superseded alpha.6 request.

The readiness CLI now labels these categories without altering releaseErrors, manifest states, permissions or eligibility. The tester generator currently infers inherited approval from any source_repository; provenance/fidelity reconciliation must address that broad inference before final promotion.

## App acceptance inventory

For every app verify approved wording, panels/actions, images/captions, search and deep links, Back/Return, offline reopen and local media. Record exact results in a separate evidence record, not this template's pending cells. Supporting apps should be exercised via their intended link or direct entry even though absent from Hub listings.

| Permanent app ID | Visibility | Content closure | Physical acceptance |
| --- | --- | --- | --- |
| applied-water-science-life-support | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| aquarium-library-explorer | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| big-bellied-seahorse | Listed | New content: scientific/editorial + five image permissions | Not tested on fixed build |
| bluespotted-ribbontail-ray | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| california-flying-fish | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| california-sheephead | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| evolution-timeline | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| five-senses-pwa | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| flamboyant-cuttlefish | Supporting | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| gooseneck-barnacle | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| gray-whale | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| gray-whale-skeleton-exhibit | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| green-falsejingle | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| hopkins-rose-nudibranch | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| inaturalist-citizen-science | Supporting | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| information-center | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| interpretation-principles | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| kelp-forest | Supporting | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| mba-leadership | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| mmc-narrations | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| naturalist-field-notes | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| northern-elephant-seal | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| open-sea | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| pacific-white-sided-dolphin | Supporting | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| pseudo-nitzschia | Supporting | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| sea-slugs-nudibranchs | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| sperm-whale | Supporting | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| stargazer-species-guide | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| tree-of-life-origins | Supporting | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| whale-associated-organisms | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| whale-parasites-associates | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| wildfires-ocean-health | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |
| wildlife-rescue | Listed | Inherited approval reconciliation; verify fidelity | Not tested on fixed build |

## Outstanding scope and order

1. Complete source/generated inherited-approval reconciliation with content-fidelity evidence; review genuinely new/altered content separately.
2. Run fixed-build physical acceptance and owner plus three trusted reviewers' pilot; record failures before fixes.
3. Measure actual install/storage size, search responsiveness and long-review usability; document a growth budget before claiming 100–200-app capacity. Android/Windows physical acceptance remains unverified.
4. Confirm whether six empty categories and seven supporting/unlisted apps are intentional. Categories: Cannery Row, Guide Talks, Making the Aquarium Come Alive, Seafood Watch, Visitor Questions, Visitor Services. These are scope/placement questions, not proof of lost content; do not relocate or invent apps automatically.
5. Close operational records using actual evidence, then request explicit final rollout authorization. Do not deploy/merge as part of this audit.

No defensible completion date exists until current-device acceptance establishes the remaining defect count. This is a bounded acceptance phase rather than an open-ended feature list.

## Audit change verification

Readiness now distinguishes unique matching inherited-provenance candidates from new/unestablished content review, without changing canonical blocker reasons or eligibility. Regression coverage rejects mismatched repository/commit, absent and duplicate provenance and confirms assessment does not mutate inputs. Full Node789/789, focused readiness3/3, EVO35/35, application preflight33/33, build, validation, security, artifact integrity and whitespace checks PASS. Both runtime release IDs remain identical to the fixed candidate. README and historical review notices now distinguish current status from superseded records; future CI artifacts include this audit/checklist/evidence alongside the actual artifact source marker.
