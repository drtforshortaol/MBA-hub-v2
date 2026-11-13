# iPhone offline readiness — owner-observed pilot evidence (October 28, 2026)

## Scope
Technical review only, on the owner's iPhone using an owner-operated temporary Windows/Caddy LAN HTTPS test at `https://10.0.0.100:8443/`. This is **not** authorization for public distribution, an approved shared pilot, or a full-device acceptance pass.

## Verified build identity
- Source: `38146016d398031b3e6f6d160b399d1457f78fb4`.
- Matching CI tester artifact: `mba-v2-tester-foundation`, artifact ID `12794434336`, from foundation validation run `40639515296`.
- Foundation validation, security CI, and development validation workflows completed successfully for this source.
- Local test source identity is based on the owner's report that the new extracted artifact folder was served; artifact byte/digest verification on the owner's PC was not independently captured.

## Owner-reported observations
- Hub launched from Home Screen, following one initial white-screen launch resolved by removing and recreating only the V2 Home Screen icon.
- While online, Hub displayed `Ready offline · 374 files` without pressing the manual offline check button (observed on the earlier acceptance cycle).
- With both Wi-Fi and cellular disabled, Hub and an Animals application opened.
- App was closed and reopened from Home Screen offline; Hub navigation continued to work.
- The alphabet-filter test subsequently found a CSS display defect. Fixed in development and retested on the iPhone.
- Most recently, matching letters filter correctly, letters without apps are faded/disabled, and owner confirmed the updated Hub still works offline.

## Not established by this limited test
- Every one of the 33 applications, each media resource and every search/navigation target operating offline on a physical iPhone.
- Full update activation, controlled whole-bundle rollback, Safari storage eviction/recovery, VoiceOver, performance and storage measurements.
- Multiple devices, iOS versions or three-reviewer pilot.
- Scientific/editorial approvals, pending image permissions, or publication authorization.

## Release boundary
Keep PR #7 in draft/unmerged until review and appropriate branch integration. Do not alter V1 production or the protected V2 tester repository, and do not publish a pilot build without owner approval and necessary content/media gates. Existing reference acceptance docs may predate these physical observations; this evidence supplements rather than supersedes the full acceptance checklist.
