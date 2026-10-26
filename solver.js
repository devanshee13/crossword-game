/**
 * A* Crossword Solver Engine
 * Ported & optimized from Python AISC Project
 * Uses A* Search with Area Bounding Box Cost g(n) and Remaining Words Heuristic h(n)
 */

class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._bubbleDown(0);
    }
    return top;
  }

  size() {
    return this.heap.length;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index].f < this.heap[parent].f || 
         (this.heap[index].f === this.heap[parent].f && this.heap[index].counter < this.heap[parent].counter)) {
        [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
        index = parent;
      } else {
        break;
      }
    }
  }

  _bubbleDown(index) {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && (this.heap[left].f < this.heap[smallest].f ||
          (this.heap[left].f === this.heap[smallest].f && this.heap[left].counter < this.heap[smallest].counter))) {
        smallest = left;
      }
      if (right < length && (this.heap[right].f < this.heap[smallest].f ||
          (this.heap[right].f === this.heap[smallest].f && this.heap[right].counter < this.heap[smallest].counter))) {
        smallest = right;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}

class CrosswordSolver {
  /**
   * Calculates coordinates for each letter of a word.
   */
  static getCells(word, row, col, direction) {
    const cells = [];
    for (let i = 0; i < word.length; i++) {
      if (direction === 'H') {
        cells.push({ pos: `${row},${col + i}`, r: row, c: col + i, letter: word[i] });
      } else {
        cells.push({ pos: `${row + i},${col}`, r: row + i, c: col, letter: word[i] });
      }
    }
    return cells;
  }

  /**
   * Checks if a word can safely be placed at the given coordinates.
   */
  static canPlace(word, row, col, direction, grid, placed) {
    const cells = this.getCells(word, row, col, direction);
    let crossings = 0;

    for (const { pos, r, c, letter } of cells) {
      if (pos in grid) {
        // Must match the intersecting letter exactly
        if (grid[pos] !== letter) return false;

        // Cannot overlap in the same direction
        for (const old of placed) {
          if (old.direction === direction) {
            const oldCells = this.getCells(old.word, old.row, old.col, old.direction);
            if (oldCells.some(oc => oc.pos === pos)) {
              return false;
            }
          }
        }
        crossings++;
      } else {
        // Parallel neighbor check: no touching words side-by-side
        if (direction === 'H') {
          if (`${r - 1},${c}` in grid || `${r + 1},${c}` in grid) return false;
        } else {
          if (`${r},${c - 1}` in grid || `${r},${c + 1}` in grid) return false;
        }
      }
    }

    // End-cap checks: Word must not touch letters immediately before or after
    if (direction === 'H') {
      if (`${row},${col - 1}` in grid || `${row},${col + word.length}` in grid) return false;
    } else {
      if (`${row - 1},${col}` in grid || `${row + word.length},${col}` in grid) return false;
    }

    return crossings > 0;
  }

  /**
   * Finds all valid candidate intersections for a word.
   */
  static findCandidates(word, grid, placed) {
    const candidates = [];
    const seen = new Set();

    for (const old of placed) {
      const newDirection = old.direction === 'H' ? 'V' : 'H';
      const oldCells = this.getCells(old.word, old.row, old.col, old.direction);

      for (const { r, c, letter: oldLetter } of oldCells) {
        for (let i = 0; i < word.length; i++) {
          if (word[i] !== oldLetter) continue;

          const row = newDirection === 'H' ? r : r - i;
          const col = newDirection === 'H' ? c - i : c;
          const key = `${row},${col},${newDirection}`;

          if (!seen.has(key)) {
            seen.add(key);
            if (this.canPlace(word, row, col, newDirection, grid, placed)) {
              candidates.push({ row, col, direction: newDirection });
            }
          }
        }
      }
    }

    return candidates;
  }

  /**
   * Bounding box area of the grid: (maxR - minR + 1) * (maxC - minC + 1)
   */
  static calculateArea(grid) {
    const keys = Object.keys(grid);
    if (keys.length === 0) return 0;

    let minRow = Infinity, maxRow = -Infinity;
    let minCol = Infinity, maxCol = -Infinity;

    for (const key of keys) {
      const [r, c] = key.split(',').map(Number);
      if (r < minRow) minRow = r;
      if (r > maxRow) maxRow = r;
      if (c < minCol) minCol = c;
      if (c > maxCol) maxCol = c;
    }

    return (maxRow - minRow + 1) * (maxCol - minCol + 1);
  }

