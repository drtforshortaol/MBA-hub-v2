# EVO V2 Recovered Draft Registry Semantic Crosswalk
Date: 2026-10-14
Status: Registry recovered; scientific approval pending.

The prior registry-not-found checkpoint is superseded. GitHub branch comparison identified docs/evo-v2-complete-migration-registry-draft-20261014.json and docs/evo-v2-permanent-id-registry-candidate-20261014.json. Both are drafts, not approved canonical definitions.

| Event | ID | Registry key | Finding |
|---:|---|---|---|
| 9 | EV-0100 | luca | Context match plausible; event-level equivalence unapproved |
| 10 | TR-0100 | great-split | Context match plausible; event-level equivalence unapproved |
| 11 | EV-0122 | cyanobacteria | cyanobacteria node is not the oxygenic-photosynthesis transition |
| 12 | EV-0125 | goe | Context match plausible; event-level equivalence unapproved |
| 13 | EV-0103 | alphaproteobacteria | lineage node does not certify aerobic physiology |
| 14 | EV-0103 | alphaproteobacteria | reuses lineage ID for persistence to present |
| 15 | TR-0104 | endosymbiosis | Context match plausible; event-level equivalence unapproved |
| 16 | EV-0110 | leca | Context match plausible; event-level equivalence unapproved |
| 17 | EV-0112 | opisthokonta | opisthokonta broader than animal/fungal divergence |
| 18 | EV-0114 | animals | animals node not Ediacaran event |
| 19 | EV-0114 | animals | animals node not Cambrian radiation |
| 26 | TR-0120 | primary-plastid-endo | Context match plausible; event-level equivalence unapproved |
| 27 | EV-0116 | red-summary | red-summary cannot stand for red and green jointly |
| 28 | EV-0118 | land-summary | land-summary is not detailed land-plants node |
| 29 | EV-0136 | vascular-plants | Context match plausible; event-level equivalence unapproved |
| 30 | EV-0137 | seed-plants | Context match plausible; event-level equivalence unapproved |
| 32 | EV-0138 | flowering-plants | Context match plausible; event-level equivalence unapproved |
| 33 | TR-0133 | red-derived-plastid | Context match plausible; event-level equivalence unapproved |
| 34 | EV-0121 | brown-summary | brown-summary is not detailed brown-algae node |
| 35 | EV-0147 | kelps | Context match plausible; event-level equivalence unapproved |

Mechanical checks: 35 event rows; 20 mapped assignments; 18 distinct IDs; 0 missing IDs; 49 concept keys; 37 transition keys.

Unresolved: biological definitions and transition endpoints must be compared against Master Map source. No scientific approvals, code edits, deployments, CI, or device tests are claimed.

Next task: inspect actual Master Map data-key nodes and transition edges, verify the pinned EVO Timeline commit, and run development registry integrity checks.
