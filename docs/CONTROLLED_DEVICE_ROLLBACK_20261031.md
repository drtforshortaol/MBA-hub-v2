# Controlled private-review rollback — prepared October 31, 2026

Preparation is complete; hosted/device rollback is NOT TESTED. No live version, access policy or operational flag was changed. Personal device observations remain in the existing private record.

## Named complete candidates

| Role | Runtime source | Tester release | Resources | Retained host version |
| --- | --- | --- | ---: | ---: |
| Prior, before Countershading addition | 8749772f5eaacac048396d82114ca0780fb82b71 | a227bc8b37742288 | 379 | 8 |
| Current, matching Countershading control | b741d437195978649d39d8a7c122ba4b0a67265e | 76a8581e2e1b4eed | 379 | 10 |

Exact saved version IDs and archive metadata are in verification/rollback-pair-preparation-20261031.json, confirmed against native Sites history. Rebuilt local artifacts independently match both release IDs and pass complete artifact validation. Only Open Sea HTML/manifest, public-review.json, registry.json and search-index.json differ among release-inventory resources; none were added/removed. Release manifests and generated worker identities also differ as expected. All media resource hashes are identical.

Existing scripts/snapshot.py restored prior then current into an isolated worktree, with full artifact validation after each restore. A ZIP with a tampered icon was rejected before replacing the current bundle; its integrity still passed afterward. These are local engineering checks, not native browser activation or a physical-device rollback PASS. Local ZIP hashes identify this preparation only; ZIP timestamps can differ on reproduction. Pinned source, release identities and per-resource hashes are the durable reproducibility checks.

## Controlled device sequence

Use the existing owner-only project appgprj_6ae55daba7b08191a19ce7036c6a4152 and the same /labeled-20261031/tester/ scope throughout. No new Site, public host, installation QR, website-data clearing or reinstall is needed.

1. Establish a coordinated device session before changing the host: the owner opens the installed review Hub while online and reports its displayed release. Record actual device/iOS/mode/network and session association privately where available. Expect current 76a8581e2e1b4eed; reconcile a different release before continuing. Confirm the complete offline-ready state. Keep an already-open old-session tab for lifecycle observations.
2. Deploy the exact saved prior version through the existing owner-private Sites operation. Verify live delivery headers and all 379 resource hashes against a227bc8b37742288 before requesting a refresh. Do not rebuild or mix individual files into the hosted version.
3. Owner opens the existing refresh.html link online. Confirm the displayed prior release and Ready offline. Close/reopen installed Hub with Wi-Fi and cellular off; inspect Open Sea, an image-bearing app, Back and Return to Hub. The separate Countershading addition is expected to be absent. Record exact outcomes, old-session behavior and any retained synthetic test data; no personal notes need to be created or altered.
4. Reconnect. Restore exact saved current version 10 and verify live delivery/hashes for 76a8581e2e1b4eed. Repeat refresh, readiness, offline cold reopening and the same bounded app/media/navigation checks. Countershading and its matching control should return.
5. Leave the host at current version 10. Keep failures and retests separate; do not mark success based on deployment alone. Record actual complete version transitions before assessing rollbackDevicePassed. Broader device acceptance, pilot, content wording review and owner production authorization remain separate.

If delivery or device activation fails, stop the device sequence, retain the failure, restore the saved current host version and verify it. Keep the existing offline data; do not clear storage or force an uninstall. A restore of local source alone cannot satisfy this checklist.

## Reproduction

Create detached worktrees at the two runtime source commits above. In each, run npm run build, validate dist/tester with scripts/verify-build-artifacts.mjs, then run python3 scripts/snapshot.py save tester. Restore the prior snapshot into the isolated current worktree using snapshot.py restore tester --archive with its absolute ZIP path; verify all artifact bytes. Restore and reverify the current snapshot. Never run this exercise in the live hosting checkout or deploy as part of local preparation.

Earlier CURRENT_DEVICE_ACCEPTANCE_20261031.md remains a historical fixed-candidate plan. This document fills its missing candidate-pair/controlled-rollback preparation; it grants no physical result or release approval.
