# Sperm Whale approval-binding gap — 2026-11-01

Owner explicitly approved the seven verbatim scientific sections; see docs/verification/sperm-whale-text-approval-20261101.json. This is an authentic wording decision, not operational release authorization.

## Verification discovery
The current config/owner-text-reviews.json entry for sperm-whale is missing the mandatory `content_sha256` required by `ownerTextApprovalSupported()` in scripts/public-review.mjs. Therefore, despite the manifest's `owner-approved-text` label, the release guard necessarily treats this app as `content review pending: sperm-whale`. No report should assert the final content blocker is clear until the complete `inheritedContentDigest` of the current resource bundle is calculated and persisted, then successfully validated.

## Correction to perform in a complete checkout
1. Verify the seven exact HTML section strings against the current approved evidence; preserve all content and media bytes.
2. Compute `inheritedContentDigest(app,{sourceRoot:'src'})` using scripts/public-review.mjs, after loading the current sperm-whale manifest and full source/media tree.
3. Add the resulting 64-hex `content_sha256` to sperm-whale's owner review row, preserve the owner's approval quote and commit, and run the approval guard.
4. Recompute the privacy review snapshot due to changed config. Rebuild both artifacts; run the whole regression suite, security/privacy tests, 381-resource exact-host verification and eight verifier scenarios.
5. Keep all four operational gate booleans false until separately accepted. Do not publish, deploy, merge PR #18, or invite external testers via the owner-only Site.

This note documents an outstanding corrective action, not a test pass or pilot authorization.
