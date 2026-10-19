# A — Naturalist Automation

Development track initialized October 18, 2026.

Base checkpoint: 966024670dc0e18cccdb091f45665ce9a9493b8f.

## Mission
Naturalist intake, extraction, classification, conflict detection, review, draft, preview, validation, and export. No automated scientific approval or publication.

## Ownership
Primary change area: src/core/naturalist-.
Avoid modifying files owned by other tracks. Cross-track shared files require integration review.

## Required gates
- Preserve protected V1, public tester, and independent EVO repositories.
- Keep canonical identifiers, scientific approvals, and modular architecture intact.
- Run automated tests, build validation, security scanning, and offline checks where applicable.
- Use pull requests into security-review-evo-foundation-20261014 for review; never auto-merge.
- No deployment, publishing, or production changes without explicit authorization.

## Execution
This branch isolates work; it does not by itself start an autonomous development agent. Work must be invoked through an available execution session or GitHub workflow.

## Source intake recovery — October 18, 2026

Implemented source-only intake JSON recovery in Developer Mode. The exported source is preserved byte-for-byte as a JavaScript string, including whitespace and Unicode. Restoring it clears the previous generated review and requires fresh classification and scientific/editorial decisions. The shared browser-safe packet reader rejects malformed, oversized, foreign-schema and authority-bearing packets; pending file reads cannot overwrite edits, a newer file selection or a newer review generation.

Verification: development/tester build succeeded (33 apps, 11 categories); validation and security scan passed; full existing suite plus first four packet tests passed (408/408), including offline integrity, interrupted updates, rollback and environment isolation. Targeted packet suite passed 5/5 after adding the canonical classification recovery integration case. No release gates, scientific content, permanent IDs, protected repositories or deployment state changed. Real-device file-picker interaction remains for device review.

## Source autosave and fresh review recovery — October 18, 2026

Naturalist source now saves locally while typing, isolated by build environment. Reopening Developer Mode offers explicit Restore/Discard controls. Discard removes only the saved source and preserves current notes and separate review records. Unavailable or full browser storage reports a download fallback. Source-only recovery (including JSON import) starts pending scientific/editorial decisions even when matching previously approved review annotations exist; explicitly saving newly recorded review decisions enables normal annotation recovery again.

Verification: build and validation passed for 33 applications/11 categories; security scan passed; full suite passed 412/412. The final behavior regression added afterward passed with the complete source recovery suite (4/4). Tests execute actual event handlers and review recovery code with matching stored approvals; restored source does not read or inherit them. Storage environment isolation, corrupt records, ignored/throwing writes, Unicode preservation and discard behavior are covered. Device reload/file-picker review remains pending; no publication or scientific approval gates changed.

## Decision recovery race protection — October 18, 2026

Review packet recovery now keeps newer reviewer decisions and newer file selections when an older file finishes reading. Source/generation changes, invalid packets and failed saves leave current decisions intact. A valid, explicitly selected decision packet can resume its saved annotations after source-only restoration; fresh-review mode ends only after validation and a verified local save. Source-only restoration still never inherits approvals automatically. Clearing the file input permits retrying the same file.

Verification: full suite 417/417 passed; build, validation (33 apps/11 categories), security and diff checks passed. Four new behavior tests execute the actual async recovery handler with deferred file reads, covering competing files, changed decisions, stale context, malformed/oversized input and unavailable storage. Existing static UI assertions were updated for the stronger guard. No scientific content, identifiers, release approvals or deployment state changed. Physical device file-picker review remains pending.

## Replacement text recovery — October 18, 2026

In-progress replacement text now saves on the device and survives regenerating the review interface, reopening Developer Mode, and reloading after source recovery. Storage is isolated by build environment and the exact source/classification fingerprint. Only proposal text is recovered; scientific/editorial decisions remain separately owned and existing draft export rules are unchanged. Clearing replacement text removes its saved draft. Invalid, oversized, stale-route and authority-bearing records are rejected. Failed storage writes show a copy-text fallback without discarding current edits.

