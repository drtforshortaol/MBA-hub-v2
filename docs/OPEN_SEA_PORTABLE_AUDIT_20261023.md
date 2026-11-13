# Portable Open Sea fidelity — October 23, 2026

Track D adds review-open-sea-fidelity.py, render-open-sea-fidelity.mjs and test-open-sea-fidelity.py. Python lxml and Node are required. The source is read-only MBA-hub pin 5c219508d23255080f6b050cefa8092905447d81. The target is the current integration's reviewed Open Sea bytes, present at e77cdd635df2112e183cc3442b26b4df5d58e206. Existing draft D source lacks two already-integrated Open Sea corrections; the new tools intentionally reject those older bytes rather than certify them. This is an explicit integration dependency, not a PR merge or a new app-source change.

Run against the integrated checkout by supplying --root when the tooling lives on the older track branch:

```sh
python3 scripts/migration/review-open-sea-fidelity.py --sources-dir PATH --root INTEGRATION_CHECKOUT
python3 scripts/migration/test-open-sea-fidelity.py --sources-dir PATH --root INTEGRATION_CHECKOUT
```

PATH contains fidelity-MBA-hub at the exact pin. Omitting --root audits the checkout containing the helper. Six complete current app files including the authored inline executable and manifest, thirteen pinned source files, exact inline stylesheet blocks, complete normalized static markup, full twelve-record DATA, all twelve rendered card/body trees, SVG/metadata, original click/ARIA states, sixteen complete search destinations and exact photo bytes are verified. The node model uses independent lxml-parsed complete fragment trees and executes the actual safeNode branches; it does not flatten authored bodies into a text node. Nonempty/count/identity checks prevent vacuous comparisons.

Sixteen isolated checks passed: two baselines and fourteen rejected mutations. They cover executable/manifest changes, added files, app/media/source ancestor symlinks and structural mutations beyond the current byte guard (lost training-note, flattened strong node, altered SVG path and changed authored DATA). The test-only temporary hash refresh proves structural detection rather than only hash rejection. Live app/source/media files are never mutated.

Independently reproduced evidence: docs/verification/open-sea-full-20261023.json. Actual current-body structure/security/SVG/toggle regressions live in Track A's open-sea-structural-render.test.mjs. The isolated original D branch plus only these tooling/evidence additions passes build and Node623/623; portable checks against the explicit integration dependency pass16/16. These isolated totals are separate from combined integration verification.

This establishes bounded source/model engineering fidelity, not native browser error recovery/layout, assistive technology, device performance/offline/update/rollback, scientific freshness, image rights, privacy, pilot or release approval. No runtime, content, permission or operational flag is changed by these tools.
