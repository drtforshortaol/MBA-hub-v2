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

## Search artifact acceptance checkpoint

- Recovered a clean tracked checkout without copied untracked files. Its tree `88406aa6f1f508a038cb336fa28daa2c286b4d16` exactly matches remote Track D head `a3cdc472e691cc362d878c904c33b213d1ca3634` despite the earlier local commit having a different SHA.
- Closed an independent verification gap: a self-consistent hashed bundle could omit its search index or carry search results pointing outside the registered app. Search metadata is now a required offline startup resource. Each result needs title/text and a registered, release-covered local app entry point; every registered app must remain searchable. Section fragments and query navigation remain supported.
- Added valid-hash negative fixtures for missing/malformed/empty indexes, missing apps, unknown apps, external/traversal/missing targets and invalid result text, plus positive section/query navigation fixtures.
- Validation: **424/424 Node tests PASS**, including **16/16 artifact verifier tests**; **35/35 Python EVO tests PASS**. Build, validation of 33 apps/11 categories, security scan and independent verification of both environments PASS.
- Strict source content preflight on this isolated Track D baseline **FAILS** because the independent registry/media/interface corrections live on Track B and the combined integration branch. No missing source was inferred from that expected branch difference. Integration must run strict preflight after combining branches; adding that gate to isolated Track D CI before integration would create an unrelated failure.
- Existing 38 release blockers and all physical/scientific/editorial/release approvals remain unchanged. No deployment or merge performed.
