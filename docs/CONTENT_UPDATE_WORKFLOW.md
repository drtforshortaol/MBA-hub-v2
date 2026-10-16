# MBA Hub V2 — Content and Application Update Procedure

This procedure applies only to the authorized V2 development branch. Never change the V1 production, V2 tester, or EVO repositories while following it.

## Update an existing article or species
1. Locate its existing `src/apps/<slug>/manifest.json` and retain its permanent `app_id`.
2. Change the relevant content or sections in the owning application. Do not duplicate canonical scientific facts; update their owner in `src/shared/knowledge.json` where applicable.
3. Keep section IDs stable when modifying text so deep links and saved references continue working.
4. Run `npm run content:check -- <app_id>` for a read-only registration and offline media preflight, then run `npm run validate`, `npm test`, and `npm run security:scan`. Inspect any failed cross-link, resource, or release gate before committing.

## Add a photograph
1. Add the image under `src/` with a safe relative path.
2. Register a unique permanent `asset_id` in `src/shared/media/catalog.json`, including owner, alt text, credit, and permission.
3. Reference the media ID in the owning application manifest, and add the image path to that application's `offline_assets`.
4. Confirm rights/permissions before marking media approved. Build validation rejects missing files or media IDs. Run `npm run content:check -- <app_id>` to catch missing offline media registration.

## Add an application
1. Create `src/apps/<slug>/manifest.json` following an existing app of the same `type`.
2. Assign a new stable `app_id`, a unique entry point, an existing category ID from `config/categories.json`, and an owner.
3. Supply the required arrays: `offline_assets`, `sections`, `media`, `knowledge`, `dependencies`, and `cross_links`. Include the entry point in `offline_assets`.
4. Create the application entry page and local resources under `src/`; use safe relative paths. Preserve navigation and return-to-Hub behavior.
5. Run `npm run content:check -- <app_id>` followed by the full validation suite. The build generates the application registry, search index, offline resource manifest, and catalog automatically—do not hand-edit generated outputs.

## Check the entire application registry
Run `npm run content:check:all` after shared media, knowledge, or navigation changes. The read-only command reports every registered application and returns a nonzero exit status if validation fails. Use `npm run content:check -- <permanent-app-id>` to inspect one app. Run the full test, validation, and security suites before considering a change complete. The preflight checks are developer diagnostics, not release approvals or device acceptance evidence.

## Developer Mode change requests
The developer-only application inspector can export a JSON change request with an app ID, app version, and description. This is a review artifact, not an edit or publication operation. The request format is checked by `scripts/change-request-validation.mjs` and covered by automated tests. Review the request against the current registry before applying changes in the authorized development branch; stale versions or unknown IDs must be rejected. Downloading a request does not constitute approval or completion.

## Before proposing release
- Verify category navigation, search, deep links, Back/Return to Hub, offline entry, and media rendering for each changed app.
- Confirm all release gates, device tests, and media permissions are satisfied. Do not set approval flags without evidence.
- Keep PR #1 draft and unmerged until explicitly authorized. Do not deploy to public tester or production.
- Record commit SHA and all three GitHub Actions conclusions. A pending workflow is not a pass.
