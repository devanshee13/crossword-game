# 🧩 A* Mini Crossword Game (AISC AI Coursework)

A modern, sleek, interactive crossword web game powered by the **A\* Search Algorithm**, featuring authentic **black blocker tiles ("black types")**, dynamic Across & Down clues, keyboard navigation, themes, and instant Vercel deployment.

---

## ✨ Features

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
  - 🕶️ **Classic Noir**: Deep dark mode with golden amber accents.
  - 👾 **Retro Arcade**: 8-bit neon aesthetic with pastel pink highlights.
  - 📰 **Cozy Newspaper**: Vintage cream and ink look.
- **Curated 8-Word Packs & Custom Input**:
  - 🤖 AISC & Artificial Intelligence
  - 👾 Retro Arcade & Gaming
  - 🐾 Cute Animals & Wildlife
  - ☕ Cozy Cafe & Bakery
  - 🚀 Cosmic Space & Stars
  - ✏️ Custom 8 Words builder

---

## 🚀 How to Run Locally

Since this is a clean, dependency-free web app, you can run it with Python's built-in web server:

```bash
cd /Users/devansheeagarwal/Desktop/crossword-game
python3 -m http.server 3000
```
Then open `http://localhost:3000` in your browser!

---

## 🌐 How to Deploy to Vercel (1-Click & Free)

### Option 1: Via GitHub (Easiest & Automatic)
1. Push this folder to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of A* Crossword Game"
   git branch -M main
   git remote add origin https://github.com/<your-username>/crossword-game.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New Project"** -> Select your `crossword-game` GitHub repo.
4. Click **Deploy**. Vercel will automatically detect the static project and deploy it in ~15 seconds to a live URL like `https://crossword-game.vercel.app`!

### Option 2: Via Vercel CLI
If you have Vercel CLI installed:
```bash
vercel
```
Follow the 3 quick prompts and your project is instantly live!
