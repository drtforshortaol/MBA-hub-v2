# RCL Lab browser acceptance — development only

## Why downloaded HTML did not work
The iPhone file preview displayed static `<details>` cards but did not run the search JavaScript. This is not a browser acceptance result.

## Preview route
The laboratory is registered under **Volunteer Tools** in the *developer build only*. CI is configured to retain `rcl-lab-developer-preview` as a seven-day artifact for this draft PR. An artifact is not a live website: it must be served from a local HTTP server or separately approved HTTPS preview host. Do not publish or merge to the existing orange or blue Hub without owner authorization.

## Browser tests
1. Open the **developer build** from its own origin/path, then Volunteer Tools → RCL Component Testing Laboratory (Dummy).
2. Verify Ocean Science, Marine Habitats, Visitor Guidance are visible.
3. Expand/collapse each card; enter `ocean` to filter to one; clear to restore all; search `zzzz` to show empty state.
4. Verify Back returns to the prior Hub context; Return to Hub resets to Hub root.
5. Wait for ready-offline status; switch to airplane mode; close and reopen; repeat navigation and search.
6. Verify tester bundle registry and files contain no `rcl-component-lab`.

## Status
Code committed, browser/device checks not yet executed. GitHub Actions run status not yet confirmed. No production release.
