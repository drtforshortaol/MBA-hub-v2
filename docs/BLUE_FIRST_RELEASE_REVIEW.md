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

## Physical-device acceptance

Use the Blue artifact linked from the preservation workflow summary and record the audited checkout and Blue offline release ID shown there. Serve the unpacked bundle on an isolated HTTPS staging origin that leaves the production install intact.

1. Open the preview online, install it, and wait for **Ready offline**. Record the device, OS, and browser.
2. Disable Wi-Fi and cellular data. Close and relaunch the installed preview.
3. Open El Niño from Concepts and verify its illustrations. Use Back and Return to Hub.
4. Open Nearby Dining from Volunteer Tools and from Hub search. Check that the local launch page opens and its Return to Hub link works. Verify the separate Dining site's link once online.
5. Record the results against that Blue offline release ID before considering production promotion.

### Verified bundle and device results

For commit `9e163288`, the downloaded [Blue staging bundle](https://github.com/drtforshortaol/MBA-hub-v2/actions/runs/43668548817/artifacts/14143522001) matched the GitHub ZIP digest and passed byte integrity and simulated offline navigation. Blue release `b6a6436c283d1401` covered 38 apps, 581 navigation targets, and 418 resources. When using a later run, take the checkout SHA and release ID from its Actions summary.

For the test record, use these fields:

| Field | Result |
| --- | --- |
| Audited checkout SHA and Blue offline release ID | |
| Isolated staging URL | |
| Device, OS, and browser | |
| Home Screen install and offline relaunch | |
| El Niño illustrations, Back, and Return to Hub | |
| Nearby Dining from Volunteer Tools and search | |
| Nearby Dining external link with network restored | |

### Hosted Blue bundle preflight

After uploading the verified bundle to an isolated HTTPS origin, compare the served release and service worker with the downloaded artifact before sending the URL for device testing. For Blue release `b6a6436c283d1401`:

```bash
node scripts/verify-preview-http.mjs --url https://STAGING-HOST/ --environment tester \
  --expected-release b6a6436c283d1401 \
  --expected-worker-sha256 2dedcbbbc22886687fa3df85742dba2b8da280cbed24ef3a6cd48b9d9aec09a0 \
  --report blue-staging-http.json
```

For a later bundle, use its release ID and compute SHA-256 from its unpacked `sw.js`. The hosted preflight checks delivery and file integrity. The Home Screen install and offline relaunch are verified on the device.

### El Niño media registration review

The media registration experiment at `75aaeece` appended 18 El Niño records marked `review-required`. All 216 previous catalog records were preserved. The only changed source paths were the catalog and the El Niño manifest. The rights to distribute the illustrations remain pending.

Existing approvals hash the entire catalog. A read-only comparison produced these results:

| Source used for digest verification | Verified inherited approvals | Verified owner text approvals |
| --- | ---: | ---: |
| Restored candidate `678c360a` | 29 | 6 |
| Registration experiment `75aaeece` | 0 | 0 |
| Temporary copy of the experiment with the exact original catalog bytes | 29 | 6 |

The temporary copy isolated the catalog's effect. It was used for diagnosis only. The candidate retains the current approval checks and evidence. Before integrating the media records, review a migration that proves each existing approval still covers the same app and dependencies. Independently verify rights for the 18 pending records.
