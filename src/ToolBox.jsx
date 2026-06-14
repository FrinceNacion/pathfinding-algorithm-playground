import { useState } from "react";
import {
    Eraser, RouteOff, Play, RotateCcw, ChevronLeft, ChevronRight,
    Pencil, MapPin, Flag, X, Layers
} from 'lucide-react';
import { SPEED } from "./canvas-config";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function ToolBox({
    grid, start, end,
    algorithm, onAlgorithmChange,
    tool, onToolChange,
    speed, onSpeedChange,
    onEraseWalls, onClearPath, onRun, onReset,
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