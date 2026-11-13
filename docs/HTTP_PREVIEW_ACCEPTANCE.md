# HTTP preview acceptance

Build the developer and tester bundles and serve their parent directory locally. Audit each environment's directory URL:

```sh
npm run verify:preview:http -- --url http://127.0.0.1:8080/tester/ --environment tester --report /tmp/tester-http-report.json
```

Use the developer directory and `--environment developer` for the other bundle. The command performs GET requests only; it does not build, deploy, publish or alter a preview. Failed acceptance exits nonzero. Use local builds or preview URLs already authorized for checking.

The audit fetches the release inventory and every declared resource, then independently checks downloaded artifact semantics. Redirects, login fallback pages, missing resources, altered bytes, wrong environments, incomplete search coverage and incompatible worker release bindings fail acceptance. Downloads have bounded concurrency, a 15-second request deadline, a 120-second overall network deadline and byte limits. Unsafe/duplicate resource paths are rejected before resource requests begin.

The JSON report binds evidence to the exact release and environment. It records verified resource/byte totals and one application row containing its entry point, declared offline resource count, declared media count, offline media count, verified unique required resources and missing paths. App-required resources combine its entry, declared offline assets and referenced offline media. Shared resources can appear in multiple app rows; the global release count includes each resource once.

App rows describe HTTP delivery. The top-level `passed` value also requires artifact semantics to pass. This does not establish browser rendering, interactions, worker installation, device update/rollback or physical offline behavior. Each app's `physicalTesting` remains `not assessed`; scientific, editorial and release approvals are unchanged.

HTTP test fixtures use temporary immutable snapshots of a built bundle, independent of subsequent activity in `dist`. The verifier downloads into its own temporary directory and removes it after each audit.

## Browser delivery headers and release pinning

HTML, CSS and JavaScript files (including the service worker) must arrive with compatible Content-Type headers. MIME essence comparison ignores case and parameters and accepts the standard JavaScript aliases. These generated HTML documents require `text/html`; styles require `text/css`. Missing or incompatible types, or `Content-Disposition: attachment` for HTML navigation, fail the audit even when the response bytes match. JSON fetched as data and media formats have no additional MIME acceptance gate here. Browser rendering and runtime execution still require separate testing.

To ensure the server delivers a particular build, add `--expected-release` with the 16-character lowercase hexadecimal release identifier from that build's `release.json`. A different, internally consistent release fails immediately after its manifest is fetched. The report's additive `expectedRelease` field records the pin, or `null` for an unpinned audit. Unpinned acceptance verifies whichever release the server currently supplies. Global and per-app verified-resource counts require both matching bytes and compatible delivery headers for applicable resources.
