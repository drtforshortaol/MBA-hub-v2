# Whale Parasites & Associates next fidelity scope — October 23, 2026

Read-only preliminary review at integration e77cdd635df2112e183cc3442b26b4df5d58e206 against MBA-hub pin 5c219508d23255080f6b050cefa8092905447d81, apps/whale-parasites-associates/. No inherited reconciliation or approval is added by this note.

| File | Pinned SHA-256 | Current SHA-256 |
| --- | --- | --- |
| app.js | b8d535e35a682d8ce99d4cff2d7cd70c771257ba21c3f9f833afdbda917d6fc4 | d069c8f85db80697d8f649ab4ce429ee3d4fd03b64a75351c699874531811d5f |
| data.js | eba6c75c2e079c0b04df1634b324489113f2ee8e790a0f23d2a0ab3accfa2954 | eba6c75c2e079c0b04df1634b324489113f2ee8e790a0f23d2a0ab3accfa2954 |
| index.html | ac7e2728b8bdac5d31c892c7dee333e6a8a3db7855a0be5086f234031f9ff9d6 | f04e8ed22ac8f63aee8b248fcafb506b0a58cb30b1f5deb203cdbd0b69c89ed5 |
| manifest.json | 2da62fa301e036a895293fcc93ad85a1930bd9c879a48d37f60228144ec2fc49 | 8b49ff2f0d44dd893094ed1e95590eadf111d971958f375be87241afe2fdef77 |
| styles.css | 334352605e15c2a06101069a7663860cfe8842398846eab55c69c41d6a7d6383 | 334352605e15c2a06101069a7663860cfe8842398846eab55c69c41d6a7d6383 |

Complete app.js and HTML diffs were inspected. The seven-record/five-filter dataset and complete stylesheet are exact pinned bytes. Executable changes only route the same escaped filter/card markup through DOMParser/replaceChildren and make old standalone troubleshooting/cache-update/worker routines inert. All original card-template fields remain: name, scientific name, icon/background, tag/class, category/search data, paragraphs, hosts title/chips, harm label/dots/warn attributes and facts. buildJumpMenu/setupSearch/applyCardVisibility and filter event binding are unchanged.

Static HTML replaces standalone maintenance controls with hidden/disabled elements, removes the standalone manifest and network font/preconnect links, adds two permanent section anchors and the shared navigation module, and removes old root apps.js/hub-links.js script references. The pinned root hub-links.js object is absent (hub-links1.js exists under a different name), so no functioning old related-topic renderer can be inferred from the dangling source reference alone. The optional window.renderRelatedHubTopics call remains conditional in both scripts; any claim about related links needs explicit source-function and active loading evidence. Existing typography fallback and Hub navigation substitution require source/model review and eventual physical layout acceptance rather than an invented exact online font claim.

The current manifest has nine destinations: two static headings and all seven original record IDs, four offline app files, no media, no knowledge/cross-link declarations and unchanged testing/publication-pending status. No photographs are bundled by this app. Existing unchanged dataset use in Whale Associated Organisms does not prove this separate app's filter/card/visibility renderer fidelity.

Next required executable evidence: complete app inventory/manifest hash guards and pinned inventory; normalized complete static DOM with only enumerated manifest/font/maintenance/anchor/navigation substitutions; actual old/current seven-card and five-filter output comparison after independent parsing, preserving inline icon backgrounds, harm-dot classes/ARIA, chips and facts; jump-menu contents and original selection behavior; every filter/search/result-count combination and shared deep-link reveal of initially hidden cards; manifest source-derived complete search text/IDs; fail-closed mutations of executable/card/filter/manifest/inventory bytes and symlinks. The escaped markup must be parsed as a tree rather than compared only as a DATA object or flattened body string.

No new scientific interpretation, authored-content edit, media permission, device/browser/privacy acceptance or release authority is supplied by this preliminary gap inventory.
