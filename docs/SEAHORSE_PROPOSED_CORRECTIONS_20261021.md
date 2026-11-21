# Seahorse proposed correction patch — October 21, 2026

Review proposal only: no runtime file, manifest, permission or approval flag is changed by this document. Read with [evidence review](SEAHORSE_CONTENT_REVIEW_20261021.md). Applying an approved proposal changes runtime bytes and requires a new acceptance candidate; do not reuse the fixed candidate's acceptance identity.

## Proposed exact text replacements

If accepted, replace the corresponding paragraph in `src/apps/big-bellied-seahorse/index.html` **and** the matching section `text` in `manifest.json`. Preserve permanent app/section IDs, navigation and dependency contracts. References below are proposed source links, not a grant of editorial approval.

| Section ID | Proposed exact replacement text | Reviewer choice / evidence |
| --- | --- | --- |
| Overview | Big-bellied seahorses (Hippocampus abdominalis) are among the largest seahorses. Published size measurements distinguish total length from height. | Removes unsupported average and avoids an ambiguous maximum. Reviewer may instead explicitly approve “up to 35 cm in total length” from R1/R2; do not describe that as height. |
| Habitat-and-range | HOLD — retain pending review; no final replacement proposed. | Choose the taxonomic treatment first: R1 includes southern Australian populations under H. abdominalis; R3 distinguishes H. bleekeri and gives H. abdominalis a narrower Australian range. Reviewer must select and cite a treatment before approving range wording. Do not combine incompatible treatments silently. |
| Feeding | Big-bellied seahorses feed on small crustaceans, including amphipods and mysid shrimps. Seahorses capture prey using a rapid upward movement of the head followed by suction through the snout. | R4 supports species diet; R5 includes this species in feeding observations. No fastest-feeding or slowest-swimming superlative. |
| Male-pregnancy | During reproduction, the female transfers eggs into the male's brood pouch. The male broods the developing young until birth. | Conservative core claim from R1; removes exact gestation and brood counts. Reviewer may separately approve an approximate duration with the original cited study and conditions. |
| Young-and-life-cycle | Young big-bellied seahorses have a pelagic stage before settling into bottom-associated habitats. They can grip floating debris with their tails. | R1 supports this sequence. Removes the unqualified independence statement and does not equate all debris with seaweed. |
| Armor-and-camouflage | Seahorses have bony plates and a grasping tail. Big-bellied seahorses vary in color and pattern, and can hold onto structures in their habitat with their tails. | R1 supports color variation and attachment; anatomical plate statement requires designated reviewer confirmation. Removes a causal protective claim and unqualified communication claim. |
| Conservation | Seahorses are included in CITES Appendix II, which regulates international trade. | R6 supports listing. Defer a current IUCN label until the dated species assessment is retained and checked; R7 supports the historical post-2017 Least Concern change but does not certify current status. |
| Aquarium-history | HOLD — obtain Aquarium editorial confirmation of the dated exhibit history and Ocean in Motion description before approving this section. | No replacement factual assertion proposed. If unavailable, reviewer may approve omission of this section's prose in the eventual runtime patch while preserving the stable section ID. |
| Guide-talking-points | Why does the male have a pouch? It holds the developing young. Why the curled tail? It helps the seahorse grip structures in its habitat. | R1 supports both. Removes the broad unsourced “other animals” extension. A reviewer may add a specifically sourced pipefish example separately. |
| References | See the linked species accounts and research listed below. Taxonomic treatments can differ; range statements must follow the treatment selected in the scientific review. | Replace generic suggested organizations with R1–R6 as links; keep R7 explicitly historical if included. Add the original October 8–14 update only when its exact reference is available. |

The HOLD rows are reviewer instructions, **not** text to paste into the public app. The developer-draft notice remains until an appropriate release decision is recorded. Do not mark any section approved simply because conservative wording is proposed.

## Proposed handling of all five images

Recommended review choice: omit all five unlicensed illustrations from any newly built public review candidate until exact rights are established. Preserve original source files as evidence; remove their six HTML figure usages (IMG_4216 appears twice), and remove only these five paths from this app's `offline_assets` if no longer needed by this app. Check other app references before any asset deletion; this proposal does not authorize deletion. Do not change the fixed acceptance artifact or hosted content silently.

