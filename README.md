# MBA Hub Version 2

## Current status — alpha.6 private migration review

All 25 registered V1 applications and seven linked supporting applications are imported, with 203 canonical media assets and a versioned EVO knowledge export. All 21 automated checks pass. See [Migration review](docs/MIGRATION_REVIEW.md) and [Application catalog](docs/GENERATED_CATALOG.md).

The public tester remains the verified two-app alpha.4 foundation. Full collection device checks, privacy review, image permissions, owner approval and the pilot remain pending. Library borrower information, internal contacts and operational notes require review before public distribution. Publication gates remain closed. V1 and independent upstream repositories are unchanged.

Run `npm run build`, `npm test` and `npm run serve` with Node 20+ and Python 3. The optional migration tooling has its own pinned dependency. Existing source builds without installing it.

The remainder of this README records the earlier foundation stage; its statements about migration not having begun and empty knowledge are historical, superseded by the alpha.6 review above.

**Summary**

This is the runnable V2 foundation specified by the two owner-provided planning documents. Version 1 remains operational and unchanged. This build is not the completed migrated volunteer release.

## What is implemented

- Mobile Hub with all eleven existing categories, alphabetically sorted and initially collapsed, and a compact Animals A–Z filter.
- Dedicated global search with offline index, alias matching and section deep links. Search is absent from the proof apps.
- Two preserved approved V1 interfaces: Six Interpretation Principles and Using the Five Senses. Shared Back and Return to Hub behavior; deep links open the corresponding section.
- Manifest-generated registries, explicit ownership and versioned dependencies; media attribution/permission catalog and shared knowledge contract.
- Flexible content renderer and settings inheritance for the five template families. Specialized applications retain their own renderers.
- Environment-specific PWA scope, cache names and local-state namespace. Hash-verified complete releases, incremental reuse of unchanged assets, prior bundle retention, offline completeness checks and developer repair.
- Five-tap developer mode with update, diagnostics, versions, dependencies and a local task list. Tester build excludes the developer module and refuses repair messages.
- Build validation, publication gates, generated registry documentation and verified local snapshot restore.

## Run

Requires Node 20 or newer and Python 3; there are no npm dependencies.

```bash
npm run build
npm test
npm run serve
```

Open http://localhost:8080. For the tester bundle, serve `dist/tester` instead. Browser service workers work on localhost or HTTPS. Opening index.html directly is not a valid offline test.

## Host separately

The owner created the separate private source repository at https://github.com/drtforshortaol/MBA-hub-v2. Foundation source is maintained there; V1 remains untouched. The reviewed read-only tester bundle is hosted separately at https://drtforshortaol.github.io/MBA-hub-v2-test/ from the public tester repository. Developer code and source documentation remain private.

Use separate deployment roots for `dist/developer` and `dist/tester`; maintain the trailing slash and serve all bundle files. Developer controls are conveniences, not authentication. A public deployment is publicly retrievable. Publish only the tester build to reviewers, and exclude private volunteer content. Review shared media permission before any public deployment.

## Release gates

`node scripts/build.mjs --published` is intentionally blocked. Full migration, approved manifests, owner approval, content/privacy review, device offline and rollback checks, and the three-reviewer pilot must be completed. Do not flip flags simply to bypass these checks. See `docs/DEVICE_CHECKLIST.md`.

## Rollback

```bash
python3 scripts/snapshot.py save tester
python3 scripts/snapshot.py restore tester --archive releases/tester-RELEASE.zip
```

Restore verifies every resource digest before replacing the local bundle. Redeploy the matching whole artifact and its worker together. Normal activation waits for old controlled sessions to close. The V2-only refresh route can activate a complete hash-verified bundle explicitly, without deleting V1 data. A controlled alpha.5-to-alpha.4 device rollback is in progress; see `docs/FOUNDATION_DEVICE_REVIEW.md`. Keep V1 as the fallback.

## Important limits

The foundation includes two proof apps, not all 25 V1 apps. Broader media permission review is pending and the knowledge library is intentionally empty rather than filled with invented facts. External EVO and Library integrations are inventoried, not certified offline. Owner-reported iPhone checks cover the two proof apps, image, navigation and search online/offline, plus the verified refresh and alpha.5 update. Automated browser visual QA, interrupted downloads, standalone installation certification and the full collection pilot remain pending. Safari can evict offline storage.

The original archive branches were verified to resolve to the documented V1 baseline. Read-only source inspection HEAD was `5c219508d23255080f6b050cefa8092905447d81`; inventory uses the archived baseline `0903457bcccdb84b99c156ad48979df2bddf5dc9`. The owner-provided final architecture governs full release; the handoff's small-proof-first rule governs internal construction. No mass migration has begun.

**End of summary**
