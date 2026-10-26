/**
 * A* Crossword Game Controller & Interactive Board
 */

// Sound Engine using Web Audio API (zero external assets needed)
class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playKey() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(500, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.12;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }
}

// Confetti Engine
class ConfettiCannon {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire() {
    this.particles = [];
    const colors = ['#fbbf24', '#f472b6', '#38bdf8', '#86efac', '#c084fc', '#ffffff'];
    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        r: Math.random() * 6 + 4,
        d: Math.random() * 60 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        tilt: Math.random() * 10,
        tiltAngle: Math.random() * Math.PI,
        tiltAngleInc: Math.random() * 0.08 + 0.04
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (!this.animating) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeCount = 0;
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.tiltAngle += p.tiltAngleInc;
      p.tilt = Math.sin(p.tiltAngle) * 12;

      if (p.y < this.canvas.height + 20) {
        activeCount++;
        this.ctx.beginPath();
        this.ctx.lineWidth = p.r;
        this.ctx.strokeStyle = p.color;
        this.ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        this.ctx.stroke();
      }
    }

    if (activeCount > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Game Controller
class CrosswordGame {
  constructor() {
    this.sound = new SoundFX();
    this.confetti = new ConfettiCannon(document.getElementById('confetti-canvas'));
    
    this.currentPack = PUZZLE_PACKS[0];
    this.puzzle = null; // result from CrosswordSolver
    this.userGrid = []; // 2D array of typed letters
    
    this.selectedRow = -1;
    this.selectedCol = -1;
    this.direction = 'H'; // 'H' for Across, 'V' for Down
    this.activeWordInfo = null;

    this.timerSeconds = 0;
    this.timerInterval = null;
    this.isSolved = false;

    this.themes = ['noir', 'arcade', 'newspaper'];
    this.themeNames = { noir: 'Noir', arcade: 'Arcade', newspaper: 'Newspaper' };
    this.currentThemeIndex = 0;

    this.initDOM();
    this.bindEvents();
    this.loadPack(this.currentPack);
  }

  initDOM() {
    // Populate Pack Dropdown
    const packSelect = document.getElementById('pack-select');
    packSelect.innerHTML = '';
    PUZZLE_PACKS.forEach(pack => {
      const opt = document.createElement('option');
      opt.value = pack.id;
      opt.textContent = pack.name;
      packSelect.appendChild(opt);
    });
  }

  bindEvents() {
    // Pack selector
    document.getElementById('pack-select').addEventListener('change', (e) => {
      const found = PUZZLE_PACKS.find(p => p.id === e.target.value);
      if (found) {
        this.loadPack(found);
      }
    });

    // Theme toggle
    document.getElementById('btn-theme').addEventListener('click', () => {
      this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
      const themeKey = this.themes[this.currentThemeIndex];
      document.documentElement.setAttribute('data-theme', themeKey);
      document.getElementById('theme-name').textContent = this.themeNames[themeKey];
    });

    // Sound toggle
    const btnSound = document.getElementById('btn-sound');
    btnSound.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      btnSound.textContent = this.sound.enabled ? '🔊' : '🔇';
    });

    // Action buttons
    document.getElementById('btn-check').addEventListener('click', () => this.checkAnswers());
    document.getElementById('btn-hint').addEventListener('click', () => this.giveHint());
    document.getElementById('btn-reveal').addEventListener('click', () => this.revealSolution());
    document.getElementById('btn-reset').addEventListener('click', () => this.resetBoard());
    document.getElementById('btn-new-puzzle').addEventListener('click', () => this.newRandomPuzzle());

    // Custom Words Modal
    const customModal = document.getElementById('custom-modal');
    document.getElementById('btn-custom-words').addEventListener('click', () => {
      customModal.classList.add('open');
      document.getElementById('custom-words-input').focus();
    });
    document.getElementById('btn-close-modal').addEventListener('click', () => customModal.classList.remove('open'));
    document.getElementById('btn-cancel-custom').addEventListener('click', () => customModal.classList.remove('open'));
    document.getElementById('btn-generate-custom').addEventListener('click', () => this.handleCustomWordsSubmit());

    // AISC Info Modal
    const aiscModal = document.getElementById('aisc-modal');
    document.getElementById('btn-aisc-info').addEventListener('click', () => aiscModal.classList.add('open'));
    document.getElementById('btn-close-aisc-modal').addEventListener('click', () => aiscModal.classList.remove('open'));

    // Global Keyboard Listener
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerSeconds = 0;
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
    }, 1000);
  }

  updateTimerDisplay() {
    const mins = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
    const secs = String(this.timerSeconds % 60).padStart(2, '0');
    document.getElementById('timer-text').textContent = `${mins}:${secs}`;
  }

  loadPack(pack) {
    this.currentPack = pack;
    document.getElementById('pack-badge').textContent = pack.badge || "8 Words";
    document.getElementById('pack-title').textContent = pack.name;
    document.getElementById('pack-select').value = pack.id;

    const wordsList = pack.words.map(w => w.word);
    this.generateCrossword(wordsList);
  }

  generateCrossword(words) {
    this.isSolved = false;
    const clueMap = {};
    if (this.currentPack && this.currentPack.words) {
      this.currentPack.words.forEach(item => {
        clueMap[item.word.toUpperCase()] = item.clue;
      });
    }

    // Run A* Solver
    const startTime = performance.now();
    const result = CrosswordSolver.solve(words);
    const duration = (performance.now() - startTime).toFixed(1);

    if (!result) {
      alert("Could not generate a fully connected crossword from this specific word set. Please try a different set of intersecting words!");
      return;
    }

    this.puzzle = result;
    this.puzzle.clueMap = clueMap;

    // Initialize userGrid with empty strings
    this.userGrid = [];
    for (let r = 0; r < result.rows; r++) {
      this.userGrid[r] = [];
      for (let c = 0; c < result.cols; c++) {
        this.userGrid[r][c] = '';
      }
    }

    // Update AISC metrics panel
    document.getElementById('metric-grid-size').textContent = `${result.cols} × ${result.rows}`;
    document.getElementById('metric-area-g').textContent = result.area;
    document.getElementById('metric-states').textContent = result.statesExplored;

    this.renderBoard();
    this.renderClues();
    this.startTimer();

    // Auto select first word
    if (result.placed && result.placed.length > 0) {
      const first = result.placed[0];
      this.selectCell(first.row, first.col, first.direction);
    }
  }

  renderBoard() {
    const gridEl = document.getElementById('crossword-grid');
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${this.puzzle.cols}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${this.puzzle.rows}, 1fr)`;

    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        const cellData = this.puzzle.matrix[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

        if (cellData.isBlack) {
          // Authentic Black Block ("Black types")
          cellEl.classList.add('cell-black');
          cellEl.setAttribute('aria-hidden', 'true');
        } else {
          // Playable Letter Tile
          cellEl.classList.add('cell-letter');
          cellEl.setAttribute('role', 'gridcell');

          if (cellData.number) {
            const numEl = document.createElement('span');
            numEl.className = 'cell-number';
            numEl.textContent = cellData.number;
            cellEl.appendChild(numEl);
          }

          const letterText = document.createElement('span');
          letterText.className = 'cell-char';
          letterText.textContent = this.userGrid[r][c];
          cellEl.appendChild(letterText);

          cellEl.addEventListener('click', () => {
            this.handleCellClick(r, c);
          });
        }

        gridEl.appendChild(cellEl);
      }
    }
  }

  renderClues() {
    const acrossList = document.getElementById('across-clues-list');
    const downList = document.getElementById('down-clues-list');
    acrossList.innerHTML = '';
    downList.innerHTML = '';

    const acrossWords = this.puzzle.placed.filter(p => p.direction === 'H').sort((a, b) => a.number - b.number);
    const downWords = this.puzzle.placed.filter(p => p.direction === 'V').sort((a, b) => a.number - b.number);

    acrossWords.forEach(item => {
      const li = this.createClueItem(item);
      acrossList.appendChild(li);
    });

    downWords.forEach(item => {
      const li = this.createClueItem(item);
      downList.appendChild(li);
    });

    this.updateProgressIndicator();
  }

  createClueItem(item) {
    const li = document.createElement('li');
    li.className = 'clue-item';
    li.id = `clue-${item.number}-${item.direction}`;
    li.dataset.num = item.number;
    li.dataset.dir = item.direction;
    li.dataset.word = item.word;

    const clueText = getClueForWord(item.word, this.puzzle.clueMap);

    li.innerHTML = `
      <span class="clue-badge">${item.number}.</span>
      <span class="clue-content">${clueText} <small style="color:var(--text-dim);">(${item.word.length})</small></span>
    `;

    li.addEventListener('click', () => {
      this.selectCell(item.row, item.col, item.direction);
    });

    return li;
  }

  handleCellClick(row, col) {
    if (this.selectedRow === row && this.selectedCol === col) {
      // Toggle direction if clicking the same cell
      this.direction = this.direction === 'H' ? 'V' : 'H';
    } else {
      // Check which directions are valid for this cell
      const cellData = this.puzzle.matrix[row][col];
      const hasH = cellData.words.some(w => w.direction === 'H');
      const hasV = cellData.words.some(w => w.direction === 'V');

      if (this.direction === 'H' && !hasH && hasV) {
        this.direction = 'V';
      } else if (this.direction === 'V' && !hasV && hasH) {
        this.direction = 'H';
      }
    }

    this.selectCell(row, col, this.direction);
  }

  selectCell(row, col, direction = this.direction) {
    this.selectedRow = row;
    this.selectedCol = col;
    this.direction = direction;

    const cellData = this.puzzle.matrix[row][col];
    if (cellData.isBlack) return;

    // Find the word object in the current direction (or fallback)
    let wordMatch = cellData.words.find(w => w.direction === this.direction);
    if (!wordMatch && cellData.words.length > 0) {
      wordMatch = cellData.words[0];
      this.direction = wordMatch.direction;
    }

    this.activeWordInfo = wordMatch ? this.puzzle.placed.find(p => p.word === wordMatch.word && p.direction === wordMatch.direction) : null;

    this.updateHighlights();
  }

  updateHighlights() {
    // Clear previous cell classes
    const allCells = document.querySelectorAll('.cell-letter');
    allCells.forEach(c => {
      c.classList.remove('cell-active', 'cell-highlight');
    });

    // Clear active clue highlights
    document.querySelectorAll('.clue-item').forEach(ci => ci.classList.remove('active'));

    if (!this.activeWordInfo) return;

    // Highlight all cells in the active word
    for (let i = 0; i < this.activeWordInfo.word.length; i++) {
      const r = this.activeWordInfo.direction === 'H' ? this.activeWordInfo.row : this.activeWordInfo.row + i;
      const c = this.activeWordInfo.direction === 'H' ? this.activeWordInfo.col + i : this.activeWordInfo.col;
      const el = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
      if (el) {
        el.classList.add('cell-highlight');
      }
    }

    // Highlight cursor cell
    const activeEl = document.querySelector(`.cell[data-row="${this.selectedRow}"][data-col="${this.selectedCol}"]`);
    if (activeEl) {
      activeEl.classList.add('cell-active');
    }

    // Highlight active clue in sidebar and top banner
    const clueItem = document.getElementById(`clue-${this.activeWordInfo.number}-${this.activeWordInfo.direction}`);
    if (clueItem) {
      clueItem.classList.add('active');
      clueItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const dirLabel = this.activeWordInfo.direction === 'H' ? 'Across' : 'Down';
    const clueText = getClueForWord(this.activeWordInfo.word, this.puzzle.clueMap);
    document.getElementById('active-clue-num').textContent = `${this.activeWordInfo.number}-${dirLabel}`;
    document.getElementById('active-clue-text').textContent = `${clueText} (${this.activeWordInfo.word.length} letters)`;
  }

  handleKeyDown(e) {
    if (this.selectedRow < 0 || this.selectedCol < 0) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Letter Typed: A-Z
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      const letter = e.key.toUpperCase();
      this.setCellValue(this.selectedRow, this.selectedCol, letter);
      this.sound.playKey();
      this.moveCursor(1);
      this.checkWordAuto();
      return;
    }

    // Backspace / Delete
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.userGrid[this.selectedRow][this.selectedCol] !== '') {
        this.setCellValue(this.selectedRow, this.selectedCol, '');
      } else {
        this.moveCursor(-1);
        this.setCellValue(this.selectedRow, this.selectedCol, '');
      }
      return;
    }

    // Spacebar toggles Across / Down
    if (e.key === ' ') {
      e.preventDefault();
      this.direction = this.direction === 'H' ? 'V' : 'H';
      this.selectCell(this.selectedRow, this.selectedCol, this.direction);
      return;
    }

    // Arrow Navigation
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.navigateCell(0, 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.navigateCell(0, -1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.navigateCell(1, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigateCell(-1, 0);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.jumpToNextWord(e.shiftKey ? -1 : 1);
    }
  }

  setCellValue(r, c, letter) {
    this.userGrid[r][c] = letter;
    const cellEl = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    if (cellEl) {
      const charEl = cellEl.querySelector('.cell-char');
      if (charEl) charEl.textContent = letter;
      cellEl.classList.remove('is-correct', 'is-wrong');
    }
  }

  moveCursor(delta) {
    if (!this.activeWordInfo) return;
    const word = this.activeWordInfo.word;
    const dir = this.activeWordInfo.direction;

    let idx = -1;
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'H' ? this.activeWordInfo.row : this.activeWordInfo.row + i;
      const c = dir === 'H' ? this.activeWordInfo.col + i : this.activeWordInfo.col;
      if (r === this.selectedRow && c === this.selectedCol) {
        idx = i;
        break;
      }
    }

    const nextIdx = idx + delta;
    if (nextIdx >= 0 && nextIdx < word.length) {
      const nextR = dir === 'H' ? this.activeWordInfo.row : this.activeWordInfo.row + nextIdx;
      const nextC = dir === 'H' ? this.activeWordInfo.col + nextIdx : this.activeWordInfo.col;
      this.selectCell(nextR, nextC, dir);
    }
  }

  navigateCell(dr, dc) {
    let r = this.selectedRow + dr;
    let c = this.selectedCol + dc;

    while (r >= 0 && r < this.puzzle.rows && c >= 0 && c < this.puzzle.cols) {
      if (!this.puzzle.matrix[r][c].isBlack) {
        this.selectCell(r, c);
        return;
      }
      r += dr;
      c += dc;
    }
  }

  jumpToNextWord(delta) {
    if (!this.puzzle || !this.puzzle.placed.length) return;
    const words = this.puzzle.placed;
    let currIdx = words.findIndex(w => w.word === this.activeWordInfo?.word && w.direction === this.activeWordInfo?.direction);
    if (currIdx === -1) currIdx = 0;

    let nextIdx = (currIdx + delta + words.length) % words.length;
    const nextWord = words[nextIdx];
    this.selectCell(nextWord.row, nextWord.col, nextWord.direction);
  }

  checkAnswers() {
    let allCorrect = true;
    let anyFilled = false;

    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        const cell = this.puzzle.matrix[r][c];
        if (!cell.isBlack) {
          const userVal = this.userGrid[r][c];
          const el = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
          if (el) {
            el.classList.remove('is-correct', 'is-wrong');
            if (userVal === '') {
              allCorrect = false;
            } else {
              anyFilled = true;
              if (userVal === cell.letter) {
                el.classList.add('is-correct');
              } else {
                el.classList.add('is-wrong');
                allCorrect = false;
              }
            }
          }
        }
      }
    }

    this.updateProgressIndicator();

    if (allCorrect && anyFilled) {
      this.handleVictory();
    } else if (anyFilled) {
      this.sound.playCorrect();
    }
  }

  checkWordAuto() {
    this.updateProgressIndicator();
  }

  updateProgressIndicator() {
    if (!this.puzzle) return;
    let solvedWords = 0;

    this.puzzle.placed.forEach(p => {
      let wordDone = true;
      for (let i = 0; i < p.word.length; i++) {
        const r = p.direction === 'H' ? p.row : p.row + i;
        const c = p.direction === 'H' ? p.col + i : p.col;
        if (this.userGrid[r][c] !== p.word[i]) {
          wordDone = false;
          break;
        }
      }

      const clueEl = document.getElementById(`clue-${p.number}-${p.direction}`);
      if (clueEl) {
        if (wordDone) {
          clueEl.classList.add('completed');
          solvedWords++;
        } else {
          clueEl.classList.remove('completed');
        }
      }
    });

    document.getElementById('progress-indicator').textContent = `${solvedWords} / ${this.puzzle.placed.length} Solved`;

    if (solvedWords === this.puzzle.placed.length && !this.isSolved) {
      this.handleVictory();
    }
  }

  giveHint() {
    if (this.selectedRow < 0 || this.selectedCol < 0) return;
    const correctLetter = this.puzzle.matrix[this.selectedRow][this.selectedCol].letter;
    if (correctLetter) {
      this.setCellValue(this.selectedRow, this.selectedCol, correctLetter);
      const el = document.querySelector(`.cell[data-row="${this.selectedRow}"][data-col="${this.selectedCol}"]`);
      if (el) el.classList.add('is-revealed');
      this.sound.playKey();
      this.moveCursor(1);
      this.checkWordAuto();
    }
  }

  revealSolution() {
    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        const cell = this.puzzle.matrix[r][c];
        if (!cell.isBlack) {
          this.setCellValue(r, c, cell.letter);
          const el = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
          if (el) el.classList.add('is-revealed');
        }
      }
    }
    this.updateProgressIndicator();
  }

  resetBoard() {
    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        if (!this.puzzle.matrix[r][c].isBlack) {
          this.setCellValue(r, c, '');
          const el = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
          if (el) el.classList.remove('is-correct', 'is-wrong', 'is-revealed');
        }
      }
    }
    this.startTimer();
    this.updateProgressIndicator();
  }

  newRandomPuzzle() {
    const remainingPacks = PUZZLE_PACKS.filter(p => p.id !== this.currentPack.id);
    const randomPack = remainingPacks[Math.floor(Math.random() * remainingPacks.length)] || PUZZLE_PACKS[0];
    this.loadPack(randomPack);
  }

  handleCustomWordsSubmit() {
    const input = document.getElementById('custom-words-input').value;
    const words = input
      .split(/[\n,]+/)
      .map(w => w.trim().toUpperCase().replace(/[^A-Z]/g, ''))
      .filter(w => w.length >= 2);

    if (words.length < 3) {
      alert("Please enter at least 3-8 words so the A* search can form an intersecting crossword!");
      return;
    }

    document.getElementById('custom-modal').classList.remove('open');
    this.currentPack = {
      id: "custom",
      name: `✏️ Custom Set (${words.length} Words)`,
      badge: "Custom Words",
      words: words.map(w => ({ word: w, clue: getClueForWord(w) }))
    };

    document.getElementById('pack-badge').textContent = "Custom Words";
    document.getElementById('pack-title').textContent = `✏️ Custom Set (${words.length} Words)`;
    this.generateCrossword(words);
  }

  handleVictory() {
    this.isSolved = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.sound.playVictory();
    this.confetti.fire();

    const timeFormatted = document.getElementById('timer-text').textContent;
    setTimeout(() => {
      alert(`🎉 Congratulations! You solved all 8 crossword words in ${timeFormatted}!\n\nA* Evaluation Cost: f(n) = ${this.puzzle.finalCost}`);
    }, 400);
  }
}

// Launch on page load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new CrosswordGame();
});
