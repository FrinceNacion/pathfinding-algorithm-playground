const COLS = 40;
const ROWS = 22;
const EMPTY = 0, WALL = 1, START = 2, END = 3, VISITED = 4, PATH = 5;

export const START_COORDINATE = { row: 12, col: 4 };
export const END_COORDINATE = { row: 12, col: 35 };

export const SPEED = {
  SLOW : 100,
  NORMAL : 75,
  FAST : 25 
}

const COLORS = {
  [EMPTY]: "#f8f9fa",
  [WALL]: "#0f3c65", // #475569 #2b323f #0f3c65
  [START]: "#22c55e",
  [END]: "#ef4444", // #9a0002
  [VISITED]: "#bfdbfe",
  [PATH]: "#fbbf24",
};

function createGrid() {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
  grid[12][4] = START;
  grid[12][35] = END;
  return grid;
}

export { COLS, ROWS, EMPTY, WALL, START, END, VISITED, PATH, COLORS, createGrid };