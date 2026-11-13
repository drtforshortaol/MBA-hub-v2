# Track C — fresh media verification and HTTPS acceptance proposal

Baseline inspected: integration source 2acca4bc41071df2671e233d11559f84c800045f. Read-only checks; no source/media/permission changes, hosting, deployment or certificate installation performed.

## Fresh verification

- `node scripts/plan-offline-media-registration.mjs`: exit 0, valid true, zero additions, zero errors, writePerformed false.
- `node scripts/audit-local-media-coverage.mjs`: exit 1, expected unresolved permission findings. 33 apps, 83 source files, 235 app/resource pairs, zero uncataloged resources, nine findings, no scanner errors. All nine findings are exclusively permission-evidence-missing. Static scanner limitations remain explicit; no runtime/computed URL completeness claim.
- `node --test tests/*media*.test.mjs`: exit 0, 25/25 PASS, zero failed/skipped.
- Catalog: 212 assets; 203 owner-approved-v1, nine review-required. Existing nine records are present, offline declared and files exist. Do not duplicate or approve them.

Permission-pending uses: Seahorse apps/IMG_4212.jpeg through IMG_4216.jpeg (five); Naturalist Field Notes apps/IMG_4207.jpeg through IMG_4210.jpeg (four). No new permission evidence was established.

Raw reports: track-c-planner.json, track-c-media-coverage.json and track-c-tests.log in the parent scratch directory.

## Concrete hosting proposal — prepare only, execute after owner authorization

Use a temporary owner-controlled computer on the same private Wi-Fi as the iPhone. Serve only verified extracted artifact runtime directories through a TLS static server bound to that LAN interface. Do not expose the source checkout or any public endpoint; no port forwarding, public tunnel, existing Site, production URL or protected tester update. Proposed dedicated LAN hostname: mba-v2-review.local, HTTPS port 8443; resolve it on the LAN before use. This is a proposed address, not an existing deployed URL.

Proposed stable environment roots:

- https://mba-v2-review.local:8443/tester/
- https://mba-v2-review.local:8443/developer/

Issue a dedicated local certificate with this hostname in its SAN using a temporary local CA. Owner explicitly installs and enables full trust for that CA on the test iPhone. Confirm trusted HTTPS without a browser bypass, secure context and service-worker registration before installation; a warning-bypassed/self-signed page does not establish acceptance. Keep the private CA key off the served tree. Disable directory listing; serve only the runtime files and correct JS/JSON/webmanifest MIME types. Use revalidation/no-store headers for mutable top-level index, worker and inventory responses. No credentials or real notes are required; use synthetic review input. Record the actual address, TLS/trust setup, computer and phone versions in acceptance evidence.

Candidate selection: retain the previously verified b8045ecfa0e394f82d471abcce2ad8088656de20 artifact unchanged, ZIP SHA-256 35af522ea2a14c05c1974713f19b15bf85023efc70a257a897e89145015ba6ba, only if its runtime resources still match the selected current candidate. Any runtime change requires a fresh successful CI candidate, exact ZIP/source verification and fresh acceptance record. Do not label the old artifact with the new commit.

Before serving: run prepare-acceptance-record.py verification against the exact successful workflow, source, artifact ID/digest and retained HTTP/offline evidence; then run both-environment HTTP byte checks against this TLS origin. Keep separate stable tester/developer roots. Serve the full tester bundle, never a partial app subset presented as full acceptance. Pending new-content/image decisions remain pending; local authorized reviewer access is technical testing only and does not grant reuse/public distribution permission.

For install/update/rollback testing keep a single origin and stable environment path. First archive both complete compatible bundles and their identities outside the served root. During an explicitly authorized controlled update/rollback test replace the whole environment directory atomically with the selected verified bundle, then follow the documented session-close/update/restart procedures. A new commit-specific URL may aid side-by-side inspection but cannot demonstrate same-scope update or rollback. Never clear V1 or unrelated browser data.

Run all 17 physical acceptance checks with exact runtime releases recorded. Include current iPhone PWA offline restart with Wi-Fi and cellular disabled, all local media and search targets, background/restart, controlled update and whole-bundle rollback, small-screen/VoiceOver, owner plus three-reviewer pilot. Keep Android/Windows, actual storage/performance and all unperformed checks NOT TESTED. Revoke/remove the temporary test CA from test devices and stop the server after testing.

No setup or deployment is authorized by this proposal. Public hosting would require a separately reviewed exposure/access proposal and the appropriate content/image distribution decisions; this LAN-only proposal does not authorize public exposure.
