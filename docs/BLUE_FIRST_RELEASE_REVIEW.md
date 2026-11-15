# Blue-first release review

[PR #44](https://github.com/drtforshortaol/MBA-hub-v2/pull/44) is the staging candidate. Use the review artifacts from the current PR run. The evidence below was reproduced for source and privacy inputs at commit `a321f9f9`.

## Shared Hub source

The deployed Blue baseline is `40e1826166f0ea61f406e1193390272029428734`. AGE-008 found all 36 baseline apps and every baseline source path in the 38-app candidate. The only modified baseline source path is `src/core/hub.js`.

| File | Deployed SHA-256 | Candidate SHA-256 |
| --- | --- | --- |
| `src/core/hub.js` | `90408055a60dca80731bc5d5a627eba7f5d34605f7272a7d582a94d98c126fae` | `166d44abb29f262a2cb3278d6fe6061cb89fb8858a0653b8ccd6ed8d759845ac` |

Nearby Dining now uses the canonical Volunteer Tools registry and search index. Its Hub entry opens a local, cached launch page. The visitor then chooses the link to the existing Dining site, which maintains its own offline preparation. Review the category and search paths, the return link, and the two-step launch behavior on a device.

## Privacy snapshot

The `blue-privacy-delta-review` artifact lists the exact file hashes. The initial review found 26 changed or added paths and zero removals. The paths comprise 23 application source files and three build or audit inputs. The static scan found no changes to its automatic external resource, sensitive browser API, storage, or fetch inventories. Review the user-initiated Dining link and the new El Niño source and imagery against the exact candidate snapshot.

Candidate snapshot SHA-256 `ed87dff148d2f729bd42ada5b28f502f4099e523d76c14b37e555ab85e1df1a5`.

## Release status

At `a321f9f9`, the Blue preservation workflow and the AGE-008 PR audit passed. Security CI, foundation validation, and development validation failed at the reviewed privacy binding. The independent source and privacy review, physical-device offline check, and release approval remain pending. The staging workflows produce evidence and preview artifacts.
