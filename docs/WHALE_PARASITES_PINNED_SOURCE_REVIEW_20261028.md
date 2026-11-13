# Whale Parasites & Associates — pinned-source parity review (October 28, 2026)

Read-only comparison of current V2 `src/apps/whale-parasites-associates/{app.js,index.html,manifest.json}` against V1 production source at immutable commit `drtforshortaol/MBA-hub@5c219508d23255080f6b050cefa8092905447d81`, paths `apps/whale-parasites-associates/`. Production was not modified.

## Findings
- The original seven records and five filter options are preserved in the exact-byte `data.js` according to `WHALE_PARASITES_SCOPE_GAPS_20261023.md`; this review fetched and inspected the source and current application renderer, not a full independent local byte test.
- The V1 renderer builds filter tabs and cards using `innerHTML`. V2 replaces those containers with DOMParser-built nodes using identical authored templates, escapeHTML calls, class names, datasets and card properties. This is an intentional DOM security adaptation, **not yet a proved browser-DOM tree equivalence**.
- Search normalization, filter matching, dataset-hidden visibility, numeric result-counter wording, filter buttons' ARIA state and card content templates are preserved at a code-inspection level.
- V2 refactors its jump-menu reveal to `revealParasiteCard` and adds an `mba:reveal-section` handler for integrated deep-link reveal. On reveal it now updates visible-item count; V1 did not. Verify that counter and active-filter behavior physically.
- V1 contains standalone cache-clear and service-worker registration; V2 deliberately makes them no-ops and hides corresponding controls, deferring lifecycle ownership to the Hub. This is an intentional architecture change, not exact V1 behavior.
- V2 removes legacy external font requests, standalone manifest and uncertain legacy hub-links script references; adds shared app-contract navigation and permanent section targets. Textual content in static page remains visually reviewable with substitutions.
- V2 manifest includes seven parasite IDs plus Fast-field-cues and References. Media/knowledge/cross-links are empty. **Do not infer that the old related-topic renderer ever successfully loaded:** its V1 HTML refers to a missing `hub-links.js` path per earlier audit.

## Remaining evidence before inherited fidelity reconciliation
1. Independently parse complete original/current HTML and generated filter/card **trees** (not just flattened text).
2. Compare all 7 card structures and all 5 filter buttons including class attributes, inline colors, harm dots, ARIA, host chips, paragraphs, fact rows and unique IDs.
3. Replay all filters, search combinations, jump-menu selection, deep links, hidden-card reveal and counter behavior using executable source/current renderers.
4. Bind V1 pin, V2 complete app files, manifest, source dataset, relevant shared dependency and any assets to reproducible immutable hashes; fail closed on mutations and symlinked resources.
5. Confirm visually on the iPhone, especially typography changes, focus behavior and navigation.

## Disposition
**Engineering inspection supports an expected equivalent-content migration but does not yet establish full fidelity.** Keep its inherited approval reconciliation pending until those five evidence steps pass. Do not alter content, images, manifest, publication status or protected/tester repositories on the basis of this preliminary check.
