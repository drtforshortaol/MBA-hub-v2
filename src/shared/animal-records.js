// Canonical animal identity, browse/index metadata and source-attributed optional taxonomy.
export const animalCatalog = {
  "schema_version": 1,
  "identity_policy": "Permanent record_id and animal_id reuse existing stable app IDs; names may change without changing identity. Group/topic records have no animal_id. App aliases resolve to the same record.",
  "ranks": [
    "phylum",
    "class",
    "order",
    "family",
    "genus",
    "species"
  ],
  "sources": {
    "adw-seahorse": {
      "title": "Animal Diversity Web — Hippocampus abdominalis",
      "url": "https://animaldiversity.org/accounts/Hippocampus_abdominalis/",
      "checked_on": "2026-10-31"
    },
    "itis-ray": {
      "title": "ITIS — Taeniura lymma, TSN 564365",
      "url": "https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=564365",
      "checked_on": "2026-10-31"
    },
    "itis-flying-fish": {
      "title": "ITIS — Cheilopogon californicus, TSN 1279625",
      "url": "https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=1279625",
      "checked_on": "2026-10-31"
    },
    "adw-sheephead": {
      "title": "Animal Diversity Web — Semicossyphus pulcher",
      "url": "https://animaldiversity.org/accounts/Semicossyphus_pulcher/",
      "checked_on": "2026-10-31"
    },
    "itis-barnacle": {
      "title": "ITIS — Pollicipes polymerus, TSN 89476",
      "url": "https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=89476",
      "checked_on": "2026-10-31"
    },
    "adw-gray-whale": {
      "title": "Animal Diversity Web — Eschrichtius robustus",
      "url": "https://animaldiversity.org/accounts/Eschrichtius_robustus/",
      "checked_on": "2026-10-31"
    },
    "itis-falsejingle": {
      "title": "ITIS — Pododesmus macrochisma, TSN 79792",
      "url": "https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=79792",
      "checked_on": "2026-10-31"
    },
    "worms-hopkins": {
      "title": "WoRMS / MolluscaBase — Ceratodoris rosacea, AphiaID 1723348",
      "url": "https://www.marinespecies.org/aphia.php?p=taxdetails&id=1723348",
      "checked_on": "2026-10-31"
    },
    "adw-elephant-seal": {
      "title": "Animal Diversity Web — Mirounga angustirostris",
      "url": "https://animaldiversity.org/accounts/Mirounga_angustirostris/",
      "checked_on": "2026-10-31"
    },
    "adw-stargazer-family": {
      "title": "Animal Diversity Web — Uranoscopus scaber classification, family context only",
      "url": "https://animaldiversity.org/accounts/Uranoscopus_scaber/",
      "checked_on": "2026-10-31"
    }
  },
  "records": [
    {
      "record_id": "big-bellied-seahorse",
      "animal_id": "big-bellied-seahorse",
      "app_id": "big-bellied-seahorse",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "Big-Bellied Seahorse",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Hippocampus abdominalis",
        "aliases": []
      },
      "index": {
        "primary": "Seahorse, Big-Bellied",
        "alternate": [
          "Big-Bellied Seahorse"
        ]
      },
      "browse_group": "fishes",
      "search_aliases": [
        "seahorses",
        "big belly"
      ],
      "taxonomy": {
        "phylum": "Chordata",
        "class": "Actinopterygii",
        "order": "Syngnathiformes",
        "family": "Syngnathidae",
        "genus": "Hippocampus",
        "species": "Hippocampus abdominalis"
      },
      "taxonomy_sources": {
        "phylum": [
          "adw-seahorse"
        ],
        "class": [
          "adw-seahorse"
        ],
        "order": [
          "adw-seahorse"
        ],
        "family": [
          "adw-seahorse"
        ],
        "genus": [
          "adw-seahorse"
        ],
        "species": [
          "adw-seahorse"
        ]
      },
      "review": {
        "status": "source-checked",
        "checked_on": "2026-10-31",
        "source_ids": [
          "adw-seahorse"
        ],
        "note": "Source-attributed ADW hierarchy; other taxonomic frameworks may use different ranks."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "bluespotted-ribbontail-ray",
      "animal_id": "bluespotted-ribbontail-ray",
      "app_id": "bluespotted-ribbontail-ray",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "Blue-spotted Ribbontail Ray",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Taeniura lymma",
        "aliases": []
      },
      "index": {
        "primary": "Ribbontail Ray, Blue-spotted",
        "alternate": [
          "Blue-spotted Ribbontail Ray"
        ]
      },
      "browse_group": "sharks-rays",
      "search_aliases": [],
      "taxonomy": {
        "phylum": "Chordata",
        "class": "Chondrichthyes",
        "order": "Myliobatiformes",
        "family": "Dasyatidae",
        "genus": "Taeniura",
        "species": "Taeniura lymma"
      },
      "taxonomy_sources": {
        "phylum": [
          "itis-ray"
        ],
        "class": [
          "itis-ray"
        ],
        "order": [
          "itis-ray"
        ],
        "family": [
          "itis-ray"
        ],
        "genus": [
          "itis-ray"
        ],
        "species": [
          "itis-ray"
        ]
      },
      "review": {
        "status": "source-checked",
        "checked_on": "2026-10-31",
        "source_ids": [
          "itis-ray"
        ],
        "note": "ITIS hierarchy. Familiar indexing remains Rays; no Stingray index alias added."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "california-flying-fish",
      "animal_id": "california-flying-fish",
      "app_id": "california-flying-fish",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "California Flying Fish",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Cheilopogon pinnatibarbatus californicus",
        "aliases": [
          "Cheilopogon californicus"
        ]
      },
      "index": {
        "primary": "Flying Fish, California",
        "alternate": []
      },
      "browse_group": "fishes",
      "search_aliases": [
        "flying fishes"
      ],
      "taxonomy": {
        "phylum": "Chordata",
        "class": null,
        "order": "Beloniformes",
        "family": "Exocoetidae",
        "genus": "Cheilopogon",
        "species": "Cheilopogon californicus"
      },
      "taxonomy_sources": {
        "phylum": [
          "itis-flying-fish"
        ],
        "order": [
          "itis-flying-fish"
        ],
        "family": [
          "itis-flying-fish"
        ],
        "genus": [
          "itis-flying-fish"
        ],
        "species": [
          "itis-flying-fish"
        ]
      },
      "review": {
        "status": "partial",
        "checked_on": "2026-10-31",
        "source_ids": [
          "itis-flying-fish"
        ],
        "note": "Existing guide name retained; ITIS treats Cheilopogon californicus as valid. Class left unfilled pending a consistent framework review."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "california-sheephead",
      "animal_id": "california-sheephead",
      "app_id": "california-sheephead",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "California Sheephead",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Semicossyphus pulcher",
        "aliases": [
          "Bodianus pulcher"
        ]
      },
      "index": {
        "primary": "Sheephead, California",
        "alternate": []
      },
      "browse_group": "fishes",
      "search_aliases": [
        "wrasse",
        "wrasses"
      ],
      "taxonomy": {
        "phylum": "Chordata",
        "class": "Actinopterygii",
        "order": null,
        "family": "Labridae",
        "genus": null,
        "species": null
      },
      "taxonomy_sources": {
        "phylum": [
          "adw-sheephead"
        ],
        "class": [
          "adw-sheephead"
        ],
        "family": [
          "adw-sheephead"
        ]
      },
      "review": {
        "status": "partial",
        "checked_on": "2026-10-31",
        "source_ids": [
          "adw-sheephead"
        ],
        "note": "Existing guide names retained. Order/genus/species rank assignments left unfilled for reconciliation of current naming frameworks."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "flamboyant-cuttlefish",
      "animal_id": "flamboyant-cuttlefish",
      "app_id": "flamboyant-cuttlefish",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "Flamboyant Cuttlefish",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Ascarosepion pfefferi",
        "aliases": [
          "Metasepia pfefferi"
        ]
      },
      "index": {
        "primary": "Flamboyant Cuttlefish",
        "alternate": []
      },
      "browse_group": null,
      "search_aliases": [],
      "taxonomy": {
        "phylum": null,
        "class": null,
        "order": null,
        "family": null,
        "genus": null,
        "species": null
      },
      "taxonomy_sources": {},
      "review": {
        "status": "pending",
        "checked_on": null,
        "source_ids": [],
        "note": "Unlisted supporting app. Existing names recorded; classification not reviewed here."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "gooseneck-barnacle",
      "animal_id": "gooseneck-barnacle",
      "app_id": "gooseneck-barnacle",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "Gooseneck Barnacle",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Pollicipes polymerus",
        "aliases": []
      },
      "index": {
        "primary": "Barnacle, Gooseneck",
        "alternate": [
          "Gooseneck Barnacle"
        ]
      },
      "browse_group": "invertebrates",
      "search_aliases": [],
      "taxonomy": {
        "phylum": "Arthropoda",
        "class": "Thecostraca",
        "order": null,
        "family": "Pollicipedidae",
        "genus": "Pollicipes",
        "species": "Pollicipes polymerus"
      },
      "taxonomy_sources": {
        "phylum": [
          "itis-barnacle"
        ],
        "class": [
          "itis-barnacle"
        ],
        "family": [
          "itis-barnacle"
        ],
        "genus": [
          "itis-barnacle"
        ],
        "species": [
          "itis-barnacle"
        ]
      },
      "review": {
        "status": "partial",
        "checked_on": "2026-10-31",
        "source_ids": [
          "itis-barnacle"
        ],
        "note": "Order left unfilled pending review of differing barnacle classifications."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "gray-whale",
      "animal_id": "gray-whale",
      "app_id": "gray-whale",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "Gray Whale",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Eschrichtius robustus",
        "aliases": []
      },
      "index": {
        "primary": "Gray Whale",
        "alternate": [
          "Whale"
        ]
      },
      "browse_group": "marine-mammals",
      "search_aliases": [],
      "taxonomy": {
        "phylum": "Chordata",
        "class": "Mammalia",
        "order": null,
        "family": null,
        "genus": "Eschrichtius",
        "species": "Eschrichtius robustus"
      },
      "taxonomy_sources": {
        "phylum": [
          "adw-gray-whale"
        ],
        "class": [
          "adw-gray-whale"
        ],
        "genus": [
          "adw-gray-whale"
        ],
        "species": [
          "adw-gray-whale"
        ]
      },
      "review": {
        "status": "partial",
        "checked_on": "2026-10-31",
        "source_ids": [
          "adw-gray-whale"
        ],
        "note": "Order/family left unfilled pending framework reconciliation. No Grey name alias."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "green-falsejingle",
      "animal_id": "green-falsejingle",
      "app_id": "green-falsejingle",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "Green Falsejingle",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Pododesmus macrochisma",
        "aliases": []
      },
      "index": {
        "primary": "Falsejingle, Green",
        "alternate": [
          "Green Falsejingle"
        ]
      },
      "browse_group": "invertebrates",
      "search_aliases": [],
      "taxonomy": {
        "phylum": "Mollusca",
        "class": "Bivalvia",
        "order": null,
        "family": "Anomiidae",
        "genus": "Pododesmus",
        "species": "Pododesmus macrochisma"
      },
      "taxonomy_sources": {
        "phylum": [
          "itis-falsejingle"
        ],
        "class": [
          "itis-falsejingle"
        ],
        "family": [
          "itis-falsejingle"
        ],
        "genus": [
          "itis-falsejingle"
        ],
        "species": [
          "itis-falsejingle"
        ]
      },
      "review": {
        "status": "partial",
        "checked_on": "2026-10-31",
        "source_ids": [
          "itis-falsejingle"
        ],
        "note": "Order left unfilled pending framework review."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "hopkins-rose-nudibranch",
      "animal_id": "hopkins-rose-nudibranch",
      "app_id": "hopkins-rose-nudibranch",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "Hopkins’ Rose Nudibranch",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Ceratodoris rosacea",
        "aliases": [
          "Okenia rosacea",
          "Hopkinsia rosacea"
        ]
      },
      "index": {
        "primary": "Nudibranch, Hopkins’ Rose",
        "alternate": [
          "Hopkins’ Rose Nudibranch"
        ]
      },
      "browse_group": "invertebrates",
      "search_aliases": [],
      "taxonomy": {
        "phylum": "Mollusca",
        "class": "Gastropoda",
        "order": null,
        "family": "Goniodorididae",
        "genus": "Ceratodoris",
        "species": "Ceratodoris rosacea"
      },
      "taxonomy_sources": {
        "phylum": [
          "worms-hopkins"
        ],
        "class": [
          "worms-hopkins"
        ],
        "family": [
          "worms-hopkins"
        ],
        "genus": [
          "worms-hopkins"
        ],
        "species": [
          "worms-hopkins"
        ]
      },
      "review": {
        "status": "partial",
        "checked_on": "2026-10-31",
        "source_ids": [
          "worms-hopkins"
        ],
        "note": "Accepted name agrees with the existing guide. Higher placement supported by the cited Goniodorididae phylogeny; order left unfilled."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "northern-elephant-seal",
      "animal_id": "northern-elephant-seal",
      "app_id": "northern-elephant-seal",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "Northern Elephant Seal",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Mirounga angustirostris",
        "aliases": []
      },
      "index": {
        "primary": "Elephant Seal, Northern",
        "alternate": [
          "Seal"
        ]
      },
      "browse_group": "marine-mammals",
      "search_aliases": [],
      "taxonomy": {
        "phylum": "Chordata",
        "class": "Mammalia",
        "order": "Carnivora",
        "family": "Phocidae",
        "genus": "Mirounga",
        "species": "Mirounga angustirostris"
      },
      "taxonomy_sources": {
        "phylum": [
          "adw-elephant-seal"
        ],
        "class": [
          "adw-elephant-seal"
        ],
        "order": [
          "adw-elephant-seal"
        ],
        "family": [
          "adw-elephant-seal"
        ],
        "genus": [
          "adw-elephant-seal"
        ],
        "species": [
          "adw-elephant-seal"
        ]
      },
      "review": {
        "status": "source-checked",
        "checked_on": "2026-10-31",
        "source_ids": [
          "adw-elephant-seal"
        ],
        "note": "Source-attributed ADW hierarchy."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "pacific-white-sided-dolphin",
      "animal_id": "pacific-white-sided-dolphin",
      "app_id": "pacific-white-sided-dolphin",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "Pacific White-Sided Dolphin",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Lagenorhynchus obliquidens",
        "aliases": []
      },
      "index": {
        "primary": "Pacific White-Sided Dolphin",
        "alternate": []
      },
      "browse_group": null,
      "search_aliases": [],
      "taxonomy": {
        "phylum": null,
        "class": null,
        "order": null,
        "family": null,
        "genus": null,
        "species": null
      },
      "taxonomy_sources": {},
      "review": {
        "status": "pending",
        "checked_on": null,
        "source_ids": [],
        "note": "Unlisted supporting app. Existing name recorded; classification not reviewed here."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "sea-slugs-nudibranchs",
      "animal_id": null,
      "app_id": "sea-slugs-nudibranchs",
      "app_aliases": [],
      "record_type": "group",
      "common_names": {
        "primary": "Sea Slugs & Nudibranchs",
        "aliases": []
      },
      "scientific_names": {
        "primary": null,
        "aliases": []
      },
      "index": {
        "primary": "Sea Slugs & Nudibranchs",
        "alternate": [
          "Nudibranchs & Sea Slugs"
        ]
      },
      "browse_group": "invertebrates",
      "search_aliases": [],
      "taxonomy": {
        "phylum": null,
        "class": null,
        "order": null,
        "family": null,
        "genus": null,
        "species": null
      },
      "taxonomy_sources": {},
      "review": {
        "status": "pending",
        "checked_on": null,
        "source_ids": [],
        "note": "Broad group reference; no single species classification assigned."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "sperm-whale",
      "animal_id": "sperm-whale",
      "app_id": "sperm-whale",
      "app_aliases": [],
      "record_type": "species",
      "common_names": {
        "primary": "Sperm Whale",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Physeter macrocephalus",
        "aliases": []
      },
      "index": {
        "primary": "Sperm Whale",
        "alternate": [
          "Whale"
        ]
      },
      "browse_group": null,
      "search_aliases": [],
      "taxonomy": {
        "phylum": null,
        "class": null,
        "order": null,
        "family": null,
        "genus": null,
        "species": null
      },
      "taxonomy_sources": {},
      "review": {
        "status": "pending",
        "checked_on": null,
        "source_ids": [],
        "note": "Unlisted supporting app. Existing name recorded; classification not reviewed here."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "stargazer-species-guide",
      "animal_id": null,
      "app_id": "stargazer-species-guide",
      "app_aliases": [],
      "record_type": "group",
      "common_names": {
        "primary": "Stargazer Fish",
        "aliases": []
      },
      "scientific_names": {
        "primary": "Uranoscopidae",
        "aliases": [
          "Astroscopus"
        ]
      },
      "index": {
        "primary": "Stargazer Fish",
        "alternate": []
      },
      "browse_group": "fishes",
      "search_aliases": [],
      "taxonomy": {
        "phylum": "Chordata",
        "class": "Actinopterygii",
        "order": null,
        "family": "Uranoscopidae",
        "genus": null,
        "species": null
      },
      "taxonomy_sources": {
        "phylum": [
          "adw-stargazer-family"
        ],
        "class": [
          "adw-stargazer-family"
        ],
        "family": [
          "adw-stargazer-family"
        ]
      },
      "review": {
        "status": "partial",
        "checked_on": "2026-10-31",
        "source_ids": [
          "adw-stargazer-family"
        ],
        "note": "Existing app covers a family/genus, not a confirmed species; no species identity inferred."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    },
    {
      "record_id": "whale-associated-organisms",
      "animal_id": null,
      "app_id": "whale-associated-organisms",
      "app_aliases": [
        "whale-parasites-associates"
      ],
      "record_type": "topic",
      "common_names": {
        "primary": "Whales — Hitchhikers & Parasites",
        "aliases": ["Whale-Associated Organisms", "Whale Parasites & Associates"]
      },
      "scientific_names": {
        "primary": null,
        "aliases": []
      },
      "index": {
        "primary": "Whales — Hitchhikers & Parasites",
        "alternate": []
      },
      "browse_group": "marine-mammals",
      "search_aliases": [],
      "taxonomy": {
        "phylum": null,
        "class": null,
        "order": null,
        "family": null,
        "genus": null,
        "species": null
      },
      "taxonomy_sources": {},
      "review": {
        "status": "pending",
        "checked_on": null,
        "source_ids": [],
        "note": "Multi-organism topic; do not classify its organisms as one whale species."
      },
      "identity_source": "Existing app names and owner-approved index review; common/scientific identity is preserved, not independently reassigned."
    }
  ]
};
export const animalRecordForApp = id => animalCatalog.records.find(r=>r.app_id===id||r.app_aliases.includes(id))||null;
