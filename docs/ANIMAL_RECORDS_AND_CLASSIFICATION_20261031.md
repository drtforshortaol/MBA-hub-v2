# Permanent animal records and visible classification browse

Owner authorized establishing the structure now and explicitly required that classification remain visible. Common/scientific names belong inside apps and must be searchable; the approved familiar Hub index names remain in the main list.

## Data ownership

src/shared/animal-records.js is the single owner for record identity, current app/alias bindings, record type, common/scientific names and aliases, approved index labels, broad group, optional phylum/class/order/family/genus/species, rank-specific sources, review date/status and notes. Animal-index helpers derive existing presentation metadata from these records rather than maintaining another name/group table. Permanent IDs reuse existing stable app IDs. Species records have an animal_id; group and topic references do not. The old whale reference app resolves to the combined topic record.

Fifteen records cover all sixteen animal-category app routes, including the retained whale alias and three unlisted supporting apps. The current Hub still has twelve unique guides: nine species guides and three group/topic references. Stargazer covers a family/genus, so it is recorded as a group rather than inventing a species identity. This does not rename or alter its original app content.

## User experience

Animals visibly offers Browse by classification, collapsed until tapped. Reviewed phylum/class/order/family branches expand to the existing familiar guide links. Genus and species names are stored and searchable but are kept inside the apps rather than added to the Hub animal labels. Group/topic references have their own branch, not a fictitious species placement. Incomplete species records remain linked under Classification not yet reviewed where needed and retain every A–Z, search and broad-group route.

Each app gains a collapsed Names & classification card after its existing content, preserving its original photo/content order. The card contains names, reviewed ranks and explicit source links. Existing application HTML, prose, image bytes, section IDs and scientific name wording are not rewritten. Full original name/alias context remains available.

## Bounded source review

Sources are recorded in the catalog with exact URLs, checked 2026-10-31: Animal Diversity Web (seahorse, sheephead, gray whale, elephant seal and stargazer family context), ITIS (ray TSN 564365, flying fish TSN 1279625, barnacle TSN 89476 and falsejingle TSN 79792), and WoRMS/MolluscaBase (Ceratodoris rosacea AphiaID 1723348). Only the supported ranks selected in each record are filled. Conflicting/unreviewed ranks remain null with a partial/pending review status. A source-attributed hierarchy is not a claim that all authorities use identical ranks. Existing scientific names are retained even where an authority recognizes an alternate name; aliases are searchable. No species identity is inferred from a broad family reference.

No live taxonomic API is required at runtime. External references load only when selected. Incomplete classification cannot block use of an existing animal guide. Missing permanent identity records and unsourced populated ranks are build errors; a valid record with all ranks null is allowed.

## Verification

Automated checks cover all animal route bindings and alias identity, rank/source validation, scientific-name searches, incomplete-record availability, reference/species counts, contextual reset and 240-record classification scaling without double counting. Browser preview verifies the visible classification control, reviewed phylum branches and in-app card. Prior physical-device outcomes remain bound to their prior exact candidate. No new physical-device result, pilot, rollback or final release approval is inferred.