Verification: full suite 421/421 passed; build, validation (33 applications/11 categories), security scan and diff checks passed. After final fallback wording refinement, rebuilt and reran all 14 replacement recovery/draft UI tests successfully. New behavior tests execute the actual textarea handler and regenerated recovery interface, verify pending decisions remain pending, reject stale handlers, and cover namespace/context isolation, malformed records and storage failures. No production, scientific content, release flags or deployment state changed. Device reload/storage review remains pending.

## Portable read-only queue verification — October 18, 2026

Read-only review queue imports now accept JSON with reordered object members, including nested summaries and queue items. Previously, an equivalent packet reserialized by a JSON editor failed verification. Exact fields and values, array order and length, review fingerprint, and false publication states remain mandatory. Extra authority fields, missing members, altered counts and moved actions remain rejected; no review decisions are restored by queue verification.

Verification: clean source tree matched remote Track A commit 56af2efa398697fba5dd7715645b9689af3cce86. Full Node suite passed 422/422; build, validation (33 apps/11 categories), security scan and diff checks passed. Final targeted queue tests passed 5/5, covering reordered JSON and tampered or sparse arrays. Protected repositories, scientific/editorial approvals and the private preview remain unchanged.

## Portable replacement text backup — October 18, 2026

Developer Mode now downloads proposal text as a portable JSON backup and restores it for the exact source/classification fingerprint. Backups contain replacement text only, never scientific/editorial decisions. Recovery merges included proposals while retaining other current drafts, refreshes their previews, and attempts normal device autosave; it remains usable when local storage is unavailable. The downloadable file is capped at the restore picker's 2 MB UTF-8 limit. Foreign contexts, changed routes, duplicate indices, oversized proposals, malformed data and extra authority fields are rejected. Newer file selections, edits made during reading and stale review interfaces keep precedence.

Verification: full suite passed 425/425 before the final UTF-8 size-limit regression was added; final replacement recovery and draft UI suites passed 18/18 including that case. Final build passed (33 apps/11 categories); validation, security scan and diff checks passed. Tests execute the actual asynchronous restore handler and confirm pending decisions remain pending. No protected repository, content approval, deployment or preview changed. Physical file-picker/download interaction remains for device review.

## Readable review report — October 19, 2026

Developer Mode now downloads a plain-text Naturalist review report suitable for reading on iPhone or copying into Notes. It includes the original source unchanged, exact classification fingerprint, each statement and destination, classifier flags and related statements, reviewer notes and pending/completed annotations, blocked action reasons, and clearly labeled current section snapshots versus unverified replacement proposals. Incomplete work can be exported without additional approval requirements. The report is explicitly read-only and grants no scientific, editorial or publication authority. Stale interfaces cannot download a report against changed source.

Verification: recovered a clean checkout and verified exact remote tree 5450b588c5d3dbad490a993064be861dd7473d94 before implementation. Build passed for 33 apps/11 categories; full Node suite passed 429/429; validation, security scan and diff checks passed. Three new tests cover source/proposal preservation, pending and blocked annotations, malformed inputs, and the actual download handler including stale review rejection. No scientific content, approval state, protected repository, deployment or private preview changed. Physical text-file download remains for device review.


## Dense approval and classification recovery — October 19, 2026

Review validation now visits every array position and requires owned decision and classification records. Sparse arrays previously passed `Array.every` because holes were skipped; partial approvals could therefore be reported as valid recovery or an incomplete action queue. Missing or inherited records now fail closed before storage writes, portable annotation recovery, or queue preparation. Complete pending and approved arrays retain existing behavior; publication authority remains false.

Verification: build and validation passed for 33 applications/11 categories; security scan and diff checks passed; Naturalist-related Node tests passed 144/144, including two new regressions exercising recovery, persistence, classification gaps, prototype-inherited records, and read-only queues. An initial test invocation before generating dist had three missing-build failures; building and rerunning resolved all three. No scientific content, permanent identifiers, deployment, protected repository, or approval policy changed.


## Portable annotation JSON recovery — October 19, 2026

Portable review decision recovery now accepts semantically unchanged nested classification objects after a JSON editor reorders their members. Recovery and read-only queue verification share one structural comparator. Exact source whitespace, array order, field presence and types, destination routing, and opaque reviewed section/source snapshot strings remain mandatory; scientific/editorial and publication gates are unchanged.

