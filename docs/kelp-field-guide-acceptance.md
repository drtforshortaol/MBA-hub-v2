# California Kelp Field Guide — acceptance and scientific review
Status: development only. Production merge requires owner approval.

## Automated checks
Run `node --test tests/kelp-field-guide.test.mjs` from repository root.
Checks: manifest ownership and routing, source offline assets, accessibility hooks, 21 species entries, core terminology and no external network scripts.
The repository-wide `npm test` workflow includes this targeted test. CI success confirms automated checks only; it does not replace scientific approval or physical-device testing. Latest confirmed successful validation: GitHub Actions run #937 (commit `71d8245`).

## Scientific review required
- Confirm current scientific names and ranges, especially the giant kelp `Macrocystis pyrifera` / `M. tenuifolia` split described in the 2026 illustrated guide.
- Verify whether the selected 21 taxa are all appropriately presented as California kelps; check genus updates and synonyms.
- Confirm the classification of `Undaria pinnatifida` as introduced/invasive and distinguish local observations from statewide claims.
- Confirm canopy/understory/intertidal categories are interpretive simplifications rather than exclusive habitats.
- Confirm annual/perennial life cycles, growth-rate claims, and visitor language against current Aquarium-approved references.
- The user-provided 2026 Andrea Dingeldein guide and 2024 Monterey Bay Aquarium giant kelp sheet are research inputs, not a blanket scientific approval.
- No copyrighted source illustrations are redistributed. Any future photography needs provenance and permission.

## Scientific sign-off record (pending)
Do not infer approval from a successful build. For each entry, record the accepted scientific name, source title/date, page or URL, range evidence, identification evidence, and reviewer/date. Mark unresolved claims as **provisional** rather than verified.

**Priority review queue**
1. **Giant kelp:** confirm whether `Macrocystis pyrifera` and `M. tenuifolia` are treated as distinct California taxa in the intended reference system; update species labels and search aliases only after evidence review.
2. **Wakame:** verify introduced/invasive status and geographical scope; avoid implying it is present at every California site.
3. **Net-of-cords kelps:** independently verify `Dictyoneurum californicum` and `D. reticulatum` names and distinguishable traits.
4. **Other 17 entries:** verify current accepted names, California occurrence, distinctive characters, and any annual/perennial claims.

**Approval record:** scientific reviewer: _not assigned_; review date: _pending_; evidence matrix: _pending_; disposition: **not approved for formal publication**.

## Device acceptance checklist (owner)
1. Open development Hub on iPhone; navigate Exhibits → Kelp Field Guide.
2. Search for giant kelp, bull kelp, and scientific name `Undaria pinnatifida`.
3. Select a kelp group (including canopy and introduced), expand/collapse an entry, then clear filters. Confirm that group labels are simplified identification aids, not exclusive habitats.
4. Enter a search with no matches; verify the reset hint appears, then clear the search. Open Anatomy and confirm labels are readable without sideways scrolling.
5. With page loaded, turn on Airplane Mode; close and reopen the installed development PWA; verify page and search still work.
6. Return to Hub and verify Back navigation.
7. Repeat basic navigation on Android/Windows if available.

## Verification boundaries
- **Verified in CI:** build and repository test suite passed on commit `71d8245` (run #937).
- **Not yet verified:** physical iPhone/Android/Windows operation, developer-site deployment, scientific taxonomy approval, and owner acceptance.
- **Production protection:** do not merge or deploy this feature without explicit owner authorization.

## Release gates
- Confirm actual developer bundle includes the app and displays its entry under Exhibits.
- Run targeted test and CI; address failures.
- Complete scientific review and device acceptance.
- Explicit owner approval before merge/deployment.
