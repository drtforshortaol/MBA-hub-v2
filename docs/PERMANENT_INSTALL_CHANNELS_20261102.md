# Permanent installation channels — deployment contract (2026-11-02)

## Approved application names
- **MBA Hub DEV**: owner-only developer build, orange icon; generated in `dist/developer/`.
- **MBA Hub V2**: guide evaluation build, standard blue icon; generated in `dist/tester/`. The internal build directory is named `tester` for compatibility, **not** the installed app.

Each build uses its own PWA manifest, local start URL, service-worker scope and cache namespace. The manifest ID remains relative (`./`), so **hosting at distinct, stable HTTPS origins or non-overlapping paths is mandatory**. Never deploy both bundles at the same root. The user should install each once and receive subsequent updates at the same address.

## Deployment requirements (not yet fulfilled)
1. Choose two permanent HTTPS locations. DEV must be access-controlled and restricted to the owner; guide URL must be accessible only to authorized guides. GitHub Pages alone is **not** an access-control mechanism.
2. Publish the complete matching directory as the root of each respective location, without mixing files between builds. Deploy only the intended approved guide candidate, never automatically promote every development commit.
3. Check `environment.json`, `manifest.webmanifest`, `release.json` and `sw.js` at each destination; verify environment and cache namespace match and validate served release with `npm run verify:preview:http -- --url <https-url> --environment developer|tester`.
4. Generate a **new** guide QR pointing to the chosen permanent guide URL; the committed `src/install-qr.png` currently points to the legacy `MBA-hub-v2-test` GitHub Pages address and **must not be distributed as the new permanent installation QR**. Rebind QR hash, resource inventory, and privacy review when replacing it.
5. On the owner's iPhone, install both independently and verify distinct icons, online/offline launches, updates without reinstall, and rollback. Record evidence before closing device acceptance.
6. Obtain the required owner, pilot, device-offline, and rollback signoffs before any production release. Do not merge draft PR #18 or modify V1 or the legacy tester repository to accomplish this setup.

## Deployment decision still needed
Permanent HTTPS hosts and authorized-guide access control have not been selected. The existing private owner-review Site is not an authorized guide distribution endpoint. This document does not publish a site or change any release gates.
