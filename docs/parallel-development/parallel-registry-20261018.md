# B — Application Integration

Development track initialized October 18, 2026.

Base checkpoint: 966024670dc0e18cccdb091f45665ce9a9493b8f.

## Mission
Registry integrity, canonical app IDs, navigation, and Hub integration. Preserve all existing apps and approved content.

## Ownership
Primary change area: registry and application navigation.
Avoid modifying files owned by other tracks. Cross-track shared files require integration review.

## Required gates
- Preserve protected V1, public tester, and independent EVO repositories.
- Keep canonical identifiers, scientific approvals, and modular architecture intact.
- Run automated tests, build validation, security scanning, and offline checks where applicable.
- Use pull requests into security-review-evo-foundation-20261014 for review; never auto-merge.
- No deployment, publishing, or production changes without explicit authorization.

## Execution
This branch isolates work; it does not by itself start an autonomous development agent. Work must be invoked through an available execution session or GitHub workflow.

## Implementation checkpoint — October 18, 2026

Fixed cross-application contextual Back. The shared app contract previously called the Hub-only capture function from app pages; that call deliberately rejected the source, so no return snapshot was saved. A separate app capture interface now saves the originating page, query, fragment, scroll, expanded panels and inputs. Chained Hub → app → app visits retain both return levels.

App contexts require an explicit type and app-view marker, same-origin application paths inside the current hosting scope, a valid visit token and matching environment namespace. Hub-only capture restrictions remain intact. Unavailable session storage falls back safely to the main Hub.

Validation: 412 automated tests passed (including eight new cross-app integration regressions); 33-app/11-category build and validation passed; credential/unsafe-DOM security scan passed. Offline resource hash and worker regression tests passed within the full suite. Physical-device review remains separate. No scientific content, canonical app identifiers, approvals, release gates or deployment settings changed.

### Preflight interface consistency

Content preflight now loads and forwards the same shared interface declarations as the build validator. Declared `evo-knowledge` dependencies no longer produce false invalid-dependency errors. Unknown dependencies and incompatible interface versions still fail validation.

The strict per-app offline-media registration rule remains unchanged. `content:check:all` still exits with failure: 226 offline-media declaration findings across 28 of 33 applications. These findings concern media paths absent from app manifests' explicit `offline_assets` lists; the build currently includes the shared files in the verified release bundle. They require a separate registration-contract reconciliation and are not recorded as passed. No content or scientific approvals were changed.

Verification after interface fix: 416 automated tests passed; 33-app/11-category validation and security scan passed. Nine targeted preflight tests include custom interface acceptance, unknown dependency rejection, incompatible version rejection and actual repository interface loading.

### Offline-media registration reconciliation

Resolved the previously recorded 226 strict preflight findings by appending existing, safe, catalog-listed `offline: true` media paths to 28 owning application manifests. Existing offline asset order was preserved; additions follow each manifest's existing media-reference order. Independent semantic diff audits confirmed that no other manifest fields changed, including permanent IDs, versions, scientific content, permission evidence, approval fields and presentation metadata.

`node scripts/plan-offline-media-registration.mjs` produces a read-only reconciliation plan. It never edits files, rejects missing or unsafe offline media, ignores online-only assets and deduplicates paths. After reconciliation it reports zero pending additions. Strict content preflight rules remain unchanged and `npm run content:check:all` now passes for all 33 applications.

The media files were already in the complete release bundle. A before/after build audit confirmed identical resource URL sets and unchanged media bytes. Only 28 manifest resources plus the generated registry changed bytes, producing a new verified release hash (`09053c9041f59a90` → `adea415dc4bca22a` for this isolated developer build). Application versions remain unchanged because this is a declaration correction with no content or interface implementation change; the service worker's release hash identifies the revised bundle. These local build hashes are not deployment or publication evidence.

Tests cover planner immutability, deterministic append order, deduplication, per-app ownership, idempotence, unsafe/missing/unknown media rejection, CLI read-only behavior and strict repository-wide preflight. Build, 33-app/11-category validation and security scanning passed. Generated build reports are excluded from this change.

Full isolated branch regression after reconciliation: 421 tests passed, zero failures. No merge, publication, deployment or protected-repository changes performed.
