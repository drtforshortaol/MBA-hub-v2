# Development cycle evidence — October 23, 2026

## Verified engineering changes

Track D: 23c7e95977ed41ea3e6c31d93532d0809d008552 executes actual inherited Tree of Life JavaScript against a bounded DOM fixture; 7e92f1d8c801e2b00a24791a4ccec8179ac5d9f3 binds original icon bytes; 0bda9da343b1ddd156b940102f87df7bc81e268c validates exact allowed offline paths with mandatory app resources and optional known centralized icon. All three PR workflows passed for 0bda9da. Original 12b1482 also has all three workflows confirmed PASS. No tests were removed.

Integration: 6334efe212d743275a5181dc3e7e12c391d63517 and 9dfdc8883f6cd20edafa8a333bae8733c4f28e40 import those tests onto a248d8a without merging any PR. Local combined full Node 861/861 PASS, zero failed/skipped; build, build --check (33 apps/11 categories), security scan and diff --check PASS. Track D initial full run 634/634; offline-focused run 154/154 (before final offline assertion adjustment); final focused Tree of Life 12/12 on both source trees. These totals identify their exact scope rather than claiming an unexecuted full latest run.

Timeline source retrieved read-only: drtforshortaol/evolution-timeline c6d782d3a8a03e407861a0fbc3aab76e5fbf8d0c app.js, Git blob 82f6edd91c7db816346f4905171b31ce773e27bb. Evaluated original prefix before const storyView and compared JSON serialization of early, groups, earthDayRows, otherDetails and timeRows to current shared/knowledge/evo-interface.js. All complete collections match. Regression hashes derive from the independent source, not the current export. Track D ee71f5e3f6cb2d0f247f3e31c45e44276649793b and integration 72555cc5f04759816b360213064a91167626cbd0 retain six new collection guards; combined Timeline tests 8/8 PASS. Newest hosted CI must be verified separately; do not transfer earlier success to these commits.

## Boundaries and exact next work

No application content, data, styles, scientific approval, media permission, permanent ID or release gate changed. PRs #2–#5 were verified open/draft/unmerged; #5 description updated. V1 and public tester are untouched. No merge, publication or deployment occurred.

Current integration ledger OPEN_SEA_RECONCILIATION_20261023.md lists 19 blockers, unchanged here: four inherited reconciliations, Seahorse, nine October media permissions and five operational gates. Automated data equality is not scientific approval. Bounded DOM execution is not physical/mobile acceptance.

Next: verify hosted CI for ee71f5e3 and 72555cc5, then complete real-document Tree of Life inventory/manifest, search targets, shared Back and offline evidence before reconciliation. Timeline next requires complete renderer/static-document/CSS/media comparison and execution of all three views, disclosures, lineage/tool panels and contextual Back; newly proven data equality closes only its full-data evidence gap. Naturalist original content must remain separate from October review. Whale Parasites needs its own seven-card/five-filter renderer evidence; existing whale renderer tool covers another app. Preserve all approval gates until supported evidence exists.
