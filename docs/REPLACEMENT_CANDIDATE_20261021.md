# Verified replacement candidate — October 21, 2026

This record identifies the phone-fix candidate for future acceptance. It supersedes the old artifact identity in FIXED_BUILD_ACCEPTANCE_20261021.md, the hosting proposal and the pilot template. Reuse their procedures, not their old candidate values. No hosting, device acceptance or release approval is recorded here.

| Identity | Verified value |
| --- | --- |
| Source | `0938a504822055160ca0179a55bbfa0edacefb16` |
| Source tree | `a6fb2b0337bc525dbf9c15f7d74c74b5dd6d4532` |
| Hosted CI | [Successful run 39723762326](https://github.com/drtforshortaol/MBA-hub-v2/actions/runs/39723762326) |
| Artifact | `12402068973`, `mba-v2-combined-iphone-review`, 128,042,932 bytes |
| ZIP SHA-256 | `bc21880af9ce34220791efe14d79f99dc02ea8781a17198926de35b25d38f571` |
| Developer release | `9b8e36c2e6d07f08`, 383 resources |
| Tester release | `e8bc7f50c707bd7c`, 374 resources |

The connector-uploaded source tree exactly matched the tested local Git tree. The downloaded artifact ZIP independently matched the Actions digest; SOURCE-COMMIT.txt matched the exact source above. Both extracted environments passed verifyBuildArtifacts, and verify-review-evidence passed for the extracted reports/releases/source marker. Local Node 791/791, EVO 35/35, fidelity regressions 2/2 and app preflight 33/33 passed. Hosted build, HTTP, offline, evidence-binding and upload steps completed successfully. All 14 retained offline simulations cover 507/507 targets and zero offline network attempts; this remains simulated evidence.

The Information Center phone text/link fix is the only app-runtime change in this batch. Runtime content/scientific flags remain pending. The existing candidate has no newly provisioned trusted-HTTPS review location; do not describe any old preview/tester URL as serving it.

## Final fidelity clarification

The machine report's conservative 10/11 normalized external dataset result was followed by a read-only Kelp Forest diff review. Its entire data.js becomes byte-identical to the pinned source after reversing just `images/kelp-forest-hero.jpg` → `../../shared/media/asset-3805cae5eba70cef--kelp-forest-hero.jpg`. The pinned and migrated hero files have identical SHA-256 `3805cae5eba70cef0fb30a048f013b96849608d48c95cf7968b1bb31c80a3d90`.

The automated mismatch resulted from normalizing the original image URL in a source comment while the migrated comment retained its original text. Thus all eleven audited external datasets now have byte-fidelity evidence after verified image-path rewrites. This does not resolve inline scripts, generated section descriptions, new Naturalist October content, physical rendering or the whole-app approval reconciliation records. The original machine report remains intact rather than rewriting an automated result into a manual PASS.

Next work remains the scoped content reconciliation/reviews, seahorse claim/image decisions, explicitly authorized trusted-HTTPS acceptance setup, physical full-collection/lifecycle tests, owner plus three-reviewer pilot and five operational closures. Android/Windows, capacity/performance and category/supporting-app questions remain explicit. No approval flag, protected repository or deployed preview changed.
