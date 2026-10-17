# MBA Hub V2 ↔ EVO V2 integration contract — Draft 1

Status: development contract, not scientific or publication approval.

## Ownership
MBA owns its shell, navigation, offline bundle and app registry. EVO owns its scientific concepts, relationship evidence, timelines, maps and Paulinella module. MBA must not embed Paulinella data. The legacy `evo-knowledge` interface is a compatibility declaration, not permission to duplicate scientific records.

## Boundary
Use an explicit versioned, read-only link manifest: `schema_version`, `provider`, `provider_version`, `entrypoints[]` with stable `id`, `title`, `href`, and `offline_policy`. Entry IDs are immutable. URLs are deployment configuration, not hardcoded biological identifiers. Cross-app navigation conveys no ancestry or causal scientific claim.

## Fail-closed rules
Reject unsupported schema versions, duplicate IDs, unapproved URL schemes, and undeclared offline promises. External EVO content is not included in MBA's verified offline bundle without a separately approved version-pinned integration and integrity test. Unavailable EVO should not break MBA navigation.

## Gates
Before implementation: independent EVO repository, authoritative EVO entrypoint inventory, interface tests, security review, and explicit tester approval. No production/tester deployment authorized.
