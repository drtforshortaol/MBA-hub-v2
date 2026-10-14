# EVO V2 — Legacy Visual Identifier Reconciliation
Date: 2026-10-14
Status: Source-extracted legacy visual IDs; NOT approved canonical registry.

Source: master-evolution-map-test/main/index.html. Legacy visualRegistry iterates Object.keys(content) and assigns VM IDs only to entries with miniMap. IDs are order-dependent.

## Extracted visual registry (73)
| Legacy VM ID | Content key | Concept/transition link |
|---|---|---|
| VM-001 | `luca` | Pending type/semantic verification |
| VM-002 | `great-split` | Pending type/semantic verification |
| VM-003 | `bacteria` | Pending type/semantic verification |
| VM-004 | `archaea` | Pending type/semantic verification |
| VM-005 | `bacterial-diversification` | Pending type/semantic verification |
| VM-006 | `alphaproteobacteria` | Pending type/semantic verification |
| VM-007 | `archaeal-diversification` | Pending type/semantic verification |
| VM-008 | `asgard` | Pending type/semantic verification |
| VM-009 | `toward-host` | Pending type/semantic verification |
| VM-010 | `host` | Pending type/semantic verification |
| VM-011 | `endosymbiosis` | Pending type/semantic verification |
| VM-012 | `mitochondrion` | Pending type/semantic verification |
| VM-013 | `eukaryogenesis` | Pending type/semantic verification |
| VM-014 | `early-eukaryote` | Pending type/semantic verification |
| VM-015 | `toward-leca` | Pending type/semantic verification |
| VM-016 | `leca` | Pending type/semantic verification |
| VM-017 | `cyano-branch` | Pending type/semantic verification |
| VM-018 | `cyanobacteria` | Pending type/semantic verification |
| VM-019 | `oxygenic-photosynthesis` | Pending type/semantic verification |
| VM-020 | `oxygen-producing-cyano` | Pending type/semantic verification |
| VM-021 | `cyano-continuation` | Pending type/semantic verification |
| VM-022 | `modern-cyano` | Pending type/semantic verification |
| VM-023 | `planetary-effect` | Pending type/semantic verification |
| VM-024 | `goe` | Pending type/semantic verification |
| VM-025 | `plastid-cyano` | Pending type/semantic verification |
| VM-026 | `euk-host` | Pending type/semantic verification |
| VM-027 | `primary-plastid-endo` | Pending type/semantic verification |
| VM-028 | `primary-plastid` | Pending type/semantic verification |
| VM-029 | `plastid-integration` | Pending type/semantic verification |
| VM-030 | `archaeplastida` | Pending type/semantic verification |
| VM-031 | `archaeplastida-diversification` | Pending type/semantic verification |
| VM-032 | `green-lineage` | Pending type/semantic verification |
| VM-033 | `other-green-algae` | Pending type/semantic verification |
| VM-034 | `streptophyte-lineage` | Pending type/semantic verification |
| VM-035 | `land-transition` | Pending type/semantic verification |
| VM-036 | `land-plants` | Pending type/semantic verification |
| VM-037 | `red-lineage-transition` | Pending type/semantic verification |
| VM-038 | `red-seaweed-diversification` | Pending type/semantic verification |
| VM-039 | `red-kelp` | Pending type/semantic verification |
| VM-040 | `stramenopile-branch` | Pending type/semantic verification |
| VM-041 | `stramenopiles` | Pending type/semantic verification |
| VM-042 | `red-derived-plastid` | Pending type/semantic verification |
| VM-043 | `photosynthetic-stramenopiles` | Pending type/semantic verification |
| VM-044 | `brown-branch` | Pending type/semantic verification |
| VM-045 | `diatoms` | Pending type/semantic verification |
| VM-046 | `brown-algae` | Pending type/semantic verification |
| VM-047 | `kelp-transition` | Pending type/semantic verification |
| VM-048 | `kelps` | Pending type/semantic verification |
| VM-049 | `giant-kelp-transition` | Pending type/semantic verification |
| VM-050 | `giant-kelp` | Pending type/semantic verification |
| VM-051 | `major-euk-div` | Pending type/semantic verification |
| VM-052 | `opisthokonta` | Pending type/semantic verification |
| VM-053 | `opisthokont-branch` | Pending type/semantic verification |
| VM-054 | `fungi` | Pending type/semantic verification |
| VM-055 | `animals` | Pending type/semantic verification |
| VM-056 | `archaeplastida-summary` | Pending type/semantic verification |
| VM-057 | `archaeplastida-summary-branch` | Pending type/semantic verification |
| VM-058 | `red-summary` | Pending type/semantic verification |
| VM-059 | `green-summary` | Pending type/semantic verification |
| VM-060 | `sar` | Pending type/semantic verification |
| VM-061 | `stramenopiles-summary` | Pending type/semantic verification |
| VM-062 | `brown-summary` | Pending type/semantic verification |
| VM-063 | `vascular-transition` | Pending type/semantic verification |
| VM-064 | `vascular-plants` | Pending type/semantic verification |
| VM-065 | `seed-transition` | Pending type/semantic verification |
| VM-066 | `seed-plants` | Pending type/semantic verification |
| VM-067 | `flower-transition` | Pending type/semantic verification |
| VM-068 | `flowering-plants` | Pending type/semantic verification |
| VM-069 | `seagrass-transition` | Pending type/semantic verification |
| VM-070 | `seagrasses` | Pending type/semantic verification |
| VM-071 | `eelgrass-transition` | Pending type/semantic verification |
| VM-072 | `eelgrass` | Pending type/semantic verification |
| VM-073 | `land-summary` | Pending type/semantic verification |

## Migration safeguards
- Preserve source keys and original legacy IDs; never regenerate permanent IDs from order.
- Reconcile each content key against the 49 EV and 37 TR identifiers before promotion.
- Some visuals describe transitions rather than concepts; do not assume one-to-one concept mapping.
- Verify chronology, lineage continuity, and scientific relationships separately.
- No legacy application, production, tester, or publication changes.

## Checks
- Visual records extracted: 73.
- VM uniqueness: PASS.
- Scientific mapping: PENDING.
- CI and offline tests: NOT RUN.
