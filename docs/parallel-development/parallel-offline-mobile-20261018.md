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

## Installed-app initialization recovery checkpoint

- Offline initialization now attaches lifecycle listeners immediately and verifies the existing controlling worker independently of registration. An offline registration failure or indefinitely pending registration no longer blocks a verified installed-cache status.
- Registration attempts are deduplicated while pending. Reconnection retries a failed registration, then subsequent reconnects use the returned registration's update check. Registration/update checks never activate a waiting worker or alter approvals.
- Fresh installs still wait for worker readiness through the bounded request channel; successful registration schedules cache reverification. Initialization returns its lifecycle handle so callers can dispose listeners if needed.
- Validation: three browser-environment behavior regressions exercise pending registration, offline registration rejection/reconnection, and fresh-install readiness. Full suite PASS 427/427; build PASS; validation PASS (33 apps, 11 categories); security scan PASS; diff check PASS.
- Physical suspension/storage eviction and update/rollback acceptance remain outstanding; private preview unchanged.

## Manual offline verification checkpoint

- The Hub status now has a keyboard-accessible, touch-sized **Check offline files** button. Users can retry verification after a transient failure or before going offline without closing and reopening the app.
- Manual checks reuse the lifecycle's serialized, bounded STATUS verification. Repeated taps coalesce, the button displays checking feedback, and failure restores retry availability.
- When connected, a check also retries registration or discovers updates without waiting for that network operation to finish. Offline checks do not request update discovery. No cache deletion, namespace changes, activation command, scientific approval, or device acceptance changes are introduced.
- The control is removed with lifecycle disposal; app pages without the Hub status do not receive an extra button.
- Five new behavior cases cover manual checks, tap coalescing, failure recovery, stalled update discovery, lifecycle disposal, absent status, and actual initialization-to-worker response wiring. Full Node suite PASS 432/432; targeted controls/initialization tests PASS 8/8; build, build validation (33 apps/11 categories), security scan and diff checks PASS. New control module is in the generated tester release inventory. Physical layout/device acceptance remains pending.

## October 19 interrupted verification checkpoint

- Worker requests accept an optional AbortSignal. Cancellation before readiness prevents late sends; cancellation after dispatch immediately closes both MessageChannel ports, clears the shared deadline, and removes the abort listener. Existing callers retain the same bounded request behavior.
- Stopping an initialized offline lifecycle now cancels outstanding verification and prevents both late worker replies and cancellation errors from changing its disposed status element. This changes no caches, service-worker activation rules, canonical identifiers, scientific content, or Safari transport behavior.
- Five new regressions cover pre-cancellation, cancellation during registration, cancellation after dispatch, listener cleanup, and lifecycle disposal with a real MessageChannel late reply. Targeted channel/initialization/control/lifecycle tests PASS 36/36; full branch Node suite PASS 442/442 after sequential build. Build, build validation (33 apps/11 categories), security scan, and diff checks PASS.
- Physical iPhone/Safari suspension and device acceptance remain pending. No deployment or preview update performed.

## October 19 readiness protocol checkpoint

- The Hub now validates the complete/count/total STATUS contract before displaying offline readiness. Truthy non-booleans, absent or unsafe counts, impossible bounds, and completion flags inconsistent with the verified inventory fail closed to the existing retryable unavailable state.
- Valid partial inventories and the worker's missing-manifest 0/0 preparation response retain their existing behavior. A later valid STATUS reply recovers readiness without reinitialization or cache deletion.
- Eleven new real-MessageChannel regressions cover malformed replies with successful recovery and valid preparation states. Targeted channel/initialization/control/lifecycle suite PASS 47/47; sequential build then full branch Node suite PASS 453/453; build validation (33 apps/11 categories), security scan, and diff check PASS.
- No worker namespaces, service-worker activation, Safari transport behavior, scientific content, deployment, preview, or device-approval gates changed.

## October 19 worker-handover recovery checkpoint

