# MBA Hub Version 2

## Current status — alpha.7, completion and acceptance review

Latest October 23 batch: [Five Senses, Kelp Forest and Northern Elephant Seal reconciled](docs/INHERITED_REFERENCE_THREE_RECONCILIATION_20261023.md) with complete byte binding and portable 18-container reproduction. Twenty-seven inherited records are supported; 20 blockers remain. Source review flags, nine image-permission reviews and five operational gates remain unchanged. A new matching CI artifact is required for this changed tester runtime; physical acceptance remains NOT TESTED. Earlier entries below are historical.

Current October 23 batch: [six more inherited apps reconciled](docs/INHERITED_SIX_RECONCILIATION_20261023.md) using fresh pinned/current full-scope evidence. Twenty-four inherited records are supported; 23 blockers remain (eight inherited reviews, Seahorse, nine image permissions, five operational gates). Source approval flags remain unchanged. The [matching successful CI artifact is independently verified](docs/ACCEPTANCE_SIX_RECONCILED_20261023.md); physical acceptance remains NOT TESTED. Older status entries below are historical.

Latest follow-up: [Water Science search](docs/WATER_SCIENCE_SEARCH_20261022.md) now includes all 13 original cards; [Five Senses and Elephant Seal search](docs/DYNAMIC_REFERENCE_SEARCH_20261022.md) includes the omitted reference notes and Diet explanation. These changes require a newly matched acceptance artifact. Earlier candidate IDs remain historical.

Latest: [fifteen inherited migrations reconciled](docs/INHERITED_FIFTEEN_RECONCILIATION_20261022.md), with 142 sections and 68 image uses verified, and [all twelve Open Sea dynamic cards indexed](docs/OPEN_SEA_SEARCH_20261022.md). Current release blockers: 29 (14 inherited reviews, Seahorse, nine image permissions, five operational gates). Earlier 44-blocker counts below are historical. A new matching CI artifact is required; physical acceptance remains NOT TESTED. [Trusted HTTPS acceptance proposal](docs/HTTPS_ACCEPTANCE_PROPOSAL_20261022.md) is prepared only; no hosting is authorized.

Latest runtime: [17 Library Wishlist search routes and Back state restored](docs/LIBRARY_WISHLIST_SEARCH_20261022.md). Combined verification passes 829 Node tests; the [matching acceptance artifact](docs/ACCEPTANCE_SEARCH_RESTORED_20261022.md) is independently verified. Physical acceptance remains NOT TESTED.

Latest runtime: [all 18 Information Center sections restored to global search](docs/INFORMATION_CENTER_SEARCH_20261022.md), verified with 825 passing Node tests. The earlier recovered artifact below is historical after this change; a new matching CI artifact is required for physical acceptance.

Latest: [recovered rendering, URL-guard and search-target fixes](docs/RECOVERED_COMPLETION_BATCH_20261022.md). The [exact recovered acceptance artifact](docs/ACCEPTANCE_RECOVERED_20261022.md) is independently verified; physical review remains NOT TESTED. The previous artifact below is historical; unpushed reconciliation and indexing work lost during workspace maintenance is explicitly pending reconstruction.

Follow-up: [three static V1 migrations reconciled](docs/INHERITED_STATIC_RECONCILIATION_20261022.md) using complete source/code/media and search-text evidence. No new scientific, image or device approval is granted; the exact replacement artifact is identified in the current candidate record.

Latest: [verified reconciled acceptance candidate](docs/ACCEPTANCE_RECONCILED_20261022.md) and [completion batch](docs/COMPLETION_BATCH_20261022.md). Current catalog registration is complete for supported local references, with nine explicit pending image-rights reviews; use the newly identified combined candidate for future acceptance.

[Current completion instructions](docs/COMPLETION_INSTRUCTIONS_20261021.md) supersede stale work priorities. The declared-media planner is clean, but [independent referenced-media coverage](docs/LOCAL_MEDIA_COVERAGE_20261021.md) identified nine catalog gaps; pending registration records preserve their unresolved permission reviews. Evidence-bound inherited metadata now distinguishes unchanged V1 authority from unresolved current-app fidelity. A new combined candidate is required for the changed tester metadata.

New finding: the Information Center phone renderer required a runtime fix. See [completion progress and replacement candidate](docs/COMPLETION_PROGRESS_20261021.md). The older fixed artifact below remains historical; it is not the final acceptance candidate after this fix.

