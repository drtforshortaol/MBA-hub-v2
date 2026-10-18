# Combined iPhone review — October 18, 2026

Review only. This branch does not publish, deploy, merge, or grant release approval.

## Included track heads

- A: `3f4f2559a4dfb9d2d3eaf568f5157a948d862063`
- B: `414d0077ab7448d91cdb64e725b243ca12428d57`
- C: `fe8d059e3b3be43455f13a0a89349a4cb3c689c2`
- D: `a6f864ddc0b95ffb6c9985bac1865cf33d883cfc`

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
