# Candidate privacy review — October 30, 2026

Completed the current guide-tester distribution/delta review under the existing owner authorization in GUIDE_CONTENT_RESTORED.md. The 31 unchanged inherited apps and explicitly approved Naturalist/Seahorse changes remain byte-bound to their recorded decisions. The old alpha.6 filtering restrictions are not revived. No content or Library fields are removed. This is the public early-access guide collection, not a confidential/private vault or a standalone visitor release.

## Concrete fix

The installation page automatically requested its three QR images from api.qrserver.com. That exposed a page-view request to an unnecessary third party. It now uses a local 220×220 PNG obtained from the same fixed public-URL QR endpoint. The target and installation steps are unchanged. The local file is included and byte-verified in both offline bundles. The online-only QR note now describes local offline availability. Independent camera scanning remains unclaimed until physical-device acceptance.

## Findings and boundary

Inspected all runtime fetch-containing files: hub.js, app-contract.js, developer.js, refresh.html and sw.js. Their requests are relative/same-origin; the worker handles only in-scope same-origin GETs. Reviewed local navigation state, local developer intake/decision/draft helpers, user-triggered downloads and external links. No remote script/iframe, telemetry SDK, automatic upload endpoint or sensitive browser API was found in the reviewed source. The bounded static scan finds zero offsite automatic resource references after the fix. This is not a claim that hosting logs, external destination requests or every possible browser behavior are absent.

Hub session/search context, preferences and developer drafts remain browser-local. Local storage and exported review files are not confidential storage/access control. The tester excludes developer.js; user-triggered exports may contain their selected source/decisions. External links can send normal request/referrer information when opened. No account credentials, patient information or new borrower fields were introduced by the new approved material. The owner photo crop has no GPS EXIF tag. Existing authorized guide-operational and Library information remains unchanged.

config/privacy-review.json records the manual findings, exact QR identity and a 463-resource source/config/build-script snapshot. The snapshot excludes the receipt itself; tests require the current state to match when privacyReviewed is true. Future changes require re-review rather than silently carrying this result forward. The scanner rejects symlinks and is documented as bounded triage.

Only privacyReviewed becomes true. The remaining gates are owner release authorization, additional-guide pilot, physical-device offline acceptance and physical-device rollback acceptance. No merge, deployment, production promotion or new physical-device result.
