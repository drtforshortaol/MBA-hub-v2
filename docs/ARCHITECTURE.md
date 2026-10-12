# Architecture and ownership

The shell owns category routing, navigation, offline preparation, search and the version display. Apps own their approved presentation and specialized datasets. Shared libraries own media IDs and approved reusable knowledge; apps only consume them.

`src/apps/APP/manifest.json` is the authoritative registration record. `scripts/build.mjs` generates the central registry, search index, release hash inventory and catalog. Do not hand-edit generated files. Stable IDs outlive titles. Dependencies declare exact interface versions; cycles are rejected.

`src/shared/media/catalog.json` records path, ownership, alt text, credit, permission and offline intent. Local display overrides belong to app/section configuration. Attribution never supplies missing permission. `src/shared/knowledge.json` uses a versioned schema; dated historical Field Notes remain app-owned and separate from living educational references.

`core/content-template.js` provides a published renderer contract across species, field-notes, reference, library and interactive families. Individual tools may preserve their specialized interface and consume the shared navigation/offline contract. Settings merge from global to template to app to individual media usage. Generic interactive behavior is app-owned; the platform does not invent interactions.

The worker validates complete compatible resource sets with SHA-256 before installation succeeds. Existing sessions keep their known release; updates activate after old sessions close. Cached responses belong to the current verified bundle, avoiding unversioned online code that could silently break offline compatibility. New online releases are detected by worker updates. Retain a prior bundle only within the same URL and environment namespace; never clear V1 caches.

Source, runtime cache rollback and hosted deployment rollback are different operations. Snapshot restore verifies local artifacts; redeployment and installed-device recovery must be separately exercised. Partial app rollback must rebuild a complete compatible system with old app content and validated references; it is not implemented as a runtime button.

Publication remains gated by explicit approval and successful device checks. No credentials or privileged GitHub operations appear in client JavaScript. Hidden developer mode supplies diagnostics only. Tester deployment excludes its module and the worker refuses maintenance commands. Local developer tasks are device-specific and not a shared database.

Add an application by declaring its manifest, assets, sections and ownership. Run build and tests. Review it in the developer environment; then use the tester build. Promotion of local facts to the shared library changes references and dependencies explicitly. No silent overwrite of user state is permitted.
