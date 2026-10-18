# D — Quality and Release

Development track initialized October 18, 2026.

Base checkpoint: 966024670dc0e18cccdb091f45665ce9a9493b8f.

## Mission
Test coverage, security checks, reproducible developer previews, release readiness. No merges or deployments.

## Ownership
Primary change area: tests, validation, security and preview build.
Avoid modifying files owned by other tracks. Cross-track shared files require integration review.

## Required gates
- Preserve protected V1, public tester, and independent EVO repositories.
- Keep canonical identifiers, scientific approvals, and modular architecture intact.
- Run automated tests, build validation, security scanning, and offline checks where applicable.
- Use pull requests into security-review-evo-foundation-20261014 for review; never auto-merge.
- No deployment, publishing, or production changes without explicit authorization.

## Execution
This branch isolates work; it does not by itself start an autonomous development agent. Work must be invoked through an available execution session or GitHub workflow.

## Implemented verification checkpoint

- Added `node scripts/verify-build-artifacts.mjs`: checks both local preview bundles for manifest completeness, duplicate/unsafe paths, exact SHA-256 hashes and byte counts, release identity, worker binding, version/environment isolation, private files, symlinks and tester maintenance leakage. This grants no publication or scientific approval.
- Integrated artifact verification after regression tests in development validation CI.
- Disabled the previously active Seahorse Pages publication job and removed its write permissions. Regression guards keep it and the iPhone publication job unconditionally disabled.
- Validation: 413/413 Node tests passed; manifest validation passed for 33 apps and 11 categories; security scan and independent artifact verification passed. Repeated build generated identical developer/tester release identifiers.
- Device, scientific and owner release approvals remain unchanged. No merges, deployments or publishing performed.

## Registry and media coverage checkpoint

- Independent artifact verification now requires valid release/registry schemas, nonempty matching versions, a valid release identifier and critical startup resources.
- Every registry application entry and declared offline resource must be present in the verified release. Referenced offline media must resolve to valid catalog metadata and release resources; malformed/duplicate declarations fail closed.
- Per-app duplicate media registration remains source-preflight responsibility, preserving independently passing track CI until manifest work is integrated.
- Validation: 418/418 Node tests passed, including five additional negative/coverage regressions. Build validation (33 apps, 11 categories), security scan and verification of both built environments passed. Existing 38 release blockers and approvals remain unchanged.

## PWA install acceptance checkpoint

- Found a semantic gap: a validly hashed webmanifest could point startup or scope outside the Hub, or reference icons unavailable offline. Independent artifact verification now requires the generated Hub root ID/scope/start URL and safe, release-covered icons.
- Added valid-hash negative fixtures for external startup URLs, parent scope, missing startup targets, empty/malformed/external/missing icons, plus metadata/service-worker symlinks.
- Metadata, worker and release resource reads now reject symbolic links and nonregular files before reading bytes.
- Validation: 421/421 Node tests passed (14 artifact verifier tests); build validation passed for 33 apps/11 categories, security scan and both environment artifact checks passed. Existing 38 release blockers remain in effect; no deployment, merge or approval changes.
