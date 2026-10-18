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
