# Rollback retention hardening — October 29, 2026

Branch: `work/release-verification-20261029`, based on development checkpoint `c0ddccf0b10dc50b01aba17e917d646946af352c`. This is one of four isolated continuation tracks; it targets the existing iPhone development branch for review. No merge, deployment, publication, approval configuration or installed-device change is performed here.

## Problem and change

Activation previously checked each prior bundle's declared resources against its cached bodies, but did not bind the complete declared inventory to the release ID in its cache key. A truncated inventory or an edited body plus matching edited digest could retain a stale release ID. If inserted after a genuine complete prior bundle, that candidate was treated as healthy and displaced the genuine rollback bundle during pruning.

Prior candidates now pass the existing `compatibleManifest(previous, cacheRelease, true)` check before resource verification and retention. This recomputes the same ordered `JSON.stringify(resources)` SHA-256 prefix used by the builder and current-bundle checks. Complete existing-format bundles retain their existing behavior; structural errors, substituted inventories and stale release identities fail closed. Current-release preparation, explicit activation authorization and same-current-hash asset recovery behavior remain unchanged.

The old retention success test used a synthetic `prior` ID with the current inventory. It now constructs a distinct, complete previous bundle with an authentic inventory-bound release ID. Other invalid-candidate tests retain their intended rejection expectations.

## Evidence and scope

Three small worker-execution regressions cover retaining the newest complete prior bundle, preserving V1/other environment/other path caches, and rejecting both subset and matching-body-substitution candidates without losing the genuine bundle. Both adversarial tests failed before the production fix and pass afterward.

Native worker lifecycle and physical iPhone update/rollback acceptance remain pending. These tests execute the actual worker source with simulated CacheStorage, response bytes and activation events. They do not grant device or release approval.

Validation: `npm run build`, `npm run security:scan`, and `node scripts/verify-build-artifacts.mjs` pass. Full `npm test`: **1,015 passed**, zero failed, cancelled or skipped, including the 31-record inherited-content regression. Read-only readiness remains 33 apps, 16 blockers and `releaseEligible:false`. No approval or acceptance gate is cleared.
