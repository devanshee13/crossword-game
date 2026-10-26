# 🧩 A* Mini Crossword Game (AISC AI Coursework)

A modern, sleek, interactive crossword web game powered by the **A\* Search Algorithm**, featuring authentic **black blocker tiles ("black types")**, dynamic Across & Down clues, keyboard navigation, themes.

---

## Features

- **8-Word Crossword Generator**: Generates an interconnected compact crossword puzzle from 8 words using the A* Search algorithm.
- **Authentic Black Blocker Tiles ("Black Types")**: Authentic newspaper and arcade style black blocks framing the letter cells.
- **Playable Crossword Engine**:
  - Click any cell or clue to highlight active word.
  - Arrow keys, Backspace, Spacebar (toggle Across ↔ Down), Tab navigation.
  - Check Answers with instant visual validation (green/red feedback).
  - Hint Letter & Reveal Solution.
  - Victory Confetti 🎉 and sound effects via Web Audio API.
- **A\* Heuristics Dashboard**:
  - Evaluation Function: $f(n) = g(n) + h(n)$
  - Path Cost $g(n)$: Bounding Box Area `(max_r - min_r + 1) * (max_c - min_c + 1)`
  - Heuristic $h(n)$: `remaining_words * 100`
  - Real-time display of states explored and grid dimensions.
- **Multiple Themes**:
  - **Classic Noir**: Deep dark mode with golden amber accents.
  - **Retro Arcade**: 8-bit neon aesthetic with pastel pink highlights.
  - **Cozy Newspaper**: Vintage cream and ink look.
- **Curated 8-Word Packs & Custom Input**:
  - AISC & Artificial Intelligence
  - Retro Arcade & Gaming
  - Cute Animals & Wildlife
  - Cozy Cafe & Bakery
  - Cosmic Space & Stars
  - Custom 8 Words builder

---



---



