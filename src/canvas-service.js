import { breadthFirstSearch } from "./algorithms-service.js";
import { ROWS, START, PATH, END, VISITED, COLS, COLORS, WALL, EMPTY } from "./canvas-config.js";

const inBounds = (row, col) => row >= 0 && row < ROWS && col >= 0 && col < COLS;

const clearWalls = (grid) => {
    for (let rows = 0; rows < ROWS; rows++) {
        for (let columns = 0; columns < COLS; columns++) {
            if (grid[rows][columns] === WALL) {
                grid[rows][columns] = EMPTY;
            }
        }
    }
}

const clearVisited = (grid) => {
    for (let rows = 0; rows < ROWS; rows++) {
        for (let columns = 0; columns < COLS; columns++) {
            if (grid[rows][columns] === VISITED || grid[rows][columns] === PATH) {
                grid[rows][columns] = EMPTY;
            }
        }
    }
}

const clearAll = (grid) => {
    for (let rows = 0; rows < ROWS; rows++) {
        for (let columns = 0; columns < COLS; columns++) {
            if (grid[rows][columns] !== START && grid[rows][columns] !== END) {
                grid[rows][columns] = EMPTY;
            }
        }
    }
}

// helper to get cell coordinates from mouse event
const cellFromEvent = (event, canvas, cell_size) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    return {
        row: Math.floor(y / cell_size.height),
        col: Math.floor(x / cell_size.width),
    };
};

const drawCanvas = (canvas, grid, cell_size, start, end) => {
    if (!canvas) return;
    const canvas_rendering_context = canvas.getContext("2d");
    const { width, height } = cell_size;

    canvas_rendering_context.clearRect(0, 0, canvas.width, canvas.height);

    // Cells
    for (let rows = 0; rows < ROWS; rows++) {
        for (let columns = 0; columns < COLS; columns++) {
            canvas_rendering_context.fillStyle = COLORS[grid[rows][columns]];
            canvas_rendering_context.fillRect(columns * width + 0.5, rows * height + 0.5, width - 1, height - 1);
        }
    }

    // Grid lines
    canvas_rendering_context.strokeStyle = "rgba(0,0,0,0.06)"; // "rgba(0,0,0,0.06)"
    canvas_rendering_context.lineWidth = 0.5;
    // render vertical and horizontal grid lines
    for (let columns = 0; columns <= COLS; columns++) {
        canvas_rendering_context.beginPath();
        canvas_rendering_context.moveTo(columns * width, 0);
        canvas_rendering_context.lineTo(columns * width, canvas.height);
        canvas_rendering_context.stroke();
    }
    for (let rows = 0; rows <= ROWS; rows++) {
        canvas_rendering_context.beginPath();
        canvas_rendering_context.moveTo(0, rows * height);
        canvas_rendering_context.lineTo(canvas.width, rows * height);
        canvas_rendering_context.stroke();
    }

    const drawLabel = (row, col, label) => {
        canvas_rendering_context.fillStyle = "#fff";
        canvas_rendering_context.font = `bold ${Math.round(height * 0.6)}px sans-serif`;
        canvas_rendering_context.textAlign = "center";
        canvas_rendering_context.textBaseline = "middle";
        canvas_rendering_context.fillText(label, col * width + width / 2, row * height + height / 2);
    };

    drawLabel(start.row, start.col, "S");
    drawLabel(end.row, end.col, "E");
}

export { inBounds, drawCanvas, cellFromEvent, clearWalls, clearVisited, clearAll };