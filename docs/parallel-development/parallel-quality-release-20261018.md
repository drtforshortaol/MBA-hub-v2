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
