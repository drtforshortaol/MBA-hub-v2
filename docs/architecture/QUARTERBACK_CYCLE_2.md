# Quarterback integration status — cycle 2

## Worker handoffs
- Worker A draft PR #27: confirmed orange deployment mutates built Hub JavaScript and assembles El Niño at publish time. Audit still incomplete for app inventory.
- Worker B draft PR #28: AGE-004 guard and unit tests. The guard is preliminary and **not** yet an enforced release gate in the orange deployment repository.
- Both PRs target the quarterback branch for review. Neither is merged or deployed.

## Integration order
1. Obtain complete orange and blue app inventories, their source SHAs, and baseline offline results.
2. Migrate El Niño into the canonical source manifest and assets without changing content.
3. Align orange/blue build pipelines to the same authoritative source architecture, allowing different release inventories.
4. Enforce AGE-001 through AGE-004 in CI, including an orange-host deployment gate.
5. Verify CI, app parity, offline functionality and rollback, then publish orange under owner authorization.
6. Blue deployment remains separately gated by explicit owner approval.

## Blocking findings
- Orange workflow currently checks out work/device-acceptance-prep-20261030, not RCL.
- The RCL source branch lacks scripts used by the existing orange workflow; do not blindly switch the ref.
- Current orange deployment modifies core/hub.js to inject El Niño; AGE-004 would reject this workflow.
- Do not claim architectural synchronization or compliance until those are corrected and tested.
