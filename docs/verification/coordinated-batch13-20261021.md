# Coordinated batch 13 — October 21, 2026

Development only. PRs #2–#5 remain draft/unmerged. No deployment, preview update, release, protected-repository change, scientific wording change or approval grant.

## Completed work and GitHub checkpoints

Baseline integration: `aa00cffab8b24644584b1bf38d4081a6dda74ed5`. Recovered and integrated existing Track A `31d527e` first (portable worklist and reverse-reference evidence); baseline plus that change passed 770/770 Node tests.

| Track | Result | GitHub commit | Isolated verification |
| --- | --- | --- | --- |
| A / PR #2 | Outgoing duplicate/conflict comparisons preserve literal source, whitespace and paragraph context; guarded comparison links transfer focus to the selected statement. | `8385541e8a4b64dae02191790d7e897f2d5d2bae` | Node 462/462; build, validation, security PASS |
| B / PR #3 | Section deep links focus revealed content, preserving native summaries, explicit tabindex, Back restoration and one-shot navigation. | `393b85a6a10b3e3abbef2583841e4d6e25ca332e` | Node 506/506; navigation 19/19; preflight 33/33; build, validation, security PASS |
| C / PR #4 | Media planning rejects duplicate app owners and sparse/inherited manifest arrays before filesystem lookup. Imported only existing registration/preflight prerequisites onto the isolated branch. | `52f26b8dc7846795eba2f8439ad62441ef637d11` | Node 526/526; planner/preflight 23/23; build, validation, security PASS |
| D / PR #5 | Retained HTTP evidence must contain accurate, complete per-app resource/media coverage; combined CI explicitly runs media planning. | `2facfe45c9ef62fb0157e38f1dd4567f1c4e2831` | Node 623/623; evidence 59/59; build, validation, security PASS |

Shell Git push lacked credentials. GitHub connector tree/commit/ref operations saved the changes on the existing development branches without force updates. Every uploaded track tree matched its tested local Git tree. Integration source checkpoint: `96cedaecee19eddf519fee3f04c3ebca39aaa269`; verified source tree `02ed14f48c03a879872a57b47c10eb6c3e25cfc3`. Connector commit IDs differ from local replay IDs; exact tree equality was checked.

## Combined verification

- Node: 788/788 PASS; zero failed, cancelled or skipped.
- EVO integrity: 35/35 PASS. Application preflight: 33/33 PASS.
- Media registration: valid, zero errors/additions, no writes. Existing registrations were already complete; no redundant manifest edits on integration.
- Build, validation (33 apps/11 categories), security scan, independent artifact integrity and whitespace checks: PASS.
- Developer HTTP: 383/383 resources PASS; release `d0a9e2c124319d67`.
- Tester HTTP: 374/374 resources PASS; release `396e7065d45407d5`.
- Offline: 14/14 scenarios PASS, each 507/507 navigation targets (33 app entries and 474 search targets), complete exact-byte resources and zero offline network attempts. Includes corrupted entries, missing inventories, interrupted recovery, refresh orchestration, corrupt JSON, forged inventories and rollback lookup.
- Retained HTTP/offline evidence binding to generated releases and integration checkpoint: PASS. Readiness: technicalEvidence verified; releaseEligible false; 38 existing blockers unchanged.

An initial combined run observed an inconsistent stale tester bundle (resource bytes did not match its release inventory). Clean rebuild plus independent artifact verification resolved it; the entire combined suite then passed. Final HTTP/offline checks ran after that full suite and passed against the same rebuilt artifacts. No failures were waived. Track A updated a static assertion after extracting its renderer. Track C resolved an isolated historical preflight dependency failure using the existing shared-interface prerequisite before its final full run.

## Remaining work and reproduction

Scientific/editorial review of 33 applications and five operational gates (owner, pilot, physical-device offline, device rollback, privacy) remain pending. Current-build physical keyboard/screen-reader/iPhone acceptance, Android/Windows installation and broader scale/performance acceptance remain unverified. These automated results do not replace device or content approval.

Hosted CI remains unverified. Exact-source-SHA connector lookup returned no runs; that tool filters pull-request-triggered runs and does not establish whether integration push workflows ran. Do not infer a synchronization failure or reuse historical CI.

Reproduce sequentially: `npm run build`, `npm test`, `npm run validate`, `npm run content:check:all`, `node scripts/plan-offline-media-registration.mjs`, `npm run security:scan`, `node scripts/verify-build-artifacts.mjs`, `python3 -m unittest discover -s scripts/validation -p 'test_evo_*.py'`, `node scripts/verify-local-http.mjs --report-dir dist/http-reports`, `node scripts/verify-offline-navigation.mjs --report-dir dist/offline-reports`. Copy HTTP reports to `dist/developer-http-report.json` and `dist/tester-http-report.json`, set `dist/SOURCE-COMMIT.txt` to the source checkpoint, then run `node scripts/verify-review-evidence.mjs dist SOURCE_SHA` and `node scripts/assess-release-readiness.mjs --evidence-dir dist --expected-commit SOURCE_SHA`.

Next useful work: inspect additional end-to-end review/navigation flows and media/scale acceptance without changing approval records; independently verify hosted CI for the current source SHA. Physical acceptance and publication require their established authorizations.
