# MBA Hub V2 — Security and Reuse Readiness
Date: 2026-10-14
Status: Security hardening in progress; NOT a full security certification.

## Scope and intended sharing
- Private development source: `drtforshortaol/MBA-hub-v2` (confirmed private).
- Public tester: `drtforshortaol/MBA-hub-v2-test` (confirmed PUBLIC GitHub repository and Pages).
- V1: `drtforshortaol/MBA-hub` (confirmed PUBLIC).
- Reuse as an **architectural reference for EVO**, not a wholesale import of Aquarium data or live service-worker code.

## Evidence inspected
Reviewed source: `src/core/{hub,app-contract,developer}.js`, `src/sw.js`, `scripts/public-review.mjs`, `config/platform.json`; examined repository visibility and existing build tests.
Added `tests/security-boundaries.test.mjs` to CI to check tester excludes developer module, declares developer=false, guards maintenance repair path, validates registry entry paths, and does not accidentally publish common secret or GitHub admin files.

## Findings
1. **Public means public.** Anyone with the link (and search or repository access) can read tester HTML, content, telephone numbers and photos. "Read-only tester" means no owner maintenance controls in the UI; it does **not** provide authentication, confidential access, or permission enforcement. Only publish content expressly approved for unrestricted public access.
2. Strong defense: public tester excludes `core/developer.js`, and maintenance repair command is guarded to developer environment; versioned and namespaced cache reduces V1/V2 crossover.
3. Good defense: Hub dynamically interpolates registry/search data using an HTML-escape helper; service worker verifies SHA-256 for release resources, though SHA-256 against a manifest served from the same site provides integrity against accidental mismatches, **not independent authenticity** if hosting is compromised.
4. Further review needed: app-specific HTML/JS may include DOM sinks and external links; no comprehensive vulnerability or dependency audit was performed. There is no automatic basis for claiming no XSS, no leaked personal data, or full security.
5. The deployed public tester is not automatically changed by additions to the private development repository or tests. Any new production/tester publication must follow build, validation and review.
6. Hosting and update risk: GitHub access permissions, repository branch restrictions, GitHub Actions versions and third-party QR/video dependencies need periodic review.
7. Sharing reusable architecture with EVO must exclude actual volunteer contact details, internal field notes, copyrighted/media assets lacking independent reuse permissions, and test content unless explicitly authorized.

## Required before calling the architecture a secure reusable foundation
- Pass new security CI checks, then investigate and remediate any failures.
- Add robust automated lint/security rules for unsafe DOM sinks and disallowed protocols; spot-check all app-specific scripts.
- Review all publicly exposed content, especially personal names/numbers and operational procedures, for appropriate public-sharing consent; distinguish "owner approved for volunteer use" from "approved for arbitrary public redistribution".
- Verify GitHub MFA, least-privilege access to private development source, branch protection or review gating for production/tester, and secrets handling using GitHub UI/account settings. These cannot be confirmed from source alone.
- Pin/review CI third-party actions and follow dependency alerts; test release artifacts before promotion.
- Establish a versioned `MBA-EVO` portable contract specification (manifest schema, navigation hooks, data schema, offline asset requirements, validation suite). Export **contracts and generic logic only**; never package MBA content automatically.
- Do not describe the platform as fully secure or privacy certified without independent testing and clear threat model.

## Decision
MBA V2 is a good **architectural example** for EVO and can be used to define common conventions immediately. Treat reusable core code as a candidate requiring isolation tests, privacy review, and security checks before packaging for general sharing.