Verification: built before testing; Naturalist suites passed 145/145 and full isolated Track A Node suite passed 435/435. Final build and validation passed for 33 applications/11 categories; security scan and diff checks passed. The new recovery regression confirms reordered JSON retains annotations and rejects nine altered classification/provenance cases. No content, protected branches, deployment, or preview changed.


## Readable statement evidence beside review controls — October 19, 2026

Naturalist review cards now display each complete source statement directly above routing and approval controls. Previously the card summary truncated statements to 130 characters and complete wording was buried in technical details. A separate original-source paragraph disclosure supplies surrounding context when it differs from the statement. Line breaks, whitespace, Unicode and literal source markup are preserved using text content; repeated context is omitted. The renderer is read-only and changes no scientific/editorial decision or source data.

Verification: build before tests; full isolated Track A suite passed 438/438, including three new rendering/wiring tests. Build and validation passed for 33 applications/11 categories; security scan and diff checks passed. An initial full run found one static assertion tied to the former card child list; updated for the new evidence element and reran successfully. Physical iPhone layout review remains pending; no preview, deployment or protected branch changed.


## Resume the last reviewed statement — October 19, 2026

Review navigation now remembers the displayed statement on this device and reopens it when regenerating or reopening the same classification. Previous/next, the statement picker and review triage navigation all save the displayed position. Position storage is separate from decisions, isolated by environment and the exact classification fingerprint, and checked against statement count. Unavailable storage leaves navigation usable and starts at the first statement. Source-only recovery still requires fresh decisions; remembering a position confers no approval.

Verification: sequential build then tests; full isolated Track A Node suite passed 441/441 and new position tests passed 3/3. The behavior test executes actual navigation and restoration code, verifies picker/triage persistence, rejects stale controls, and confirms source and review decisions stay unchanged. Build/validation passed for 33 applications/11 categories; security scan and diff checks passed. Physical iPhone reload review remains pending; no preview or protected branch changed.


## Open statements directly from action queues — October 19, 2026

Blocked and preparable reviewed actions now include a “Review statement” button returning directly to that statement's full source evidence and scientific/editorial controls. This replaces manual statement-number lookup when resolving a queue blocker or checking a proposed action. Links reuse existing statement navigation and position resume. Navigation logic lives in a focused module; the Developer Mode orchestrator adds only import/render glue. Clicking a link changes neither decisions nor blocker classifications; links belonging to retired reviews do nothing.

Verification: sequential build then tests; full isolated Track A Node suite passed 444/444 and the three new queue-link tests passed. Behavior coverage opens both queue types, verifies unchanged approvals and blockers, rejects stale links, and checks render integration. Build/validation passed for 33 applications/11 categories; security scan and diff checks passed. Preview/device testing remains on hold; no deployment or protected branch changed.

## Keyboard context for queue review links — October 19, 2026

Opening a statement from a blocked or preparable action queue now transfers keyboard and screen-reader focus to that statement's native summary before scrolling it into view. Previously focus stayed on the queue button below the review, so the next Tab continued from the queue after the visual jump. This uses the existing summary without adding tab stops or changing source, annotations, approvals, or queue blockers. Retired and invalid links remain inert; missing summaries retain usable navigation.

Verification: aligned to authoritative remote Track A commit e50e1d77aeb2dbb6670443ce7ace7686d1ffde89 with an identical source tree. Sequential build then full isolated Node suite passed 450/450; focused queue navigation tests passed 5/5, including event ordering and missing-summary fallback. Validation passed for 33 applications/11 categories; security scan and diff checks passed. Physical assistive-technology/device acceptance remains untested while preview/device testing is on hold. No deployment or protected branch changed.

## Verify first-statement position saves — October 19, 2026

Position persistence now verifies the exact stored record after writing. Previously an ignored or corrupted storage write for the first statement returned success because the reader's safe fallback index is also zero. Invalid, absent, altered-count and extra-field records can no longer masquerade as a successful save. Navigation still starts safely at the first statement when storage is unavailable; review decisions and approvals remain separately owned.

Verification: build completed before full isolated Node tests; focused position tests passed 4/4, including silent write failures for index zero and successful navigation back to zero. Validation passed for 33 apps/11 categories; security scan and diff checks passed. Full suite count is recorded in the accompanying development batch evidence. No deployment, preview, scientific content, identifiers or approval state changed.
