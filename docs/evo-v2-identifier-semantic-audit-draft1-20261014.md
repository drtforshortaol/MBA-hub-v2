# EVO V2 — Permanent Identifier Semantic Audit Draft 1
Date: 2026-10-14
Status: Preliminary read-only audit; canonical concept/transition registry definitions NOT YET recovered. No identifier changes or scientific approvals.

## Sources actually inspected
- EVO timeline v11: drtforshortaol/evolution-timeline, main/app.js (35 source events).
- MBA V2 Scientific Approval Matrix Draft 1 and Source Chronology Discrepancy Ledger Draft 1.
- MBA V2 config/migration-provenance.json (confirms EVO v11 source pinned at c6d782d3a8a03e407861a0fbc3aab76e5fbf8d0c; this is application provenance, NOT the scientific EV/TR registry).
- Legacy Master Evolution Map v1.5 main/index.html (map UI inspected; scientific node data still requires extraction).

## Candidate identifier audit
| Event | Candidate ID | Semantic risk | Decision |
|---:|---|---|---|
| 9 | EV-0100 | LUCA concept vs event marker | Pending definition |
| 10 | TR-0100 | Bacteria/Archaea deep divergence; transition semantics | Pending definition |
| 11 | EV-0122 | Cyanobacteria vs photosynthesis innovation | Pending definition |
| 12 | EV-0125 | Great Oxidation Event | Pending definition |
| 13 | EV-0103 | Alphaproteobacterial aerobic physiology may not be lineage identity | Pending definition |
| 14 | EV-0103 | Reused by event 13; persistence-to-present vs historical trait are distinct claims | Potential one-to-many mapping |
| 15 | TR-0104 | Mitochondrial endosymbiosis transition | Pending definition |
| 16 | EV-0110 | LECA vs first eukaryote | Pending definition |
| 17 | EV-0112 | Animal/fungal divergence vs established lineages | Pending definition |
| 18 | EV-0114 | Ediacaran conspicuous marine animals | Potential one-to-many mapping |
| 19 | EV-0114 | Reused by event 18; Cambrian diversification is a distinct interval | Potential one-to-many mapping |
| 26 | TR-0120 | Primary plastid endosymbiosis | Pending definition |
| 27 | EV-0116 | Red and green algal divergence vs red-algal lineage alone | Potential scope mismatch |
| 28 | EV-0118 | Land plants | Pending definition |
| 29 | EV-0136 | Vascular plants | Pending definition |
| 30 | EV-0137 | Seed plants | Pending definition |
| 32 | EV-0138 | Flowering plants | Pending definition |
| 33 | TR-0133 | Secondary red-algal endosymbiosis; multiple lineage histories | Pending definition |
| 34 | EV-0121 | Brown algae | Pending definition |
| 35 | EV-0147 | Kelp | Pending definition |

## Verified mechanical findings
- 20 event-to-ID assignments, involving 18 distinct identifier strings.
- Reused IDs: EV-0103 (events 13 and 14); EV-0114 (events 18 and 19).
- 15 of 35 timeline events have no candidate ID; absence is not automatically an error.
- No duplicate event numbers in the source chronology ledger.
- Source-to-matrix title matching: 35/35 (verified previously).
- No EV/TR semantic definition has been proven by this document. Do not label any assignment scientifically verified.

## Next
Recover the scientific EV/TR concept and transition registry definitions and compare all 18 candidate IDs against their actual labels and relationships. Prioritize reused identifiers and EV-0116; record accepted mappings vs split/alias proposals without changing canonical content.
