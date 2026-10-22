# Local media coverage audit — October 21, 2026

The existing offline registration planner is correct within its declared scope: every catalog media ID already declared by an app has its required offline path. Its zero-addition result does not establish that every displayed local resource has a catalog record or permission evidence.

The new read-only `node scripts/audit-local-media-coverage.mjs` scans app-owned HTML, CSS and literal JS/JSON media properties independently of `manifest.media`. It resolves relative paths safely, groups repeated app/resource references, and compares existence, catalog membership, app media IDs, offline declarations and recorded permission evidence. It does not create IDs, move/copy files, alter content, grant image rights or modify approvals. Findings cause exit status 1; malformed input causes exit status 2. The original planner's behavior remains unchanged.

Current baseline: integration `12afc2052c6117cc33616a9687199e353c3d8c48`. Retained report: `verification/local-media-coverage-20261021.json`. Across 33 apps and 83 scanned source files the audit identified 235 app/resource pairs, including nine uncataloged local resources. All nine files exist and are explicitly offline-declared, but have no matching catalog/app media IDs or catalog permission evidence:

| Owning app | Referenced local files | Required action |
| --- | --- | --- |
| big-bellied-seahorse | `apps/IMG_4212.jpeg` through `apps/IMG_4216.jpeg` | Resolve each exact image's creator, reuse scope and scientific/editorial treatment; register approved use or apply a separately approved removal/replacement. |
| naturalist-field-notes | `apps/IMG_4207.jpeg` through `apps/IMG_4210.jpeg` | Establish provenance and review scope for these newly added October images separately from unchanged V1 material; attach actual permission evidence before registering an approved use. |

Zero unsafe or missing local file references were found within the supported extraction scope. The platform's common `icon.svg` is an explicit shell-asset exemption retained in the report; its exemption is not an app-content permission grant. No new media were silently approved simply because they are already present in source or listed for offline use.

Coverage is deliberately bounded to static HTML `src`, `poster`, `srcset` and media `href` attributes, CSS `url()`, and unescaped literal JS/JSON properties named `src`, `image`, `img`, `poster`, `audio`, `video` or `url`. Comments, prose mentions and external/data URLs are excluded. Computed or escaped URLs, dynamic templates, JS-generated markup, imported shared scripts, runtime DOM changes and actual playback still require other verification. Catalog permission status/evidence is checked for presence and recognized state, not independently adjudicated. Physical rendering and offline playback remain pending.

Nine new behavior regressions plus the existing fourteen planner regressions pass (23/23). They cover registration gaps, undeclared offline media, unresolved permission states, repeated uses, relative/encoded URLs, traversal rejection before filesystem callbacks, comment/prose exclusions, literal markup attributes, srcset/video/CSS paths, missing resources, explicit platform exemptions, malformed catalog/source paths and duplicate app ownership. No app-runtime byte or approval flag changed in this track.

Permission evidence is evaluated on every same-path catalog record actually referenced by the app. An unrelated approved alias cannot mask a selected pending record; selecting both an approved and pending alias still leaves a finding. The regression covers both catalog orders and confirms that explicitly selecting only the approved record succeeds. The retained repository report is unchanged after this stricter check.
