# Migration fidelity normalization correction — October 21, 2026

The earlier audit conservatively reported 10 of 11 external datasets equal after image URL normalization. The Kelp Forest mismatch was an audit false negative. Its only actual dataset change is the independently byte-verified hero-image URL migration; its prose, numerical claims and other dataset bytes are unchanged.

The old normalizer replaced image URL substrings anywhere in source text. That also transformed the unchanged Kelp Forest `detail` text containing `Hero image file: images/kelp-forest-hero.jpg.` in the pinned source, while the current detail still contained the original filename. This asymmetry caused the mismatch. The detail is displayed prose, not a comment, and must remain fully compared.

The corrected normalizer replaces complete quoted URL values only. It preserves longer prose strings and comments containing filenames. A replacement is recorded only when a matching current media URL exists and the current image bytes match the independently read pinned Git object. Whole-file comparison still retains all other bytes. This is a narrowly bounded text comparison, not a JavaScript parser, a scientific review, or proof of rendered behavior.

## Verification

A fresh read-only audit from Track D base `12afc20`, using the three exact source commits recorded in `config/migration-provenance.json`, yields:

| Check | Result |
| --- | --- |
| External datasets equal after verified image URL normalization | 11/11 PASS |
| Kelp Forest hero-image pinned/current SHA-256 | `3805cae5eba70cef0fb30a048f013b96849608d48c95cf7968b1bb31c80a3d90` |
| Migrated app inventory | 32 |
| Catalog images/media with exact pinned bytes | 202/203; one remains without complete provenance |
| Catalog media differences | 0 |
| Static HTML text equality | 33/34; remaining difference is the recorded sperm-whale navigation label |
| Fidelity regression suite | 3/3 PASS |

Reproduce with `python3 scripts/migration/test-fidelity-audit.py` and `python3 scripts/audit-migration-fidelity.py --sources-dir PATH`. PATH contains read-only clones as documented by the audit script. The full audit emits JSON to stdout. The previous committed evidence remains a dated record; this correction explains its Kelp Forest false negative without rewriting provenance or upstream files.

The new regression covers the Kelp-shaped case with an unchanged filename embedded in a longer prose field and a comment. It also verifies that changed prose, numerical claims, comments or image bytes fail equality. Existing regression coverage confirms exact pinned-commit reads even when upstream HEAD and its worktree change. The combined iPhone review workflow now runs this Python suite so these checks cannot silently be omitted from the combined build.

No app source, image bytes, approval metadata, source provenance or release gate was changed. The separately unestablished Naturalist additions, inline/differently named data files, scientific/editorial decisions, rendered content fidelity and physical-device acceptance remain outside this 11-dataset result. No inherited approval is granted merely because a dataset comparison passes.
