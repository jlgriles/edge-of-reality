// Podcast Episode Data
// Each node represents a podcast episode positioned in 3D space

const podcastNodes = [
  {
    id: "episode-001",
    title: "The Future of Artificial Intelligence",
    spotifyEmbed: "https://open.spotify.com/embed/episode/5XbBJJVI9Y4ZXWkzbT2ybN",
    theta: 0,      // Front
    phi: 90,       // Horizon
    themes: ["technology", "science"]
  },
  {
    id: "episode-002",
    title: "Understanding Human Psychology",
    spotifyEmbed: "https://open.spotify.com/embed/episode/0Q86acNRm4y9BFLm7SqLXD",
    theta: 72,     // Front-right
    phi: 75,       // Upper
    themes: ["health", "science"]
  },
  {
    id: "episode-003",
    title: "The Rise of Remote Work Culture",
    spotifyEmbed: "https://open.spotify.com/embed/episode/3J3nDqjZgxzP5YqbLqnqbB",
    theta: 144,    // Right-back
    phi: 105,      // Lower
    themes: ["business", "culture"]
  },
  {
    id: "episode-004",
    title: "Neuroscience and Decision Making",
    spotifyEmbed: "https://open.spotify.com/embed/episode/7makf9oM1KMM7zBfRHGFVH",
    theta: 216,    // Back-left
    phi: 60,       // Upper
    themes: ["science", "health"]
  },
  {
    id: "episode-005",
    title: "Building Sustainable Tech Companies",
    spotifyEmbed: "https://open.spotify.com/embed/episode/2tIwlZEoEqXqNQaIkjYPAC",
    theta: 288,    // Left-front
    phi: 120,      // Lower
    themes: ["technology", "business"]
  },
  {
    id: "episode-006",
    title: "The Science of Habit Formation",
    spotifyEmbed: "https://open.spotify.com/embed/episode/4iUuGE1eWFHJR9vYP1fLwh",
    theta: 45,     // Front-right
    phi: 45,       // Upper diagonal
    themes: ["health", "science"]
  },
  {
    id: "episode-007",
    title: "Cultural Shifts in the Digital Age",
    spotifyEmbed: "https://open.spotify.com/embed/episode/1hB4ELq5f1T5Cg4Pg2WqOr",
    theta: 180,    // Behind
    phi: 90,       // Horizon
    themes: ["culture", "technology"]
  },
  {
    id: "episode-008",
    title: "Innovation in Healthcare Technology",
    spotifyEmbed: "https://open.spotify.com/embed/episode/6MD5H6LD5sVV2iq0uxKXOQ",
    theta: 315,    // Left-front
    phi: 135,      // Lower diagonal
    themes: ["health", "technology"]
  }
];