  /**
   * Main A* Solver implementation
   * Returns: { grid, placed, statesExplored, boundingBox, stats }
   */
  static solve(inputWords, maxStates = 4000) {
    const words = inputWords
      .map(w => w.toUpperCase().trim())
      .filter(w => w.length > 1 && /^[A-Z]+$/.test(w));

    if (words.length === 0) return null;

    // Sort descending by length for optimal root placement
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    const firstWord = sortedWords[0];
    const remaining = sortedWords.slice(1);

    const startGrid = {};
    const firstCells = this.getCells(firstWord, 0, 0, 'H');
    for (const cell of firstCells) {
      startGrid[cell.pos] = cell.letter;
    }

    const startPlaced = [{
      word: firstWord,
      row: 0,
      col: 0,
      direction: 'H'
    }];

    const frontier = new MinHeap();
    let stateCounter = 0;
    let statesExplored = 0;

    const gStart = this.calculateArea(startGrid);
    const hStart = remaining.length * 100;
    frontier.push({
      f: gStart + hStart,
      g: gStart,
      h: hStart,
      counter: stateCounter++,
      grid: startGrid,
      placed: startPlaced,
      remaining: remaining
    });

    while (frontier.size() > 0) {
      statesExplored++;
      if (statesExplored > maxStates) {
        break; // Guard against excessive search on incompatible word sets
      }

      const current = frontier.pop();

      // Goal test: all words successfully placed!
      if (current.remaining.length === 0) {
        return this.formatResult(current.grid, current.placed, statesExplored, current.f);
      }

      // Check remaining words for candidates
      // We look for candidate positions for the next word
      // If the immediate next word has 0 candidates, try other remaining words to prevent deadlocks
      const wordIndicesToTry = [0];
      const initialCandidates = this.findCandidates(current.remaining[0], current.grid, current.placed);
      
      let candidateList = [{ wordIdx: 0, word: current.remaining[0], candidates: initialCandidates }];

      if (initialCandidates.length === 0) {
        // Fallback: search other remaining words that can intersect right now
        for (let i = 1; i < current.remaining.length; i++) {
          const cands = this.findCandidates(current.remaining[i], current.grid, current.placed);
          if (cands.length > 0) {
            candidateList = [{ wordIdx: i, word: current.remaining[i], candidates: cands }];
            break;
          }
        }
      }

      for (const item of candidateList) {
        const wordToPlace = item.word;
        const nextRemaining = current.remaining.filter((_, idx) => idx !== item.wordIdx);

        for (const cand of item.candidates) {
          const nextGrid = { ...current.grid };
          const nextPlaced = [...current.placed];

          const newCells = this.getCells(wordToPlace, cand.row, cand.col, cand.direction);
          for (const cell of newCells) {
            nextGrid[cell.pos] = cell.letter;
          }

          nextPlaced.push({
            word: wordToPlace,
            row: cand.row,
            col: cand.col,
            direction: cand.direction
          });

          const g_n = this.calculateArea(nextGrid);
          const h_n = nextRemaining.length * 100;
          const f_n = g_n + h_n;

          stateCounter++;
          frontier.push({
            f: f_n,
            g: g_n,
            h: h_n,
            counter: stateCounter,
            grid: nextGrid,
            placed: nextPlaced,
            remaining: nextRemaining
          });
        }
      }
    }

    return null;
  }

  /**
   * Normalizes coordinates so the top-left is (0, 0)
   * and prepares board matrix with black tiles
   */
  static formatResult(grid, placed, statesExplored, finalCost) {
    const keys = Object.keys(grid);
    let minRow = Infinity, maxRow = -Infinity;
    let minCol = Infinity, maxCol = -Infinity;

    for (const key of keys) {
      const [r, c] = key.split(',').map(Number);
      if (r < minRow) minRow = r;
      if (r > maxRow) maxRow = r;
      if (c < minCol) minCol = c;
      if (c > maxCol) maxCol = c;
    }

    const rows = maxRow - minRow + 1;
    const cols = maxCol - minCol + 1;

    // Shift placed words coordinates to 0-based
    const normalizedPlaced = placed.map(p => ({
      ...p,
      row: p.row - minRow,
      col: p.col - minCol
    }));

    // Create normalized 2D grid matrix
    const matrix = [];
    for (let r = 0; r < rows; r++) {
      matrix[r] = [];
      for (let c = 0; c < cols; c++) {
        const origKey = `${r + minRow},${c + minCol}`;
        if (origKey in grid) {
          matrix[r][c] = {
            letter: grid[origKey],
            isBlack: false,
            row: r,
            col: c,
            number: null,
            words: []
          };
        } else {
          // Classic crossword BLACK BLOCK
          matrix[r][c] = {
            letter: '',
            isBlack: true,
            row: r,
            col: c,
            number: null,
            words: []
          };
        }
      }
    }

    // Assign standard crossword clue numbers (1, 2, 3...)
    // A cell gets a number if it is the start of an Across or Down word
    let clueCounter = 1;
    const numberedCells = {};

    // Sort words by (row, col) to assign numbers in reading order
    const sortedForNumbering = [...normalizedPlaced].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    for (const item of sortedForNumbering) {
      const key = `${item.row},${item.col}`;
      if (!numberedCells[key]) {
        numberedCells[key] = clueCounter++;
      }
      item.number = numberedCells[key];
      matrix[item.row][item.col].number = item.number;
    }

    // Link each cell to its words
    for (const item of normalizedPlaced) {
      for (let i = 0; i < item.word.length; i++) {
        const r = item.direction === 'H' ? item.row : item.row + i;
        const c = item.direction === 'H' ? item.col + i : item.col;
        matrix[r][c].words.push({
          word: item.word,
          direction: item.direction,
          number: item.number,
          charIndex: i
        });
      }
    }

    const area = rows * cols;

    return {
      rows,
      cols,
      matrix,
      placed: normalizedPlaced,
      statesExplored,
      finalCost,
      area,
      boundingWidth: cols,
      boundingHeight: rows
    };
  }
}

// Export for browser or node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CrosswordSolver, MinHeap };
}
