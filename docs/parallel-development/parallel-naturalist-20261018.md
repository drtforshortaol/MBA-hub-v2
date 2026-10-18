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