The current integration contains 33 applications (26 listed, seven supporting/unlisted), 11 categories and 212 catalog media assets. All 25 V1 inventory apps are present. The recorded core Naturalist, navigation/search, offline/recovery and evidence/security workstreams are implemented; full-release acceptance remains incomplete.

Start with the [completion audit](docs/COMPLETION_AUDIT_20261021.md) and [fixed-build acceptance checklist](docs/FIXED_BUILD_ACCEPTANCE_20261021.md). The fixed Batch 13 candidate is source `96a9303ef54f0d0fc6cccb8ef0da2fed9f8609de`, with [successful hosted CI and downloadable artifact](https://github.com/drtforshortaol/MBA-hub-v2/actions/runs/39717669206). Its combined Node 788/788, EVO 35/35 and application preflight 33/33 passed. These are dated evidence, not a promise about later checkouts; inspect the matching build's verification results.

The 44 current release blockers comprise 29 inherited-approval reconciliation records, one new seahorse app review, nine pending image-permission records and five operational gates. New October content within migrated apps remains separately scoped for review. [Existing V1 approval](docs/GUIDE_CONTENT_RESTORED.md) carries forward for unchanged migrated content; do not ask for identical content/photos/guide details to be approved again. Verify content fidelity and review new or materially altered content separately. The read-only readiness report distinguishes these tasks without granting approvals.

Current-build physical iPhone acceptance, full-collection interactions/media, update/rollback, reviewer pilot and final operational records remain outstanding. Android/Windows installation, growth/performance capacity and placement of six empty categories/seven supporting apps remain unverified or unresolved. No percentage or release date is certified.

## Run and verify

Node 20+ and Python 3 are required; the source build has no npm dependencies. Optional migration tooling has separate pinned dependencies.

```bash
npm run build
npm test
npm run validate
npm run content:check:all
node scripts/plan-offline-media-registration.mjs
npm run security:scan
node scripts/verify-build-artifacts.mjs
node scripts/assess-release-readiness.mjs
npm run serve
```

Serve opens the developer bundle on localhost:8080. Serve `dist/tester` separately to review the tester bundle. Use localhost or trusted HTTPS for service workers; opening HTML directly or using a phone's plain LAN HTTP address does not establish offline acceptance. See the fixed checklist for provenance and full HTTP/offline evidence verification.

## Architecture and content ownership

Manifest-generated registries own permanent app/section identifiers, declared dependencies and search targets. Shared media/knowledge retain central ownership. Applications retain their specialized interfaces and approved content. [Architecture](docs/ARCHITECTURE.md) and [content update procedure](docs/CONTENT_UPDATE_WORKFLOW.md) describe the contracts.

The platform provides contextual Back/Return to Hub, global offline search/deep links and A–Z filtering; hash-verified complete offline bundles, prior-release reuse, explicit refresh/recovery and rollback tooling; developer-only Naturalist intake/classification/manual review, proposal recovery and export; and independent artifact, HTTP, offline and security verification. Tester bundles exclude developer controls. Developer visibility is not authentication.

## Authorization and release boundaries

Work only in the authorized V2 development repository/branches. Preserve V1 `drtforshortaol/MBA-hub`, public tester `drtforshortaol/MBA-hub-v2-test` and independent EVO/upstream repositories. Existing hosted tester/preview content does not automatically match the integration build. Do not merge, update a hosted preview, publish, deploy or release without explicit authorization.

The development repository is public; do not rely on old documents calling it private as an access-control claim. Keep credentials and new private material out of source and artifacts. Existing guide distribution is owner-authorized as recorded in GUIDE_CONTENT_RESTORED.md; final release review remains separate.

`node scripts/build.mjs --published` remains gated. Never flip flags just to make it succeed. Retain the prior whole compatible bundle for controlled update/rollback. `scripts/snapshot.py` verifies local save/restore; local restoration is not deployed-device rollback acceptance.

## Historical records

[MIGRATION_REVIEW](docs/MIGRATION_REVIEW.md), [PUBLICATION_PRIVACY_REVIEW](docs/PUBLICATION_PRIVACY_REVIEW.md), [foundation device evidence](docs/FOUNDATION_DEVICE_REVIEW.md) and the October 13 technical audit document earlier stages. Their old app counts, privacy-filter recommendations and device scope must be read with their dates and the explicit supersession in GUIDE_CONTENT_RESTORED.md. The original two owner planning documents referenced by the previous README are not present in this checkout; the completion audit is bounded to requirements recorded in the repository.
