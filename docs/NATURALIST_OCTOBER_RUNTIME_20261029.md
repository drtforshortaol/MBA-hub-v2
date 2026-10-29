# Naturalist October current-runtime verification — October 29, 2026

Baseline: MBA Hub V2 `c0ddccf0b10dc50b01aba17e917d646946af352c`. This complements the original-source fidelity packet; it does not replace or broaden that packet's inherited-content decision.

The original fidelity audit explicitly excludes execution of `october-2026-note.js`. Existing October tests evaluated the addition against an empty array and checked declarations. The new auditor executes the actual current classic scripts in their HTML order, in one lexical environment: complete base `data.js`, complete October additive script, complete `app.js`. It therefore tests the addition together with the current archive and real startup/bound event handlers, without changing application content or permissions.

Verified behavior:

- Current Home contains 25 unique notes and 41 inline Q&A cards; October supplies the latest destination and seven source-note controls across Home's indexes.
- The bound October issue button sets the correct query route; bound Back restores Home and clears it. Direct query startup independently renders the October article with the checked authored fields.
- All authored October summary tiles, five observations, four image URLs/alt/loading attributes/captions, three visitor Q&A answers, every Bay Watch entry, and the species highlight's scientific name/intro/facts/dedicated guide link survive the actual renderer and sanitizer.
- Three searches (`ephyra`, `CA51As`, `Hippocampus abdominalis`) use the combined current dataset, preserve its expected result order, and can open the October note before clearing back to Home.
- Each October photograph exists with one catalog record, the matching manifest media ID and offline path, and its unchanged `review-required` permission. The manifest's stable October section retains its query destination and publication review remains pending.

The saved report fingerprints all five exercised input files. A regression compares the freshly executed report with that checkpoint. Independent mutations reject a missing additive-script load, lost observation text, removed photograph caption, lost Bay Watch entries and disabled direct-note startup. These probes execute the altered renderer rather than relying solely on byte differences.

Reproduce:

```sh
node scripts/migration/review-naturalist-october-runtime.mjs
node --test tests/naturalist-october-runtime.test.mjs tests/october-seahorse.test.mjs tests/naturalist-contextual-return.test.mjs
```

These checks compare authored fields and bound event behavior, not complete current DOM-tree equivalence. The original-source audit separately owns full original-tree comparisons.

Limitations: the DOM and events use the existing independently lxml-parsed, bounded synchronous model. Native layout/browser parser, accessibility, shared `app-contract.js`, separate October HTML page and service-worker lifecycle are outside this added runtime check. Original data/media provenance remains with `review-naturalist-original-fidelity.mjs`. Executing current authored scientific claims does not verify those claims or grant editorial/image rights. Existing changed Q&A/Home presentation, new October content, pending photo permissions and physical/release gates remain unresolved; `whole_app_inheritance` and `approval_granted` remain false.

Validation: the new six-case suite plus existing October, contextual-return and original-fidelity regressions passed **26/26**, zero failures/cancellations/skips. Repository security scan and `git diff --check` passed. No application, manifest, catalog or approval configuration changed.
