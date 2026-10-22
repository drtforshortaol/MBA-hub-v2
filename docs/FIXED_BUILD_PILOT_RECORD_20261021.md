# Fixed-build pilot and operational closure — October 21, 2026

Prepared record only: no review has been performed or accepted by this document. Use [the fixed acceptance checklist](FIXED_BUILD_ACCEPTANCE_20261021.md) and [JSON template](verification/fixed-build-acceptance-template-20261021.json). Hosting proposal: [isolated HTTPS review](FIXED_BUILD_HTTPS_PROPOSAL_20261021.md). Do not edit config/platform.json or historical QA evidence merely because a template exists.

## Evidence collection

Create a dated working copy of the JSON template. Keep reviewer names, contact information, screenshots and completed feedback out of the public development repository unless expressly cleared for distribution. Use owner / reviewer-1 / reviewer-2 / reviewer-3 references in public summaries. No invitations or messages have been sent.

Add one sessions entry per actual device/browser/mode session with: session_id, reviewer_reference, started_at with UTC offset, actual_url, source_commit, artifact_id, environment, displayed_release, device_model, OS_version, browser_version, mode (Safari/browser or installed), network_state, evidence_refs and notes. Record exact evidence filenames/digests where retained. Each result links the relevant session(s), evidence and findings. A historical PASS with no fixed-build identity remains outside this acceptance record.

Use PASS / FAIL / NOT TESTED for technical tests; use PENDING / VERIFIED for operational closure. A checked result requires an actual observation and reproducible steps. A failed run remains recorded even after a later retest passes. If bytes change, create a new candidate record rather than editing the candidate identity under old passes.

## Owner and three-reviewer pilot

All four participants independently complete a realistic guide flow: start from installed Hub; locate an animal using category/A–Z; search for a section; open panels and media; Back to the original Hub context; Return to Hub; reopen installed Hub with both Wi-Fi and cellular off; use an app and bundled media; reconnect and restart. Record ease of finding information, confusing wording, missing content, failed images and navigation problems. Reviewers use tester; owner also completes developer Naturalist I9–I11 using synthetic notes and backup files.

Full collection I5/I6 coverage is separately required across all 33 app rows. Assign rows among participants, but one person's partial sample must not become 33-app PASS. Include the seven supporting apps through their intended links or direct entries. Record whether bundled media loaded/played and whether captions/proportions were usable. External-only media may remain external and must not be claimed as offline.

| Participant | Identity reference | Sessions | Workflow result | Findings |
| --- | --- | --- | --- | --- |
| Owner | Unassigned | None | NOT TESTED | None recorded |
| Trusted reviewer 1 | Unassigned | None | NOT TESTED | None recorded |
| Trusted reviewer 2 | Unassigned | None | NOT TESTED | None recorded |
| Trusted reviewer 3 | Unassigned | None | NOT TESTED | None recorded |

For every failure record finding ID, steps, expected/actual behavior, severity/impact, candidate/session, evidence, assigned fix, fix commit/new candidate, retest result and unresolved disposition. Do not record “no defects” before testing.

## Five operational closure records

| Gate | Required concrete evidence | Current state |
| --- | --- | --- |
| Owner release authorization | Explicit approval naming final candidate, release scope and intended destination after review | PENDING |
| Pilot | Owner plus three completed independent workflows, recorded feedback, resolved or explicitly accepted defects | PENDING |
| Current-build device offline | I1, I5–I8/I15 and all app offline/media rows on the exact candidate, with real device identity | PENDING |
| Device rollback | I12–I14 evidence with two identified complete artifacts, same lifecycle URL and actual offline restart | PENDING |
| Final privacy review | Candidate-specific distribution/delta review; inherited unchanged V1 scope carries forward; identify new material and current distribution boundaries | PENDING |

The final privacy review does not reopen the superseded alpha.6 request for unchanged V1 guide details or photographs. It checks current artifact scope, genuinely new/altered material, permissions and whether the intended distribution matches the owner authorization. Scientific/editorial approval for new seahorse content remains a separate pending content review.

## Explicit unresolved coverage and owner decisions

Android/Windows installation and assistive technology remain NOT TESTED. Record actual cold/warm load time, search latency, long Naturalist interaction delay and browser storage before/after preparation on the real device; retain browser overhead and prior bundle observations separately from the approximately 64 MiB resource inventory. No 100–200-app capacity claim follows from current inventory size.

Ask the owner to confirm whether the empty Cannery Row, Guide Talks, Making the Aquarium Come Alive, Seafood Watch, Visitor Questions and Visitor Services categories are intentional and whether the seven supporting/unlisted apps should remain so. Record the decision; do not move, list, invent or remove content automatically.

Completion requires verified technical evidence, appropriately scoped content reconciliation/reviews and explicit final rollout approval. This document grants none of those approvals.
