# Naturalist owner-source reconciliation — October 29, 2026

The owner supplied the October 8–14 update in the current conversation. This resolves the earlier inability to inspect the source text. It does not supply original email headers, attached image bytes, creator permissions or blanket scientific/editorial approval. Existing approved Q&A presentation remains settled.

## Verified source transcription

The source's 38 Bay Watch rows map to all 39 current structured entries. The combined long-beaked/short-beaked common-dolphin row intentionally produces two species entries. All named orca groups and all source bird names are preserved in the active data; no species from the previous October 1–7 update is imported. The smaller standalone page remains a grouped summary, not the authoritative species inventory.

The selected exact source excerpts, complete Bay Watch rows, all 16 supplied scientific reference URLs and attachment filenames are retained in `docs/verification/naturalist-october-owner-source-20261029.json`. This is explicitly a selected-source receipt, not a complete email/attachment archive. The source URLs are preserved as supplied, not newly certified here.

## Routine source-fidelity corrections applied

- The pasted date line establishes the October 8–14 observation period but does not establish the source email's publication date. The structured display now says **October 8–14, 2026 (Bay Watch period)**, using the existing project-year context. The permanent ID/query `2026-10-15-seahorse` is retained; it no longer purports to prove an October 15 email timestamp.
- Restored the omitted historical Big Sur gray-whale observation in both the structured issue and standalone summary. It preserves the source's relative March/two-years-earlier timing without inventing an exact calendar date, and expressly excludes it from current Bay Watch sightings.
- Added the historical context to central search metadata. No substitute photograph or new source identity is invented.
- Naturalist application version advances from `2.0.0-alpha.6` to `2.0.0-alpha.7`; no Hub platform or deployed build changes.

Original `data.js` (24 notes), app renderer, stylesheet, original media and permanent links remain unchanged. The original-scope auditor now binds the new manifest/addition bytes; this technical baseline update is not a content approval. The current-runtime report was regenerated for the revised source files.

## Missing photograph and media identity

The source refers to **five** Naturalist media items: `5.JPG` (ancient murrelets), `15.JPG` (rhinoceros auklets), `22.JPG` (fork-tailed storm-petrel), **`MZD_5048.JPG`** (historical Big Sur gray whale), and `image.png` (ephyra). The active issue has four photo references, `IMG_4207.jpeg`–`IMG_4210.jpeg`.

The three bird captions and ephyra subject correspond, but filenames/captions alone do not establish byte identity. No exact `MZD_5048.JPG` filename, explicit mapping, current/history path, or pinned-inventory entry was found. A renamed duplicate has not been visually identified. Do not substitute an unrelated gray-whale picture. The owner must supply that original image or an exact mapping before its image placement can be completed. Attachment identity, creator attribution and reuse permission are separate checks.

## Scientific/editorial distinctions retained

- The source does contain the ephyra lappet/feeding-color explanation. Its provenance is now established; independent biology review and the exact conservative proposal in `NATURALIST_PRIMARY_EVIDENCE_FOLLOWUP_20261029.md` remain separate. No new jelly wording is silently applied.
- The source recalls a 2008 Splash Zone renovation and gives 2008 for The Secret Lives of Seahorses. The latter conflicts with the Aquarium timeline's April 2009 opening. Neither current Naturalist file states Secret Lives opened in 2008. Record the source discrepancy; do not insert it as confirmed history or overwrite the approved species guide.
- The source's 24–30-day gestation differs from the approved guide's qualified 28–34-day species-account range. The active Naturalist highlight has no numeric gestation claim. These are attributed account differences, not a reason to silently change the approved guide.
- Seasonal trends, hydrophone identification and orca-movement explanations remain dated reports with uncertainty. Source transcription is not independent confirmation of whale identity or migration causality.

## Executable checks and remaining scope

`node scripts/migration/review-naturalist-owner-source.mjs` binds the source receipt and checks the complete species/pod inventory, stable issue route, observation-period display and historical context. It reports five expected source photo items/four current references and the unresolved filename without granting approval. Mutation tests reject missing species, a previous-week species, changed pod IDs, invented email dates, lost historical context and substitute photographs.

Receipt: `docs/verification/naturalist-october-source-reconciliation-20261029.json`. Existing full-current October runtime and original-source fidelity checks remain required. Original source text is now available; the missing gray-whale image, attachment identity, scoped new-content disposition, image rights and physical/release checks still prevent blanket completion. No permission/publication flags, protected repositories or deployment changed.

Validation: **19 focused checks** and the full **1,022-test suite** passed, with zero failures/cancellations/skips on the completed runs. The first overlapping broad run encountered an existing 3-second VM timing limit under CPU contention; rerunning the unchanged suite alone passed, without weakening the timeout or assertions. Build, security scan, content preflight, built-artifact verification and diff check passed. Independent read-only review found no blocking source-reconciliation error. The new source auditor checks the structured note and manifest, not the standalone grouped summary or full email; that scope is not expanded by the pass count.
