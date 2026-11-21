# Fixed-build HTTPS acceptance proposal — October 21, 2026

Status: conditional design only; public hosting is blocked pending seahorse image-permission/content review. Nothing deployed. This proposal does not authorize a release, merge, existing preview update or protected-repository change.

## Conditional public-host design

Create a new public repository `drtforshortaol/MBA-hub-v2-acceptance` solely for disposable guide acceptance. Enable GitHub Pages on that repository and publish the **existing verified artifact bytes**, without rebuilding or changing runtime files. Proposed URL (not provisioned or verified): `https://drtforshortaol.github.io/MBA-hub-v2-acceptance/`.

Publish the extracted artifact's `developer/` and `tester/` directories under `fixed-96a9303/`, preserving their relative paths. Review entry points would be:

- `https://drtforshortaol.github.io/MBA-hub-v2-acceptance/fixed-96a9303/tester/`
- `https://drtforshortaol.github.io/MBA-hub-v2-acceptance/fixed-96a9303/developer/`

These are proposed paths, not working review links. Before provisioning, confirm name availability, Pages eligibility/permissions and actual HTTPS activation. If any condition fails, report it and prepare an alternate host proposal; do not silently reuse an existing preview or tester URL. Public Pages exposes the entire review collection, including the pending seahorse draft, guide operations, and owner/borrower fields. Developer visibility is not authentication. Use synthetic notes only. The seahorse image rights and new-content review are unresolved. Do not carry out this public-host design until the relevant permission/content review permits that exposure. Owner hosting authorization alone does not establish image rights or scientific approval. Inherited V1 approval is already recorded and is not being requested again.

## Candidate and publication controls

| Property | Required value |
| --- | --- |
| Source | `96a9303ef54f0d0fc6cccb8ef0da2fed9f8609de` |
| Actions run | `39717669206` |
| Artifact ID | `12399387211` |
| ZIP SHA-256 | `ec47c591c187752fcea183703e7005fe910e7c2756913b6cd935575085884dd4` |
| Developer release/resources | `d0a9e2c124319d67` / 383 |
| Tester release/resources | `396e7065d45407d5` / 374 |

Download and retain the original ZIP; verify its digest, SOURCE-COMMIT.txt, RELEASE-CHECKSUMS.txt, resource hashes and retained evidence before copying. Do not substitute the latest Actions artifact. Add `.nojekyll` at the hosting root outside both environment bundles. Do not publish pilot identities, completed feedback or synthetic source exports. Keep the candidate path immutable. Retain the original ZIP and hosting deployment identity for withdrawal/reproduction.

After hosting, run the repository's byte-and-header verifier against **both actual HTTPS URLs**, with their exact expected release IDs; retain the JSON reports and deployment identity. Example after authorized provisioning:

```bash
node scripts/verify-preview-http.mjs --url https://drtforshortaol.github.io/MBA-hub-v2-acceptance/fixed-96a9303/tester/ --environment tester --expected-release 396e7065d45407d5 --report /tmp/fixed-tester-https.json
node scripts/verify-preview-http.mjs --url https://drtforshortaol.github.io/MBA-hub-v2-acceptance/fixed-96a9303/developer/ --environment developer --expected-release d0a9e2c124319d67 --report /tmp/fixed-developer-https.json
```

Verify real Safari secure context and worker scope before installation. A hosting deployment success or HTTP integrity PASS does not certify physical-device acceptance. Stop on mismatch; do not edit a served file to conceal it.

## Isolation and update/rollback scope

Existing workflows were inspected: `combined-iphone-review.yml` only builds/uploads; `iphone-preview-build.yml` has its deployment job disabled (`if: false`). Leave those controls unchanged. The new acceptance repository would contain only copied artifacts and a separately authorized hosting configuration. No change to `MBA-hub`, `MBA-hub-v2-test`, independent EVO/upstream repositories or the existing private preview is proposed.

The candidate worker registers within its environment directory; cache keys include environment and URL pathname (`src/core/offline.js`, `src/sw.js`). The proposed paths therefore isolate caches from current installations, but physical tester isolation still needs I15. Same-origin storage is not a confidentiality boundary between paths.

For I13/I14 use separate disposable `lifecycle/tester/` and `lifecycle/developer/` paths on this acceptance host. An immutable path alone cannot demonstrate updating an installed PWA. Before these tests, identify a **second complete compatible artifact**, its source, digest and both releases, verify it, and record approval to expose it. No such second artifact is designated by this proposal. Never synthesize an update merely by editing a release ID.

At each lifecycle path: install the recorded older complete bundle, verify offline restart, serve the recorded newer complete bundle at the **same path**, test old sessions and fresh restart, then redeploy the older whole bundle to that same path and verify its exact release online and offline. Preserve all evidence and synthetic local data, record activation failures, and restore the designated review baseline afterward. Changes at immutable candidate paths are prohibited. Deleting caches, changing paths or restoring only local files does not count as device rollback.

Withdrawal means disabling/removing only the new acceptance hosting after an authorized decision. Installed offline copies may persist; do not remotely erase user browser data. Keep V1 available throughout. Any runtime fix requires a newly identified candidate and affected physical checks repeated.

## Authorization wording after public-exposure blockers close

“Authorize creation of the new public `drtforshortaol/MBA-hub-v2-acceptance` repository and Pages hosting of artifact `12399387211` under the isolated fixed paths above for draft guide review, including developer and tester bundles. Do not modify existing previews or protected repositories. This is acceptance hosting only, not scientific approval, rollout, merge or production release.”

Do not present this public-host authorization as immediately executable while the image/content blockers remain. Lifecycle update/rollback deployment must additionally name the second verified artifact before authorization. This proposal does not request sending invitations; reviewer outreach remains the owner's action unless separately instructed.

## Restricted alternative while public review is blocked

Prefer an access-controlled trusted HTTPS host, or a private local trusted HTTPS server, for restricted review if the unresolved rights allow that use. Authentication must protect every bundle/resource request and still permit Safari service-worker registration, fetched assets and installed offline operation; a sign-in wall returning HTML for JavaScript is unacceptable. No available private host, account/session policy or trusted certificate installation has been verified in this checkout, so no access-controlled URL is claimed ready.

Local HTTPS avoids publishing on the public internet, but still requires permission appropriate to the reviewed material. Before making that option concrete, identify the owner's serving computer, reachable LAN address, certificate names/trust installation on iPhone, server port, firewall/network isolation and serving implementation. The current artifact does not provision these. Record those actual values and verify both environment URLs/bytes before device testing. Do not substitute an untrusted certificate warning bypass, a plain LAN HTTP URL or a Files preview.
