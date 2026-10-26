/**
 * Curated 8-Word Crossword Packs & Clue Dictionary
 * Tailored for cute, educational, and fun crossword gameplay
 */

const PUZZLE_PACKS = [
  {
    id: "aisc_ai",
    name: "🤖 AISC & Artificial Intelligence",
    badge: "AISC Project Special",
    description: "Core algorithms, state space search, and AI concepts",
    words: [
      { word: "ALGORITHM", clue: "Step-by-step mathematical recipe to solve a problem" },
      { word: "HEURISTIC", clue: "The h(n) 'rule of thumb' guiding A* search toward the goal" },
      { word: "PYTHON", clue: "The friendly serpent language used in our AISC project" },
      { word: "SEARCH", clue: "Exploring state spaces to find an optimal solution path" },
      { word: "GRAPH", clue: "Nodes and edges representing search problem states" },
      { word: "AGENT", clue: "An entity that perceives its environment and takes actions" },
      { word: "CROSS", clue: "Where two intersecting words share a common letter" },
      { word: "LOGIC", clue: "Formal reasoning system based on truth and validity" }
    ]
  },
  {
    id: "retro_gaming",
    name: "👾 Retro Arcade & Gaming",
    badge: "Arcade Classics",
    description: "Nostalgic 8-bit games, pixels, and high scores",
    words: [
      { word: "ARCADE", clue: "Classic coin-operated gaming hall with glowing neon lights" },
      { word: "PACMAN", clue: "Yellow circle who munches dots and dodges sneaky ghosts" },
      { word: "JOYSTICK", clue: "Vintage handheld control lever with a big red button" },
      { word: "PIXEL", clue: "Tiny colorful square dot forming retro digital art" },
      { word: "QUEST", clue: "Epic adventure undertaken by brave pixelated heroes" },
      { word: "LEVEL", clue: "A numbered gaming stage with escalating difficulty" },
      { word: "SCORE", clue: "Points accumulated on the high-score leaderboard" },
      { word: "RETRO", clue: "Charming nostalgic aesthetic from the 80s and 90s" }
    ]
  },
  {
    id: "cute_animals",
    name: "🐾 Cute Animals & Wildlife",
    badge: "Cozy Creatures",
    description: "Adorable animal friends from around the globe",
    words: [
      { word: "DOLPHIN", clue: "Playful aquatic acrobat known for cheerful clicks" },
      { word: "PENGUIN", clue: "Flightless feathered buddy waddling in a tuxedo" },
      { word: "KITTEN", clue: "Fluffy baby feline with gentle purrs and playful paws" },
      { word: "RABBIT", clue: "Floppy-eared hopper with a twitchy nose and carrot snacks" },
      { word: "HAMSTER", clue: "Chubby-cheeked rodent running on an endless wheel" },
      { word: "PANDA", clue: "Chubby black-and-white bear munching green bamboo" },
      { word: "KOALA", clue: "Sleepy Australian tree-hugger chewing eucalyptus leaves" },
      { word: "OTTER", clue: "Water mammal that holds paws while floating so they don't drift" }
    ]
  },
  {
    id: "cozy_cafe",
    name: "☕ Cozy Cafe & Bakery",
    badge: "Warm & Sweet",
    description: "Steaming drinks, sweet pastries, and afternoon treats",
    words: [
      { word: "ESPRESSO", clue: "Strong, concentrated shot of rich Italian coffee" },
      { word: "MATCHA", clue: "Vibrant emerald green Japanese whisked tea latte" },
      { word: "COOKIE", clue: "Crispy-edged, gooey chocolate-chipped baked treat" },
      { word: "CARAMEL", clue: "Decadent golden sweet drizzle made from heated sugar" },
      { word: "TEAPOT", clue: "Charming ceramic kettle for steeping warm fragrant herbal tea" },
      { word: "CINNAMON", clue: "Aromatic sweet spice dusted over lattes and warm buns" },
      { word: "BAKERY", clue: "Warm kitchen filling the street with fresh bread aromas" },
      { word: "ROAST", clue: "Slow heating process that unlocks rich coffee bean flavors" }
    ]
  },
  {
    id: "cosmic_space",
    name: "🚀 Cosmic Space & Stars",
    badge: "Deep Space",
    description: "Planets, shooting stars, and cosmic mysteries",
    words: [
      { word: "ASTRONAUT", clue: "Brave space voyager floating in zero gravity" },
      { word: "GALAXY", clue: "Vast swirling spiral of billions of twinkling stars" },
      { word: "NEBULA", clue: "Glowing interstellar cloud of colorful dust and stellar gas" },
      { word: "METEOR", clue: "Shooting star blazing bright across the midnight sky" },
      { word: "PLANET", clue: "Large spherical celestial body orbiting a central star" },
      { word: "ROCKET", clue: "Blazing booster engine propelling vessels past the atmosphere" },
      { word: "ORBIT", clue: "Gravitational elliptical path traced around a celestial body" },
      { word: "COMET", clue: "Icy wanderer leaving a glowing cosmic tail in its wake" }
    ]
  }
];

// Fallback clue dictionary for user custom words
const CLUE_DICTIONARY = {
  AI: "Artificial Intelligence that powers smart systems",
  DATA: "Information processed or stored by computers",
  CODE: "Instructions written by programmers for machines",
  WEB: "Global interconnected network of online pages",
  NODE: "A single point or junction in a graph or network",
  TREE: "Hierarchical data structure with roots and leaves",
  PATH: "Route connecting one state to another in a graph",
  COST: "The penalty or distance metric evaluated in search",
  GOAL: "The desired final target state in a search problem",
  BEST: "Optimal solution with minimal path cost",
  SMART: "Showing quick-witted intelligence or automated reasoning",
  GAME: "Interactive playful activity with rules and goals",
  STAR: "A luminous celestial sphere or favorite rating symbol",
  SOLVE: "To find an answer or solution to a puzzle",
  MINI: "Compact, bite-sized version of a puzzle",
  PLAY: "Engage in fun gaming activity",
  TEST: "Procedure to check correctness and verify performance"
};

/**
 * Returns a clue for any given word (from dictionary or friendly auto-generator)
 */
function getClueForWord(word, customClues = {}) {
  const upper = word.toUpperCase().trim();
  if (customClues[upper]) return customClues[upper];
  if (CLUE_DICTIONARY[upper]) return CLUE_DICTIONARY[upper];
  return `Word starting with "${upper[0]}" (${upper.length} letters)`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PUZZLE_PACKS, CLUE_DICTIONARY, getClueForWord };
}
