# EVO V2 — Thirteen High-Priority Relationship Reviews (Draft 1)
Date: 2026-10-14
Status: Evidence screening only. Zero transitions approved for canonical promotion.

## Method and limitations
Inspected original Master Evolution Map v1.5 explanatory text, 37 visual endpoint hypotheses, existing EVO evidence Draft 3, and published review/research sources linked below. The map compresses relationships for teaching; it does not serialize scientifically validated graph endpoints. Endpoint arrays in the candidate file must never be silently promoted to ancestry edges.

| ID / key | Original map description vs candidate | Finding | Disposition |
|---|---|---|---|
| TR-0100 great-split | LUCA -> Bacteria and Archaea | Broad educational depiction of divergent cellular lineages; does not determine timing, exclusive two-way topology, or singular observed split | retain visual hypothesis; no date or strict edge approval |
| TR-0101 bacterial-diversification | Bacteria -> other bacteria and alphaproteobacteria | Map explicitly compresses numerous omitted branches; "other bacteria" is an aggregation, not a single daughter lineage | context/aggregate, not verified bifurcation |
| TR-0102 archaeal-diversification | Archaea -> other archaea and Asgard | Asgard relatives are not proved to be the actual eukaryotic host; summary aggregates many lineages | distinguish related extant group from historical ancestor |
| TR-0104 endosymbiosis | alphaproteobacteria + host -> mitochondrion | Mitochondrial origin involves host/endosymbiont partnership; the map's output is an organelle milestone, not a wholly descended organism | model process with participant roles and product separately; do not approve exact ancestors |
| TR-0105 eukaryogenesis | mitochondrion -> early eukaryote | Mitochondrion alone is NOT a complete ancestral cell; other processes and host ancestry matter | block single-parent phylogenetic interpretation |
| TR-0107 major-euk-div | LECA -> other eukaryotes, opisthokonts, Archaeplastida summary, SAR | Educational compressed list, not rigorously resolved simultaneous root split; placement of eukaryotic root disputed | change **future** graph relation to conceptual overview, not 4-way certified cladogenesis |
| TR-0108 opisthokont-select-transition | LECA -> other groups and opisthokonts | Map text describes the UI following one selected branch, not a newly established lineage split | view-selection only; do not assert direct genealogical edge |
| TR-0110 archaeplastida-select-transition | LECA -> other groups and Archaeplastida summary | Selected view pathway, with "other" representing context | view-selection only |
| TR-0113 sar-select-transition | LECA -> other groups and SAR | Selected view pathway, not an explicit dated emergence event | view-selection only |
| TR-0119 planetary-effect | oxygen-producing cyanobacteria -> GOE | Original clearly calls it a planetary-effect relationship, not descendant lineage | retain causal environmental category, no ancestry assertion |
| TR-0122 archaeplastida-diversification | Archaeplastida -> red algae and green lineage | Valid pedagogical red/green contrast but glaucophyte branch omitted; not an exhaustive phylogeny | preserve omitted-glaucophyte qualification |
| TR-0132 stramenopile-branch | other eukaryotes -> other eukaryotic lineages and stramenopiles | "Other eukaryotes" is pedagogical side-branch/context aggregator, not a demonstrated ancestor | view/aggregate relation only |
| TR-0133 red-derived-plastid | stramenopiles -> photosynthetic stramenopiles | Plastid acquisition requires photosynthetic red-algal contributor; host-to-descendant visual edge omits endosymbiont and uncertain multi-event histories | block ancestry-only interpretation; distinguish host, plastid donor, acquisition process |

## Evidence and caution
- Eukaryotic rooting: https://www.nature.com/articles/s41586-025-08709-5 (2025). Root position remains debated; avoid treating a pedagogical major-group diagram as a resolved basal four-way split.
- Phylogenetic uncertainty of protists: https://pubmed.ncbi.nlm.nih.gov/40871430/ (2025).
- Red plastid history and host disagreement: https://www.nature.com/articles/s41467-021-22044-z (2021).
- 2024 phylogenetic alternative identifying independent acquisitions: https://pubmed.ncbi.nlm.nih.gov/39240751/ . Do not present any one competing scenario as universal consensus.
- 2024 review of complex plastid endosymbioses: https://pubmed.ncbi.nlm.nih.gov/38502496/ .
- Existing internal Draft 3 covers some timeline events, but does not certify these endpoint sets.

## Recommended downstream schema options (NOT APPROVED)
- Separate `evolutionary-ancestry`, `cellular-endosymbiosis`, `environmental-causation`, `summary-aggregation`, and `ui-view-selection` rather than relying on `branching` and a default `continuation`.
- For endosymbioses record donor and host roles and product organelle separately, with explicit unknowns.
- Require individual citation, interpretation, and reviewer approval before moving any candidate IDs from hypotheses into canonical endpoint arrays.
- Never infer missing donors or ancestor edges from visual control order alone.

## Status
13/13 high-priority transitions screened; scientific approvals 0/13. No scientific content, application code, production/tester repo, or canonical endpoint registry modified. CI and physical offline verification not executed during this documentation step.
