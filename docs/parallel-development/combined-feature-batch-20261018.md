# Combined feature batch — October 18, 2026

Base remote integration: `c9f8e7e8f4be467c41eecf07cd8f4a5011f5d5fa`. All remote track heads were rechecked before recovery/integration. Clean recovered integration exactly matched source tree `5b321234162b046d3c764eb93eb3ad66fb5586f5` before new changes. D's recovered predecessor also exactly matched its remote tree. No unrelated untracked source was copied.

## Implemented features

| Track | Remote head | Feature |
| --- | --- | --- |
| A | `d57fa15a37a986c941079247fdb1df1d67225420` | Download and restore replacement-text backups, bound to the exact classification. Portable recovery preserves edits during async reads, merges proposal text only, rejects invalid/oversized packets and never restores approvals. |
| B | `20f3ae290df0fc079a3794ee80e337c26b8daaff` | Contextual Back restores both open and deliberately closed disclosures, multiline fields, field events and scroll. Stable owner/control fallback keys cover 13 Life Support cards lacking aria-controls; existing keys remain compatible. Sensitive/non-user controls are excluded. |
| C | `1593f83bd606753ec46d07e83dc95f8cc77fdb9c` | Offline verification and recovery listeners initialize independently of stalled/failed registration. Installed controllers remain usable; reconnect retries failed registration and late completion rechecks readiness without activating updates. |
| D | `418bbfed28fb9a3c5f757079b078352d50ea8f69` | HTTP acceptance CLI verifies actual served release bytes with bounded requests/concurrency and per-app/offline-media coverage reports. Redirects, auth fallback pages, altered/missing bytes, unsafe paths and stalls fail. |

The combined build workflow now runs the HTTP acceptance CLI against both environments on an ephemeral loopback server. Reports are retained in its review artifact. This neither deploys nor grants browser/device acceptance.

## Final combined local results

- Node regressions: **522/522 PASS**, zero failed/skipped/cancelled.
- Python EVO integrity: **35/35 PASS**.
- Strict content preflight: **33/33 apps PASS**.
- Media registration planner: **zero additions, zero errors**, read-only.
- Build and manifest validation: **PASS**, 33 apps and 11 categories.
- Security scan, independent artifact verification and diff checks: **PASS**.
- Developer HTTP delivery: **371/371 resources PASS**, 33/33 apps; release `2c505c82a131fb08`.
- Tester HTTP delivery: **362/362 resources PASS**, 33/33 apps; release `960a3b739234a496`.

Exact HTTP reports are in `docs/verification/http-delivery-20261018-{developer,tester}.json`. Their scope is byte delivery and artifact semantics, not browser execution, physical devices or scientific approval. An initial HTTP invocation could not connect across separate execution network namespaces; running server and clients together passed. CI uses the same colocated setup.

Track D's isolated strict all-app preflight still lacks B's earlier media/interface changes; its previously recorded failure is not converted into a pass. Combined preflight passes all 33 apps. D's final isolated Node suite passed 429/429, including five HTTP tests. Earlier malformed generated output was eliminated by a clean rebuild; independent final artifact checks passed. A's final additional Unicode-limit test is covered by this complete combined run, beyond its earlier 425-test full run and final 18-test targeted run.

GitHub CI outcomes must be checked against these exact remote heads and the final integration commit, separately from local results.

## Remaining acceptance

No deployment, publication, release or protected-branch merge was performed. The private iPhone preview remains on the previously tested application source `8cefb1d763ec49c8f13588bf7ec0705ec6d89f61`; these features are not physically accepted. Broader app/media interaction, physical update/rollback and registration-loss recovery, other devices and required scientific/editorial/release approvals remain outstanding. All existing 38 release gates remain unchanged. Scientific content, stable identifiers, V1/public tester repositories and protected branches were not modified by this batch.
