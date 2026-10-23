# Four-track implementation cycle — October 23, 2026

Integration baseline: 3dbb3636656440657e78c6bb27bb9edf88bc71ed. Existing draft PRs #2–#5 remain unmerged.

## Implemented behavior

- Track A: Whale Parasites jump destinations outside a search/filter now update the actual visible-card count without calling manually revealed entries search matches. Search/filter values, jump reveal/open/scroll/reset, scientific dataset, styles and stable IDs are unchanged. Regression reproduced the stale zero count before the fix. Runtime current-byte evidence updated with a bounded technical note; pinned evidence and approval statuses unchanged.
- Track B: contextual Back restores Timeline Time/Tools selection using the app's existing mode click handler, rather than resetting to Story. Legacy snapshots remain compatible; missing/ambiguous/malformed modes cannot trigger arbitrary controls. The inherited Timeline app bytes and centralized scientific data are unchanged.
- Track C: responsive-image audit checks all mixed data/local srcset candidates, preserves URL commas for path validation, and checks preload imagesrcset. A leading data URL cannot hide unregistered local images. The new verify-media-registration.mjs independently fails technical registration/offline/path findings while explicitly retaining incomplete permission review. Combined CI retains dist/media-registration-report.json; it does not confer publication permission.
- Track D: actual-document Tree of Life execution covers 53 registered destinations, nine fast controls, 18 internal links, ten searchable chapters and 48 disclosures, plus both generated environments' app/icon/shared-contract bytes and offline hashes. A reproduced search/navigation bug is fixed: a destination hidden by the active query clears that query before disclosure opening and scroll; visible destinations retain the query. Pinned V1 whole-JS protection still reverses only the exact documented fix and worker migration, then checks the original blob. Original content and stylesheet unchanged.

## Existing development branches

| Track | GitHub commit | Isolated verification |
| --- | --- | --- |
| A / #2 | 30a8abdf697298a852fc51012d1252db4b65ad4e | Node 494/494; focused 9/9; build/security PASS |
| B / #3 | e253b1bd2de5e7f390482a9a43e70a45381fce18 | Node 527/527; focused 55/55; build/schema/security PASS |
| C / #4 | 39f6b932b1039145ebbec71db887a4b89fa35dd3 | scanner Node 544/544 and focused 32/32; new gate 3/3 separately; build/security PASS |
| D / #5 | b374f5b7de442e9f8cbaa7d01fd353f154b5e26e | Node 646/646; focused Tree 17/17; build/security PASS |

These are exact isolated scopes, not a claim that every isolated full run included later independent helper additions.

## Combined local verification

Final source includes all changes and narrow Whale/Tree current-byte technical evidence updates. Node 887/887 PASS, zero failed/skipped. Build, schema (33 apps/11 categories), app preflight 33/33, security scan, artifact integrity and diff whitespace PASS. EVO Python 35/35 PASS. Technical media gate: zero technical findings/errors and zero registration additions; exactly nine permission-only findings remain. complete:false and permissionReviewComplete:false are retained explicitly.

Generated developer release: 98f490a5b3efe937. Tester release: bf5643e52eaef576. Previous physical-device evidence cannot establish acceptance of these changed bundles. Fresh local HTTP checks PASS: developer 383/383 and tester 374/374. All fourteen generated-worker offline/recovery scenarios PASS with 550/550 targets and complete resources in each scenario. Fresh hosted CI results must be checked independently and are retained in the existing draft PR updates and workflow artifacts rather than assumed from historical runs.

## Remaining boundaries and next batch

Readiness assessment still has 19 blockers: four complete inherited-app reconciliations, Seahorse review, nine image permissions and five operational gates. No blocker was closed by these engineering changes. New October Field Notes content remains separately scoped. Current device/mobile/offline/rollback, privacy, pilot and release authorization remain pending.

Next: verify final combined hosted workflow/artifact, then complete full Tree of Life and Whale renderer/inventory/manifest fidelity evidence (bounded new behavior differences explicitly documented), followed by Timeline renderer and Field Notes original/new-content review. Retain scientific/editorial/media review and native-device acceptance gates. No protected repository modification, PR merge, deployment, publication, release or visitor-app implementation occurred.

