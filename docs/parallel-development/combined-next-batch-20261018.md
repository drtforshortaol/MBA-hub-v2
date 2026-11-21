# Combined development checkpoint — October 18, 2026

Development only. No deployment, publication, protected-branch merge or new scientific/editorial/device approval.

## Recovery and isolation

Verified all five remote heads against the handoff before editing. Created clean Git clones from preserved local objects, excluding untracked files. Each track's predecessor tree exactly matched its remote head. Recovered missing integration files through GitHub; the complete recovered tree matched remote `39846cc388d9486ffecca75049a0415b3d836284` exactly (`c8a72151b9e7ad254c112385ffb64aa0e001a97b`). Local replay commit IDs differ from GitHub history; the source trees were verified before changes.

## Track changes and remote commits

| Track | Behavior | Remote commit | Isolated Node result |
| --- | --- | --- | --- |
| A | Read-only Naturalist queue imports accept equivalent JSON object member order while retaining exact schema/value checks and ordered arrays. | `d762e1da417b1e0913370047632ccc58e48b3e72` | 422/422 PASS |
| B | App snapshots restore only onto the originating URL, query, fragment and visit; malformed stored fields are normalized. | `f0afebca0ae3b02cc4f27270a7e7db56af3f7b22` | 442/442 PASS |
| C | Existing service-worker controllers respond without waiting for registration readiness; one 30-second deadline covers readiness and response, with late-result and cleanup protection. | `552ed57221ffbf49cf4676524d953c82dad5fcf8` | 424/424 PASS |
| D | Artifact verification requires an offline search index, every registered app's coverage, meaningful searchable text, and registered release-covered entry targets. | `5b7723d8207269a7cc9babe50012ae516b3acffe` | 424/424 PASS |

Changes were cherry-picked onto the recovered integration source without conflicts. The general validation workflow now runs strict content/offline media preflight. Separate combined workflow already includes that check. Generated build reports were not committed.

## Combined local verification

- `npm run build`: PASS, 33 apps, 11 categories; existing 38 release gates unchanged.
- `npm test`: PASS, 500/500 tests; zero failures, skips or cancellations.
- `npm run content:check:all`: PASS, 33/33 apps.
- `npm run validate`: PASS.
- `npm run security:scan`: PASS, no matched credential or unsafe DOM patterns.
- `node scripts/verify-build-artifacts.mjs`: PASS for both developer/tester artifacts.
- `python3 -m unittest discover -s scripts/validation -p 'test_*.py'`: PASS, 35/35 tests.
- EVO relationship, ambiguity, original narrative and description reconciliation validators: PASS structural checks; scientific accuracy approval remains separate.
- `git diff --check`: PASS.

Isolated D strict all-app preflight still FAILS because B's earlier registration/interface corrections are absent from that branch. That limitation is recorded in D's log; it is resolved by combination, with all 33 apps passing on integration. Isolated D's Node/build/security/artifact checks passed. No failed check is treated as a pass.

GitHub workflow results must be checked against the final remote commit, separately from these local results.

## Outstanding acceptance and restrictions

The private preview remains unchanged on application source `8cefb1d763ec49c8f13588bf7ec0705ec6d89f61` / Sites source `c3885999c187c3eca4e3d30a77619ed328e9431a`. Existing physical evidence applies only to that preview. This batch has not been deployed or physically accepted.

Broader app/media coverage, physical update/rollback and registration-loss recovery, other devices, and required scientific/editorial/release approvals remain outstanding. V1 production, the public tester, independent repositories, `main`, and `security-review-evo-foundation-20261014` remain unchanged. Stable IDs and scientific content are unchanged.
