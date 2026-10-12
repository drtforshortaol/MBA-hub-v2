const FILTERS = [
  ["all", "All"],
  ["broad", "Broad Host"],
  ["whale", "Whale-Specific"],
  ["specific", "Host-Specific"],
  ["mutualist", "Mutualists"]
];

const PARASITES = [
  {
    id: "cookiecutter",
    name: "Cookiecutter Shark",
    sci: "Isistius brasiliensis",
    icon: "🦷",
    iconBg: "#FFF0E8",
    tag: "Broad Host",
    tagClass: "tag-broad",
    categories: ["broad"],
    paragraphs: [
      "A small deep-sea shark that bites circular plugs from much larger animals — its name describes exactly what the wound looks like. Not a true parasite in the classical sense, but functionally parasitic: it takes tissue and leaves a scar.",
      "Cookiecutters migrate to the surface at night during vertical migration alongside other deep-sea organisms. Whales feeding over deep water in summer are especially exposed. Bites leave large, round scars that persist for life."
    ],
    hostsTitle: "Recorded hosts",
    hosts: ["Blue whales", "Fin whales", "Toothed whales", "Sharks", "Stingrays", "Tuna", "Sea lions", "Seals"],
    harm: "Scarring, no major systemic harm",
    harmDots: 2,
    warn: true,
    facts: [
      ["Season", "Year-round; peaks offshore summer"],
      ["ID cue", "Round, cookie-cutter scars"],
      ["Depth", "Vertical migrator — surface at night"]
    ]
  },
  {
    id: "remora",
    name: "Whalesucker",
    sci: "Remora australis",
    icon: "🐟",
    iconBg: "#E8F4F0",
    tag: "Mutualist",
    tagClass: "tag-mutualist",
    categories: ["whale", "mutualist"],
    paragraphs: [
      "A remora species with a strong preference for whales as hosts. Not a true parasite — the relationship leans mutualistic. The whalesucker grazes dead skin and external parasites from its host whale, providing cleaning services in exchange for a free ride and predator refuge.",
      "They attach via a modified dorsal fin that acts as an adhesive disk. Long-term attachment can cause heavier skin damage at the contact site. Blue whales this week showed everything from a single sucker on the dorsal fin to dense clusters below it."
    ],
    hostsTitle: "Preferred hosts",
    hosts: ["Blue whales", "Fin whales", "Humpback whales", "Risso's dolphins", "Common dolphins"],
    harm: "Minimal; some skin wear from disk",
    harmDots: 1,
    facts: [
      ["ID cue", "Slim dark fish clinging to skin"],
      ["Scar", "Oval depigmented patches on dolphins"],
      ["Selective", "Choosy about host species & location"]
    ]
  },
  {
    id: "coronula",
    name: "Humpback Barnacle",
    sci: "Coronula diadema",
    icon: "🐚",
    iconBg: "#EBF4F4",
    tag: "Host-Specific",
    tagClass: "tag-specific",
    categories: ["specific", "mutualist"],
    paragraphs: [
      "Almost exclusively found on humpback whales — rarely documented on other species. Large accumulations develop over time, particularly around the chin, flippers, and flukes. Humpbacks can shed clusters through behaviors like breaching.",
      "Despite the parasite label, harm is generally limited to added drag and weight. The barnacles themselves can be parasitized by gooseneck barnacles, creating a stacked parasite-on-parasite arrangement."
    ],
    hostsTitle: "Primary hosts",
    hosts: ["Humpback whales", "Rarely other baleen whales"],
    harm: "Drag & weight only",
    harmDots: 1,
    facts: [
      ["ID cue", "White clusters, chin & flippers"],
      ["Removal", "Breaching behavior"],
      ["Nested parasite", "May host Conchoderma"]
    ]
  },
  {
    id: "coronula-r",
    name: "Whale Barnacle",
    sci: "Coronula reginae",
    icon: "🐚",
    iconBg: "#EBF4F4",
    tag: "Whale-Specific",
    tagClass: "tag-whale",
    categories: ["whale", "mutualist"],
    paragraphs: [
      "A closely related barnacle to C. diadema but with a broader host range — documented on multiple baleen whale species rather than being restricted to humpbacks.",
      "Like all whale barnacles, they filter-feed while getting transport to productive feeding grounds. The relationship is commensal at worst and may offer mild host benefit through the secondary organisms they support."
    ],
    hostsTitle: "Known hosts",
    hosts: ["Multiple baleen whale species", "Humpbacks", "Blue whales"],
    harm: "Drag & weight only",
    harmDots: 1,
    facts: [
      ["Compare", "Broader host range than C. diadema"],
      ["Obligate", "Whale skin only"]
    ]
  },
  {
    id: "conchoderma",
    name: "Rabbit-ear Barnacle",
    sci: "Conchoderma auritum",
    icon: "🪶",
    iconBg: "#F4EBE0",
    tag: "Whale-Specific",
    tagClass: "tag-whale",
    categories: ["whale"],
    paragraphs: [
      "A gooseneck barnacle that parasitizes whale barnacles — specifically attaching to and feeding on Coronula species. Its two fleshy lobes at the top of the stalk resemble rabbit ears.",
      "This creates a true layered parasitic system: the whale hosts Coronula barnacles, which in turn host Conchoderma. The gooseneck draws nutrients from the whale barnacle rather than directly from the whale."
    ],
    hostsTitle: "Substrate",
    hosts: ["Coronula diadema", "Coronula reginae", "Occasionally direct on whale skin"],
    harm: "Indirect; harms barnacle host",
    harmDots: 1,
    facts: [
      ["ID cue", "Dangling from other barnacles"],
      ["Unique", "Parasite-of-a-parasite"]
    ]
  },
  {
    id: "cryptolepas",
    name: "Gray Whale Barnacle",
    sci: "Cryptolepas rhachianecti",
    icon: "🐳",
    iconBg: "#F4EBE0",
    tag: "Host-Specific",
    tagClass: "tag-specific",
    categories: ["specific", "mutualist"],
    paragraphs: [
      "Host-specific to gray whales. Unlike humpback barnacles which concentrate on appendages, gray whale barnacles spread broadly across the body — encrusting heavily around the blowhole and rostrum, and appearing as large patchy clusters anywhere on the body.",
      "Gray whales often have such dense encrustation that the barnacles become a field-identification feature. The distinctive orange and white barnacle patches are visible from distance on cooperative animals."
    ],
    hostsTitle: "Host",
    hosts: ["Gray whales"],
    harm: "Drag; ID feature in the field",
    harmDots: 1,
    facts: [
      ["ID cue", "Blowhole & rostrum clusters"],
      ["Color", "Orange-white patches"],
      ["Exclusive", "Gray whales only"]
    ]
  },
  {
    id: "whalelice",
    name: "Whale Lice",
    sci: "Cyamus boopis",
    icon: "🦐",
    iconBg: "#E8EFF8",
    tag: "Host-Specific",
    tagClass: "tag-specific",
    categories: ["specific"],
    paragraphs: [
      "Not insects — whale lice are crustaceans. Despite the name, they are weakly parasitic at best, grazing on algae growth and dead skin from whale surfaces. Their entire lifecycle plays out on a single whale host.",
      "Transfer between whales occurs only during close contact. Because opportunities to switch hosts are rare, whale lice populations are highly host-specific. On humpbacks, look for them tucked into skin folds, barnacle margins, and around the rostrum."
    ],
    hostsTitle: "On humpback whales",
    hosts: ["Cyamus boopis", "Skin folds", "Barnacle margins"],
    harm: "Minimal; grazes dead skin",
    harmDots: 1,
    facts: [
      ["Class", "Crustacean — not an insect"],
      ["Transfer", "Only whale-to-whale contact"],
      ["ID cue", "Tiny, clustered in skin folds"],
      ["Lifecycle", "Entire life on one host"]
    ]
  }
];