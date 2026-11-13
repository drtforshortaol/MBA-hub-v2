# Architecture and ownership

The shell owns category routing, navigation, offline preparation, search and the version display. Apps own their approved presentation and specialized datasets. Shared libraries own media IDs and approved reusable knowledge; apps only consume them.

`src/apps/APP/manifest.json` is the authoritative registration record. `scripts/build.mjs` generates the central registry, search index, release hash inventory and catalog. Do not hand-edit generated files. Stable IDs outlive titles. Dependencies declare exact interface versions; cycles are rejected.

`src/shared/media/catalog.json` records path, ownership, alt text, credit, permission and offline intent. Local display overrides belong to app/section configuration. Attribution never supplies missing permission. `src/shared/knowledge.json` uses a versioned schema; dated historical Field Notes remain app-owned and separate from living educational references.

`core/content-template.js` provides a published renderer contract across species, field-notes, reference, library and interactive families. Individual tools may preserve their specialized interface and consume the shared navigation/offline contract. Settings merge from global to template to app to individual media usage. Generic interactive behavior is app-owned; the platform does not invent interactions.

The worker validates complete compatible resource sets with SHA-256 before installation succeeds. Existing sessions keep their known release; updates activate after old sessions close. Cached responses belong to the current verified bundle, avoiding unversioned online code that could silently break offline compatibility. New online releases are detected by worker updates. Retain a prior bundle only within the same URL and environment namespace; never clear V1 caches.

Concurrent authorized preparation requests within one worker share only their in-flight preparation. Success or failure releases that operation; later requests recheck the live release rather than reusing a settled result. Each caller still receives independently verified readiness. Client authorization precedes joining shared work.

Source, runtime cache rollback and hosted deployment rollback are different operations. Snapshot restore verifies local artifacts; redeployment and installed-device recovery must be separately exercised. Partial app rollback must rebuild a complete compatible system with old app content and validated references; it is not implemented as a runtime button.

Publication remains gated by explicit approval and successful device checks. No credentials or privileged GitHub operations appear in client JavaScript. Hidden developer mode supplies diagnostics only. Tester deployment excludes its module and the worker refuses general REPAIR commands. Explicit same-scope refresh may reconstruct only the current authenticated release through RECOVER_OFFLINE, without deleting caches or forcing activation. Missing/incomplete inventory or the narrowly typed cached-inventory validation error can request this reconstruction; arbitrary runtime errors stop safely. Local developer tasks are device-specific and not a shared database.

Add an application by declaring its manifest, assets, sections and ownership. Run build and tests. Review it in the developer environment; then use the tester build. Promotion of local facts to the shared library changes references and dependencies explicitly. No silent overwrite of user state is permitted.

Run `node scripts/assess-release-readiness.mjs` for a read-only assessment of the existing release gates, their source files and required actions. Optional `--evidence-dir PATH --expected-commit SHA` checks generated HTTP/offline evidence independently of approvals; stale or malformed supplied evidence fails the command. Historical QA records are dated and do not establish current-build acceptance. This command never writes gate flags or grants publication authority.

Readiness triage distinguishes inherited-approval reconciliation from new content review using unique matching migration provenance. Matching repository/commit records do not prove unchanged content or resolve a blocker. Existing V1 authorization is recorded in `GUIDE_CONTENT_RESTORED.md`; source pending labels and generated tester inheritance must be reconciled with fidelity evidence before final promotion.
