# Worker A — architecture audit, initial evidence

## Scope and verified observations
Canonical source: drtforshortaol/MBA-hub-v2.
Orange deployment host: drtforshortaol/MBA-hub-v2-dev.
Orange workflow: .github/workflows/deploy-developer.yml on main.
RCL source branch: feature/rcl-lab-prototype-20261114.
Orange workflow source ref: work/device-acceptance-prep-20261030.

### Findings
- AGE-A01 (confirmed): orange workflow inserts El Niño app registration by replacing JavaScript in dist/developer/core/hub.js, rather than using the canonical registry.
- AGE-A02 (confirmed): orange workflow constructs app files from preview uploads during deployment. App behavior has a second source of truth.
- AGE-A03 (confirmed): orange source ref differs from validated RCL feature ref. Blind branch switch is unsafe.
- AGE-A04 (confirmed): orange workflow requires scripts/audit-privacy-snapshot.mjs, scripts/verify-build-artifacts.mjs and scripts/migration/requirements-fidelity.txt; those files were not found on the RCL feature branch during preliminary inspection.
- AGE-A05 (pending): verify full current orange/blue inventory, parity, external Nearby Dining integration, image availability, offline assets, and rollback SHAs before deployment.

## Correction criteria
1. Move El Niño app code/assets into canonical source with a manifest and explicit offline inventory.
2. Build registry from manifests; no deployment-time core JS patches.
3. Preserve all 18 El Niño images and existing user-visible behavior.
4. Ensure orange and blue derive from one canonical platform implementation with environment-specific release inventory.
5. Add regression tests for app presence, navigation, offline integrity and registry behavior.

## Current decision
Do not delete orange or switch its workflow ref yet. No unverified claims of full audit completion.
