**Later October text decision:** The owner explicitly approved the final October packet at `74b91bb5af8f0215d4863bcdf9a2c39e76aa3c58`; implementation and exact scope are recorded in `NATURALIST_TEXT_APPROVAL_20261029.md`. Earlier pending-text and missing-photo statements below describe prior checkpoints. Six illustration permissions and operational release gates remain separate.

# Naturalist scoped owner review — October 29, 2026

> Later source update (October 29, 2026): the owner has now supplied the actual October 8–14 text. See `NATURALIST_OWNER_SOURCE_RECONCILIATION_20261029.md` for transcription verification, corrected date labeling, restored historical context and the missing `MZD_5048.JPG` photograph. Earlier missing-source statements below describe the pre-receipt review; no whole-app or media approval is implied.

**Owner approved the expandable Q&A presentation on October 29, 2026.** This records presentation approval only; new October facts, image rights and whole-application publication review remain pending. No application content or release-gate configuration changes here.

Reviewed content baseline: `c0ddccf0b10dc50b01aba17e917d646946af352c`; subsequent Naturalist engineering commit `faee249` adds runtime checks without changing these app files. Source pin for inherited material: `drtforshortaol/MBA-hub@5c219508d23255080f6b050cefa8092905447d81`.

## Approved decision: keep inline Q&A presentation

**Accepted scope:** “Keep the current expandable Q&A cards, with the original answer and any original photographs/tags inside each card and a button back to its dated Field Note. This approves the presentation change only. Existing unchanged V1 content remains under its prior authorization; new October content and image rights remain separately pending.”

| Before: pinned V1 | Current V2 | Actual scope of this decision |
| --- | --- | --- |
| Q&A index button shows question, date and tags. Selecting it opens the complete source Field Note. | Expandable question/date card shows the answer, photographs and tags directly, plus “Read original field note” button. | Retain this changed interaction for the 38 original Q&A entries and the Q&A block embedded in Home. No new interpretation of those original answers is proposed. |

Example: “What changed in the Seabirds exhibit?” originally linked to `2026-01-08-seabirds-training-bay-watch`. The current card reveals that same dated answer before the source-note button. Its instruction to confirm the birds' current status remains part of the original answer; presentation approval does not transform it into a current exhibit-status claim.

Evidence: `src/apps/naturalist-field-notes/app.js:2`, function `qaBlock()` and the call from `home()` on line 10. Pinned original `app.js` Git blob: `23e4718ec959e9aa0044000d7826c3d6f0c1583a`. `scripts/migration/review-naturalist-original-fidelity.mjs:88–98` separately compares all 38 source-derived cards; lines 100–111 exercise original issue buttons, Back and note-query startup. The existing independent review explicitly leaves presentation approval pending: `docs/NATURALIST_INDEPENDENT_SCOPE_REVIEW_20261023.md`.

**Decision record — APPROVED, October 29, 2026.** The owner replied, “I approve your recommendation,” after comparing the original index-only approach with expandable cards. The accepted recommendation keeps cards collapsed by default, reveals the answer and associated photographs/tags on expansion, and retains the button back to the dated Field Note. This approval covers the layout, including its Home embedding; it does not approve newly added answer text or new media rights. The current `qaBlock()` already renders native details without an `open` attribute, so no runtime rewrite is necessary.

The presentation question is resolved. This is not a blanket `reviewed-unchanged-v1` record for the whole current app. The three October Q&A entries use the accepted layout but their factual text remains pending below. The engineering reports' `approval_granted:false` and `whole_app_inheritance:false` remain correct for their original, broader scope.

## Already-authorized inherited scope — no repeat content approval requested

The original-source packet establishes 24 original notes, 38 Q&A entries, eight resource labels, complete original CSS and 119 original media resources after reviewed relocation. The original archive already includes an October 7 note; do not mistake that existing issue for the new October 8–14 addition.

All 24 original issue trees and the original Home subtrees outside the explicitly changed Q&A block reproduce against the pinned source. This supports the existing unchanged-content authorization recorded in `docs/GUIDE_CONTENT_RESTORED.md`, within the exact source/byte scope of the original audit. It does not authorize the newly added files or certify every current browser/device behavior.

The current-runtime follow-up in `docs/NATURALIST_OCTOBER_RUNTIME_20261029.md` exercises the October addition with the current app: 25 notes and 41 Q&A entries. Its field/event checks establish what is displayed; they do not validate the new scientific or historical claims.

## New October scope: precise source gaps and disagreements

**Later evidence update:** `NATURALIST_PRIMARY_EVIDENCE_FOLLOWUP_20261029.md` now locates primary ephyra **arm** transport evidence and direct Aquarium member/donor preview schedules. Those two evidence findings supersede the corresponding initial source-gap assessments below; distal-lappet/early-ephyra postfeeding wording and original 2008 archival verification remain bounded as described in the follow-up. No factual/editorial approval is inferred.

Both new content files are minified to **line 1**. The field/section locators below distinguish exact claims on that line. `october-2026-note.js` is the active structured issue. `october-2026-08-14.html` is a separately packaged text summary; it is declared as an offline asset in `manifest.json:25`, while the indexed October destination at `manifest.json:602–613` routes to the structured issue. No direct reference to the separate page was found in current app runtime/data/index HTML. Offline inclusion still makes its content part of the review scope.

