# Shared navigation and inherited fidelity — October 23, 2026

Baseline integration: a5e4fac7de957974e4fcaeac435d8758cb98478b. Existing draft PRs #2–#5 remain unmerged. Development changes only; no protected repository writes or deployment.

## Implemented

Shared section navigation now synchronously notifies an application before opening disclosures, focusing or scrolling a destination. The application owns search/filter visibility; core navigation remains independent of app-specific classes/data. Re-entrant mutations do not replay a fragment. Back restoration still skips initial replay, and explicit revisits/new fragments remain supported.

Whale Parasites handles only its authored card IDs and matching event target, reveals excluded destinations and updates visible counts while preserving search/filter values. Tree of Life clears only a query that hides the resolved target/ancestor; matching queries remain, and shared core performs focus/scroll once. The actual core+Tree interface is executed together in regression tests.

Media auditing now decodes HTML URL attributes once, including semicolonless numeric references and bounded ASCII punctuation names. Encoded dots no longer conceal unregistered images; ampersand replacements cannot recursively invent another entity. Invalid Unicode scalars no longer crash the audit. No media bytes, permissions or approval fields changed.

The reusable Tree audit verifies the complete ten-file pinned source inventory, including retired standalone packaging and the alternate monolithic legacy document. Source README/registry/manifest select index.html as the canonical entry; the alternate is inventoried, not silently substituted. Complete current HTML/JS/CSS normalize to pinned bytes after only exact enumerated migrations; both original icon files match centralized bytes. Complete current manifest semantics, source provenance, current app inventory and icon catalog metadata are guarded. Twenty-five baseline/adversarial checks reject source/current inventory changes, unknown manifest data, incorrect pins, altered media and symlink substitutions.

## Commits and isolated results

| Track | GitHub commit | Verification |
| --- | --- | --- |
| A / #2 | 920c6aa6c4c96842c52cb60079bfc0af3c713bb9 | Node496/496; interaction6/6; build/security PASS |
| B / #3 | 858a417e0b23ae1897743d4f39029c112e612f23 | Node531/531; focused73/73; build/schema/security PASS |
| C / #4 | 29b15ad7e7a054a1f173dc175cb5b736c9a9b943 | Node550/550; focused38/38; build/security PASS |
| D / #5 | d30ed7803275f0fa07ae660f7c26dd784991e487 | Final coherent dependency suite696/696; focused91/91; build PASS. Original tooling-only suite671/671 and tooling25/25 PASS. |

Track A's stale runtime evidence hash was updated with a technical note before its passing rerun; pinned evidence/status unchanged. Track D's older branch required the existing canonical navigation dependencies. Its old Hub-return assertion was extended to verify categoryScroll/animalLetter reset and prior-state immutability, rather than relaxing the expected behavior. Full coherent rerun passes. Generated build reports are excluded from source commits.

## Combined local evidence

Node923/923 PASS, zero failed/skipped; Tree focused44/44 PASS. Build/schema33 apps11 categories, preflight33/33, security, artifact integrity, whitespace, EVO35/35, fidelity-tool Python3/3 and acceptance-record Python3/3 PASS. HTTP developer383/383 and tester374/374 PASS. All14 offline/recovery scenarios PASS, each550/550 targets and complete resource coverage. Current media gate: zero technical findings/errors and zero additions; nine permission-only findings remain, complete:false.

Full independently retrieved pinned-source comparison is retained in docs/verification/tree-of-life-full-source-20261023.json. CI also regenerates a current-only report without claiming it re-fetched source: complete_source_inventory_verified:false there is intentional. Current bytes and source identities are still checked against the exact pin. Both report scopes explicitly grant no approval.

Generated developer release f6039d7dd9462692; tester db10b6f3824796cd. Current physical/device acceptance is pending for these changed bundles. Hosted CI must be verified on exact new heads and is recorded in draft PR updates/workflow artifacts; local success is not substituted for hosted success.

## Remaining blockers and exact next work

Readiness still reports19 blockers and releaseEligible:false: four complete inherited-app reconciliation/review decisions, Seahorse review, nine image permissions and five operational gates. Engineering fidelity does not grant new scientific/editorial/image or device approval. Tree source-byte verification is now complete, but independent technical reconciliation and native/mobile/layout/accessibility acceptance remain separate.

Next: verify latest combined hosted artifact and retained reports, independently review Tree's complete evidence without granting new scientific approval, then complete Whale Parasites parsed old/current renderer fidelity and all shared-link/search/filter combinations. Continue Timeline renderer and Naturalist original-versus-October review boundaries. Do not merge, publish, deploy, release or implement visitor editions without authorization.

