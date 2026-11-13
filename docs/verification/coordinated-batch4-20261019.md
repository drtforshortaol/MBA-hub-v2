# Coordinated recovery and navigation batch 4 — October 19, 2026

## Features and branch commits
- A ce4144b5: resume same-classification Naturalist review at last displayed statement; position remains separate from approvals.
- B dd4f2e40: reselecting current section deep link reopens collapsed section and scrolls without requiring hashchange.
- C 30034b2e: restore evicted/corrupt current-release files only from authenticated inventory and exact verified bytes; partial/unregistered data stays uncached; quota failure does not block serving.
- D b9cdcc61: real generated worker simulated offline routing evidence for all app entries and search targets; reports retained by Development Validation PR CI.

## Executed combined local verification
Source tree before evidence: e3ec3a234d4dea7bb5e23ec371fe096f3595fcd8
- Node tests 623/623 PASS, zero failed/skipped/cancelled.
- Python EVO integrity 35/35 PASS.
- Strict application preflight 33/33 PASS.
- Media planner PASS, zero errors/additions; 203 canonical media records unchanged.
- Build/validation, security pattern scan, independent artifact integrity and whitespace checks PASS.
- Release-pinned HTTP developer 377/377 PASS; release 62ce6e64e99ccdc4.
- Release-pinned HTTP tester 368/368 PASS; release c2b6a0f7b8c689b9.
- Simulated offline navigation developer 507/507 PASS, tester 507/507 PASS. Each checks 33 app entry URLs and 474 distinct search targets; zero network attempts.
The offline report checks generated worker routing and exact bytes using simulated CacheStorage/network/lifecycle events. It is not browser rendering/native service-worker lifecycle/device acceptance.
Isolated branch counts: A 441/441, B 477/477, C 466/466 PASS; D targeted 28/28 PASS. C initial build encountered transient generated media file disappearance; sequential retry and full combined build passed.

Previous combined 4212be1 and all prior track GitHub CI PASS. New CI tracked separately.
No scientific content, permanent identifiers, media bytes, approval flags, protected repositories, merge status, preview or deployment changed. Physical iPhone/Safari and scientific/editorial/release acceptance remain pending.
