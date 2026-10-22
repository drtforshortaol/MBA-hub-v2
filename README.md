# MBA Hub Version 2

## Current status — alpha.7, completion and acceptance review

The current integration contains 33 applications (26 listed, seven supporting/unlisted), 11 categories and 203 catalog media assets. All 25 V1 inventory apps are present. The recorded core Naturalist, navigation/search, offline/recovery and evidence/security workstreams are implemented; full-release acceptance remains incomplete.

Start with the [completion audit](docs/COMPLETION_AUDIT_20261021.md) and [fixed-build acceptance checklist](docs/FIXED_BUILD_ACCEPTANCE_20261021.md). The fixed Batch 13 candidate is source `96a9303ef54f0d0fc6cccb8ef0da2fed9f8609de`, with [successful hosted CI and downloadable artifact](https://github.com/drtforshortaol/MBA-hub-v2/actions/runs/39717669206). Its combined Node 788/788, EVO 35/35 and application preflight 33/33 passed. These are dated evidence, not a promise about later checkouts; inspect the matching build's verification results.

The 38 current release blockers comprise 32 inherited-approval reconciliation records, one new seahorse content review and five operational gates. [Existing V1 approval](docs/GUIDE_CONTENT_RESTORED.md) carries forward for unchanged migrated content; do not ask for identical content/photos/guide details to be approved again. Verify content fidelity and review new or materially altered content separately. The read-only readiness report distinguishes these tasks without granting approvals.

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
