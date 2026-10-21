# Combined iPhone review — October 18, 2026

Review only. This branch does not publish, deploy, merge, or grant release approval.

## Current review provenance

The commit in the artifact's `SOURCE-COMMIT.txt` and its release checksums identify the build being reviewed. The track heads below are the original October 18 snapshot, not the latest development heads. Consult `docs/verification/coordinated-batch10-20261021.md` and `docs/verification/coordinated-batch11-20261021.md` in the matching source checkout for subsequent verification. Never apply prior device or CI results to a newer artifact automatically.

## Original October 18 track heads

- A: `76cdabcc3e9a2007162ee36943f9d3ae0103e14d`
- B: `383905d01681f6d4f8b4a26136053148cc311efa`
- C: `41d0b472c3e411721ad12cb54deca7c4ee3badbd`
- D: `5941eb243e63f5ba4d7ca08d90331e5f390d222c`

Original development checkpoint: `parallel-development/combined-guide-workflow-batch-20261018.md`.

Base: `966024670dc0e18cccdb091f45665ce9a9493b8f`.
The artifact contains separate `developer/` and `tester/` bundles, a source commit ID and release checksums. Developer includes local Naturalist review controls; tester excludes privileged developer controls. Test both at separate URL paths. Do not copy either over V1 or the public tester.

## Testing options

1. **Computer review now, without deployment.** Download the artifact from the Combined iPhone Review Build Actions run, extract it, then run `python3 -m http.server 8080 --bind 127.0.0.1 --directory PATH_TO_EXTRACTED_ARTIFACT`. Open `http://localhost:8080/tester/` and `http://localhost:8080/developer/` in separate browser tabs. Desktop results do not count as physical iPhone acceptance.
2. **iPhone on a private local HTTPS server.** A computer can serve the extracted bundles over HTTPS on your local network, using a certificate the iPhone trusts. Both devices must be able to reach that server. This requires local setup; it is not configured by this build. Plain HTTP to a computer's LAN address is insufficient for service-worker/offline acceptance.
3. **Hosted HTTPS review link, after separate authorization.** A dedicated review URL would allow direct iPhone access and Home Screen installation. No hosting or preview link is created by this build. Public hosting would expose review content and needs explicit authorization.

Opening `index.html` from Files or a ZIP preview does not validate the PWA. No App Store/TestFlight package is included; this is a web application.

## iPhone acceptance when a trusted HTTPS URL is available

- Open tester in Safari; add it to the Home Screen. Confirm title and installation are correct. Apple guide: https://support.apple.com/guide/iphone/iphea86e5236/ios
- Wait for Ready offline. Record displayed version/release, iPhone model and iOS version.
- Open apps and section links; interact with panels, then use Back. Confirm restored scroll and panel state; Return to Hub still works.
- Play available local audio/video and seek. Note that external media is not automatically available offline.
- Turn off Wi-Fi and cellular data, close and reopen the installed app, revisit local apps/media, and seek again.
- Background and reopen the app; confirm readiness rechecks and recovers.
- In developer review, paste source notes, reload, explicitly Restore saved source, and verify fresh pending review decisions. Test JSON intake/decision recovery and newer edits during a pending import.
- Confirm tester has no developer maintenance controls. Record PASS/FAIL and exact reproduction steps. Do not mark scientific/editorial or release approval from technical results alone.

Service workers require a secure context: https://www.w3.org/TR/service-workers/
Local device results, update/recovery testing and required approvals remain outstanding until evidence is recorded.

## Batch 10–11 focused review

Only run this review on an authorized isolated installation with a trusted HTTPS origin. The new builds have not been published by this work. Record exact source commit, developer/tester release IDs, device, iOS version and each result separately.

- With a deliberately slow connection, open Search and immediately type a query and choose a category. Verify those choices survive index loading and a failed-load retry. Return to Hub and confirm category position; reload and repeat.
- In developer review, inspect an original statement referenced as a duplicate or conflict by another statement. Confirm the counterpart source, original paragraph, destination and review link are visible. Scientific decisions must remain pending until reviewed.
- On a disposable automated or instrumented review fixture, simulate missing, partial and corrupt inventory metadata, then open `refresh.html` online. Confirm verified completion and return to Hub. Interrupt a recovery, reconnect and retry; then disable the network and restart, open apps and local media. Never remove a user's browser data to create the fixture.
- Confirm developer REPAIR is unavailable in tester, unrelated stored data remains intact, and a changed release fails safely. Capture errors verbatim without marking release/scientific approval.

The automated recovery scenarios simulate worker/cache/message behavior. They do not establish Safari rendering, actual browser eviction behavior or physical-device acceptance.

## Scoped physical evidence

The user-reported iPhone passes in `iphone-private-preview-evidence-20261018.md` apply to integration revision `8cefb1d` and its private preview. This newer combined development batch has separate automated verification and has not been deployed or physically accepted. The existing private preview remains on the tested revision.

The user also reported 14/14 baseline iPhone checks passing on October 20, with no problems. The exact artifact/source SHA was not established in this session; do not assign that acceptance to Batch 10 or Batch 11.
