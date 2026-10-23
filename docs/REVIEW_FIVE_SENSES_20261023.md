# Five Senses complete scope recheck — October 23, 2026

Reviewed integration baseline `390d1507502a5915431e84cdc58d820b7917933f` against read-only pinned MBA-hub `5c219508d23255080f6b050cefa8092905447d81`. This supplements the retained dynamic-reference static/render reports and DYNAMIC_REFERENCE_SEARCH_20261022.md. No app source or review flag changed in this recheck.

## Full app-local byte inventory

Every file in `src/apps/five-senses-pwa` was inventoried; the directory contains exactly these six regular files. Source manifests are standalone web-app metadata and current manifests are Hub registration contracts, so equality is neither assumed nor expected.

| File | Pinned SHA-256 | Current SHA-256 |
| --- | --- | --- |
| app.js | `93354781794d775885590e119eb42eb34babdc28f22b1373d942b20b49e9b6c7` | `ff2477d75b25c6ca4a22457b1166702dbbec91359690a241c72dfcf3a24f44dd` |
| apps.js | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| data.js | `31e10022be5d88c3273306aebacf6c81375352ddb1911daa6827ea5c609f800b` | `31e10022be5d88c3273306aebacf6c81375352ddb1911daa6827ea5c609f800b` |
| index.html | `47685c354871589b67a66aaf385385434374ee0de8adf13e164f88e35cdb31f1` | `b4789f227aba2b9046c0b23ec9e50031cac2a4944c391be3b869c137cc29ddc0` |
| manifest.json | `d508da2908a426aa64d9c7608286a8e577fcb046e14b3b00f2395a9ed2d2434e` | `4618a8baf6dda4f7fe87ac39e176db3ef65966f8bff59e7d7c13ef33a7bfc4d5` |
| styles.css | `5584ed35f4d34ff97e45d5a01dae9e8a3141977f1bb607fc6f495fa0d378aac2` | `5584ed35f4d34ff97e45d5a01dae9e8a3141977f1bb607fc6f495fa0d378aac2` |

## Reviewed differences and complete content scope

The complete data.js and styles.css are exact pinned bytes; apps.js is an identical empty file and is not loaded by either HTML document. All four authored sense cards (Touch, Hearing, Smell, Taste), three guide sections and seven references remain. The title's reference to five senses, the absence of a dedicated Sight card, and the displayed v1.1 versus dataset v1.2 are inherited source characteristics, not new interpretations introduced by V2.

The full app.js diff consists of the added renderMarkup function, substitution of its DOMParser/imported-node output for three innerHTML assignments, and neutralization of the old standalone cache clearing and worker registration. All original markup templates, escapeHtml calls, card order, data-search JSON, labels, icons, summaries, content containers, lists, quote/safety/chip structures, tags and closed initial details state are preserved. The helper removes executable elements/event attributes and javascript URL attributes. Current authored data is escaped text; no authored HTML link is removed by that transformation. The filter, reset, expand/collapse and troubleshooting functions/event bindings are unchanged, but neither pinned nor current HTML contains their optional control IDs. No active app-local search, modal or cache button was removed from this source UI. Native details disclosure remains the active interaction.

Complete HTML diff inspection found serialization/self-closing syntax changes, comment removal, standalone manifest-link removal, icon/header URL changes, a Sources-and-Notes ID addition, the shared app-contract module, and the common maintenance CSS. All authored static text, alt text, classes, intro emphasis, main landmark, skip link, Hub link, headings, footer and data/app script order remain. The stylesheet is unchanged, including responsive breakpoint, focus styles, touch sizes, native details and open-chevron styling. This source comparison does not establish actual rendered browser layout or assistive-technology acceptance.

The header asset is byte-identical to pinned `apps/five-senses-pwa/images/header-five-senses-mba.svg` (SHA-256 `25a12b38f3e3cad43fd05b260176f45aed17f5d894ffa1fb57f16b049595be6a`). Pinned HTML referenced absent app-local `icon.svg`; the migrated shared icon exactly matches pinned root `icon.svg` (SHA-256 `3b65e654f48dae5f4ba94d1f9e426ffe1449a6657d27ad57a50402bea8cd5bc4`). This is an install-icon repair, not a claim of app-local source identity or new image permission. There are no dynamic image URLs in this dataset and no new authored external links. The original Hub route and skip destination remain valid under shared navigation.

The entire current manifest was reviewed: app/category/entry identity, navigation interface dependency, seven offline resources, two media references, no shared knowledge/cross-links, three heading targets, Sources-and-Notes, four sense targets and three guide targets. Source repository/commit/version are retained and status testing/publication pending remain unchanged. The current manifest indexes all seven source reference notes at the existing Sources-and-Notes target. Shared app-contract assigns absent sense/guide IDs to their matching summary parent after rendering; this preserves manifest destinations without changing the authored app templates. The standalone PWA manifest/cache lifecycle is superseded by Hub build/worker ownership.

Executed `node --test tests/dynamic-reference-search.test.mjs tests/recovered-fidelity-fixes.test.mjs`: 8/8 PASS, zero failed/skipped, covering full source reference indexing and the actual renderMarkup dangerous-attribute behavior alongside related inherited regressions. Byte comparisons independently verified the complete data/styles/empty apps.js and both migrated media resources against pinned objects.

No newly established runtime defect requires an app-source edit. The retained literal DOM reports alone still require the separate portable full-file/manifest binding and full renderer reproduction requested for this batch. That executable reproduction must succeed before adding a reconciliation record. Existing V1 distribution authority is separate from current scientific claims, new image permissions, browser/device offline/update/rollback, privacy, reviewer pilot and release authorization; none is granted here.
