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
