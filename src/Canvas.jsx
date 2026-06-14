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
  const workspace_ref = useRef(null);
  const viewport_ref = useRef(null);
  const splitter_ref = useRef(null);
  const app_root_ref = useRef(null);
  const is_splitter_dragging = useRef(false);

  const [start, setStart] = useState(START_COORDINATE);
  const [end, setEnd] = useState(END_COORDINATE);
  const [algorithm, setAlgorithm] = useState("BFS");
  const [tool, setTool] = useState("draw-walls");
  const [speed, setSpeed] = useState(SPEED.NORMAL);

  // Layout state
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showFloatingToolbox, setShowFloatingToolbox] = useState(true);
  // Lazy-init isMobile so we don't call setState inside an effect body
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 900px)").matches
  );

  // Detect mobile/tablet breakpoint changes
  useEffect(() => {
    const media_query = window.matchMedia("(max-width: 900px)");
    const listener = (e) => setIsMobile(e.matches);
    media_query.addEventListener("change", listener);
    return () => media_query.removeEventListener("change", listener);
  }, []);

  const draw = useCallback(() => {
    drawCanvas(canvas_ref.current, grid_ref.current, cell_size.current, start, end);
  }, [start, end]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvas_ref.current;
    const viewport = viewport_ref.current;
    if (!canvas || !viewport) return;

    const available_width = viewport.clientWidth;
    const available_height = viewport.clientHeight;

    const aspect = ROWS / COLS;
    let base_width = available_width;
    let base_height = Math.round(base_width * aspect);

    if (base_height > available_height) {
      base_height = available_height;
      base_width = Math.round(base_height / aspect);
    }

    canvas.width = base_width;
    canvas.height = base_height;
    cell_size.current = { width: base_width / COLS, height: base_height / ROWS };
    draw();
  }, [draw]);

  // Observe the viewport element for size changes
  useEffect(() => {
    const viewport = viewport_ref.current;
    if (!viewport) return;
    const resize_observer = new ResizeObserver(() => resizeCanvas());
    resize_observer.observe(viewport);
    resizeCanvas();
    return () => resize_observer.disconnect();
  }, [resizeCanvas]);

  // zoom helpers
  const clampZoom = (val) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(val * 100) / 100));

  const handleZoomIn = () => setZoom(z => clampZoom(z + ZOOM_STEP));
  const handleZoomOut = () => setZoom(z => clampZoom(z - ZOOM_STEP));
  const handleZoomReset = () => setZoom(ZOOM_DEFAULT);

  // Mouse-wheel zoom on the viewport
  useEffect(() => {
    const viewport = viewport_ref.current;
    if (!viewport) return;
    const onWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom(zoom => clampZoom(zoom - Math.sign(event.deltaY) * ZOOM_STEP));
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  // Fullscreen
  const handleToggleFullscreen = useCallback(() => {
    const element = document.documentElement;
    if (!document.fullscreenElement) {
      element.requestFullscreen?.().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => { });
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Sidebar splitter drag
  useEffect(() => {
    const splitter = splitter_ref.current;
    if (!splitter) return;

    const onMouseDown = (e) => {
      e.preventDefault();
      is_splitter_dragging.current = true;
      splitter.classList.add("is-dragging");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    };

    const onMouseMove = (e) => {
      if (!is_splitter_dragging.current) return;
      const app_root = app_root_ref.current;
      if (!app_root) return;
      const rect = app_root.getBoundingClientRect();
      const new_sidebar_width = rect.right - e.clientX;
      const clamped = Math.min(400, Math.max(240, new_sidebar_width));
      setSidebarWidth(clamped);
    };

    const onMouseUp = () => {
      if (!is_splitter_dragging.current) return;
      is_splitter_dragging.current = false;
      splitter.classList.remove("is-dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    splitter.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      splitter.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Grid operations
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
    <div
      ref={app_root_ref}
      className={`app-root ${isFullscreen ? "is-fullscreen" : ""}`}
    >
      <div className="workspace-panel" ref={workspace_ref}>

        {/* Workspace top bar */}
        <header className="workspace-header">
          <div className="workspace-title">
            <div className="workspace-title-dot" />
            Pathfinding Playground
          </div>
          <div className="workspace-header-actions">
            {/* Mobile sidebar toggle */}
            {showMobileSidebar && (
              <button
                className={`btn-icon ${isMobileSidebarOpen ? "active" : ""}`}
                onClick={() => setIsMobileSidebarOpen(v => !v)}
                title="Toggle Controls"
              >
                {isMobileSidebarOpen ? <PanelRightClose size={15} /> : <PanelRight size={15} />}
              </button>
            )}
            {/* Fullscreen toggle */}
            <button
              className={`btn-icon ${isFullscreen ? "active" : ""}`}
              onClick={handleToggleFullscreen}
              title={isFullscreen ? "Exit full screen" : "Enter full screen"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </header>

        {/* Canvas viewport (scrollable when zoomed) */}
        <div
          ref={viewport_ref}
          className={`canvas-viewport ${zoom <= 1 ? "canvas-fits" : ""}`}
        >
          <div
            className="canvas-zoom-wrapper"
            style={{ transform: `scale(${zoom})` }}
          >
            <canvas
              ref={canvas_ref}
              className="canvas-element"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            />
          </div>
        </div>

        <div className="viewport-controls">
          <button className="vc-btn" onClick={handleZoomOut} title="Zoom out (Ctrl + Scroll)">
            <ZoomOut size={14} />
          </button>
          <button
            className="vc-zoom-label"
            onClick={handleZoomReset}
            title="Reset zoom to 100%"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {zoom_percent}
          </button>
          <button className="vc-btn" onClick={handleZoomIn} title="Zoom in (Ctrl + Scroll)">
            <ZoomIn size={14} />
          </button>
          <div className="vc-divider" />
          <button
            className={`vc-btn ${isFullscreen ? "active" : ""}`}
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit full screen" : "Full screen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          {!isMobile && !isFullscreen && (
            <>
              <div className="vc-divider" />
              <button
                className={`vc-btn ${isSidebarCollapsed ? "active" : ""}`}
                onClick={() => setIsSidebarCollapsed(v => !v)}
                title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
              >
                {isSidebarCollapsed ? <SidebarOpen size={14} /> : <SidebarClose size={14} />}
              </button>
            </>
          )}
        </div>
      </div>

      {showSidebar && !isSidebarCollapsed && (
        <div ref={splitter_ref} className="sidebar-splitter" />
      )}

      {showSidebar && (
        <aside
          className={`sidebar-panel ${isSidebarCollapsed ? "is-collapsed" : ""}`}
          style={{ width: isSidebarCollapsed ? undefined : `${sidebarWidth}px` }}
        >
          <ToolBox
            {...toolboxProps}
            isFloating={false}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(v => !v)}
          />
        </aside>
      )}

      {showMobileSidebar && (
        <aside
          className={`sidebar-panel ${isMobileSidebarOpen ? "" : "mobile-hidden"}`}
          style={{ width: "280px" }}
        >
          <ToolBox
            {...toolboxProps}
            isFloating={false}
            isCollapsed={false}
            onToggleCollapse={() => setIsMobileSidebarOpen(false)}
          />
        </aside>
      )}

      {isFullscreen && showFloatingToolbox && (
        <ToolBox
          {...toolboxProps}
          isFloating={true}
          onClose={() => setShowFloatingToolbox(false)}
        />
      )}

      {isFullscreen && !showFloatingToolbox && (
        <button
          className="btn-icon active animate-pop-in"
          style={{
            position: "fixed",
            top: "60px",
            right: "16px",
            zIndex: 10001,
            width: "36px",
            height: "36px",
          }}
          onClick={() => setShowFloatingToolbox(true)}
          title="Show controls"
        >
          <PanelRight size={16} />
        </button>
      )}
    </div>
  );
}