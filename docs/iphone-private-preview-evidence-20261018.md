# iPhone private preview evidence — October 18, 2026

## Scope and provenance

These are user-reported checks on the private iPhone preview, recorded separately from automated verification. Times are on October 18, 2026 in America/Los_Angeles (PDT, UTC−07:00). No iPhone model or iOS version was provided.

The preview used integration source `8cefb1d`, with deployed Sites source `c388599`. This document describes that private preview; it does not assert that the isolated quality branch or any later source revision was physically tested.

## Reported observations

| Local time | User-reported observation | Scope |
|---|---|---|
| Not provided | Initial redirect error occurred. | Initial private preview access |
| Not provided | Preview access recovered after the redirect issue. | Recovery of access |
| 15:46 | Safari online reload succeeded. | Safari, connected |
| 15:46 | Offline reload succeeded. | Safari, disconnected |
| 15:50 | Home Screen launch worked online, offline, then online again. | Installed Home Screen flow and connectivity changes |
| 15:50 | Seahorse opened offline. | Selected app offline access |

The initial error remains part of the evidence; the successful recovery checks do not establish that every redirect or installation path is covered.

## Acceptance boundaries

No global release, device acceptance, scientific approval, publication, or deployment flag is changed by this record. These observations support the specific flows above on the tested private preview only.

Broader acceptance remains outstanding: complete app/media coverage, additional navigation and installation paths, sustained/interrupted updates and rollback on physical devices, other browser/device combinations, Android and Windows testing, additional-guide pilot, and all remaining owner, scientific and release gates. Do not infer that an unreported check passed.
