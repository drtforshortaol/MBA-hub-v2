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

### Section navigation and contextual Back

Fixed a shared app integration defect: every body mutation previously replayed the current section fragment, scrolling the visitor back to that section and reopening panels after they had been collapsed. A dedicated section navigator now resolves each fragment once, retries while a dynamically rendered target is absent, and responds to later fragment changes. It opens every enclosing details panel for nested targets and retains existing section-ID and sense-data deep-link support.

When contextual Back restores a captured app view, the initial fragment is not replayed over the restored scroll/panel state. Malformed percent-encoded fragments are ignored safely, allowing the remainder of the app contract to initialize. The navigator marks a target resolved before triggering panel rendering, preventing reentrant mutation callbacks from scrolling twice.

Nine regression tests cover nested panels, repeated mutations, delayed targets, subsequent fragment navigation, contextual restoration, malformed fragments, encoded/sense-data targets, reentrant rendering and contract wiring. Strict content preflight continues to pass all 33 applications. No manifests, scientific content, permanent IDs, approvals or deployment settings changed in this step.

Verification: 430/430 isolated-branch automated tests passed, including offline worker regressions; build, 33-app/11-category validation and security scanning passed. Generated build reports are excluded. Physical-device interaction review remains separate; no deployment was performed.

### Search navigation race

Fixed an asynchronous Hub search defect: when the visitor leaves Search while its index request is pending, the old request previously resumed against the new page, attempted to access the removed query input and could replace the current Hub/help view with an error. Each route render now has a generation. Delayed search completions, failures and scroll restoration update only their active generation. Current HTTP search-index failures show a clear error and allow a subsequent retry. Initial rendering uses the same guarded error path as later navigation.

Seven behavior regressions execute the actual Hub routing implementation with deferred fetches and verify return to categories, navigation to help, late request failure, overlapping search visits without duplicate input handlers, request failure/retry, multiword results and stale scroll callbacks. No scientific content, manifests, identifiers, approval gates, offline worker or deployment configuration changed.

Search errors now include explicit Try again and Back to Hub controls, so recovery does not depend on a hash change. Malformed index payloads or records are rejected before caching and use the same recovery path. The retry regression invokes the actual recovery button handler.

Validation: 437/437 isolated branch automated tests passed; strict content preflight passed all 33 apps; build, 33-app/11-category validation and security scanning passed. Generated build reports excluded. No publication or deployment performed.


### App snapshot ownership and recovery — continuation

Contextual app restoration now checks that a saved snapshot belongs to the current app page, including its query, fragment and preceding visit token. Copying a restore token to another app or deep link no longer fills unrelated controls, repositions that page or suppresses its section navigation. Replaced restore tokens are ignored during this comparison so chained contextual Back continues to work.

Session snapshot fields are normalized before replay: malformed collections become empty, panel references are deduplicated, invalid detail indices are removed, scroll is finite and nonnegative, and input records require string IDs and values. Malformed or unavailable storage falls back to ordinary app entry.

Recovery used a clean Git clone with no copied untracked files. The local predecessor tree (`6afaf6dd0364b99db2833e770bad08dff502ede3`) exactly matched verified remote branch head `784fc99b9c55723f3f5e3d41a6c3c31ef951db5a`; only commit metadata differed. No AGENTS.md was present.

Validation: 442/442 isolated Node tests passed, including five new ownership/recovery regressions and existing offline worker checks; build and 33-app/11-category validation passed; strict content preflight passed all 33 apps; security scan passed. Generated reports were excluded. No scientific content, IDs, approvals, deployment or preview changed. Physical review remains outstanding.


### Complete contextual app view restoration

Contextual Back now restores deliberately closed panels as well as open panels. Previously it only reopened saved panels, leaving panels that default to open visible even when the visitor had closed them before following an app link. Native details now match the saved open-index set; custom disclosure controls use their own click handlers only when their current expansion differs from the saved set. Input events run first, followed by panel restoration and scroll, so input-triggered rendering cannot leave default panels open.

The shared app-view module also captures multiline textarea notes, keeps input/change event behavior, and excludes password, file, hidden and non-user action fields. Replay verifies the current element is an input, select or textarea and remains eligible, tolerating removed fields and IDs reused by unrelated elements.

Seven behavior regressions cover open/closed native and custom panels, textarea capture, rendering event order, idempotent replay, removed/sensitive fields, reused nonform IDs, and a complete capture → cross-app visit → contextual Back → restored view round trip through namespaced session storage. No content, scientific approvals, IDs, deployment configuration or private preview changed.

Validation on final code: 449/449 Node tests passed, build and 33-app/11-category validation passed, security scan passed, strict content preflight passed 33/33 apps. Generated reports excluded; physical-device testing remains separate.
### Disclosure coverage follow-up

Inspection found 13 Applied Water Science / Life Support disclosure buttons without `aria-controls`. App snapshots now preserve these through existing stable card/control IDs while retaining previous `aria-controls` keys. Controls lacking a stable owner are ignored. Three additional behavior regressions cover owner IDs, standalone IDs, unidentified controls and independent sibling states. App-view module tests passed 10/10; combined verification is recorded separately. No scientific content or permanent identifiers changed.



### Ranked Hub search and category filtering

Hub search now ranks exact app titles ahead of title phrases, title-term matches, body phrases and remaining content matches. Terms match across the existing result title and content together, fixing guide queries such as a species name plus a habitat term that occur in different fields. Equal-ranked results preserve index order and section deep links. Existing scientific text and the generated index format are unchanged.

A labeled category selector filters by canonical application ownership in the current registry. Its selection travels with the existing saved query and contextual Back snapshot; returning to Search retains both. Unknown restored categories reset to All categories. Results use a polite live region, and existing safe-link validation, retry behavior and asynchronous route guards remain in place.

Six search-helper regressions cover title/body ranking, mixed-field terms, category ownership, whitespace/case, no matches, stable ties and source immutability. Two route regressions cover category changes/route return and displayed rank order/live-region behavior. Clean recovery first reproduced remote B tree `f3ee9a91c825a3ea7a296a94187dcc94bc440ac4` exactly, avoiding unrelated integration source in this branch.

Final isolated validation: 460/460 Node tests passed, build passed, 33-app/11-category validation passed, security scan passed and strict content preflight passed 33/33 apps. An earlier mixed-tree run was discarded after removing integration-only untracked files; final validation used the exact B baseline plus these feature files. Generated build reports excluded. No deployment or approval changes.

### Section deep-link keyboard position — October 21, 2026

Deep links now move keyboard and assistive-technology focus to the revealed section, after opening its enclosing panels and before the single intentional scroll. Native details focus their summary. Other section targets without keyboard focusability gain programmatic focus without adding a Tab stop; explicit tabindex values remain unchanged. Previously the page scrolled to the section while keyboard focus remained on the preceding navigation link. One-shot mutation protection, explicit same-fragment revisits and contextual Back restoration retain their existing behavior.

Validation: isolated Node suite 506/506 PASS; focused section navigation 19/19 PASS, including focus order, reentrant mutation, native summary behavior, explicit tabindex preservation and no focus theft during contextual Back restoration. Build, validation (33 apps/11 categories), security scan, all-app strict content preflight 33/33 and whitespace checks PASS. Physical keyboard/screen-reader/device acceptance remains pending. No scientific text, stable identifiers, approvals, offline worker, publication or protected repository changed.
