# Media evidence preservation and provenance triage — October 29, 2026

Baseline: `c0ddccf0b10dc50b01aba17e917d646946af352c`. Work is limited to the development media-evidence branch. No source image, catalog permission, manifest, approval record, distribution gate or production/tester repository changes.

## Evidence-file preservation fix

The shared review-output guard rejected symlinks and protected repository paths, but an allowed scratch filename could be a hard link to protected source or submitted evidence. Writing the generated packet/template/report would then overwrite the same underlying file through that alias. The guard now rejects existing targets unless they are regular files with exactly one directory link. Ordinary generated files can still be refreshed. Nonregular output targets such as directories and FIFOs also fail before writing.

Adversarial tests cover both the packet JSON/contact sheet and response template/report CLIs. Protected catalog and submitted license bytes are compared before and after rejection. Packet rejection also leaves no partially written companion output. This is a bounded existing-output check; no new concurrent-filesystem or browser security guarantees are claimed.

## Embedded source metadata

Read-only Pillow EXIF/IPTC inspection of the exact nine pending JPEGs found `Screenshot` in both EXIF ImageDescription and IPTC Caption/Abstract for every image. None has a value in the inspected EXIF Artist/Copyright or IPTC By-line/Credit/CopyrightNotice/Source fields. Exact current SHA-256 values and dimensions are retained in `docs/verification/pending-media-embedded-metadata-20261029.json`; each hash matches its catalog record.

These findings narrow the provenance question: the files' embedded fields do not identify the original creators or reuse terms. `Screenshot` is metadata supplied with the file, not independently verified capture history or evidence of ownership. This inspection does not cover XMP, visual reverse-image matching, external licensing records or historical source documents. Absence of an embedded copyright field does not mean an image is public domain.

All **nine** images remain `review-required`. Exact creator/authorized licensor and permission evidence for the intended audience, distribution, modification and attribution terms remain unresolved. Existing response tooling continues to validate package completeness only and never grants permission.

## Validation

Run `node --test tests/review-output-path.test.mjs tests/pending-media-review.test.mjs tests/media-review-responses.test.mjs` for output-preservation and existing identity/evidence boundaries. Related media registration tests remain separate from rights adjudication.

Executed those three suites plus `tests/pending-october-media-registration.test.mjs` and `tests/media-registration-gate.test.mjs`: **35 passed**, zero failed/cancelled/skipped. `git diff --check` passed.
