# Media audit path and declaration hardening — October 23, 2026

Integration baseline `e77cdd635df2112e183cc3442b26b4df5d58e206`; Track C baseline `b981e82d02c3a5aa5b61ff640c3085842d9af37d`. This bounded follow-up changes the independent read-only media auditor and its regressions. It does not change catalog registrations, media bytes, app manifests, permission labels, runtime content or operational gates.

The repository auditor previously checked only the final referenced file with lstat. A symlinked shared/media directory could therefore be followed and its target accepted as a regular registered resource. Catalog and manifest reads also occurred before equivalent ancestor checks. The auditor now checks every source-relative path component before reading or descending and rejects source/app/media-directory, manifest, catalog and resource symlinks. Missing regular referenced files remain explicit findings. This is path-integrity verification within the supplied checkout, not a race-proof filesystem sandbox.

App declaration validation previously occurred only while scanning an app-owned source file. An app with no scanned references could carry malformed media/offline declarations yet produce an empty successful audit. Every app's declaration arrays are now checked up front for dense, unique, correctly typed entries and safe offline paths. Registration and permission comparisons retain their existing app-selected-alias semantics.

Executed focused checks:

```sh
node --test tests/local-media-coverage.test.mjs tests/offline-media-registration.test.mjs tests/pending-october-media-registration.test.mjs
node scripts/plan-offline-media-registration.mjs
node scripts/audit-local-media-coverage.mjs
```

Focused tests: 29/29 PASS, zero failed/skipped, on combined integration and an isolated checkout of the existing Track C head containing only the two auditor/test changes. New fixtures cover absent references with malformed declarations, missing regular files, unchanged catalog bytes, and symlinked source/app/media ancestors, catalogs and manifests. The tests create isolated temporary repositories and never alter live app/media bytes.

Planner: valid, zero additions/errors, no writes. Literal coverage: 33 apps, 83 source files and 235 app-resource uses, zero uncataloged resources and zero path errors. Exactly nine resources retain only permission-evidence-missing findings: five Seahorse images and four new October Field Notes images. The audit intentionally returns complete:false and CLI exit 1 for these unresolved rights findings. This is expected pending review, not a new registration defect or permission clearance. Evidence: docs/verification/media-followup-20261023.json.

The scanner remains bounded to literal HTML media attributes, CSS url() and JS/JSON media properties. Computed/escaped URLs, imported shared scripts, dynamic templates, string markup and actual browser network/media behavior are not certified. Permission labels are checked for recorded evidence, not independently adjudicated. Existing V1 authority and all nine pending October permissions remain unchanged.

Isolated Track C verification completed: build PASS; full Node suite541/541 PASS, zero failed/skipped. This total belongs to the retained Track C baseline plus its two scoped changes, not the larger integration suite. Generated build reports in that temporary worktree were not included in this change.
