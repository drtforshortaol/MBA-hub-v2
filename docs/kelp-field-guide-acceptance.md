# California Kelp Field Guide — acceptance and scientific review
Status: development only. Production merge requires owner approval.

## Automated checks
Run `node --test tests/kelp-field-guide.test.mjs` from repository root.
Checks: manifest ownership and routing, source offline assets, accessibility hooks, 21 species entries, core terminology and no external network scripts.
**Important:** passing repository-wide workflow does not substitute for running this targeted test or testing on a device.

## Scientific review required
- Confirm current scientific names and ranges, especially the giant kelp `Macrocystis pyrifera` / `M. tenuifolia` split described in the 2026 illustrated guide.
- Verify whether the selected 21 taxa are all appropriately presented as California kelps; check genus updates and synonyms.
- Confirm the classification of `Undaria pinnatifida` as introduced/invasive and distinguish local observations from statewide claims.
- Confirm canopy/understory/intertidal categories are interpretive simplifications rather than exclusive habitats.
- Confirm annual/perennial life cycles, growth-rate claims, and visitor language against current Aquarium-approved references.
- The user-provided 2026 Andrea Dingeldein guide and 2024 Monterey Bay Aquarium giant kelp sheet are research inputs, not a blanket scientific approval.
- No copyrighted source illustrations are redistributed. Any future photography needs provenance and permission.

## Device acceptance checklist (owner)
1. Open development Hub on iPhone; navigate Exhibits → Kelp Field Guide.
2. Search for giant kelp, bull kelp, and scientific name `Undaria pinnatifida`.
3. Filter canopy, expand/collapse an entry, then clear filters.
4. Open Anatomy and confirm labels readable without sideways scrolling.
5. With page loaded, turn on Airplane Mode; close and reopen the installed development PWA; verify page and search still work.
6. Return to Hub and verify Back navigation.
7. Repeat basic navigation on Android/Windows if available.

## Release gates
- Confirm actual developer bundle includes the app and displays its entry under Exhibits.
- Run targeted test and CI; address failures.
- Complete scientific review and device acceptance.
- Explicit owner approval before merge/deployment.
