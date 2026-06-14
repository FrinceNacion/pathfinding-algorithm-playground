import { useEffect, useRef, useState, useCallback } from "react";
import ToolBox from "./ToolBox.jsx";
import { breadthFirstSearch, depthFirstSearch } from "./algorithms-service.js";
import { COLS, ROWS, EMPTY, WALL, START, END, VISITED, PATH, SPEED, createGrid } from "./canvas-config.js";
import { END_COORDINATE, START_COORDINATE } from "./canvas-config.js";
import { inBounds, drawCanvas, cellFromEvent, clearWalls, clearAll, clearVisited } from "./canvas-service.js";
import {
  ZoomIn, ZoomOut, Maximize2, Minimize2, SidebarOpen, SidebarClose,
  PanelRight, PanelRightClose,
} from "lucide-react";

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.5;
const ZOOM_DEFAULT = 1.0;
const SIDEBAR_DEFAULT_WIDTH = 300;

export default function PathfindingCanvas() {
  const canvas_ref = useRef(null);
  const grid_ref = useRef(createGrid());
  const cell_size = useRef({ width: 0, height: 0 });
  const painting = useRef(false);
  const paint_value = useRef(WALL);
  const running = useRef(false);

  const [start, setStart] = useState(START_COORDINATE);
  const [end, setEnd] = useState(END_COORDINATE);

  const [algorithm, setAlgorithm] = useState("BFS");
  const [tool, setTool] = useState("draw-walls");
  const [speed, setSpeed] = useState(SPEED.NORMAL);

  // clear all walls from the grid
  const handleClearWalls = () => {
    if (running.current) return;
    clearWalls(grid_ref.current);
    draw();
  };

  const handleClearPath = () => {
    if (running.current) return;
    clearVisited(grid_ref.current);
    draw();
  };

  const resetCanvas = () => {
    if (running.current) return;
    clearAll(grid_ref.current, start, end);
    grid_ref.current[start.row][start.col] = EMPTY;
    grid_ref.current[end.row][end.col] = EMPTY;
    grid_ref.current[12][4] = START;
    grid_ref.current[12][35] = END;
    setStart(START_COORDINATE);
    setEnd(END_COORDINATE);
    draw();
  };

  // Canvas interaction handlers (mouse)
  const handleMouseDown = (event) => {
    if (running.current) return;
    const { row, col } = cellFromEvent(event, canvas_ref.current, cell_size.current);
    if (!inBounds(row, col)) return;

    if (tool === "draw-walls") {
      const cell = grid_ref.current[row][col];
      if (cell === START || cell === END) return;
      painting.current = true;
      paint_value.current = cell === WALL ? EMPTY : WALL;
      grid_ref.current[row][col] = paint_value.current;
      draw();
    } else if (tool === "move-start") {
      if (row === end.row && col === end.col) return;
      grid_ref.current[start.row][start.col] = EMPTY;
      grid_ref.current[row][col] = START;
      setStart({ row, col });
      draw();
      painting.current = "move-start";
    } else if (tool === "move-end") {
      if (row === start.row && col === start.col) return;
      grid_ref.current[end.row][end.col] = EMPTY;
      grid_ref.current[row][col] = END;
      setEnd({ row, col });
      draw();
      painting.current = "move-end";
    }
  };

  const handleMouseMove = (event) => {
    if (!painting.current) return;
    const { row, col } = cellFromEvent(event, canvas_ref.current, cell_size.current);
    if (!inBounds(row, col)) return;

    if (painting.current === true) {
      const cell = grid_ref.current[row][col];
      if (cell === START || cell === END) return;
      grid_ref.current[row][col] = paint_value.current;
      draw();
    } else if (painting.current === "move-start") {
      if (row === end.row && col === end.col) return;
      grid_ref.current[start.row][start.col] = EMPTY;
      grid_ref.current[row][col] = START;
      setStart({ row, col });
      draw();
    } else if (painting.current === "move-end") {
      if (row === start.row && col === start.col) return;
      grid_ref.current[end.row][end.col] = EMPTY;
      grid_ref.current[row][col] = END;
      setEnd({ row, col });
      draw();
    }
  };

  const handleMouseUp = () => { painting.current = false; };

  // Touch support for mobile
  const handleTouchStart = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
  };

  const handleTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  };

  const visualizeAlgorithm = (steps, path, grid) => {
    const renderVisited = setInterval(() => {
      if (steps.length === 0) { clearInterval(renderVisited); return; }
      const [row, col] = steps.shift();
      if (grid[row][col] !== START && grid[row][col] !== END) {
        grid[row][col] = VISITED;
        draw();
      }
    }, speed);

    if (path.length === 0) { running.current = false; return; }

    const renderPath = setInterval(() => {
      if (steps.length > 0) return;
      if (path.length === 0) { clearInterval(renderPath); running.current = false; return; }
      const [row, col] = path.shift().split(",").map(Number);
      if (grid[row][col] !== START && grid[row][col] !== END) {
        grid[row][col] = PATH;
        draw();
      }
    }, speed);
  };

  const handleRun = () => {
    if (running.current) return;
    running.current = true;
    const grid = grid_ref.current;
    if (algorithm === "BFS") {
      const [steps, path] = breadthFirstSearch(grid, start, end);
      visualizeAlgorithm(steps, path, grid);
    } else if (algorithm === "DFS") {
      const [steps, path] = depthFirstSearch(grid, start, end);
      visualizeAlgorithm(steps, path, grid);
    }
  };

  const zoom_percent = `${Math.round(zoom * 100)}%`;

  // In fullscreen, use floating toolbox; on mobile, draw-er style sidebar.
  const showSidebar = !isFullscreen && !isMobile;
  const showMobileSidebar = !isFullscreen && isMobile;

  const toolboxProps = {
    algorithm, onAlgorithmChange: setAlgorithm,
    tool, onToolChange: setTool,
    speed, onSpeedChange: setSpeed,
    onEraseWalls: handleClearWalls,
    onClearPath: handleClearPath,
    onRun: handleRun,
    onReset: resetCanvas,
    gridRef: grid_ref,
    start, end,
  };

  return (
    <div style={style}>
      <ToolBox
        algorithm={algorithm}
        onAlgorithmChange={setAlgorithm}
        tool={tool}
        onToolChange={setTool}
        speed={speed}
        onSpeedChange={setSpeed}
        onEraseWalls={handleClearWalls}
        onClearPath={handleClearPath}
        onRun={handleRun}
        onReset={resetCanvas}
        grid={grid_ref.current}
        start={start}
        end={end}
      />
      <canvas
        ref={canvas_ref}
        style={{ display: "block", width: "100%", cursor: "crosshair" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}