- Controller handover now interrupts verification against the obsolete worker and immediately queues verification using the replacement. Installed apps no longer wait up to the old request's 30-second deadline after a controller change.
- Each verification owns a fresh abort controller, so cancellation releases the old ports without disabling future manual, lifecycle, or initialization checks. Expected handover cancellation does not flash a misleading failure status.
- Controller changes reverify even while the document is hidden, preventing a retained readiness label for the previous controller when the app next becomes visible. Normal visibility/page-show throttling remains intact.
- Three new real-MessageChannel behavior tests exercise handover during a stalled check, handover while hidden, and handover during the first initialization check. Targeted offline suite PASS 50/50; sequential build then full branch Node suite PASS 456/456; build validation (33 apps/11 categories), security scan, and diff check PASS.
- No cache namespace, message protocol, worker activation, Safari response handling, scientific content, approvals, deployment, or preview changes.

## October 19 evicted-resource recovery checkpoint

- Fetch recovery now restores an evicted/corrupted current-release resource from an already verified compatible rollback copy or a complete online response with the current inventory's exact SHA-256 and byte length. A successful visit can restore offline readiness instead of repeatedly depending on the network or rollback cache.
- Current inventory structure, environment, release identity, and inventory digest must all validate before any recovery write. Missing/substituted current inventories cannot authorize recovery; partial installations are never promoted. Unknown paths and network partial responses stay uncached.
- Restoring storage is best effort: quota/eviction write failures preserve successful verified serving. Rollback range requests store the full authenticated representation before returning the partial response. V1 and previous-release caches remain untouched; tester REPAIR command rejection and activation rules remain unchanged.
- Ten new real-worker regressions cover online-to-offline recovery, rollback recovery, interrupted retry, substituted/missing manifests, unverified/partial/unknown resources, quota failure, and full-body preservation during range recovery. Targeted recovery suite PASS 10/10; full branch Node suite PASS 466/466 after sequential build; build validation (33 apps/11 categories), security scan, and diff check PASS. One initial build encountered a transient missing media-upload temporary file; rerunning the build completed successfully before full tests.
- No deployment or preview update; physical Safari/iPhone storage-eviction acceptance remains pending.

## October 19 standalone recovery deadline checkpoint

- The standalone refresh page now shares a 90-second deadline across registration, update discovery, worker installation, worker commands, current-release download, and release parsing. A stalled network/browser operation produces actionable retry guidance rather than an indefinite loading screen.
- Each awaited phase races the same deadline, so a late registration or installation completion cannot resume a timed-out workflow or send a delayed activation request. Recovery retains its existing explicit waiting-worker activation and verified current-release reopen behavior.
- Success/failure/timeout cleanup closes message ports, removes installation/controller listeners, and clears timers. A failed activation can no longer navigate the user later when an unrelated controller change occurs.
- Six VM regressions execute the actual standalone page script with controlled clocks and worker events, covering stalled registration/update/fetch/installation, late events, failed activation cleanup, and both successful recovery paths. Targeted recovery-page suite PASS 6/6; full branch Node suite PASS 472/472 after sequential build; build validation (33 apps/11 categories), security scan, and diff check PASS.
- The page remains self-contained, without a dependency on Hub modules. No cache-clearing, namespace, activation-rule, deployment, preview, or device-testing changes.

## Media registration ambiguity checkpoint — October 21, 2026

- Read-only planning now rejects duplicate application IDs before proposing additions for any ambiguous owner. Manifest media and offline-path arrays must contain owned entries at every position; holes and prototype-inherited entries no longer pass validation or reach filesystem lookups.
- Existing integration media registrations remain complete: zero errors and zero additions. No manifests, scientific wording, permissions, runtime caches, or approval gates changed.
- The delta was first validated on combined integration `acb2609`, then reproduced on PR #4's existing branch with the exact earlier media-registration and interface-preflight prerequisites. No whole integration merge or unrelated runtime changes were imported. Owning manifests match combined integration exactly. Prerequisites: `7271b0e`, `1069dd7`, `709b9cf`, `1c342a7`, `0e98f63`, `e9521ae`.
- Combined integration: planner PASS 14/14; Node PASS 772/772. Isolated PR #4: planner plus preflight PASS 23/23; Node PASS 526/526 (zero failures/cancellations/skips); build, validation (33 apps/11 categories), security scan and diff check PASS. An initial isolated run failed on the historical shared-interface preflight bug; applying existing `e9521ae` resolved it before final full verification. No deployment or publication performed.
