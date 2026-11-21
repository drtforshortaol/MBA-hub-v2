# Three dynamic inherited-content fidelity reviews — October 22, 2026

Engineering comparison against pinned V1 Git objects supports unchanged inherited CONTENT reconciliation for Information Center, Aquarium Library Explorer and MMC Narrations. Source approval flags and independent scientific/image/device/release gates remain unchanged. Existing owner authority is recorded in GUIDE_CONTENT_RESTORED.md; this report does not grant new approval.

Reproduce from any checkout location:

    node scripts/migration/audit-dynamic-inherited-fidelity.mjs --sources-dir PATH --output docs/verification/dynamic-inherited-three-20261022.json
    node --test tests/information-center-search.test.mjs tests/library-wishlist-navigation.test.mjs tests/recovered-fidelity-fixes.test.mjs

PATH contains read-only pinned clones named fidelity-MBA-hub and fidelity-aquarium-shift-library-. The helper derives the current root from its own path and refuses stale reviewed executable/data/markup/style/manifest hashes or changed app-local file sets. Exact pinned/current hashes and complete authored-field comparisons are in the machine-readable report. All complete source/current diffs were inspected, including executable code and styles, rather than inferring approval from dataset equality.

## Information Center

Pinned MBA-hub source 5c219508d23255080f6b050cefa8092905447d81. Complete data.js and styles.css exactly equal pinned bytes. Dataset contains all 18 sections and 47 blocks. All text fields in all blocks (including quick-reference labels, values, notes) occur in corresponding manifest sections at actual card IDs. The title/headings, body labels, list/numbered/alert-list contents, quick-reference layout, emergency classes and closed/open-state classes survive the safe DOM rewrite.

The render-equivalence script executes pinned renderSection and current appendSection for each of the 18 source sections; Python HTMLParser independently canonicalizes their complete structural element/class/text stream. All 18 match after ignoring only added phone anchor wrappers. Telephone labels remain source text; the added tel action is engineering behavior, tested separately by existing telephone coverage. No scientific claim or operational instruction was edited. The original search/toggle/header-keyboard machinery remains; newly safe rendering replaces innerHTML. App-local cache clearing and registration are disabled in favor of central offline control; notice dismissal receives an environment-scoped key. The complete executable changes are enumerated here. Index HTML text is unchanged; icon relocated to verified equal pinned bytes; manifest metadata replaced by central platform registration and injected shared app contract/maintenance style.

Defensible unchanged-V1 CONTENT candidate, with explicit technical interaction differences above. Physical layout, telephone handoff and device offline acceptance remain separate.

## Aquarium Library Explorer

Pinned aquarium-shift-library- source 9438060bd836c46245e4af45c280e4bb37b0ab94. Complete library-data.js exactly equals pinned bytes, all 95 records, 78 holdings and 17 Wishlist entries. Every record's title, author, owner, description, borrowed field and tags are preserved in global search. The original inline style block is byte-identical. Library icon relocation is exact pinned image bytes. Hub URL is localized; app-local SW replaced by central contract.

Complete inline renderer diffs show safe DOM node construction preserving original native details/summary/class hierarchy and all label/value fields. render-equivalence executes both original and current scripts and compares Python-parsed structural element/class/text streams for the entire default 78-book view and entire 17-book Wishlist view; both equal. Count strings equal. Added hidden select supplies saved filter view, not new book content. Only valid source Wishlist title/ID pairs activate the entry query and exact summary target. Existing library regression tests exercise all 17 entry URLs, defaults/malformed values, saved filters/open state and generated index links. The source esc helper is retained but no longer used for construction; no operational/personal metadata removed or changed. The complete diff is scoped to the changes enumerated here.

Defensible unchanged-V1 CONTENT candidate with documented engineering query/Back changes. No duplicate owner approval is needed for identical personal fields already authorized by GUIDE_CONTENT_RESTORED. Final privacy verification remains a separate gate.

## MMC Narrations

Pinned MBA-hub source 5c219508d23255080f6b050cefa8092905447d81. Complete data.js, empty apps.js and styles.css exactly match pinned bytes. Seven narration sections and three references preserved. Every authored title/category/summary/body paragraph/prompt/tag appears in its global section; complete source reference labels/notes are indexed. Complete active renderer diff is limited to two innerHTML-empty clears replaced by replaceChildren and disabled local SW registration. No content-rendering function changes. Executing pinned and current complete app.js against the same dataset produces identical complete serialized DOM trees (including all class names, attributes, data search text, text and structure).

Index static text unchanged; icon relocation matches source bytes, centralized app registration replaces empty original manifest and injects shared contract. Core app-contract assignSectionIDs resolves each manifest section title to native details/summary, then shared navigator opens containing details. Existing full HTTP/offline navigation evidence remains required to establish generated target coverage; this task does not claim fresh browser layout. No new illustrations or content.

Defensible unchanged-V1 CONTENT candidate. Do not reinterpret inherited scientific wording as newly approved science; previously approved claims carry only their existing owner authority.

## Verification and limits

Portable helper PASS: all three complete datasets, all CSS, all three media bytes, all manifest authored-text fields; MMC complete rendered tree equality. Its independent rendering comparison PASS: IC18 structural/text comparisons and Library all95 cards across both views. Existing relevant regressions 13/13 PASS. The JSON records all reviewed current-file hashes, pinned source hashes and complete rendering outcomes. The helper is read-only apart from an explicit requested report output.

Not physical/browser layout acceptance, no device claim, no new content/image approval. This evidence supports only unchanged inherited CONTENT reconciliation, not final deployment authorization or whole-app technical acceptance. Operational gates and October/Seahorse review remain pending.
