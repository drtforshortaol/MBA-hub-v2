# Naturalist original-source runtime scope — October 23, 2026

This packet separates preserved original Field Notes from current presentation changes and new October additions. It grants no whole-app inheritance or scientific/editorial/image approval.

Source is read-only `drtforshortaol/MBA-hub` at `5c219508d23255080f6b050cefa8092905447d81`, `apps/naturalist-field-notes/`. The portable fixture contains all nine complete original text files and canonical Git blob IDs, the complete 122-entry original directory inventory, and source metadata for externally referenced photographs. No original photographs are redownloaded: each current centralized photo's entire bytes are hashed as a Git blob and compared with the independently retrieved pinned source metadata. Fixture metadata is itself byte-bound by the auditor.

The current `data.js` contains exactly the original 24 notes, 38 Q&A entries and eight resource labels. After reversing only the 118 independently identified media relocations, **the entire executable data file** equals the original source bytes. The shared images plus standalone Steve Webster hero have exact original Git blob identity and registered offline/media declarations. Original CSS is exact. The three complete HTML documents match after enumerated Hub maintenance/manifest/navigation/anchor substitutions, with the new October script explicitly excluded only from this original-source reproduction.

The tool evaluates actual old and current renderers, including the current DOMParser/sanitizer/replaceChildren path, against independently lxml-parsed complete node trees. It compares every original issue article, its photographs and metadata, latest note, archive, Bay Watch, species directory/guides and resources. Real bound issue buttons and Back handlers are exercised, as are text search, source-derived issue destinations, species-letter filtering/reset and full-script startup for all 24 original `?note=` queries. Native layout, browser parsing details and service-worker lifecycle are outside this structural/event model.

## Known presentation difference — review remains required

A full-tree comparison correctly found that pinned `qaBlock()` presented 38 question/date/tag **index buttons**, while the current block presents **inline disclosure cards** containing the original question, date, answer, photographs, tags and a source-note button. Home embeds that changed block. These are explicit current presentation differences, not normalized away as identical markup and not silently approved.

Each of the 38 current inline cards is compared in full against an independently constructed expected tree using the pinned original Q&A objects and original photo/tag/escape functions. This establishes where the answer/photo/tag content came from, not approval of the presentation change. All complete Home subtrees outside that explicitly isolated Q&A block match the original. The report records `complete_home_equal: false`, a presentation review queue, and `whole_app_inheritance: false`.

## New October material — separate review packet

The original source already contains its October 7 note. The *new* material is `october-2026-note.js`, `october-2026-08-14.html`, the added October 15 query destination, and four photographs `apps/IMG_4207.jpeg`–`IMG_4210.jpeg`. The auditor records their exact current hashes and permissions but does **not** execute the additive script or interpret/approve that new content. Their photograph permissions must remain review-required. On an older isolated Track A catalog where registration dependencies are absent, the packet explicitly records missing registration; the combined checkout must supply the registered pending rows. Missing dependencies are never counted as permission clearance.

## Reproduction and meaningful failure checks

```sh
node scripts/migration/review-naturalist-original-fidelity.mjs --root /path/to/combined
NATURALIST_FIDELITY_ROOT=/path/to/combined node --test tests/naturalist-original-fidelity.test.mjs
```

The current app supports two reviewed technical baselines: the earlier URL-safe sanitizer/canonical-note behavior and the new app-owned contextual-Back restore hook. Runtime hashes distinguish them. The separate actual-app/shared-restore regression owns the restore-hook behavior; this packet binds those complete app bytes and compares original displays without extending that test's claims.

Tests reject new runtime/October bytes, changed complete static-document attributes (including the `html` language), original CSS/data, owning-app symlinks, and independent full-tree mutations to photo attributes, inline answer text/structure and issue observation headings. A bound issue-handler mutation fails actual interaction reproduction. These structural probes deliberately bypass only the current-byte guard to prove that detailed comparisons remain substantive; the CLI always retains its byte guards.

The result is an original-versus-addition completion packet. Presentation review, new content review, image permissions, physical iPhone/browser/offline/privacy acceptance and deployment authorization remain separate. Source and application code, data, styles, media, manifests and approval configurations are unchanged by this audit tooling.
