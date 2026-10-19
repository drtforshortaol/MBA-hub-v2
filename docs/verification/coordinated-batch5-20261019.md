# Coordinated workflow and recovery batch 5 — October 19, 2026

## Features
- A 1cf3b9a4: action queues link directly to full statement review using existing navigation/position resume; no decision changes.
- B 25fb4273: Animals A-Z selection restored per contextual Back visit; explicit main Hub return clears selection.
- C 2d6e9498: standalone refresh uses bounded90-second workflow, retry guidance and deterministic listener/port cleanup; late timed-out events cannot navigate.
- D e09dc850: whole-registry corrupted-entry offline recovery scenario and retained per-app evidence, separate from normal navigation.

## Executed combined local verification
Source tree before evidence: ce3a0d3fe702ed1677ee70cefb30f777230e3dea
- Node 638/638 PASS, zero failed/skipped/cancelled.
- Python EVO integrity 35/35 PASS.
- Strict application preflight 33/33 PASS.
- Media planner PASS: zero errors/additions; 203 canonical media records unchanged.
- Build/validation, security pattern scan, artifact integrity and whitespace checks PASS.
- Expected-release-pinned HTTP developer 379/379 PASS; release 4b0fd737849555c2.
- Expected-release-pinned HTTP tester 370/370 PASS; release ab40134559b76478.
- Developer/tester prepared-navigation and corrupted-entry-recovery: all four scenarios 507/507 PASS each (33 app entry URLs,474 search targets; no offline network attempts).
Recovery uses real generated worker/bundle in simulated CacheStorage/network/lifecycle harness with all current app entries corrupted and compatible authenticated prior cache. No DOM/rendering/native lifecycle/device acceptance claim.
Isolated A full444/444,B481/481,C472/472 PASS; D targeted26/26 PASS.

Previous combined2e91c11 and prior12 track CI workflows PASS. New CI tracked separately.
Preview and physical-device testing remain on hold per user instruction. No production/tester repository, canonical IDs/science/media bytes, approval flags, merge state or deployment changed. Scientific/editorial and device/release acceptance remain pending.
