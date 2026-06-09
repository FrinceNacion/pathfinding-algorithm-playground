import { useEffect, useRef, useState, useCallback } from "react";
import ToolBox from "./ToolBox.jsx";
import { COLS, ROWS, EMPTY, WALL, START, END, VISITED, PATH, COLORS, createGrid } from "./canvas-config.js";
import { inBounds, drawCanvas, cellFromEvent, clearWalls, clearAll } from "./canvas-service.js";

export default function PathfindingCanvas({ style }) {
  const canvas_ref = useRef(null);
  const grid_ref = useRef(createGrid());
  const cell_size = useRef({ width: 0, height: 0 });
  const painting = useRef(false);
  const paint_value = useRef(WALL);

  const [start, setStart] = useState({ row: 12, col: 4 });
  const [end, setEnd] = useState({ row: 12, col: 35 });

  const [algorithm, setAlgorithm] = useState("BFS");
  const [tool, setTool] = useState("draw-walls");
  const [speed, setSpeed] = useState("normal");

  // clear all walls from the grid
  const clearWalls = () => {
    const grid = grid_ref.current;
    for (let rows = 0; rows < ROWS; rows++) {
      for (let columns = 0; columns < COLS; columns++) {
        if (grid[rows][columns] === WALL) {
          grid[rows][columns] = EMPTY;
        }
      }
    }
    draw();
  };

  const draw = useCallback(() => {
    drawCanvas(canvas_ref.current, grid_ref.current, cell_size.current, start, end);
  }, [start, end]);

  // resize canvas to fit parent and calculate cell size
  useEffect(() => {
    const canvas = canvas_ref.current;
    const resize = () => {
      const width = canvas.parentElement.clientWidth;
      const height = Math.round(width * ROWS / COLS);
      canvas.width = width;
      canvas.height = height;
      cell_size.current = { width: width / COLS, height: height / ROWS }; // cleanup, calculate cell size only on resize
      draw();
    };
    resize();
    const resize_observer = new ResizeObserver(resize);
    resize_observer.observe(canvas.parentElement);
    return () => resize_observer.disconnect();
  }, [draw]);

  const handleMouseDown = (e) => {
    const { row, col } = cellFromEvent(e);
    if (!inBounds(row, col)) return;

    if (tool === "draw-walls") {
      const cell = grid_ref.current[row][col];
      if (cell === START || cell === END) return;
      painting.current = true;
      paint_value.current = cell === WALL ? EMPTY : WALL;
      grid_ref.current[row][col] = paint_value.current;
      draw();
    } else if (tool === "move-start") {
      // move start immediately and begin dragging
      const previous_start_coordinate = start;
      if (row === end.row && col === end.col) return;
      grid_ref.current[previous_start_coordinate.row][previous_start_coordinate.col] = EMPTY;
      grid_ref.current[row][col] = START;
      setStart({ row, col });
      draw();
      painting.current = "move-start"; // special marker to enable dragging
    } else if (tool === "move-end") {
      const previous_end_coordinate = end;
      if (row === start.row && col === start.col) return;
      grid_ref.current[previous_end_coordinate.row][previous_end_coordinate.col] = EMPTY; // remove old end
      grid_ref.current[row][col] = END; // set new end
      setEnd({ row, col });
      draw();
      painting.current = "move-end";
    }
  };

  const handleMouseMove = (e) => {
    if (!painting.current) return;
    const { row, col } = cellFromEvent(e);
    if (!inBounds(row, col)) return;

    if (painting.current === true) {
      // drawing walls mode
      const cell = grid_ref.current[row][col];
      if (cell === START || cell === END) return;
      grid_ref.current[row][col] = paint_value.current;
      draw();
    } else if (painting.current === "move-start") {
      // update start while dragging
      const previous_start_coordinate = start;
      if (row === end.row && col === end.col) return;
      grid_ref.current[previous_start_coordinate.row][previous_start_coordinate.col] = EMPTY;
      grid_ref.current[row][col] = START;
      setStart({ row, col });
      draw();
    } else if (painting.current === "move-end") {
      const previous_end_coordinate = end;
      if (row === start.row && col === start.col) return;
      grid_ref.current[previous_end_coordinate.row][previous_end_coordinate.col] = EMPTY;
      grid_ref.current[row][col] = END;
      setEnd({ row, col });
      draw();
    }
  };

  const handleMouseUp = () => {
    painting.current = false;
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
        onEraseWalls={clearWalls}
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