| Locator | Current material needing review | Evidence / narrow next action |
| --- | --- | --- |
| Structured `summary[0..2]`, `observations[0]`; separate page “Bay highlights” | Seasonal humpback peak/offshore shift, dolphin pods sometimes over 1,000, less frequent orcas, hydrophone sounds and tentative blue/fin attribution. | These are dated observations, not general species facts. The exact original weekly update/email and author/date attribution have **not** been recovered. Preserve uncertainty. Public whale biology cannot authenticate those particular sightings, count or audio identifications. |
| Structured `bay` (39 entries); separate page “Bay Watch species list” | Named orca groups, particular seabirds and other sightings. Structured data preserves more species-level detail; separate page groups many names. | Recover the original October 8–14 list before checking transcription or omission. Do not interpret the shorter summary as an independent corroborating source. |
| Structured `observations[1]` / `photos`; separate page “Birds” | Bird IDs and Wharf 2 location; structured note includes four images, while the separate text copy says photographs were not included with that copy. | This is a presentation/scope difference, not proof an image is missing from the structured note. Source IDs/location and exact image attribution still need original evidence; permission remains separate. |
| Structured `observations[2]`, `qa[0]`; separate page “Jelly Q&A” | Gastrovascular nutrient transport into developing lappets; canals may become visible/colored after feeding. | Primary paper J1 supports general transport and post-feeding canal coloration in **juvenile** Aurelia observations. Its authors explicitly exclude early ephyra-stage network development from the study. Do not relabel that limited evidence as confirmation of every ephyra/lappet-specific sentence. An ephyra-specific source or reviewer disposition remains needed. |
| Structured `observations[3]`, `qa[1]`; separate page “Splash Zone and Ocean in Motion” | New exhibit/layout/interactives versus “Splash Zone 3.0.” **Only the separate page additionally asserts a 2008 renovation and late-October/early-November member/donor previews.** | A1 confirms Splash Zone opened in April 2000. A2 supports Ocean in Motion's new design/interactives. The two official sources do **not** establish the separate page's 2008 renovation or preview schedule. Hold those two extra assertions for Aquarium archival/editorial evidence; do not silently remove them or approve them through the structured note alone. |
| Structured `highlights[0]`, `qa[2]`; separate page “Species highlight” | Big-bellied seahorse range/taxonomy, male brooding, pivot feeding, plates/tail, and pipefish brooding. | Share claim-level evidence with the Seahorse scientific track; avoid a duplicate blanket approval. The existing October 29 Seahorse packet locates species-specific feeding and museum-account evidence but still separates scientific signoff. Do not infer that the separate guide link itself validates these claims. |

**Do not reopen the owner's already-selected post-opening Ocean in Motion release wording.** Confirm actual opening before public release as already required. That decision supplies neither the missing 2008/preview evidence nor authentication of the weekly report.

## Sources inspected October 29, 2026

- **A1 — Aquarium primary historical timeline:** [Our history](https://www.montereybayaquarium.org/about-us/about-the-aquarium/our-history), April 2000 entry. Supports opening month/year only among the disputed historical details here; no 2008 renovation or 2026 preview schedule was found there.
- **A2 — Aquarium primary announcement:** [Ocean in Motion press release, September 8, 2026](https://www.montereybayaquarium.org/about-us/about-the-aquarium/newsroom/press-releases/monterey-bay-aquariums-ocean-in-motion-la-danza-del-mar-opens-november-7-2026), opening announcement and exhibit-design paragraphs. Supports the announced exhibit and new interactive features. This is an announcement, not a fresh certificate of opening or evidence of a particular member/donor event.
- **J1 — primary experimental paper:** [Morphogenesis of the gastrovascular canal network in Aurelia jellyfish: Variability and possible mechanisms](https://www.frontiersin.org/journals/physics/articles/10.3389/fphy.2022.966327/full), Frontiers in Physics (2022), DOI `10.3389/fphy.2022.966327`. Introduction distinguishes early ephyra development from the juvenile-to-adult stage studied; Methods describes orange canals after Artemia feeding. Supports the limited finding stated in the table, not the entire app's ephyra-specific explanation.

External sources are paraphrased here; source retrieval does not clear image rights. The original October weekly source remains missing. Neither the app's own source footer nor its paraphrased summary is a substitute for that original.

## Smallest next steps

1. **Completed:** owner approved retaining the current expandable Q&A layout, collapsed by default. No image-rights or new-fact decision is bundled into that answer.
2. Continue exact original-source recovery and the itemized factual review above. In particular, obtain Aquarium evidence for the **separate page's** 2008/preview assertions; ask for a scoped retain/edit/omit decision only after exact evidence or proposed replacement text is available.
3. Preserve pending content/publication/media flags. Update the scoped evidence record after decisions; do not decrement the whole-app release blocker merely because the layout is accepted.

Reviewed SHA-256: `app.js` `c871238eeb6f808a034eb5123517df4720b4a8dd6f560177c25c2df4303065a2`; additive script `f942215c8f7eb22ed2ee9eb26a0f05b9f6076212bdb42be03cc1e7e52f0c2210`; separate HTML `692a40302b95ecdba4e19ba6a5849dba89ad20b49ea36c7754a0c3db1a00713b`; manifest `a6ad9198f2c0f57be576d69909c02b6b0e3700f6fed05c9f577e8ca67443bfb8`.
