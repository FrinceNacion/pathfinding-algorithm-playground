import { inBounds } from "./canvas-service";
import { ROWS, COLS, WALL, VISITED } from "./canvas-config.js";

// get Neighbors of a cell that are not walls and are within bounds
const getNeighbors = (row, col, grid) => {
    const neighbors = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
        .filter(([r, c]) =>
            inBounds(r, c) && grid[r][c] !== WALL
        );
    return neighbors;
}

const breadthFirstSearch = (grid, start, end) => {
    const steps = [];
    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    visited[start.row][start.col] = true;
    const queue = [[start.row, start.col]];

    while (queue.length > 0) {
        const [row, col] = queue.shift();
        if (row === end.row && col === end.col) { 
            console.log("End found!");
            break; 
        } // found end;
        const neighbors = getNeighbors(row, col, grid);
        for (const [nRow, nCol] of neighbors) {
            console.log(`Checking neighbor: (${nRow}, ${nCol})`);
            if (visited[nRow][nCol]) { continue } // skip if visited
            visited[nRow][nCol] = true;
            steps.push([nRow, nCol]);
            queue.push([nRow, nCol]);
        }
    }

    return steps;
};

export { breadthFirstSearch };