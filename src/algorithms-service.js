import { inBounds } from "./canvas-service";
import { ROWS, COLS, WALL } from "./canvas-config.js";

// get Neighbors of a cell that are not walls and are within bounds
const getNeighbors = (row, col, grid) => {
    const neighbors = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
        .filter(([r, c]) =>
            inBounds(r, c) && grid[r][c] !== WALL
        );
    return neighbors;
}

// reconstruct path from end to start using the prev map
const reconstructPath = (prev, end) => {
    const path = [];
    let current = `${end.row},${end.col}`; // backtrack from end
    while (prev[current]) {
        path.push(current);
        current = prev[current];
    }
    return path;
}

const breadthFirstSearch = (grid, start, end) => {
    const steps = [], prev = {};
    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    visited[start.row][start.col] = true;
    const queue = [[start.row, start.col]];

    while (queue.length > 0) {
        const [row, col] = queue.shift();
        if (row === end.row && col === end.col) {
            //console.log(`Reached end at (${row}, ${col}). End coordinates: (${end.row}, ${end.col})`);
            break;
        }

        const neighbors = getNeighbors(row, col, grid);
        for (const [nRow, nCol] of neighbors) {
            if (visited[nRow][nCol]) { continue } // skip if visited
            visited[nRow][nCol] = true;
            steps.push([nRow, nCol]);
            prev[`${nRow},${nCol}`] = `${row},${col}`;
            queue.push([nRow, nCol]);
        }
    }

    //console.log("Steps taken:", steps);
    //console.log("Previous map:", prev);
    const path = reconstructPath(prev, end);

    return [steps, path];
};

const depthFirstSearch = (grid, start, end) => {
    //console.log("DFS called with start:", start, "end:", end);
    const steps = [], prev = {};
    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    visited[start.row][start.col] = true;
    const stack = [[start.row, start.col]];

    while (stack.length > 0) {
        const [row, col] = stack.pop();
        if (row === end.row && col === end.col) {
            break;
        }

        const neighbors = getNeighbors(row, col, grid);
        for (const [nRow, nCol] of neighbors) {
            if (visited[nRow][nCol]) { continue } // skip if visited
            visited[nRow][nCol] = true;
            steps.push([nRow, nCol]);
            prev[`${nRow},${nCol}`] = `${row},${col}`;
            stack.push([nRow, nCol]);
        }
    }

    const path = reconstructPath(prev, end);
    
    return [steps, path];
}

export { breadthFirstSearch, depthFirstSearch };