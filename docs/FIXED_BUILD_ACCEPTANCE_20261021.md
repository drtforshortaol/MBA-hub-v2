# Fixed-build acceptance — October 21, 2026

This checklist records tests to run; it records no approval or device PASS. Keep results tied to a single artifact. Do not update the protected tester, existing preview, or production to run it without explicit authorization.

## Candidate and setup

- Source: `96a9303ef54f0d0fc6cccb8ef0da2fed9f8609de`.
- [Successful CI run and artifact download](https://github.com/drtforshortaol/MBA-hub-v2/actions/runs/39717669206), artifact `12399387211` (`mba-v2-combined-iphone-review`).
- ZIP SHA-256: `ec47c591c187752fcea183703e7005fe910e7c2756913b6cd935575085884dd4`.
- Developer release: `d0a9e2c124319d67`; tester release: `396e7065d45407d5`.
- Download/extract; check SOURCE-COMMIT.txt and RELEASE-CHECKSUMS.txt. Use separate developer/tester paths. Desktop localhost supports an initial browser review. iPhone offline acceptance needs a trusted HTTPS origin. A LAN HTTP address, Files preview, or ZIP preview is insufficient.
- No current HTTPS review URL is provisioned by this audit. Existing device evidence and older preview URLs cannot certify this artifact. Any hosted update remains a separate explicitly authorized action. Local HTTPS setup is an alternative.
- Use an isolated review installation and synthetic notes. Never clear a user's existing browser data to simulate failure. Keep V1 available and retain the prior complete artifact before controlled update/rollback tests.

## Evidence record

For every row record PASS / FAIL / NOT TESTED, date/time, reviewer, source SHA, release ID, device model, OS/browser version, Safari vs installed mode, actual URL, network state and reproduction notes. Attach screenshots where useful. Do not replace NOT TESTED with a historical PASS. Describe changed content and approval scope separately from technical checks.

| ID | Procedure | Expected result |
| --- | --- | --- |
| I1 | Open tester in Safari, install to Home Screen, wait for Ready offline | Correct title/version and complete resource count; no developer controls |
| I2 | Expand Hub categories; exercise A–Z; open app; Back; Return to Hub; reload | Required collapsed defaults, exact Back context and usable return controls |
| I3 | Search then open section; Back; repeat with slow loading/category edits | Correct target, retained query/category/position; no delayed focus theft |
| I4 | Follow section links using keyboard/VoiceOver, including same-fragment revisit | Revealed section receives useful focus; native summaries and normal Tab order remain usable |
| I5 | Exercise every app in COMPLETION_AUDIT_20261021.md online | Wording, image proportions, captions, accordions, actions and cross-links work; supporting apps reachable as intended |
| I6 | Disable Wi-Fi and cellular; close/reopen installed app; revisit every local app/media | Verified cached content works; external-only resources are clearly distinguished |
| I7 | Seek local audio/video where supplied, online and offline | Playback/seek succeeds for bundled media; no claim that external Vimeo works offline |
| I8 | Background and reopen; reconnect/restart | Readiness rechecks; no false Ready or lost review source |
| I9 | Developer: enter synthetic notes; reload; explicitly restore source | Exact whitespace/Unicode retained; source-only recovery starts fresh pending decisions |
| I10 | Inspect duplicate/conflict endpoints, triage, counterpart links and portable report | Full statement/paragraph context, correct focus and worklist; annotations/blockers unchanged by navigation/export |
| I11 | Download/import source, decision and replacement backups; edit while import waits | Correct context required, newer edits win, errors actionable; unrelated decisions not inherited |
| I12 | On disposable instrumented fixture interrupt preparation/recovery; retry | Prior usable bundle retained; verified completion on retry; no unrelated data deleted |
| I13 | Controlled authorized update, old sessions then fresh restart | Whole compatible release activates; old-session behavior and retained data remain correct |
| I14 | Controlled authorized whole-bundle rollback and offline restart | Prior exact release works; local snapshot restore alone does not count as deployed-device rollback |
| I15 | Tester isolation | Developer controls absent; no general REPAIR authority; separate caches and V1 unchanged |
| I16 | Small-screen and long Naturalist review; measure timing/storage | Record actual load/search/interaction times and storage; no unmeasured scalability PASS |
| I17 | Owner plus three trusted reviewers complete guide workflow | Feedback and unresolved defects recorded; owner release authorization remains a separate step |

Android/Windows installation and assistive-technology coverage remain explicit NOT TESTED until performed. Simulated worker tests do not prove Safari storage eviction or native lifecycle behavior.

## Exit criteria

Resolve failures; rerun affected checks and automated validation on the resulting source. If runtime bytes change, assign a new candidate and release identity rather than reusing this candidate's physical PASS. Reconcile inherited approvals without repeating identical-content review, obtain appropriate approval for new/materially changed content, complete operational evidence, then request explicit rollout authorization. No automated step should mark these human/device gates true.
