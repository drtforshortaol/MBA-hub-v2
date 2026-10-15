# EVO V2 — Unmatched Timeline Events Scope Audit (Draft 1)
Date: 2026-10-14
Status: Read-only structural classification; scientific interpretations unapproved.

## Source inventory
Compared the 35-event provisional Timeline-to-Concept crosswalk with the recovered Master Map migration registry containing 49 concepts and 37 transitions. Exactly 15 Timeline events have no crosswalk references. These are **not broken references**: they are legitimate Timeline topics for which the Map lacks an exact corresponding concept or transition in the recovered source registry.

## Coverage audit
| Timeline event(s) | Topic | Scope finding | Next action |
|---|---|---|---|
| 1–6 | Universe, stars, Solar System, Earth, Moon, early crust and water | Cosmology / planetary geology; not represented as individual Master Map biological concepts | Retain Timeline-only; separately assess evidence and chronology |
| 7 | Origin of life | Not equivalent to LUCA, which presupposes life and later common ancestry | Retain Timeline-only; annotate highly uncertain dating |
| 8 | Hypothetical FUCA-type stage | No matching Map concept; theoretical label and age especially uncertain | Retain Timeline-only with explicit hypothetical status, scientific review required |
| 20 | Arthropod terrestrial colonization | Map `animals` is broad, not an arthropod-on-land event or direct ancestor | Timeline-only; fossil benchmark review |
| 21 | Vertebrate transition onto land | Map `animals` is broad, not a tetrapod transition event | Timeline-only; distinguish aquatic tetrapods and terrestrial adaptations |
| 22 | Early primates | No primate concept in recovered Map | Timeline-only; distinguish stem and crown fossil evidence |
| 23 | Hominin divergence | No hominin or chimpanzee/bonobo split concept in recovered Map | Timeline-only; assess divergence uncertainty |
| 24 | Earliest Homo | No genus Homo concept in recovered Map | Timeline-only; review fossil record and taxonomy |
| 25 | Homo sapiens | No Homo sapiens concept in recovered Map | Timeline-only; review evidence and dating |
| 31 | Gymnosperm lineages expand | Map contains seed plants but no separate gymnosperm concept or diversification event | Timeline-only unless future scientifically authorized context link is introduced |

## Do not conflate
- No new EV/TR identifiers should be invented solely to make a crosswalk complete.
- Do not attach events 7 or 8 to LUCA as a same-as or direct-ancestor relationship.
- Do not equate all animal taxa with particular arthropod, tetrapod, primate, or human transitions.
- `seed-plants` is not synonymous with gymnosperms (angiosperms are seed plants too).
- Timeline-only is a supported coverage outcome, not a migration defect.
- The provisional Timeline IDs `TL-0001` etc. are crosswalk-local labels, not authorized runtime IDs.

## Decision record
15 unmatched events retained without synthetic references. 20 events retain candidate links; these remain unverified. All 35 Timeline events preserve distinct identities. No canonical Map data changed. Zero scientific approvals.

## Next validation / research
Review scientific claims and chronology for 7, 8, 20–25, 31; independently corroborate source references before approval. Separate concept reuse from event identity in the future integrated viewer. Run CI on documentation changes before merge. Production/tester and legacy Timeline/Map remain untouched.
