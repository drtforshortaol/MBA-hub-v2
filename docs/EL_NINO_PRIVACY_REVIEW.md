# El Niño module — privacy delta review (engineering evidence)

Date: 2026-11-13
Scope: `src/apps/el-nino/index.html` and `src/apps/el-nino/manifest.json`.

## Observed architecture
- Illustrations are generated as inline SVG/data URLs within the module. No remote illustration host is required.
- The manifest registers one offline HTML entry point; the slide diagrams are embedded in that HTML.
- The module references the existing shared Hub navigation contract.
- No user accounts, personal information, location, microphone, camera, or persistent browser storage are needed for the educational experience.

## Automated checks
- `tests/el-nino-module.test.mjs` verifies the manifest, the 18 16:9 SVG diagrams, syntax, and prohibited sensitive API / remote-network patterns.
- `.github/workflows/el-nino-checks.yml` executes the module tests and V2 registry validation.
- The module-specific workflow passed on commit `8dda9fac`.

## Outstanding approvals and limits
- This note is an engineering assessment, **not** a completed privacy approval or a scientific-content approval.
- The broader V2 workflows fail at the existing bounded privacy snapshot rebinding step because its fixed permitted-delta list does not include the new module files. Do not modify that list to silently auto-approve a new module.
- A designated reviewer must explicitly reconcile the complete inventory delta and bind the updated snapshot using the project's established review process.
- `publication_review` remains `pending`; no production merge or deployment should occur until applicable gates pass.
- User's publication authorization is conditional on readiness and does not itself establish technical validation or scientific approval.
