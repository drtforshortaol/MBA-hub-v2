/* APP CONTENT DATA FILE: apps/five-senses-pwa/data.js */
/* Preservation rebuild from original five-senses.html */

window.USING_FIVE_SENSES_DATA = {
  app: {
    appName: "Using the Five Senses",
    appFolderName: "five-senses-pwa",
    hubCategory: "Volunteer Tools",
    appType: "PWA interpretation skills app",
    version: "1.2",
    lastUpdatedDate: "2026-06-28",
    sourceNote: "Preserved from original five-senses.html. Generic classroom content removed.",
    tags: [
      "five senses",
      "interpretation skills",
      "volunteer tools",
      "accessibility",
      "guest engagement",
      "touch",
      "hearing",
      "smell",
      "taste",
      "multisensory interpretation"
    ]
  },

  senses: [
    {
      id: "touch",
      icon: "🤚",
      title: "Touch",
      tagline: "Tactile items · texture language · safety",
      accent: "touch",
      sections: [
        {
          label: "Why it works",
          type: "paragraph",
          content:
            "Touch is often the most powerful way to understand marine life. Invite guests to explore safe tactile objects or touch pools whenever possible."
        },
        {
          label: "Tactile Items",
          type: "list",
          content: [
            "Live animals (bat rays, hermit crabs, decorator crabs, chitons, abalone)",
            "Live or dried algae",
            "Marine mammal skulls or replicas",
            "Bird skulls, bones, or replicas",
            "Sea otter pelts",
            "Shells and/or molts",
            "Whale baleen, teeth, or replicas",
            "Model boats or equipment",
            "Rock or substrate samples",
            "Brass animal models",
            "3D maps",
            "Water"
          ]
        },
        {
          label: "Texture Language",
          type: "chips",
          content: [
            "smooth like polished stone",
            "rough like sandpaper",
            "rubbery like a thick sponge",
            "bumpy like gravel"
          ]
        },
        {
          label: "Example phrase",
          type: "quote",
          content:
            "You can gently place two fingers in the water to touch the gumboot chiton. Its surface feels slightly rough and bumpy."
        },
        {
          label: "Safety",
          type: "safety",
          content: "Always provide clear guidance on how to touch animals safely."
        }
      ],
      tags: ["touch", "tactile items", "texture language", "touch pools", "safe touch"]
    },

    {
      id: "hearing",
      icon: "👂",
      title: "Hearing",
      tagline: "Water · animals · ocean soundscapes",
      accent: "hearing",
      sections: [
        {
          label: "Why it works",
          type: "paragraph",
          content:
            "Sound can reveal a lot about ocean environments. Directing attention to ambient aquarium sounds builds immersion and curiosity."
        },
        {
          label: "Listen For",
          type: "list",
          content: [
            "Water movement",
            "Pumps and filtration systems",
            "Birds in the aviary or from the deck",
            "Wave sounds in open exhibits",
            "Recordings of animal sounds at MBOS"
          ]
        },
        {
          label: "Example phrase",
          type: "quote",
          content:
            "Listen closely and you may hear the water moving through the kelp tank. The swishing sound is created as the kelp sways back and forth with the current."
        },
        {
          label: "Describe Wild Sounds",
          type: "paragraph",
          content:
            "You can also describe sounds animals make in the wild — snapping shrimp, whale songs, or dolphin clicks."
        }
      ],
      tags: ["hearing", "sound", "water movement", "animal sounds", "ocean soundscapes"]
    },

    {
      id: "smell",
      icon: "👃",
      title: "Smell",
      tagline: "Seawater · kelp · coastal habitats",
      accent: "smell",
      sections: [
        {
          label: "Why it works",
          type: "paragraph",
          content:
            "Smell can help guests connect to the ocean environment and link sensory memory to marine habitats."
        },
        {
          label: "Scents to Notice",
          type: "list",
          content: [
            "Fresh seaweed or kelp",
            "Saltwater",
            "Tidepool environments"
          ]
        },
        {
          label: "Example phrase",
          type: "quote",
          content:
            "You might notice the salty ocean smell here near the touch pool. That scent comes from seawater and marine plants like kelp."
        },
        {
          label: "Guide note",
          type: "paragraph",
          content:
            "Use smell to talk about coastal habitats and ocean ecosystems."
        }
      ],
      tags: ["smell", "seawater", "kelp", "tidepool", "coastal habitats"]
    },

    {
      id: "taste",
      icon: "👅",
      title: "Taste",
      tagline: "Familiar comparisons · animal adaptations",
      accent: "taste",
      sections: [
        {
          label: "Why it works",
          type: "paragraph",
          content:
            "Describing familiar tastes helps visitors better understand ocean environments and animal adaptations — even without sampling anything on site."
        },
        {
          label: "Comparisons to Use",
          type: "list",
          content: [
            "Texture of seafood to highlight habitat and adaptations",
            "Seaweed compared to wet, salty lettuce"
          ]
        },
        {
          label: "Example phrase",
          type: "quote",
          content:
            "Some fish that live in cold ocean water have a lot of fat stored in their bodies. That fat helps insulate them and keep them warm. Raw bluefin tuna, for example, almost melts in your mouth because its fat content creates a smooth, rich texture."
        },
        {
          label: "Example phrase",
          type: "quote",
          content:
            "Sardines and other very small fish are so small that we often eat them whole, but their bones are so small that you barely notice the very light crunch as you eat them."
        }
      ],
      tags: ["taste", "familiar comparisons", "seafood texture", "animal adaptations"]
    }
  ],

  guideSections: [
    {
      id: "original-introduction",
      title: "Original App Introduction",
      body: [
        "While many exhibits rely on sight, interpreters can deepen engagement by using clear verbal descriptions and involving touch, sound, smell, and occasionally taste.",
        "Multisensory interpretation benefits all visitors — not only guests who are visually impaired."
      ],
      tags: ["introduction", "accessibility", "multisensory interpretation"]
    },
    {
      id: "how-to-use",
      title: "How to Use This With Guests",
      body: [
        "Use this as a quick interpretation prompt guide, not as a script.",
        "Open the sense that fits the exhibit, object, animal, habitat, or guest question.",
        "Choose one short sensory prompt and connect it to the animal, habitat, adaptation, or guest experience.",
        "Use touch, sound, smell, and taste comparisons only when appropriate, safe, and consistent with aquarium guidance."
      ],
      tags: ["guest conversations", "interpretation", "volunteer tool"]
    },
    {
      id: "safety-and-accuracy",
      title: "Safety and Accuracy",
      body: [
        "Always follow Monterey Bay Aquarium guidance for guest touch experiences.",
        "Do not invite guests to touch, smell, taste, or handle anything unless it is approved and safe.",
        "Use taste as a comparison tool unless an approved sampling experience is specifically available."
      ],
      tags: ["safety", "approved guidance", "accuracy"]
    }
  ],

  references: [
    "Content source: Original user-provided five-senses.html, created 2026-06-28.",
    "Original app title: Using the Five Senses.",
    "Original header: MBA Hub · Interpretation Skills.",
    "Original purpose: Engage all senses to make exhibits accessible and memorable for every guest.",
    "Preserved sections: Touch, Hearing, Smell, and Taste.",
    "Generic classroom/student content was removed from this repair version.",
    "Safety note: Follow Monterey Bay Aquarium-approved guidance for any live animal, tactile, smell, taste, or guest interaction."
  ]
};