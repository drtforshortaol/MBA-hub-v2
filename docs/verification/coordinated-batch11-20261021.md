# Coordinated batch 11 — October 21, 2026

## Baseline and scope

Verified clean integration head `8ead95a5a4eb753163524036083fe90225ad59dd`, current remote track refs and draft/unmerged PRs #2–#5. Initial and final read-only media planning passed with zero errors/additions, so no redundant media registration changes were made. Architecture and approval boundaries remain authoritative.

## Completed tracks and GitHub checkpoints

- A `d0020d050f6c0b242dba816fc9c106cf3322330e`: original Naturalist statements show inbound duplicate/conflict evidence, exact source and paragraph context, destination and guarded review links. Existing decisions/blockers are unchanged. Isolated Node 456/456 PASS.
- B `b859b4fa6e7ed8c15f141f09150ca59254463fdd`: Search initializes and persists query/category controls before awaiting the index. Slow loading and failed-request retries preserve user input; detached controls cannot overwrite a newer route. Isolated Node 500/500 PASS.
- C `967fd5b1e3dd075159af3a02ec5071ab3201bf86`: cached JSON/metadata/inventory digest failures receive the narrowly typed OFFLINE_INVENTORY_INVALID status. Explicit refresh may reconstruct once through existing authenticated same-release preparation. Arbitrary storage/crypto/runtime errors remain failures. No cache deletion, forced activation or REPAIR permission expansion. Isolated Node 505/505 PASS.
- D `196969fc5544d11c035b7c84110f69d0559bdc87`: generated refresh page executes against the generated worker via simulated MessageChannel, checking missing/corrupt inventory recovery, exact command order, redirect, port/timer cleanup and retained data. Seven scenarios per environment are required by retained-evidence binding. D includes C as an explicit dependency. Isolated D+C Node 610/610 PASS.

Remote tree hashes were matched to tested local trees before branch updates. Integration cherry-picks were conflict-free. Independent review found no blocking cross-track/scientific-approval issue. Generated catalog/build report changes were excluded.

## Combined local verification

Implementation source checkpoint before documentation: `e940b3d` (local integration commit). Final remote integration includes this record and updated architecture/review instructions; runtime bytes are unchanged by those documents.

- Node: 758/758 PASS; zero failed/cancelled/skipped.
- EVO integrity: 35/35 PASS.
- All-app preflight: 33/33 PASS.
- Media registration: valid, zero errors/additions, no writes.
- Build validation, security scan, independent artifact integrity, post-suite security regressions 4/4 and whitespace checks: PASS.
- HTTP developer: 381/381 PASS, release `7343f3959b2de873`.
- HTTP tester: 372/372 PASS, release `fc50d1524bd640f1`.
- Offline: 14/14 scenarios PASS. Each verifies 507/507 navigation targets (33 app entry URLs, 474 search targets), plus developer 381/381 or tester 372/372 exact-byte resources, zero offline network attempts.
- Scenarios in each environment: prepared navigation; corrupted-entry rollback recovery; inventory loss; interrupted recovery/retry; generated refresh-page missing inventory; generated refresh-page corrupt JSON; generated refresh-page forged resource inventory.
- Recovery retains unrelated data and performs no cache deletion or activation. Refresh-page scenarios require STATUS then RECOVER_OFFLINE, one Hub redirect, closed message channels and cleared deadlines.
- Retained HTTP/offline evidence release, source checkout, complete resources and recovery/orchestration binding: PASS.

The negative refresh fixture was corrected to rebind modified bytes to its test release and disable every recovery call. The final full suite passed after this correction; no failing fixture was waived.

Reproduce using npm run validate; npm run build; npm test; npm run content:check:all; node scripts/plan-offline-media-registration.mjs; npm run security:scan; python3 -m unittest discover -s scripts/validation -p 'test_evo_*.py'; node --test tests/security-review.test.mjs; node scripts/verify-build-artifacts.mjs; node scripts/verify-local-http.mjs --report-dir dist/http-reports; node scripts/verify-offline-navigation.mjs --report-dir dist/offline-reports. Copy HTTP reports to dist/developer-http-report.json and dist/tester-http-report.json, write the checkout SHA to dist/SOURCE-COMMIT.txt, then run node scripts/verify-review-evidence.mjs dist CHECKOUT_SHA. Build before tests; avoid source edits during a full-suite run.

## GitHub CI investigation

Git transport and the GitHub refs endpoint agree that Batch 10 development refs advanced. However, PR payloads still reported Batch 9 head SHAs even after metadata updates. Exact-SHA Actions and check-run lookups for Batch 10 returned zero results; combined status was pending with zero statuses. The newest returned combined-branch run was historical Batch 9 run39324667318 for3db691e, PASS. That result does not verify Batch 10 or Batch 11.

Independent static review found no defect in the combined push branch trigger or existing pull_request workflows. Deployment jobs remain intentionally disabled. The connector rejects the workflow collection endpoint and exposes no workflow-dispatch operation; Git command-line writes lack credentials, so authenticated commits/ref updates use the connected GitHub tools. The cause of missing CI/PR synchronization is unconfirmed. Do not change release safeguards or claim hosted CI PASS without actual exact-SHA results. Recheck the final Batch 11 commit's Actions/check runs separately.

## Remaining boundaries and next acceptance

The prior corrupt-inventory recovery limitation is resolved in simulated worker/page verification. Online same-release availability is still required; stale deployments and arbitrary runtime failures stop safely. Existing installed workers acquire this behavior only after an authorized update.

Physical iPhone tests of slow-loading Search, reload position, generated refresh/recovery and corrupt-inventory fixtures remain outstanding. The user reported baseline14/14 PASS on October20; the exact source SHA was not established here, so no Batch 10/11 device acceptance is inferred. Updated artifact instructions are in docs/iphone-review-20261018.md. Use disposable instrumented fixtures; do not clear a user's browser data.

Hosted CI confirmation, scientific/editorial acceptance and existing release gates remain pending. No scientific content, canonical IDs, protected repositories or independent EVO boundaries changed. All PRs remain draft and unmerged. No preview publication, deployment or release occurred.