| Image | Proposed treatment pending rights | Alternative the reviewer may approve with evidence |
| --- | --- | --- |
| IMG_4212.jpeg | Omit anatomy illustration; the proposed paragraph supplies a limited text account. | Retain exact image only after creator/source and reuse scope are recorded, anatomical labels reviewed, and meaningful caption/alt supplied. |
| IMG_4213.jpeg | Omit ten-point infographic, including its embedded speed superlatives. | Retain only after rights plus scientific review of every embedded claim. Editing/cropping also needs applicable permission; do not remove a credit/watermark. |
| IMG_4214.jpeg | Omit fovea diagram; it currently lacks a verified species-specific explanatory context. | Retain only with source paper/figure rights and an approved explanation of relevance and limitations. |
| IMG_4215.jpeg | Omit composite anatomy comparison. | Retain with creator/license scope covering the composite and components, labels reviewed, and generic seahorse scope explicit. Logos do not establish permission. |
| IMG_4216.jpeg | Omit hero and duplicate reproduction figure. | Retain with creator permission and a reviewed caption explaining generic-species scope; independently verify embedded egg/gestation/birth numbers. The prose's conservative wording cannot neutralize contradictory image claims. |

After the reviewer selects image treatment, register retained images in the centralized catalog with exact creator, source, permission scope, alt/caption and offline intent through the normal workflow. Do not assign inherited V1 permission to this new material without evidence. A text-only treatment avoids a need to invent substitute images.

## Exact reference candidates

- **R1:** Bray, D.J. & Thompson, V.J. (2018), *Hippocampus abdominalis*, Fishes of Australia. https://fishesofaustralia.net.au/Home/species/3332 — retrieved October 21, 2026. Museum-authored reference account; its 2008 IUCN statement is dated and must not be copied as current status.
- **R2:** Museums Victoria, *Hippocampus abdominalis Lesson, 1827, Bigbelly Seahorse*. https://collections.museumsvictoria.com.au/species/8329 — retrieved October 21, 2026.
- **R3:** Australian Museum, *Bigbelly Seahorse, Hippocampus abdominalis Lesson, 1827*. https://australian.museum/learn/animals/fishes/bigbelly-seahorse-hippocampus-abdominalis/ — retrieved October 21, 2026. Read alongside its separate potbelly account: https://australian.museum/learn/animals/fishes/potbelly-seahorse-hippocampus-bleekeri-fowler-1908/ . The disagreement remains unresolved here.
- **R4:** Woods, C.M.C. (2002), *Natural diet of the seahorse Hippocampus abdominalis*. New Zealand Journal of Marine and Freshwater Research 36(3):655–660. https://doi.org/10.1080/00288330.2002.9517121 — primary dietary study, retrieved October 21, 2026.
- **R5:** Van Wassenbergh et al. (2011), *An adaptive explanation for the horse-like shape of seahorses*. Nature Communications 2:164. https://doi.org/10.1038/ncomms1168 (https://www.nature.com/articles/ncomms1168) — primary feeding study, retrieved October 21, 2026; supplemental observations include H. abdominalis.
- **R6:** CITES Secretariat, *Appendices*. https://cites.org/eng/app/appendices.php — retrieved October 21, 2026. Retain the applicable dated listing/export at final scientific review.
- **R7:** Project Seahorse (November 29, 2018), *Two Big-bellies and one Short-head in Australia*. https://projectseahorse.org/two-big-bellies-and-one-short-head-in-australia/ — retrieved October 21, 2026. Historical evidence of Least Concern after 2017; direct current IUCN assessment still required for a current label.

## Decision record to complete

Scientific reviewer/date: NOT RECORDED. Selected taxonomy/range treatment: NOT RECORDED. Accepted text rows and exceptions: NOT RECORDED. Aquarium editorial confirmation: NOT RECORDED. Image treatment and rights evidence per file: NOT RECORDED. Owner/editorial signoff scope: NOT RECORDED. Implementation commit/new runtime release IDs and acceptance results: NOT CREATED.
