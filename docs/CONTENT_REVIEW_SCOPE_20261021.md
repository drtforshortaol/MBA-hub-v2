# File-level content review scope — October 21, 2026

The inherited V1 authorization covers unchanged material within its original scope. It cannot establish approval for new files, new observations, new images or changed claims inside an otherwise migrated app. This ledger records evidence and required review; it grants no scientific, editorial, image or distribution approval.

## Implemented audit

Run `node scripts/audit-content-review-scope.mjs` from the repository. It emits read-only JSON with current SHA-256 identities and classifications. It compares current manifests with unique matching migration provenance and the pinned-source fidelity report; checks every retained report file's current hash; discovers current local additions instead of trusting the old additions list; identifies offline images/media lacking a unique centralized catalog record; and never asserts whole-app inherited approval.

Exit 1 means missing/stale/mismatched evidence or invalid input. Exit 0 means the ledger was produced consistently, **not** that content or release is approved. Normal review findings remain visible in JSON. The script does not alter canonical readiness flags. It complements `audit-migration-fidelity.py`, which must be rerun after relevant bytes change. The retained fidelity report is dated and is not independently recreated by this command.

Classifications preserve distinctions: exact pinned bytes; content preserved after verified image-URL relocation; static text preserved with technical differences still requiring review; style differences; registration/search metadata review; local additions; new-app content; changed content or code. Script-generated text and embedded image claims cannot be certified by HTML static-text equality. Registration manifests contain search prose as well as technical fields and are never blindly exempted.

Current run: 33 apps; two local added content files in Naturalist Field Notes; one new-app runtime file (seahorse HTML, with its manifest separately classified); nine unregistered offline media uses (four Naturalist + five seahorse). Zero stale-byte/provenance errors. These counts describe review scope, not nine newly created canonical blockers or a completion percentage.

## Naturalist October scope requiring separate review

| File/scope | Pinned fidelity result / current content | Required evidence |
| --- | --- | --- |
| `naturalist-field-notes/data.js` | Existing dataset matches pinned source after image-URL relocation only. | Retain fidelity evidence and existing authorization; this says nothing about the separately appended October script. |
| `naturalist-field-notes/october-2026-note.js` | Local addition absent from pinned migration source; appends October 15 entry reporting October 8–14. | Original weekly source and author/distribution scope; verify dated observations, tentative whale acoustics identification, species list, jelly anatomy, seahorse claims and exhibit-history/preview statements. Do not present historical sightings/events as current. |
| `naturalist-field-notes/october-2026-08-14.html` | Local added static summary, also absent from pinned source. | Compare against original weekly source and the appended entry; confirm editorial selection and duplicated science. Its prose says photographs were not included in this text copy, while the separate app entry includes four; reviewer should assess clarity in context rather than silently harmonize. |
| `naturalist-field-notes/app.js` | Changed executable code; no blanket content-fidelity assertion. | Review functional differences and any embedded/generated prose separately. |
| `naturalist-field-notes/manifest.json` | Registration/search metadata. | Review added October sections/search wording and dependency/offline changes without treating all metadata as technical-only. |
| `apps/IMG_4207.jpeg`, `IMG_4208.jpeg`, `IMG_4209.jpeg`, `IMG_4210.jpeg` | Four offline media paths unregistered in central catalog; captions already say permission pending. | Exact creator/source/permission scope and image/caption accuracy. Existing V1 permission does not automatically cover these additions. Record permissions centrally only when evidence supports them. |

## Seahorse scope

`big-bellied-seahorse` is a new app without inherited migration provenance. Its five offline image paths `apps/IMG_4212.jpeg` through `apps/IMG_4216.jpeg` lack central catalog records. The manifest declares `media: []`; offline inclusion supplies neither attribution nor permission. Scientific and embedded-image claims remain separate from file registration.

Read [seahorse evidence review](SEAHORSE_CONTENT_REVIEW_20261021.md) and [proposed corrections](SEAHORSE_PROPOSED_CORRECTIONS_20261021.md). These identify unsupported average length, precise reproductive counts/ranges, taxonomy/range differences, current-status uncertainty, exhibit statements and infographic superlatives/numbers. They propose conservative wording and per-image choices without applying runtime changes or granting approval.

## Closure protocol

For each new/changed content scope, retain the exact file hash, source/reference, designated reviewer/date, accepted wording and image permission scope. Confirm unchanged migrated material using fidelity evidence without requesting duplicate approval. Review technical changes separately. A whole-app “inherited” label cannot replace this record. Applying content corrections requires rebuilt runtime identities and a newly identified acceptance candidate; physical checks cannot be copied from the old candidate.

All source approval flags remain unchanged. Android/Windows, physical iPhone and operational gates are unaffected by this audit.
