import { useState } from "react";
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';

export default function ToolBox({
    algorithm,
    onAlgorithmChange,
    tool, onToolChange,
    speed, onSpeedChange
}) {
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        <div
            className="card position-fixed p-2 d-flex flex-column gap-3"
            style={{
                top: "20px",
                right: "20px",
                zIndex: 1000,
                minWidth: "220px",
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
                            <option value="bfs">BFS</option>
                            <option value="dfs">DFS</option>
                            <option value="dijkstra">Dijkstra</option>
                            <option value="astar">A*</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label mb-2" style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                            Tool
                        </label>
                        <select
                            className="form-select form-select-sm"
                            value={tool}
                            onChange={(event) => onToolChange(event.target.value)}
                        >
                            <option value="draw-walls">Draw Walls</option>
                            <option value="move-start">Move Start</option>
                            <option value="move-end">Move End</option>
                        </select>
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
                            <option value="slow">Slow</option>
                            <option value="normal">Normal</option>
                            <option value="fast">Fast</option>
                        </select>
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-primary btn-sm flex-grow-1">Run</button>
                        <button className="btn btn-secondary btn-sm flex-grow-1">Reset</button>
                    </div>
                </>
            )}
        </div>
    );
}