# RCL v0.5 — Orange Hub deployment readiness

## Verified evidence
- Pull request #26 remains draft and unmerged.
- GitHub Actions run 43635799657 (commit d4e8d5f7) completed successfully, including developer/tester builds and RCL integration tests.
- Owner confirmed the isolated PACE preview operates offline on iPhone.
- The isolated preview is **not** the orange developer Hub and its offline result does not establish orange Hub acceptance.

## Deployment gate (owner approval required)
1. Confirm exact orange developer deployment repository/branch and its workflow.
2. Obtain explicit owner authorization to update the orange development environment.
3. Deploy the validated developer bundle, without changing the blue production environment.
4. In orange Hub: Volunteer Tools → RCL Component Testing Laboratory → search for “habitat” → open a card → Back → reopen → Return to Hub.
5. Verify offline reopen after the orange Hub reports ready; retest navigation and search.
6. Record actual results and rollback target before considering any production action.

## Rollback
Preserve the previous orange deployment commit and redeploy it if navigation, search, or offline operation regresses. Do not delete existing Hub V1 or blue production files.

## Release limitations
RCL remains a development-only dummy app. Automatic component selection, a full reusable catalog, and automated PACE orchestration are not yet implemented. Do not describe this as a completed RCL platform.
