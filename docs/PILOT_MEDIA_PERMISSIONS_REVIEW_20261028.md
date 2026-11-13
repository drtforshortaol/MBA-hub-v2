# Pilot media permission evidence review — October 28, 2026

Read-only inspection of `src/shared/media/catalog.json` on development branch `fix/iphone-offline-readiness-20261027`. No image, media ID, catalog approval, application content, or public/tester deployment changed.

## Result
- Catalog version: 1.2.0; 212 records.
- 203 retained `owner-approved-v1` records: existing owner approval remains preserved; this review did not re-adjudicate their rights.
- Exactly nine `review-required` records, all with offline availability but no creator/license/reuse permission evidence in their catalog record.
- No exact-byte duplication with legacy catalog assets was reported in `PENDING_OCTOBER_MEDIA_REGISTRATION_20261021.md`; hence existing V1 approval cannot be transferred by identity.

| App | Image | Stable ID | Catalog description | Permission |
|---|---|---|---|---|
| naturalist-field-notes | IMG_4207.jpeg | asset-1bd100105f88c83a | Ancient murrelets | review-required |
| naturalist-field-notes | IMG_4208.jpeg | asset-95daa2493750e82f | Rhinoceros auklets | review-required |
| naturalist-field-notes | IMG_4209.jpeg | asset-47f9bbb193878eec | Fork-tailed storm-petrel near Wharf 2 | review-required |
| naturalist-field-notes | IMG_4210.jpeg | asset-50646c3fe1d0c359 | Moon jelly ephyra anatomy | review-required |
| big-bellied-seahorse | IMG_4212.jpeg | asset-486b6cdb96375dfb | Seahorse illustration 4212 | review-required |
| big-bellied-seahorse | IMG_4213.jpeg | asset-2913dc8df835400c | Seahorse illustration 4213 | review-required |
| big-bellied-seahorse | IMG_4214.jpeg | asset-e62b39cc07a542c4 | Seahorse illustration 4214 | review-required |
| big-bellied-seahorse | IMG_4215.jpeg | asset-54f52bac7bc827bc | Seahorse illustration 4215 | review-required |
| big-bellied-seahorse | IMG_4216.jpeg | asset-93c15fb934aba9e6 | Seahorse illustration 4216 | review-required |

## Decision needed before broader sharing
Supply creator/rights source and distribution permission evidence for each exact image, or authorize replacing/removing it. Do not equate file presence, caption/credit, engineer-provided source commit, or access to GitHub with reuse rights. Retain scientific/editorial review for new Seahorse content separately. Do not treat the private owner's LAN test as a distribution authorization.

## Scope
This review checked repository catalog metadata and the existing media-registration audit, not independent external reverse-image provenance research or user-owned licensing records. No permission status has been cleared.
