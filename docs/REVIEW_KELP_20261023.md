# Kelp Forest full-scope inherited review — October 23, 2026

Reviewed integration baseline `390d1507502a5915431e84cdc58d820b7917933f`; pinned read-only MBA-hub source `5c219508d23255080f6b050cefa8092905447d81`, prefix `apps/kelp-forest/`. This is source/model engineering review and carries no new scientific, image, device or release approval.

## Complete file scope

All five current app-local files were inventoried and their complete pinned/current diffs inspected. No symlink or extra app-local file was present.

| File | Pinned SHA-256 | Reviewed current SHA-256 |
| --- | --- | --- |
| app.js | a5c3f72711bd3fedb1135d199a3d997f41193257d236c1747287059325a33cb8 | fc02c6117b3002bdd4f407c2d88f965e31929af92de987829214d89d11f70fbe |
| data.js | fa85b531d17c7f4d046a7a812e2460a14bd010ef774e227f4b8ac4098f48872e | f0b6a0b50027b0fa127d9305ca00ddf2b04ef6027528db926c3d64dee1846d88 |
| index.html | 66bc710da1e33de2afe32564abcb90acd7c51ca791d3d3a0b929b508ba473afc | a5ed0ecc5de1d4bdb9b44b780ce74ac1a54d4ab187b7eb12f6a59b9326ef1d04 |
| styles.css | ac3e31559ac34891a5862e084e69d56be705db0aad9a603398ca6bf2c5c98064 | ac3e31559ac34891a5862e084e69d56be705db0aad9a603398ca6bf2c5c98064 |
| manifest.json | 25c82dfe9fb9a2ea2bc279e6fe4e7b9a0a0fcb644f037025f8e958b3b0f66ecd | e24f4cf23a100a0197a9e6f33eb876c8eb98ac6acb3b232960dd853f0bf25174 |

The old manifest was standalone PWA installation metadata. The current manifest is the Hub app registration: unchanged permanent app identity/title and whole-app section `Kelp-Forest`, explicit navigation dependency, complete app/media offline inventory, two central media IDs and no knowledge/cross-link declarations. Existing `testing`, unlisted and publication-review-pending flags remain unchanged. Original README/changelog/registry snippets, install worker and unused exhibit image are upstream packaging/support files, not imported executable content. The active hero is the pinned hero photograph.

## Reviewed behavior and content

The sole data edit remaps `images/kelp-forest-hero.jpg` to central media. Executing both full datasets and reversing that one remap produces exact deep equality. All 110 non-URL source strings occur in the current whole-app search text after decoding serialized Unicode/newline escapes; the current whole-app target matches the explicit header anchor. No claims were rewritten.

The complete stylesheet is exact pinned bytes. HTML changes are serialization, central icon mapping, removal of standalone install manifest, addition of the whole-app header anchor and shared app-contract module, and explicit hiding/disabling of obsolete maintenance controls. The existing inline close helper is identical and only hides its already-hidden troubleshooting panel. The original Hub-return URL, section jump, search input, headings, header, body container and footer are retained.

The executable migration changes unsafe markup assignment to literal DOM creation. Reviewed output preserves eight Quick Facts, Kids Fact, full three-paragraph Story, seven main-content cards, ten visitor Q&A cards, nine Guide Notes, twelve tags, four related-item cards, three references, version/date, notification, hero image/alt/caption and six troubleshooting FAQ cards. Ten dropdown IDs/order and first-three-open defaults match the source. The Story paragraph split is the previously recovered fix; no source prose is removed. Related-item URLs are all the original `#` placeholders; the safe URL helper restricts future resolved URLs to HTTP(S). Hero URL resolves inside the current app's declared central media path.

`setupJump` and `setupSearch` are unchanged: jump opens and scrolls the selected dropdown then clears the select; local search hides nonmatching sections and opens matching ones. Empty search restores visibility without imposing a new collapse state. The old app-local troubleshooting/cache/worker setup and broad cache deletion are inert by design under central Hub offline ownership. Old maintenance prose and the historical notification remain inherited text; their physical Hub usability and any future wording changes remain separate review scope. Uncalled markup helper definitions are not extra active UI.

## Executed checks and limits

Independently read pinned Git blobs and compared both displayed assets byte for byte: icon 473 bytes, SHA-256 `5a78a8d75c9a61743456a2a01340aed1099b0a357a0a38cd976116b20e8793d4`; hero 167335 bytes, SHA-256 `3805cae5eba70cef0fb30a048f013b96849608d48c95cf7968b1bb31c80a3d90`. PASS. Dataset equality after the one media remap and complete 110-string search coverage PASS.

`node --test tests/recovered-fidelity-fixes.test.mjs tests/dynamic-reference-search.test.mjs`: 8/8 PASS, zero failed/skipped, including actual active Kelp Story paragraph reproduction and whole-app anchors. Retained static/render evidence was inspected, including all ten dropdowns, hero, notification and FAQ; the new portable audit must freshly reproduce and bind complete current bytes before reconciliation. This app-specific review does not relabel retained evidence as fresh execution.

No new fidelity defect was established and no app source or approval flag was changed. Complete current-byte binding and portable renderer reproduction remain the integration task. Lightweight DOM execution does not establish real browser layout, assistive technology, physical offline installation/update/rollback, current factual accuracy, privacy acceptance or owner/reviewer authorization.
