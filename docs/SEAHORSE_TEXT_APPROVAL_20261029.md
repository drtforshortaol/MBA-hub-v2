# Seahorse authored-text approval — October 29, 2026

## Owner decision and exact scope

The owner was shown the exact ten-section candidate in `SEAHORSE_FINAL_TEXT_REVIEW_20261029.md`, published at immutable commit `74d718a185d34c3bd8b0e7d5a2251b2cd3f9ead9`. The assistant requested approval to implement that text, excluding image permissions and publication. The owner then asked what clears a blocker; the assistant specified approval, synchronized implementation, a recorded decision and successful verification. The owner's response was **“Proceed.”** This is the explicit authorization recorded here.

Approved scope: the ten authored text paragraphs, including the proposed Conservation and Aquarium-history substitutions. Eight candidate sections retain their previous manifest wording. References now displays the approved wording too, with the two existing species-account links retained on the corresponding names. No image, embedded illustration claim, supplied Naturalist source transcription, or Naturalist scientific content is approved by this decision.

The new Aquarium-history paragraph preserves the previously approved Ocean in Motion sentence exactly, adds the institution's verified historical exhibit dates, and explicitly leaves earlier species placement unconfirmed. The new Conservation paragraph preserves the dated FishBase attribution and adds the specialist group's September 2026 category corroboration; direct IUCN assessment/current CITES PDF retrieval limitations remain as recorded in the evidence packet. These limitations were visible in the approved candidate; no new direct-source access is claimed.

## Implementation and approval binding

- Updated application version: `2.0.0-alpha.8` (Hub platform remains `2.0.0-alpha.7`).
- Status remains a test-stage application: `testing`; scoped review marker: `owner-approved-text`.
- Both rendered paragraphs and all ten search sections match the exact candidate text. The development notice now distinguishes completed authored-text review from pending image/release acceptance; draft labeling remains.
- `config/owner-text-reviews.json` records the explicit owner decision and exact digest of the reviewed manifest and resources. It reuses the existing path-safe byte inventory; binding media bytes is not image permission. Any reviewed resource/manifest change or absent/malformed record invalidates the text decision in release assessment.
- New regression coverage verifies missing/duplicate/malformed records, wrong scope, changed text/manifest and symlink resources cannot retain approval. Separate image and operational gates remain independently enforced.

## Blocker outcome and boundaries

The verified development branch should report **15 blockers**, down from 16: Naturalist content reconciliation (1), image permissions (9), and operational gates (5). All 31 existing inherited V1 records remain distinct and valid; Seahorse is an explicit new-text decision, not a 32nd inherited V1 record.

`releaseEligible` remains false. Before public release, independently verify Ocean in Motion actually opened and recheck authoritative status/trade sources. Five Seahorse image permissions (including scientific interpretation of embedded image text), four Naturalist image permissions, physical acceptance, pilot, privacy and distribution authorization are not granted here. No protected repository, deployment, installed phone build, PR merge or public publication is authorized by this text decision.

## Verification record

Full `npm test`: **1,017 passed**, zero failed, cancelled or skipped. Build validation, security scan, content preflight and generated artifact verification passed. The independent read-only gate review found no release bypass; stale reviewer metadata was also normalized to pending. The exact readiness/hash receipt is `docs/verification/seahorse-text-clearance-20261029.json`. GitHub CI must also pass for the implementation commit before selecting its tester artifact. The approval record is not physical-device acceptance.
