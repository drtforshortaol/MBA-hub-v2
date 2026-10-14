# MBA Hub V2 — Technical audit and handoff
Date: 2026-10-13
Status: **Tester reviewed; technical audit partly complete; NOT yet a production-release certification.**

## Repositories
- Version 1 production (protected, not edited): `drtforshortaol/MBA-hub`
- Version 2 private development: `drtforshortaol/MBA-hub-v2`
- Version 2 public tester: `drtforshortaol/MBA-hub-v2-test`
- Tester URL: https://drtforshortaol.github.io/MBA-hub-v2-test/

## User device acceptance
The owner completed iPhone device checks: Hub navigation, species guides (ray/stargazer/gray whale), Naturalist notes/Q&A, Aquarium Library Explorer, Information Center Handbook and tap-to-call, leadership profiles, search and deep links, offline mode, controlled release update and rollback, skeleton video link/transcript, and installation QR codes. The existing V1 content approval is inherited, not re-requested. Android and Windows were **not** physically tested.

## GitHub structural audit results
- Public tester tree: **338 files**.
- Release offline manifest: **336 distinct resources** (none duplicated).
- Exactly two unlisted files: `release.json` and `sw.js`, which have special service-worker/manifest roles.
- Registry: **32 applications**, **11 categories**.
- For all 32 registry apps, declared entry points exist; every declared offline asset exists; every declared category ID exists.
- All 336 declared release resources exist in the public tester repository.
- Private `src/` matches the public tester for **330 of 332** common files by Git blob SHA. Differences: `install.html` (environment-specific install/help text) and `sw.js` (environment/cache/release identity). Verify these intentional divergences whenever promoting a release.
- Public-review report: **0 withheld applications**, V1-approved content inherited.
- **Complete static HTML link audit:** all **37 HTML pages** scanned; **276 local src/href references** resolved; **0 missing local targets**. Root-directory links were correctly treated as legitimate hub links. This audit does not cover links constructed dynamically at runtime.
- GitHub Pages deploy for phone-links update: GitHub Actions run 38471402857 completed **success**. Owner reported tap-to-call works on iPhone.

## Category distribution (important)
- Animals: 15
- Aquarium Updates: 2
- Cannery Row: 0
- Concepts: 5
- Exhibits: 4
- Guide Talks: 0
- Making the Aquarium Come Alive: 0
- Seafood Watch: 0
- Visitor Questions: 0
- Visitor Services: 0
- Volunteer Tools: 6

**Six categories are presently empty in the application registry**. They may be intentional taxonomy placeholders, but do not describe all 11 categories as containing apps without verifying whether applications should be cross-listed there. Do not silently relocate or remove owner-approved content.

## Items still requiring verification
1. Static HTML local-link audit is complete and passed. Still audit runtime-generated links, JS data references, and external/media URLs.
2. Recalculate SHA-256 over all 336 deployed resource bytes, not just the existence checks; validate SW install/update integrity on a fresh device/browser.
3. Review small-screen layout issues in species-highlight action buttons and handbook horizontal shortcut accessibility.
4. Consider an iPhone browser-first external video experience for Steve Webster's Vimeo link (the video was reachable but iOS redirected via the Vimeo app/App Store).
5. Run private repo's build/validation and test suites via CI; inspect failures before tagging.
6. Physically test Android and Windows installation, where available.
7. Resolve empty-category taxonomy with owner before final production promotion.

## Release boundaries
V1 production must remain unchanged. Do not conflate successful user device tests and repository reference checks with full technical certification. Preserve rollback baseline `recovery-baseline-alpha7-update-a`. Keep V2 tester public for guide testing, and perform final changes in V2 repos only. The tester remains `2.0.0-alpha.7` until release criteria are satisfied.
