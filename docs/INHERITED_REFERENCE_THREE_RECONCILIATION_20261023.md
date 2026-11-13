# Three inherited reference applications reconciled — October 23, 2026

Baseline integration: `390d1507502a5915431e84cdc58d820b7917933f`. Integration and all four draft-track heads matched the owner handoff; PRs #2–#5 were independently confirmed open, draft and unmerged. Read-only MBA-hub source pin: `5c219508d23255080f6b050cefa8092905447d81`.

Five Senses, Kelp Forest and Northern Elephant Seal now have evidence-supported inherited-content records in config/inherited-v1-fidelity.json. Existing V1 authorization carries forward under GUIDE_CONTENT_RESTORED.md. The records bind current complete app/manifest, offline dependency, shared knowledge and media bytes. Source scientific/publication/status flags remain unchanged. This grants no new scientific, image, privacy, physical-device or release approval.

Complete app-specific scope reviews are REVIEW_FIVE_SENSES_20261023.md, REVIEW_KELP_20261023.md and REVIEW_ELEPHANT_SEAL_20261023.md. Complete executable and static markup differences, styles, links, actual versus unused interactions, search and media were reviewed. No new authored-content defect was established. Existing sanitizer/central-offline migrations, media relocation, permanent section anchors, Kelp Story repair and inherited search restoration were preserved. Five Senses' formerly absent app-local icon uses exact pinned root-icon bytes; this is an explicit migration repair.

The new portable review-dynamic-reference-fidelity.py and render-dynamic-reference-apps.mjs reproduce the complete pinned/current scope. Fresh evidence: docs/verification/dynamic-reference-full-20261023.json. It binds all 16 current app-local files including complete app.js/data.js/manifests, inventories every pinned app file, checks exact external stylesheets and normalized full static documents, and compares complete datasets after only byte-verified media-path normalization. All 18 expected rendered containers match, including Kelp title/summary/meta/version/jump output, four Five Senses cards/three guide cards/seven references, ten Kelp dropdowns and seventeen Seal panels with eleven images. Sixteen distinct shared media files match exact pinned bytes. Exact container sets, nonempty output and eight structural cardinalities prevent empty or incomplete comparisons.

Reproduce with Python lxml and Node:

```sh
python3 scripts/migration/review-dynamic-reference-fidelity.py --sources-dir PATH
python3 scripts/migration/test-dynamic-reference-fidelity.py --sources-dir PATH
```

PATH contains the pinned fidelity-MBA-hub Git repository. Full hashes fail closed on changed reviewed app files or manifests, unexpected files and symlinks. The literal VM DOM model compares generated markup and data; its DOMParser transport does not establish real browser sanitizer behavior. Event handling, browser layout, assistive technology and physical installation/offline/update/rollback acceptance remain separate. Independent app review and focused security/navigation tests supplement this bounded model.

Twenty-seven inherited records are supported. Twenty release blockers remain: five inherited reconciliations (evolution-timeline, naturalist-field-notes, open-sea, tree-of-life-origins, whale-parasites-associates), Seahorse review, nine October image permissions and five operational gates. New October Field Notes content remains separate. OPEN_SEA_SCOPE_GAPS_20261023.md records the next concrete reproduction gap: all twelve inline cards need a real body-tree comparison; the existing flattened-body test alone cannot support reconciliation.

The reconciliation metadata changes the tester runtime release. The prior 1480417 artifact remains historical for the new runtime. A newly matched successful combined CI ZIP must be independently verified and a fresh all-NOT-TESTED physical record prepared. No deployment, hosted-preview update, merge, visibility change, publication, release or upstream/protected-repository write is authorized or performed.

Combined verification and exact replacement-artifact identity are recorded separately after execution; do not infer them from this scope review.

Fresh combined local verification: Node839/839, EVO35/35, application preflight33/33; build/schema/security/artifact/whitespace PASS. Portable three-app baseline/adversarial9/9, earlier static baseline/adversarial12/12, fidelity-audit3/3 and acceptance-record3/3 PASS. Developer HTTP383/383 and tester374/374; fourteen offline/recovery scenarios each550/550 targets with complete resources and zero offline network attempts. Developer release e02837b6f3bb023c; tester05a27576a3757157. Local summary: docs/verification/reference-three-local-verification-20261023.json. These results do not establish physical acceptance.
