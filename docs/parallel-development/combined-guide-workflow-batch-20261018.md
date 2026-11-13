# Combined guide workflow batch — October 18, 2026

Base remote integration: `20cb2ef9fb2e0705ebbf736aac3ebf56796bf55e`, source tree `5e33f90daad23154030d7d50b883ac9209a5ff86`. All five remote heads and media registration were checked before changes. Isolated restored track trees matched their remote predecessors exactly; only intended feature commits were integrated. Recovery checkpoint commits and unrelated untracked files were excluded.

## Features and remote heads

| Track | Remote commit | Implemented behavior | Isolated Node tests |
| --- | --- | --- | --- |
| A | `76cdabcc3e9a2007162ee36943f9d3ae0103e14d` | Readable Naturalist .txt reports include original source, fingerprint, pending annotations, blocked actions, notes, and current/proposed section text. Incomplete drafts can be exported without a new approval gate. | 429/429 PASS |
| B | `383905d01681f6d4f8b4a26136053148cc311efa` | Ranked search matches across titles and text. Category filtering persists with query/contextual Back; existing async race/retry and safe-link guards remain. Results are announced through a live region. | 460/460 PASS |
| C | `41d0b472c3e411721ad12cb54deca7c4ee3badbd` | Check offline files provides manual verified-cache readiness checks and safe online update discovery. Busy feedback/coalescing and cleanup preserve recovery without activation or cache deletion. | 432/432 PASS |
| D | `5941eb243e63f5ba4d7ca08d90331e5f390d222c` | HTTP acceptance validates HTML/CSS/JavaScript and worker MIME compatibility, rejects HTML attachment delivery, and optionally pins an expected release before resource downloads. | 432/432 PASS |

Combined CI now derives the expected developer/tester release IDs from the just-built manifests and pins both HTTP acceptance runs. Unpinned standalone inspection remains supported. HTTP reports are additive schema 1 and distinguish expectedRelease from served release.

## Combined local verification

- **541/541 Node tests PASS**, zero failed/skipped/cancelled.
- **35/35 Python EVO integrity tests PASS**.
- **33/33 apps PASS** strict content preflight; registration planner reports zero additions and zero errors without writing.
- Build, manifest validation, security scan, independent artifact verification and diff checks: **PASS**; 33 apps, 11 categories and existing 38 release gates unchanged.
- Pinned developer HTTP acceptance: **374/374 resources PASS**, 33/33 apps; expected/served release `edc4265b6d0d05e2`.
- Pinned tester HTTP acceptance: **365/365 resources PASS**, 33/33 apps; expected/served release `a395ce0443e68316`.
- Exact delivery reports: `docs/verification/http-delivery-guide-workflow-20261018-{developer,tester}.json`.

An initial B test run contained unrelated untracked integration files and was discarded. After removing them, the clean isolated suite passed 460/460. Only five intended feature files were committed; its remote tree was verified against the local feature tree before updating the branch. No combined failure remains unresolved. D's previously recorded isolated strict-preflight limitation (missing B registration/interface changes) remains scoped to that branch; combined strict preflight passes.

These are automated delivery/contract results, not scientific accuracy approval or physical browser/device acceptance. GitHub workflow results must be checked against the final remote heads separately.

## Restrictions and remaining acceptance

This batch did not merge, deploy, publish or release. The private iPhone preview remains on application source `8cefb1d763ec49c8f13588bf7ec0705ec6d89f61`; the new controls and reports have no physical-device acceptance yet. Broader app/media interaction, update/rollback and registration-loss device tests, additional devices and required scientific/editorial/release approvals remain outstanding. Stable IDs, scientific content, media bytes and protected repositories/branches were preserved.

The existing hourly `.github/workflows/static.yml` on main deploys the protected foundation branch independently. It was inspected in the previous batch and remains unchanged; these development commits do not update that deployed branch.
