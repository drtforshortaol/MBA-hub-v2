**Later license/provenance update:** The retained ephyra illustration is now sourced and licensed, with its caption/alt and source/license references corrected. See `EPHYRA_FIGURE_LICENSE_20261029.md`. All approved scientific/editorial text and the standalone summary remain unchanged; the original approval and candidate below remain the baseline for the precisely bounded technical rebind.

# Naturalist authored-text approval — October 29, 2026

The owner explicitly replied **“Approved”** to the exact October text packet at commit `74b91bb5af8f0215d4863bcdf9a2c39e76aa3c58`, after being shown the proposed jelly wording, sourced exhibit-history paragraph and stale photo-label cleanup. This is approval of the reviewed authored text only. It is not permission for the remaining illustrations, public release, a pilot result or physical-device acceptance.

## Implemented scope

The two source files are byte-for-byte identical to `candidate_files` in the immutable `docs/verification/naturalist-final-text-candidate-20261029.json`:

- `src/apps/naturalist-field-notes/october-2026-note.js`: jelly observation and Q&A use the approved arm-canal wording; three approved MJ photo captions no longer claim permission review is pending. All other observation text, all 39 Bay Watch entries, pod names, historical context, photo paths/alt text, MJ credits, species-highlight text and questions are preserved.
- `src/apps/naturalist-field-notes/october-2026-08-14.html`: the same jelly explanation and the approved attributed exhibit-history paragraph replace the prior wording. All other summary content and the historical photo remain unchanged.

Naturalist advances to `2.0.0-alpha.10`, remains `status: testing`, and carries `publication_review: owner-approved-text`. Original V1 data, renderer, stylesheet, original media and stable issue query remain unchanged. Prior authorization of 24 original notes and the accepted collapsed Q&A presentation is preserved; these items were not presented for repeat approval. Four MJ photo permissions remain approved, while six illustration permissions remain pending.

## Byte-bound approval mechanism

`config/owner-text-reviews.json` records the exact owner quote, candidate commit and packet hash, review scope, decision reference and current content digest. The digest covers the current manifest, app directory, offline dependencies, media catalog and shared knowledge. Changed reviewed bytes or an invalid decision record reopen the content gate. Source manifests do not become globally approved or published.

The build and public-review helper are reused unchanged from the already-tested Seahorse approval track (`a8dddb8535a5313149edc8616aefae7cafaebe88`). This is reuse of the same scoped mechanism, not a second approval model. Its generic regression tests are also reused. The Naturalist record is the only owner-text record in this uncombined branch; the separate Seahorse approval has not been revoked or imported here.

The existing 31 inherited-content records remain unchanged because no catalog, shared knowledge or those app resources changed. Naturalist original-source byte guards are updated for the precise new addition/manifest bytes. Original-fidelity coverage remains separate from whole-app inheritance. Current runtime/source reports now explicitly verify the owner-text binding while retaining their own `approval_granted: false` engineering-scope flags: those tools do not themselves grant approval.

## Release impact

The uncombined Naturalist branch decreases **13 → 12 blockers** by removing only `content review pending: naturalist-field-notes`. The twelve remaining entries are six media reviews, five operational gates and the base branch's Seahorse content marker. The latter does not reopen the owner's earlier Seahorse approval; it reflects that this branch does not yet contain that separate change. A future combined development verification must include both explicit text decisions and re-bind them after checking the final exact app/catalog resources. No merge or deployment occurs in this task.

## Verification

Twenty-seven focused checks passed. New Naturalist tests require the exact candidate file bytes, packet hash and explicit approval record, reject an altered manifest or absent authorization quote, and verify the precise content-gate removal while retaining six media and five operational gates. Generic owner-text tests retain malformed/duplicate record, byte-drift, symlink and reviewer-normalization coverage. Full build, security/content/artifact, test-suite and offline results are recorded after completion below.

Completed validation: **1,033/1,033 full-suite tests passed**, with zero failures, cancellations or skips. Build, security scan, all-app content preflight, artifact verification and diff check passed. Prepared offline navigation passed in both environments (384 developer / 375 tester resources, zero offline network attempts). The exact candidate files, approval digest, remaining blockers and verification results are recorded in `verification/naturalist-text-clearance-20261029.json`. Developer release `db467bd50de2e744` and tester release `f5438e08b58c8544` identify local verification builds only.
