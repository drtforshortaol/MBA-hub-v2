# MBA Hub V2 architecture consolidation — quarterback
Status: IN PROGRESS. Source baseline: feature/rcl-lab-prototype-20261114.

## Non-negotiable invariants
1. GLOBAL → SUB-GLOBAL → SUB-SUB-GLOBAL → COMPONENT. Every module has one owner.
2. The canonical MBA-hub-v2 source owns application code. Deployment repositories must not own app behavior.
3. Orange and blue use the same registry schema, platform contracts and build logic; environment configuration and approved app inventory may differ.
4. Applications register through manifests, never by patching core/hub.js at deployment.
5. A failed AGE rule blocks integration and deployment; no bypass.
6. Preserve existing orange El Niño, Nearby Dining and other functional apps; preserve blue and V1 until acceptance.

## Three-branch assignments
- Quarterback (this branch): inventory evidence, integration decisions, compatibility checks, release gates, rollback; no production changes.
- Worker A (architecture/worker-a-audit-20261114): compare canonical source and orange deployment, inventory violations, map El Niño migration without content loss.
- Worker B (architecture/worker-b-age-20261114): implement independently testable AGE guards for deployment-time source mutation and registry ownership.

## Integration gate
Require Worker A evidence, Worker B tests, clean source integration, CI success, preserved orange app inventory, rollback reference, and explicit acceptance before any blue release.
Do not merge workers blindly. No orange deployment until source/build incompatibilities are reconciled and tested.

## Confirmed baseline risk
Orange deployment workflow .github/workflows/deploy-developer.yml in MBA-hub-v2-dev checks out work/device-acceptance-prep-20261030, patches core/hub.js to inject El Niño, and rebinds offline inventory. RCL feature source does not have some older workflow build scripts. Switching refs without reconciliation is unsafe.
