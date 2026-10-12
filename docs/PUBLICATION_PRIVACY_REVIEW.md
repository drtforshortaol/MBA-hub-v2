# Alpha.6 publication review

GitHub validation for source commit 009dc89964bb7f959702e3a67bbd257c9132965a completed successfully on October 12, 2026. The full collection remains private; the public tester is still alpha.4.

## Findings requiring owner decisions

| Content | Evidence | Decision before public testing |
|---|---|---|
| Aquarium Library | Dataset includes owner and borrowed fields; the interface displays both and searches owners. | Approve public use or redact personal owner/borrower fields from a separately reviewed distribution. |
| Information Center | Internal extensions, staff procedures, lost-property handling and volunteer arrangements. | Confirm authorization for public distribution or keep this app in an authenticated environment. |
| Naturalist Field Notes | Historical shift schedules, training, substitute arrangements and volunteer resource references mixed with educational content. | Approve dated operational material or prepare an educational-only distribution. |
| Leadership | Named leadership profiles; inspected email fields are blank. | Review profile publication scope and accuracy. |
| Shared media | All 203 catalog assets are marked review-required; inherited captions/credits remain in source apps. | Confirm reuse permission and attribution per asset. An upstream public repository is not permission evidence. |

No data was silently removed from the private migration. No permission or privacy gate was marked passed. Upstream repositories were not edited. The current source is reviewable and reproducible with pinned source provenance.

## Next device candidate

After these decisions, generate the approved tester distribution, verify that excluded fields are absent from source, search indexes and offline caches, then test the entire collection on iPhone online/offline. Cover cross-app Back context, Hub reset, search deep links, images, update interruption and whole-bundle rollback. Run the owner plus three-reviewer pilot before full release.
