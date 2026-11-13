# Completion progress and replacement candidate — October 21, 2026

Follow-up: [verified replacement artifact and final Kelp Forest clarification](REPLACEMENT_CANDIDATE_20261021.md). Its exact source/digest supersede the historical candidate identity.

Actual acceptance work uncovered a runtime defect, so the previous fixed artifact is now a historical baseline. No deployment or release occurred. All approval flags remain unchanged; PRs #2–#5 were confirmed open/draft.

## Fixed defect and new candidate identity

Information Center's active DOM renderer captured only the area code when splitting complete phone numbers, discarding the remaining digits. Double-escaped digit expressions also prevented callable links. The corrected renderer retains complete text and creates the proper `tel:+1` target. Short internal extensions remain text. Regression tests exercise list, numbered-list and quick-reference paths, multiple numbers, highlighting and literal markup.

Replacement runtime releases: developer `9b8e36c2e6d07f08` (383 resources), tester `e8bc7f50c707bd7c` (374). These supersede `d0a9e2c124319d67` / `396e7065d45407d5` for future acceptance. Identify the actual new hosted build by its exact Actions head SHA, SOURCE-COMMIT.txt, artifact ID and ZIP digest before device testing. No artifact ID or download verification is implied by this document. Later documentation/tool-only commits may preserve these runtime IDs but still have distinct artifact source markers.

Use procedures I1–I17 from FIXED_BUILD_ACCEPTANCE_20261021.md, substituting a fully identified replacement candidate in a new evidence record. Do not carry old physical results or candidate identity into the new record. The old hosting proposal and JSON template describe the earlier artifact; update every identity before any authorized deployment or test. The old artifact remains useful as an explicitly identified lifecycle comparison, but its known phone defect must be recorded and it is not the release target.

## Completed evidence and checks

Local combined verification after the phone fix: Node 791/791, EVO 35/35, migration-audit regressions 2/2, app preflight 33/33, build/validation/security-pattern scan/artifact integrity/media registration PASS. HTTP developer 383/383 and tester 374/374 PASS. All 14 simulated offline scenarios pass 507/507 navigation targets with zero offline network attempts. Machine summary: verification/completion-local-20261021.json. These do not replace physical Safari/device tests.

The pinned-source fidelity audit, per-file hashes and reconciliation limits are in MIGRATION_FIDELITY_20261021.md and verification/migration-fidelity-20261021.json. It establishes 202 exact pinned media assets, one media provenance gap, and static-text equality on 33/34 pages. Content-aware comparison separates navigation/security rewrites from content datasets; remaining executable and newly added content scopes are explicit. No blanket inherited approval is granted by source_repository alone.

SEAHORSE_CONTENT_REVIEW_20261021.md records claim evidence and inspection of all five local images. It identifies numerical/taxonomic uncertainties, additional claims embedded in illustrations and missing image permissions. SEAHORSE_PROPOSED_CORRECTIONS_20261021.md provides proposed wording and per-image choices; none is applied or approved.

Pilot procedures, all 33 app rows, 17 checks, owner plus three reviewers and five operational gates are prepared in FIXED_BUILD_PILOT_RECORD_20261021.md and its template. They remain NOT TESTED/PENDING.

## Concrete remaining work

1. Finish content-aware fidelity reconciliation, including generated section descriptions and separately introduced Naturalist content. Preserve unchanged V1 approval; obtain evidence/review only for new or materially changed material.
2. Resolve seahorse scientific/editorial and image-rights findings. Public draft hosting remains blocked by these findings; hosting authorization alone does not resolve them.
3. Identify/download/hash-verify the replacement CI artifact, then adapt the isolated trusted-HTTPS proposal to that exact identity. Deployment requires explicit authorization. A restricted/local trusted-HTTPS alternative needs an actual host/certificate/device arrangement before it is executable.
4. Complete physical current-build app/media/navigation/install/offline/update/rollback tests and owner plus three-reviewer pilot, recording actual failures and retests. Keep the five operational gates pending until evidence exists.
5. Retain explicit Android/Windows, performance/growth, six empty category and seven supporting-app questions. No automatic relocation or invented content.

Protected repositories, upstream repositories, existing preview URLs, scientific approval scope and release authority remain unchanged. No completion percentage or fixed release date is asserted.
