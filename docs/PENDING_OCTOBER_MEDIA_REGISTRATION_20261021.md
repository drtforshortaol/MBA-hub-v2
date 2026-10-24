# Pending October media registration — October 21, 2026

The nine independently detected local October images are now registered centrally without granting reuse approval. Catalog version advances from 1.1.0 to 1.2.0 (203 → 212 records). Stable IDs follow the existing `asset-` plus first sixteen SHA-256 hex characters convention. None of the nine hashes duplicates an existing catalog asset. Existing IDs and all image bytes/paths are preserved; no file was moved or copied.

| Owning app | Existing source path | Stable media ID |
| --- | --- | --- |
| naturalist-field-notes | `apps/IMG_4207.jpeg` | `asset-1bd100105f88c83a` |
| naturalist-field-notes | `apps/IMG_4208.jpeg` | `asset-95daa2493750e82f` |
| naturalist-field-notes | `apps/IMG_4209.jpeg` | `asset-47f9bbb193878eec` |
| naturalist-field-notes | `apps/IMG_4210.jpeg` | `asset-50646c3fe1d0c359` |
| big-bellied-seahorse | `apps/IMG_4212.jpeg` | `asset-486b6cdb96375dfb` |
| big-bellied-seahorse | `apps/IMG_4213.jpeg` | `asset-2913dc8df835400c` |
| big-bellied-seahorse | `apps/IMG_4214.jpeg` | `asset-e62b39cc07a542c4` |
| big-bellied-seahorse | `apps/IMG_4215.jpeg` | `asset-54f52bac7bc827bc` |
| big-bellied-seahorse | `apps/IMG_4216.jpeg` | `asset-93c15fb934aba9e6` |

Each app's `media` array now references the corresponding new IDs. All nine paths were already in the owning app's offline declarations; no new offline file addition is needed. Original alt wording is retained from the app; creator/credit/reuse scope is explicitly unresolved. New records have `permission: review-required` and no permission-evidence grant. Both app publication-review flags remain `pending`.

Engineering provenance points to the exact pre-registration V2 source `drtforshortaol/MBA-hub-v2` commit `12afc2052c6117cc33616a9687199e353c3d8c48`, paths `src/apps/IMG_*.jpeg`. This is **not** pinned V1 provenance, original-creator attribution or evidence of a license. The new media does not inherit approval merely because its owning Naturalist app has older V1 content.

The independent coverage audit now reports **zero uncataloged resources**, zero missing app/offline registrations, and **nine unresolved permission findings**. Those findings intentionally remain failures for release readiness; all nine IDs also appear as canonical media-permission release blockers. The original registration planner reports zero additions/errors, and all 33 application preflights pass. The updated full read-only report is in `verification/local-media-coverage-20261021.json`.

Focused regression checks pass 25/25: nine audit tests, fourteen existing planner tests and two pending-registration tests. They verify exact original image digests, stable IDs and paths, each app reference/offline declaration, pending media/content approvals, V2-only provenance, canonical permission blockers and the transition from nine registration gaps to nine rights findings. Whitespace check passes. Catalog/manifest bytes changed, so the combined build must receive fresh runtime release IDs and a newly identified acceptance candidate. No publication or deployment occurred.

Remaining action is actual creator/license/reuse evidence and scientific/editorial review for each image, followed by an appropriately reviewed retention/removal/replacement decision. Registration alone does not clear any rights or content approval.
