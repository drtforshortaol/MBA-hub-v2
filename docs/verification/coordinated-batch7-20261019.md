# Coordinated navigation and evidence batch 7 — October 19, 2026

## Starting checkpoint and CI reconciliation

Verified authoritative integration head `62cf308b6c38578078389f9549a71525c3327d8c` and the four remote track heads before editing. Prior A–D heads each have all three workflows completed successfully. Previously pending D Development Validation run `39315887944` and delayed B run `39316632498` both succeeded.

Combined push run `39316016326` succeeded for exact commit `62cf308`, including HTTP, four offline scenarios, evidence binding and artifact upload. The specialized commit-workflow lookup filters to PR events and omitted this push-triggered run; the generic Actions endpoint returned it. There was no workflow trigger defect. Use generic Actions runs filtered by `head_sha` when verifying the integration branch.

## Implemented tracks

- A `a73d25ec05b5b45c1114b11020bd8e4f1872395f`: queue-to-statement navigation focuses the opened native summary before scrolling. Existing review validity and approval guards remain intact. Isolated Node 450/450 PASS.
- B `7f44dc73f943e98f5c7f8149438c9bf6fade0c8e`: contextual Search restoration applies only to arrival; later explicit visits focus normally, and abandoned arrivals cannot transfer stale restoration. Isolated Node 487/487 PASS.
- C `cf3b6773f2c8ccfe65f2887633562be6adfc2059`: persisted back/forward-cache pageshow interrupts a suspended worker request and verifies again; late replies cannot overwrite current readiness. Isolated Node 474/474 PASS.
- D `73e143d048eb1286601cc3dc1fe9fb0d3639491a`: offline evidence requires every generated app exactly once, its exact generated navigation-target count, safe integer counts and empty per-app errors. Isolated Node 479/479 PASS.

Connected GitHub commits preserve the exact tested local trees; returned Git tree hashes were compared before branch updates. Local integration cherry-picks the same changes. Generated catalog/build reports were excluded from source commits.

## Combined verification

Tested source checkpoint before this documentation: `358ec6b4812fb698c0a83b1f0d65aaf33de203f0`.

- Build completed before the full test suite; no concurrent build/test in this checkout.
- Node 678/678 PASS; zero failed, cancelled or skipped.
- Python EVO integrity 35/35 PASS.
- All-app preflight 33/33 PASS.
- Read-only media planner: valid, zero errors/additions; media catalog unchanged.
- Build validation, security scan, independent artifact integrity and whitespace checks PASS.
- Developer HTTP 380/380 PASS; release `3811ca8b3fc99301`.
- Tester HTTP 371/371 PASS; release `557e53e3cd477296`.
- Four simulated offline scenarios (developer/tester prepared navigation and corrupted-entry recovery): each 507/507 PASS, 33 app entry URLs plus 474 search targets, zero offline network attempts.
- Actual retained HTTP/offline reports pass the stronger release, checkout and complete-app evidence gate.

These HTTP and generated-worker simulations do not establish physical-browser/device acceptance. Final integration CI must be checked against the exact published commit; preceding commit CI is not a substitute.

## Boundaries and remaining work

Complete loss of the current offline inventory still cannot be rebuilt by same-release tester refresh. REPAIR remains developer-only. No repair, clearing, reinstall or activation behavior was added.

Scientific/editorial approvals and physical-device acceptance remain pending. Preview updates and physical-device testing remain on hold. No PR merge, deployment, publication, release, approval changes, canonical identifier changes, scientific content changes, media changes or protected-repository updates were performed.
