# EVO V2 — Legacy ID Reconciliation Checkpoint
Date: 2026-10-14
Status: Extracted legacy identifiers; NOT approved EVO V2 canonical IDs.

The Master Map v1.5 derives EV-/TR- identifiers from FIRST DOM APPEARANCE of unique node/transition data-key values. They are order-dependent and must be frozen before any markup rearrangement. VM- identifiers are assigned by object iteration to content records with miniMap; they are NOT yet frozen here. This is a migration audit, not an EVO V2 data registry.

Source: master-evolution-map-test/main/index.html; MBA V2 draft cross-reference commit cdd8563.

## Full extracted node identifiers (49)
- EV-0100 = luca
- EV-0101 = bacteria
- EV-0102 = other-bacteria
- EV-0103 = alphaproteobacteria
- EV-0104 = archaea
- EV-0105 = other-archaea
- EV-0106 = asgard
- EV-0107 = host
- EV-0108 = mitochondrion
- EV-0109 = early-eukaryote
- EV-0110 = leca
- EV-0111 = other-major-euks
- EV-0112 = opisthokonta
- EV-0113 = fungi
- EV-0114 = animals
- EV-0115 = archaeplastida-summary
- EV-0116 = red-summary
- EV-0117 = green-summary
- EV-0118 = land-summary
- EV-0119 = sar
- EV-0120 = stramenopiles-summary
- EV-0121 = brown-summary
- EV-0122 = cyanobacteria
- EV-0123 = oxygen-producing-cyano
- EV-0124 = modern-cyano
- EV-0125 = goe
- EV-0126 = plastid-cyano
- EV-0127 = euk-host
- EV-0128 = primary-plastid
- EV-0129 = archaeplastida
- EV-0130 = red-algae
- EV-0131 = red-kelp
- EV-0132 = green-lineage
- EV-0133 = other-green-algae
- EV-0134 = streptophyte-lineage
- EV-0135 = land-plants
- EV-0136 = vascular-plants
- EV-0137 = seed-plants
- EV-0138 = flowering-plants
- EV-0139 = seagrasses
- EV-0140 = eelgrass
- EV-0141 = other-eukaryotes
- EV-0142 = other-eukaryotic-lineages
- EV-0143 = stramenopiles
- EV-0144 = photosynthetic-stramenopiles
- EV-0145 = diatoms
- EV-0146 = brown-algae
- EV-0147 = kelps
- EV-0148 = giant-kelp

## Full extracted transition identifiers (37)
- TR-0100 = great-split
- TR-0101 = bacterial-diversification
- TR-0102 = archaeal-diversification
- TR-0103 = toward-host
- TR-0104 = endosymbiosis
- TR-0105 = eukaryogenesis
- TR-0106 = toward-leca
- TR-0107 = major-euk-div
- TR-0108 = opisthokont-select-transition
- TR-0109 = opisthokont-branch
- TR-0110 = archaeplastida-select-transition
- TR-0111 = archaeplastida-summary-branch
- TR-0112 = green-to-land-summary
- TR-0113 = sar-select-transition
- TR-0114 = sar-branch
- TR-0115 = brown-summary-transition
- TR-0116 = cyano-branch
- TR-0117 = oxygenic-photosynthesis
- TR-0118 = cyano-continuation
- TR-0119 = planetary-effect
- TR-0120 = primary-plastid-endo
- TR-0121 = plastid-integration
- TR-0122 = archaeplastida-diversification
- TR-0123 = red-lineage-transition
- TR-0124 = red-seaweed-diversification
- TR-0125 = green-diversification
- TR-0126 = land-transition
- TR-0127 = vascular-transition
- TR-0128 = seed-transition
- TR-0129 = flower-transition
- TR-0130 = seagrass-transition
- TR-0131 = eelgrass-transition
- TR-0132 = stramenopile-branch
- TR-0133 = red-derived-plastid
- TR-0134 = brown-branch
- TR-0135 = kelp-transition
- TR-0136 = giant-kelp-transition

## Timeline candidate reconciliation
| Event | Candidate | Legacy ID | Status |
|---:|---|---|---|
| 1 | — | — | Unmatched |
| 2 | — | — | Unmatched |
| 3 | — | — | Unmatched |
| 4 | — | — | Unmatched |
| 5 | — | — | Unmatched |
| 6 | — | — | Unmatched |
| 7 | — | — | Unmatched |
| 8 | — | — | Unmatched |
| 9 | luca | EV-0100 | Existing legacy ID, semantic mapping unverified |
| 10 | great-split | TR-0100 | Existing legacy ID, semantic mapping unverified |
| 11 | cyanobacteria | EV-0122 | Existing legacy ID, semantic mapping unverified |
| 12 | goe | EV-0125 | Existing legacy ID, semantic mapping unverified |
| 13 | alphaproteobacteria | EV-0103 | Existing legacy ID, semantic mapping unverified |
| 14 | — | — | Unmatched |
| 15 | endosymbiosis | TR-0104 | Existing legacy ID, semantic mapping unverified |
| 16 | leca | EV-0110 | Existing legacy ID, semantic mapping unverified |
| 17 | opisthokonta | EV-0112 | Existing legacy ID, semantic mapping unverified |
| 18 | animals | EV-0114 | Existing legacy ID, semantic mapping unverified |
| 19 | animals | EV-0114 | Existing legacy ID, semantic mapping unverified |
| 20 | — | — | Unmatched |
| 21 | — | — | Unmatched |
| 22 | — | — | Unmatched |
| 23 | — | — | Unmatched |
| 24 | — | — | Unmatched |
| 25 | — | — | Unmatched |
| 26 | primary-plastid-endo | TR-0120 | Existing legacy ID, semantic mapping unverified |
| 27 | red-summary | EV-0116 | Existing legacy ID, semantic mapping unverified |
| 28 | land-summary | EV-0118 | Existing legacy ID, semantic mapping unverified |
| 29 | — | — | Unmatched |
| 30 | — | — | Unmatched |
| 31 | — | — | Unmatched |
| 32 | — | — | Unmatched |
| 33 | red-derived-plastid | TR-0133 | Existing legacy ID, semantic mapping unverified |
| 34 | brown-summary | EV-0121 | Existing legacy ID, semantic mapping unverified |
| 35 | — | — | Unmatched |

## Validation
- Source DOM entries: 89; distinct node keys: 49; distinct transition keys: 37.
- ID uniqueness by prefix/order: PASS.
- Candidate IDs resolved: 15/35.
- Visual VM references: pending extraction; do not infer.
- Scientific semantic review, automated CI, browser/offline validation: pending.

No content, runtime application code, publication, or legacy repositories changed.
