# C — Offline and Mobile

Development track initialized October 18, 2026.

Base checkpoint: 966024670dc0e18cccdb091f45665ce9a9493b8f.

## Mission
Offline-first reliability, caching, navigation, and iPhone compatibility. Do not modify public tester or production.

## Ownership
Primary change area: service worker, offline cache, mobile UI.
Avoid modifying files owned by other tracks. Cross-track shared files require integration review.

## Required gates
- Preserve protected V1, public tester, and independent EVO repositories.
- Keep canonical identifiers, scientific approvals, and modular architecture intact.
- Run automated tests, build validation, security scanning, and offline checks where applicable.
- Use pull requests into security-review-evo-foundation-20261014 for review; never auto-merge.
- No deployment, publishing, or production changes without explicit authorization.

## Execution
This branch isolates work; it does not by itself start an autonomous development agent. Work must be invoked through an available execution session or GitHub workflow.

## October 18 implementation checkpoint

- Installed app cache status now re-verifies after page restoration, foregrounding, connection changes and service-worker controller changes. This covers suspended iPhone PWA sessions that previously kept an old Ready offline label.
- Overlapping lifecycle events coalesce into one pending verification; errors allow a later resume to retry. Status displays Checking offline files while verification runs.
- Reconnection checks for a new worker without activating an update or changing existing approval gates.
- Validation: build PASS; 409/409 automated tests PASS, including five new lifecycle behavior tests; build validation PASS (33 apps, 11 categories); security scan PASS.
- New lifecycle module appears in generated tester release resources, preserving offline availability of its static import.
- Physical iPhone suspension, storage eviction and airplane-mode checks remain manual device-review work. Automated checks do not satisfy device release gates.

## Shared-media offline range checkpoint

- The worker now serves single byte ranges from fully SHA-256/size-verified cached resources, including compatible verified rollback resources. This supports installed-app media consumers requesting partial reads.
- Exact, open-ended and suffix ranges return 206 with byte bounds and lengths; unsatisfiable ranges return 416. Unsupported/malformed/multiple or conditional If-Range requests retain the complete verified response.
- Partial responses are never written to the cache. Existing environment/scope boundaries, rollback matching, V1 caches, and update activation rules remain intact.
- Validation: build PASS; 413/413 tests PASS (four new real-worker shared-media behavior regressions); build validation PASS (33 apps, 11 categories); security scan PASS.
- Physical Safari media playback/seeking and installed-device offline tests remain pending; no device approval is implied.

## Fetch inventory authorization checkpoint

- Direct cached responses and rollback recovery now require structurally valid manifests, matching worker environment/release identities, safe unique paths, and valid hash/length metadata.
- Current inventories across installation, activation, readiness and fetch additionally recompute the builder's resource-list digest and bind it to the worker's embedded release ID. A substituted payload with a substituted matching resource hash cannot reuse the original release ID.
- Rollback bytes still must match the authenticated current inventory's SHA-256 and size; older inventories cannot authorize new content. Full and byte-range responses use the same checks.
- This is release inventory binding, not a digital signature, scientific approval or a replacement for device release checks.
- Validation: build PASS; 418/418 tests PASS (five new real-worker security regressions covering fetch, install, readiness and activation); build validation PASS (33 apps, 11 categories); security scan PASS. Existing lifecycle and range tests remain passing.

## Bounded worker readiness checkpoint

- Offline requests now use an existing controller immediately, even if `serviceWorker.ready` remains pending after registration loss or suspension.
- A single 30-second deadline covers both registration readiness and the worker reply. A late registration cannot send an abandoned request, and reply timeout closes both message ports.
- Registration rejection is surfaced promptly, allowing existing lifecycle retry/error behavior to recover on a later event.
- Validation: targeted channel regressions PASS 13/13; full suite PASS 424/424; build PASS; build validation PASS (33 apps, 11 categories); security scan PASS. Existing real-worker cache, redirect, integrity, and byte-range behavior tests pass in the full suite.
- No deployment, device acceptance, or release/scientific approval changes. Physical storage-eviction and registration-loss recovery remain device review work.
