# Coordinated batch 10 — October 21, 2026

## Baseline and boundaries

Verified integration head `3db691e42f26d9c707908e76bbb13c51b07bba34`, clean working tree, remote track heads and open draft PRs #2–#5 before editing. Batch 9 results remain historical. Initial and final media registration planning were valid with zero errors/additions.

User-reported physical iPhone acceptance on October 20: 14/14 PASS, no problems. This is baseline acceptance, not acceptance of the new recovery behavior. No approval flags were changed.

## Completed development and GitHub track checkpoints

- A `d5ca2cd9358ffea49aa14e6a4ab17bf91973374d`: readable Naturalist exports share captured-section provenance validation with the review UI. Mismatched/incomplete evidence shows regeneration instructions; source, reviewer annotations and approval states remain intact. Isolated Node 453/453 PASS.
- B `f3e5feba7c0800d48bfb468f4b6b0389dd496cb3`: pagehide saves browsing position for reload/browser departures, preserving separate category position while Search/Help/History is displayed. Isolated Node 497/497 PASS.
- C `90a51f2ed6d0c502f2a66e7715438ffa6c724470`: explicit refresh reconstructs missing/partial same-release offline inventory. RECOVER_OFFLINE is restricted to the exact same-scope refresh page and uses existing release/environment/inventory/resource verification. No cache deletion or forced activation; general REPAIR remains developer-only. Isolated Node 494/494 PASS.
- D initial `e8755aec646fcd53591618c8005639f0bcce27c4`, final `6bba9328c3837838b07b0eae9002ccc6b0ab692c`: offline acceptance verifies every resource's exact bytes, plus full inventory-loss recovery and interrupted recovery/retry. Evidence binding requires all eight scenarios, full resource counts and preserved data/no deletion/no activation. Final D explicitly includes C as a dependency. Isolated D+C Node 590/590 PASS.

Connected GitHub trees were checked against tested local tree hashes before branch updates. Integration cherry-picks were conflict-free. Generated catalog/build reports were excluded.

## Combined verification

Tested source checkpoint: `7319645` (local integration implementation commit; final remote checkpoint includes this document). Build completed before tests.

- Node: 732/732 PASS; zero failed/cancelled/skipped.
- EVO integrity: 35/35 PASS.
- All-app preflight: 33/33 PASS.
- Media registration: valid, zero errors/additions, no writes.
- Build validation, security scan, independent artifact integrity, post-suite security regressions 4/4 and whitespace checks: PASS.
- HTTP developer: 380/380 PASS, release `76df2f87ca456d88`.
- HTTP tester: 371/371 PASS, release `f364b63cf96e1282`.
- Eight offline simulations: prepared navigation, corrupted-entry recovery, complete inventory-loss recovery, interrupted inventory recovery/retry, each in developer and tester. Every scenario: 507/507 navigation targets (33 app entries, 474 search targets), zero offline network attempts. All manifest resources pass exact-byte verification: developer 380/380, tester 371/371.
- Inventory recovery simulations preserve unrelated data, perform no cache deletion/activation and verify complete readiness before offline navigation.
- Retained HTTP/offline report release, checkout, resource and recovery-evidence binding: PASS.

Reproduce using npm run validate; npm run build; npm test; npm run content:check:all; node scripts/plan-offline-media-registration.mjs; npm run security:scan; python3 -m unittest discover -s scripts/validation -p 'test_evo_*.py'; node --test tests/security-review.test.mjs; node scripts/verify-build-artifacts.mjs; node scripts/verify-local-http.mjs --report-dir verification/http; node scripts/verify-offline-navigation.mjs --report-dir dist/offline-reports. Evidence binding also needs the HTTP reports copied to dist/developer-http-report.json and dist/tester-http-report.json and the checkout hash in dist/SOURCE-COMMIT.txt, as in the combined workflow.

## Outstanding verification and acceptance

GitHub CI must be checked for the final exact remote SHA. New track commits had no returned workflow/check runs at inspection; no Batch 10 CI PASS is claimed here. Local verification does not substitute for hosted CI or device acceptance.

Corrupt existing inventory metadata still causes STATUS rejection with a preserve-data/help diagnostic. Reconstruction is limited to valid incomplete or missing-inventory STATUS. Recovery requires online access to the matching release; changed deployments fail safely. Older installed workers gain this capability only after receiving the updated worker; no preview was published.

Next physical-device test: on an authorized isolated review installation, verify same-release refresh after missing inventory, an interrupted recovery/retry, offline restart/navigation/media, and Search/Hub/category position across reloads. Do not clear a user's website data to simulate loss.

Scientific/editorial review and existing release gates remain pending. No canonical identifiers, scientific content, protected repositories, independent EVO architecture, publication or deployment changed. PRs remain draft and unmerged. No release authorization is implied.
