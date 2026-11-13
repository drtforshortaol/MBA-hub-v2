// Source: supplied weekly naturalist email, exhibit update, Q&A, species highlight, and Bay Watch.
export const sections = [
  {
    "id": "ocean-in-motion",
    "title": "Ocean in Motion",
    "paragraphs": [
      "Ocean in Motion is open. Look for flamboyant cuttlefish in the display they share with fish and corals. Scan along the edges of the viewing window if guests are having trouble spotting them.",
      "The update reports ocellaris clownfish in the anemonefish display. The proposed saddleback anemonefish identification there and pink anemonefish identification in the main reef tank are tentative."
    ]
  },
  {
    "id": "white-seabass",
    "title": "White seabass in Monterey Bay Habitat",
    "paragraphs": [
      "Aquarium staff identified the striped fish in the main Monterey Bay Habitat exhibit as white seabass (Atractoscion nobilis). White seabass belong to the drum family (Sciaenidae). Young fish can show dark bars that fade in adults.",
      "White seabass eat small fish and squid. The update suggests that more squid might help explain recent local sightings. This is a proposed explanation."
    ]
  },
  {
    "id": "ocellaris-clownfish",
    "title": "Species highlight · Ocellaris clownfish",
    "paragraphs": [
      "The ocellaris clownfish (Amphiprion ocellaris), or common clownfish, lives on shallow reefs in the Indo-West Pacific. The update lists a maximum length of about 4.3 inches and a depth range of roughly 3–60 feet. It feeds on small planktonic animals and algae.",
      "In an anemonefish group, the largest fish is typically the breeding female and the next largest is the breeding male. When the female disappears, the breeding male can become female. The male tends the eggs near the host anemone, fanning them and removing compromised eggs. The update reports about 100–1,000 eggs and hatching in roughly 6–8 days, depending on temperature.",
      "The anemone shelters the fish among its stinging tentacles. The fish can provide nutrients through its waste. Research on the fish’s mucus, including low levels of particular sialic acids, offers clues to how the fish avoids triggering stinging cells. The role of microbes and acclimation remains an active research question.",
      "Guest prompt: Can you spot the largest clownfish near the anemone?"
    ],
    "links": [
      [
        "Monterey Bay Aquarium · Clownfish",
        "https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/clownfish"
      ],
      [
        "Florida Museum · Clown anemonefish",
        "https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/clown-anemonefish/"
      ],
      [
        "PNAS · Clownfish and anemone research",
        "https://www.pnas.org/doi/10.1073/pnas.2419716122"
      ],
      [
        "Research article · PubMed Central",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC10624958/"
      ],
      [
        "Research article · BMC Biology",
        "https://link.springer.com/article/10.1186/s12915-025-02144-8"
      ]
    ]
  },
  {
    "id": "bay-watch",
    "title": "Bay Watch · Nov 5–11",
    "paragraphs": [
      "The update reports migrating humpbacks, common dolphins, and juvenile makos breaking the surface. It also reports nighttime hydrophone detections of blue, sperm, and beaked whales. The list below records reported sightings for the week."
    ],
    "groups": [
      {
        "title": "Marine mammals",
        "items": [
          "Humpback whales",
          "Blue whale",
          "Risso’s dolphins",
          "Long-beaked common dolphins",
          "Short-beaked common dolphins",
          "Southern sea otters",
          "California sea lions",
          "Harbor seals"
        ]
      },
      {
        "title": "Birds",
        "items": [
          "Black-vented shearwaters",
          "Northern fulmars",
          "Black-footed albatross",
          "California brown pelicans",
          "Common murres",
          "Pigeon guillemot",
          "Rhinoceros auklets",
          "Cassin’s auklets",
          "Brandt’s cormorants",
          "Pelagic cormorants",
          "Western gulls",
          "Heermann’s gulls",
          "California gulls",
          "Bonaparte’s gulls",
          "Elegant terns",
          "Red-necked phalaropes",
          "Red phalaropes",
          "Surf scoters",
          "Eared grebes",
          "Western grebes",
          "Common loons",
          "Red-throated loons",
          "Pacific loons",
          "Brant geese",
          "Cocos booby"
        ]
      },
      {
        "title": "Sharks and turtles",
        "items": [
          "Shortfin mako sharks",
          "Olive ridley sea turtle"
        ]
      }
    ]
  }
];

export const mediaBySection = {
  "ocean-in-motion": [
    {
      "id": "briefing-20261111-flamboyant-cuttlefish",
      "path": "shared/media/briefing-20261111-flamboyant-cuttlefish.jpg",
      "alt": "Two flamboyant cuttlefish over blue-lit gravel.",
      "credit": "Photo by MJ."
    }
  ],
  "white-seabass": [
    {
      "id": "briefing-20261111-juvenile-white-seabass",
      "path": "shared/media/briefing-20261111-juvenile-white-seabass.jpg",
      "alt": "Juvenile white seabass showing dark vertical bars.",
      "credit": "Photo by adleboro on iNaturalist."
    }
  ],
  "ocellaris-clownfish": [
    {
      "id": "briefing-20261111-clownfish-sex-change",
      "path": "shared/media/briefing-20261111-clownfish-sex-change.jpg",
      "alt": "Illustrated overview of clownfish reproduction and sex change.",
      "credit": "Infographic supplied with the naturalist update. Creator unconfirmed."
    },
    {
      "id": "briefing-20261111-clownfish-life-cycle",
      "path": "shared/media/briefing-20261111-clownfish-life-cycle.jpg",
      "alt": "Clownfish life cycle from reef eggs through oceanic larvae and back to the reef.",
      "credit": "Graphic by Stefano Davide Vianello."
    },
    {
      "id": "briefing-20261111-sialic-acid-diagram",
      "path": "shared/media/briefing-20261111-sialic-acid-diagram.jpg",
      "alt": "Diagram comparing anemonefish and damselfish mucus and stinging-cell discharge.",
      "credit": "Research figure supplied with the naturalist update."
    },
    {
      "id": "briefing-20261111-sialic-acid-chart",
      "path": "shared/media/briefing-20261111-sialic-acid-chart.jpg",
      "alt": "Bar charts comparing Neu5Ac and Kdn in sampled anemonefish and other damselfish.",
      "credit": "Research figure supplied with the naturalist update."
    },
    {
      "id": "briefing-20261111-anemonefish-microbiome",
      "path": "shared/media/briefing-20261111-anemonefish-microbiome.jpg",
      "alt": "Diagram comparing mucus and microbes of a clownfish and its host anemone.",
      "credit": "Research figure supplied with the naturalist update."
    }
  ]
};
