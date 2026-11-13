# Comparative fovea illustration license — October 29, 2026

The retained `apps/IMG_4214.jpeg` (`asset-e62b39cc07a542c4`) visually matches the cropped upper panel of Figure 1 in [Potier et al. (2020), Scientific Reports 10:6133](https://doi.org/10.1038/s41598-020-63039-y). The publisher-deposited article's license explicitly covers its figures under **CC BY 4.0** unless separately credited otherwise. Figure 1 contains no restrictive copyright credit. The diagram is comparative reference material, not a seahorse-specific retinal measurement.

Nature's website returned a cookie redirect. The full publisher-deposited article and figure were inspected through [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7145841/) and its [full-text XML mirror](https://www.ebi.ac.uk/europepmc/webservices/rest/PMC7145841/fullTextXML). The image comparison used the silhouettes, paired grey profiles, labels and rim marker. No identity of publisher/JPEG encoding is asserted. Exact retained-image, source-figure and XML hashes and the bounded HTML delta are in `verification/fovea-figure-license-20261029.json`.

## Applied scope

Only this catalog asset becomes `licensed`. Its existing bytes, ID, path and engineering source provenance are retained. The Seahorse figure now displays the article credit, author copyright notice, crop disclosure and source/license links. The alt text identifies a comparative diagram. Replacing precisely this figure's before/after markup reproduces the preceding HTML byte-for-byte, so scientific/editorial paragraphs and all other images are unchanged. The app advances from `2.0.0-alpha.7` to `2.0.0-alpha.8` on this uncombined branch and retains its pending content marker. The owner's independently approved Seahorse text in PR #9 is not revoked or silently replaced by this task.

Before edits, the existing Naturalist text binding and all 31 inherited-content bindings reproduced. They are re-bound for this single catalog metadata change, retaining their authorization quotes and scope. Naturalist files are unchanged; its earlier ephyra-attribution rebind remains recorded, followed by this catalog-only rebind. No new scientific approval is inferred.

The uncombined branch decreases **11 → 10 blockers** by removing only the fovea image permission. Four illustration permissions and five operational gates remain, along with the base branch's Seahorse content marker. Combining the separately approved Seahorse text remains an independent engineering step. No publication, deployment, pilot or device result is asserted.

## Seaweek anatomy artwork — source found, permission unresolved

The original anatomy artwork matching `IMG_4212.jpeg` was located on [Seaweek's own page](https://seaweek.org.nz/large-bellied-seahorse/), specifically `image-2.png`. The official [teaching-tools page](https://seaweek.org.nz/teaching-tools-2/) describes classroom resource use, but the inspected material did not establish cropped-artwork redistribution permission for the guide hub. This finding is bounded: it does not claim that such permission cannot be obtained. Creator identity remains unresolved; a credit on a separate poster collection is not transferred to this image. No permission status changes for it.

The source and scope findings are retained in `verification/seaweek-anatomy-source-20261029.json`. The official [contact page](https://seaweek.org.nz/contact-us/) lists `seaweek@merc.org.nz`. No message was sent.

A concrete request is ready if contact is authorized: “May we reproduce the large-bellied seahorse anatomy illustration shown on your page in an Aquarium volunteer's educational guide hub, including its source repository and offline-download copies? We currently hold a cropped screenshot and would preserve the artwork with the credit you require. Please confirm the rights holder, permitted distribution and any restrictions.”

## Verification

Forty-two focused checks passed. They verify source-license metadata and exact retained image bytes, required visible credit/source/license/crop information, reversible figure-only HTML changes, continued Naturalist text support and continued pending Seaweek status. Full build/test, security/content/artifact and offline results are recorded after completion below.

Completed validation: **1,037/1,037 full-suite tests passed**, with zero failures, cancellations or skips. Build, security scan, all-app content preflight, artifact integrity and diff check passed. Prepared offline navigation passed in both environments (384 developer / 375 tester resources; zero offline network attempts). Exact evidence is in `verification/fovea-license-clearance-20261029.json`. An older blanket pending-image assertion was narrowed to require this figure's specific license evidence while retaining four pending records; no check was removed.
