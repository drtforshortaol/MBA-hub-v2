# EVO V2 — Classification Ambiguity and Source Evidence Audit (Draft 1)
Date: 2026-10-14
Status: Provisional interpretation screening only; zero scientific or canonical endpoint approvals.

## Source and method
Compared the 37-row provisional classification register with the 37-row endpoint manifest, legacy migration registry, prior high-priority relationship review, and original `master-evolution-map-test/index.html` source. Source labels and pedagogical layout are evidence of **presentation intent**, not independent proof of phylogenetic ancestry. Original visual labels and behavior remain unchanged.

## Ambiguities and escalation (not proposed canonical changes)

| Transition | Provisional class | Source-language issue / contested inference | Required scientific decision |
|---|---|---|---|
| TR-0100 great-split | evolutionary-branching | Pedagogical LUCA division; not a dated, fully resolved two-child organismal graph | Specify lineage semantics, uncertainties and evidence |
| TR-0101, TR-0102, TR-0107, TR-0111, TR-0116, TR-0132 | summary-aggregation | Aggregated groups and omitted branches cannot be represented as certified bifurcations | Specify aggregation semantics and non-ancestral rendering |
| TR-0103 toward-host; TR-0106 toward-leca | ancestry-context | Extant Asgard lineages and hypothetical host/LECA trajectory cannot be taken as identified direct ancestors | Distinguish related lineage, inferred ancestor and conceptual path |
| TR-0104 endosymbiosis; TR-0120 primary-plastid-endo | cellular-endosymbiosis | Host, donor, organelle outcome, and organism are different biological roles | Review donor/host/product participant model |
| TR-0105 eukaryogenesis | complex-evolutionary-process | Mitochondrion-to-cell visual sequence is not single-parent lineage descent | Review process model; block organelle-as-parent |
| TR-0108, TR-0110, TR-0113 | ui-view-selection | Original source describes selected navigation branch rather than newly proven descent | Keep view controls nonphylogenetic |
| TR-0112 green-to-land-summary | ui-view-selection | Original button label is `Selected branch`; fallback continuation is runtime only | Verify UI scope separately from biology |
| TR-0114 sar-branch; TR-0115 brown-summary-transition | ancestry-context | Original labels `Toward Stramenopiles` and `Toward brown algae` imply direction/overview; fallback does not prove ancestry | Consider navigation/summary alternative before approval |
| TR-0119 planetary-effect | environmental-causation | Oxygenation/Great Oxidation Event is environmental effect, not a descendant taxon | Specify causal evidence separate from ancestry |
| TR-0122 archaeplastida-diversification | evolutionary-branching | Red/green visual simplification omits glaucophytes; does not establish exhaustive cladogram | Annotate omissions; independently review phylogeny |
| TR-0124 red-seaweed-diversification | evolutionary-diversification | Original `red-kelp` means colloquial red seaweeds, explicitly **not** true kelps | Preserve terminology and avoid kelp homology |
| TR-0126–TR-0129 land/vascular/seed/flower transitions | evolutionary-innovation | Milestone sequence may be conflated with strict lineage-edge ancestry | Separate emergence of traits from ancestor assertions |
| TR-0130 seagrass-transition | habitat-transition | Marine habitat shift is not a standalone lineage ancestor | Decide trait/habitat vs clade semantics |
| TR-0131 eelgrass-transition; TR-0136 giant-kelp-transition | ancestry-context | Original uses `One seagrass lineage` and giant-kelp selection; not evidence for unique direct descent | Review exemplar/selection alternative |
| TR-0133 red-derived-plastid | cellular-endosymbiosis | Original calls it `Red-algal-derived plastid history`; source path omits donor and alternatives in complex plastid history | Review host/donor and uncertainty, no single scenario asserted |
| TR-0135 kelp-transition | evolutionary-diversification | Group-level selection vs explicit diversification event remains ambiguous | Verify map description, literature, and presentation intent |

## Mandatory approval gates
- No changes to EV/TR/VM permanent identifiers or to canonical source/target endpoint arrays.
- No inference of phylogenetic parentage from markup order, line shapes, selectable controls, or a default runtime class.
- For each transition record original text, evidence citation, competing models where relevant, endpoint roles, reviewer and approval decision.
- Scientific category acceptance and canonical endpoint review are independent gates; neither is approved here.
- Required validation: structural validator execution, negative mutation tests, CI, and offline runtime smoke test before any release.

## Verification limits
This audit inventories ambiguity and source-language conflicts, not peer-reviewed scientific correctness. 37 classifications remain unverified. The 13 runtime-fallback records are a provenance-risk subset and are **not** 13 validated biological relationships.
