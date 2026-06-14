import { useState } from "react";
import {
    Eraser, RouteOff, Play, RotateCcw, ChevronLeft, ChevronRight,
    Pencil, MapPin, Flag, X, Layers
} from 'lucide-react';
import { SPEED } from "./canvas-config";

const TOOL_OPTIONS = [
    { value: "draw-walls", label: "Draw Walls", icon: Pencil },
    { value: "move-start", label: "Move Start", icon: Flag },
    { value: "move-end", label: "Move End", icon: MapPin },
];

const ALGORITHM_OPTIONS = [
    { value: "BFS", label: "Breadth-First Search", short: "BFS" },
    { value: "DFS", label: "Depth-First Search", short: "DFS" },
];

const LEGEND_ITEMS = [
    { color: "#22c55e", label: "Start node" },
    { color: "#ef4444", label: "End node" },
    { color: "#0f3c65", label: "Wall" },
    { color: "#bfdbfe", label: "Visited" },
    { color: "#fbbf24", label: "Shortest path" },
    { color: "#f8f9fa", label: "Empty cell" },
];

export default function ToolBox({
    gridRef, start, end,
    algorithm, onAlgorithmChange,
    tool, onToolChange,
    speed, onSpeedChange,
    onEraseWalls, onClearPath, onRun, onReset,
    // Layout props
    isFloating = false,
    isCollapsed = false,
    onToggleCollapse,
    onClose,
}) {
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        console.log("Initialized tooltips");
    }, []);
    

    return (
        <div
            className="card position-fixed p-2 d-flex flex-column gap-3"
            style={{
                top: "20px",
                right: "20px",
                zIndex: 1000,
                minWidth: "50px",
            }}
        >
            <button
                className="btn btn-link p-0"
                style={{ fontSize: "1.2rem", color: "#666" }}
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
            >
                {isMinimized ? <Menu /> : <ChevronUp />}
            </button>

            {!isMinimized && (
                <>

                    <div>
                        <label className="form-label mb-2" style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                            Algorithm
                        </label>
                        <select
                            className="form-select form-select-sm"
                            value={algorithm}
                            onChange={(event) => onAlgorithmChange(event.target.value)}
                        >
                            <option value="BFS">BFS</option>
                            <option value="DFS">DFS</option>
                        </select>
                    </div>

                    <div className="d-flex flex-column">
                        <label className="form-label mb-2" style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                            Tool
                        </label>
                        <div className="d-flex flex-row gap-2">
                            <select
                                className="form-select form-select-sm"
                                value={tool}
                                onChange={(event) => onToolChange(event.target.value)}
                            >
                                <option value="draw-walls">Draw Walls</option>
                                <option value="move-start">Move Start</option>
                                <option value="move-end">Move End</option>
                            </select>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => onEraseWalls()}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                data-bs-title="Clear walls"
                            >
                                <Eraser />
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => onClearPath()}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                data-bs-title="Clear visited"
                            >
                                <RouteOff />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="form-label mb-2" style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                            Speed
                        </label>
                        <select
                            className="form-select form-select-sm"
                            value={speed}
                            onChange={(event) => onSpeedChange(event.target.value)}
                        >
                            <option value={SPEED.SLOW}>Slow</option>
                            <option value={SPEED.NORMAL}>Normal</option>
                            <option value={SPEED.FAST}>Fast</option>
                        </select>
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onRun(grid, start, end)}>Run</button>
                        <button className="btn btn-danger btn-sm flex-grow-1" onClick={() => onReset()}>Reset</button>
                    </div>
                </>
            )}
        </div>
    );
}