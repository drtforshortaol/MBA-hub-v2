# MJ photograph permission — October 29, 2026

Glenn explicitly confirmed that MJ authorized the newsletter photographs for his Aquarium guide hub. The preceding question was: “Has MJ authorized you to include these photos in your Aquarium guide hub?” Glenn answered: “Yes. In fact MJ is one of my tester for the hub”. This is a direct owner report of photographer authorization; MJ's participation as a tester provides context rather than substituting for permission.

## Four exact photographs cleared

| Subject | Asset ID |
| --- | --- |
| Ancient murrelets | `asset-1bd100105f88c83a` |
| Rhinoceros auklets | `asset-95daa2493750e82f` |
| Fork-tailed storm-petrel near Wharf 2 | `asset-47f9bbb193878eec` |
| Historical Big Sur gray whale | `asset-df392914e6cf5502` |

The permission record in `verification/mj-photo-permission-20261029.json` binds each approval to its existing path, SHA-256 and source provenance. Catalog entries now say `approved`, carry MJ's credit, reference this decision and explicitly identify guide-hub display/offline use for the hub and its testers. Approval is not extended to a separate visitor application or unrelated public redistribution. No additional transformation permission is inferred. The stored image bytes are unchanged. The three bird captions and historical whale caption now display “Photo: MJ.”; the standalone historical whale figure has the same credit. Naturalist version advances to `2.0.0-alpha.9`; its issue ID and whole-app pending review remain unchanged.

The moon jelly ephyra illustration and five Seahorse illustrations are excluded. Those six assets retain `review-required`, and all operational and scientific/editorial gates remain separate. No pilot result, device approval, PR merge or publication is inferred from the fact that MJ is a tester.

## Evidence continuity and release impact

The prior attribution-only question in `NATURALIST_MJ_PHOTO_ATTRIBUTION_20261029.md` is now answered. Older missing-file and pending-photo statements describe their earlier checkpoints, not this current disposition. Original upload and source receipts remain immutable.

Before refreshing the 31 inherited-content digests, all prior digests reproduced against the preceding catalog. All non-approved asset entries remain structurally identical, and approved entries retain the same identity, source provenance and image bytes. Only their credit, permission metadata and review note changed. The 31 app manifests, resources and authorizations are unchanged. Their digests are refreshed because the existing contract binds the entire catalog; this grants no new content approval. The new Naturalist captions are separately bounded by updated October byte guards and runtime/source checks.

On this uncombined branch, the release count decreases **17 → 13**: four specific media blockers disappear; six media, two content and five operational blockers remain. This is not a fresh combined-branch or physical-device result. On later integration the approved Seahorse text digest must be re-bound after checking that its exact approved app content is unchanged, as documented at the previous photo-intake checkpoint.

## Validation

Forty-two focused tests passed. They check exact user-confirmation scope, unchanged photo hashes, four displayed MJ credits, six pending illustration records, the precise removed media blockers and unchanged release gates. Full build/test and offline results will be recorded after completion. No production, tester site or installed phone build changed.

Completed validation: **1,026/1,026 full-suite tests passed**, with zero failures, cancellations or skips. Build, security scan, all-app content preflight, artifact verification and diff check passed. Prepared offline navigation passed in both environments (384 developer / 375 tester resources, zero offline network attempts). No service-worker code changed; this check covers delivery of the revised catalog and captions, not a fresh physical-device result. Exact blocker and validation results are in `verification/mj-photo-clearance-20261029.json`.

An initial full run encountered the existing three-second VM timeout. The next run reached an older assertion that all five Naturalist images were pending; it was corrected to require exactly four approved photographs and the pending jelly illustration. The final full run passed with the existing timeout and all coverage intact.
