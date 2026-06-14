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
    const [localCollapsed, setLocalCollapsed] = useState(false);
    const collapsed = isFloating ? localCollapsed : isCollapsed;
    const toggleCollapse = isFloating
        ? () => setLocalCollapsed(v => !v)
        : onToggleCollapse;

    const speedLabels = { [SPEED.SLOW]: "Slow", [SPEED.NORMAL]: "Normal", [SPEED.FAST]: "Fast" };
    const speedIndex = [SPEED.SLOW, SPEED.NORMAL, SPEED.FAST].indexOf(Number(speed));

    const handleSpeedSlider = (e) => {
        const idx = Number(e.target.value);
        const vals = [SPEED.SLOW, SPEED.NORMAL, SPEED.FAST];
        onSpeedChange(vals[idx]);
    };

    if (isFloating) {
        return (
            <div className="floating-toolbox animate-pop-in">
                <div className="floating-toolbox-header">
                    <span className="floating-toolbox-title">Controls</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button
                            className="btn-icon"
                            onClick={toggleCollapse}
                            title={collapsed ? "Expand" : "Collapse"}
                        >
                            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </button>
                        {onClose && (
                            <button className="btn-icon" onClick={onClose} title="Close">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {!collapsed && <ToolboxBody
                    algorithm={algorithm} onAlgorithmChange={onAlgorithmChange}
                    tool={tool} onToolChange={onToolChange}
                    speed={speed} speedIndex={speedIndex} speedLabels={speedLabels}
                    onSpeedSlider={handleSpeedSlider}
                    onEraseWalls={onEraseWalls} onClearPath={onClearPath}
                    onRun={onRun} onReset={onReset}
                    gridRef={gridRef} start={start} end={end}
                />}
            </div>
        );
    }

    // Sidebar mode
    return (
        <>
            <div className="sidebar-header">
                <span className="sidebar-header-title">Controls</span>
                <button
                    className="btn-icon"
                    onClick={toggleCollapse}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
            </div>
            {!isCollapsed && (
                <div className="sidebar-content">
                    <ToolboxBody
                        algorithm={algorithm} onAlgorithmChange={onAlgorithmChange}
                        tool={tool} onToolChange={onToolChange}
                        speed={speed} speedIndex={speedIndex} speedLabels={speedLabels}
                        onSpeedSlider={handleSpeedSlider}
                        onEraseWalls={onEraseWalls} onClearPath={onClearPath}
                        onRun={onRun} onReset={onReset}
                        gridRef={gridRef} start={start} end={end}
                    />
                </div>
            )}
        </>
    );
}

function ToolboxBody({
    algorithm, onAlgorithmChange,
    tool, onToolChange,
    speed, speedIndex, speedLabels, onSpeedSlider,
    onEraseWalls, onClearPath,
    onRun, onReset,
    gridRef, start, end,
}) {
    return (
        <>
            {/* Algorithm Selection */}
            <div className="sidebar-section">
                <div className="sidebar-section-label">Algorithm</div>
                <div className="tool-options">
                    {ALGORITHM_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            className={`tool-option ${algorithm === opt.value ? "active" : ""}`}
                            onClick={() => onAlgorithmChange(opt.value)}
                        >
                            <Layers size={14} className="tool-option-icon" />
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tool Selection */}
            <div className="sidebar-section">
                <div className="sidebar-section-label">Drawing Tool</div>
                <div className="tool-options">
                    {TOOL_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.value}
                                className={`tool-option ${tool === opt.value ? "active" : ""}`}
                                onClick={() => onToolChange(opt.value)}
                            >
                                <Icon size={14} className="tool-option-icon" />
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                        className="btn btn-outline-secondary btn-sm flex-grow-1"
                        onClick={onEraseWalls}
                        title="Clear all walls"
                    >
                        <Eraser size={13} style={{ marginRight: "5px" }} />
                        Clear Walls
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm flex-grow-1"
                        onClick={onClearPath}
                        title="Clear visited cells"
                    >
                        <RouteOff size={13} style={{ marginRight: "5px" }} />
                        Clear Path
                    </button>
                </div>
            </div>

            {/* Speed */}
            <div className="sidebar-section">
                <div className="sidebar-section-label">Visualization Speed</div>
                <div className="speed-control">
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="1"
                        value={speedIndex === -1 ? 1 : speedIndex}
                        onChange={onSpeedSlider}
                    />
                    <div className="speed-labels">
                        <span>Slow</span>
                        <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>
                            {speedLabels[speed] || "Normal"}
                        </span>
                        <span>Fast</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="sidebar-section">
                <div className="sidebar-section-label">Actions</div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        className="btn btn-primary btn-sm flex-grow-1"
                        onClick={() => onRun(gridRef?.current, start, end)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                        <Play size={13} />
                        Run
                    </button>
                    <button
                        className="btn btn-danger btn-sm flex-grow-1"
                        onClick={onReset}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                        <RotateCcw size={13} />
                        Reset
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="sidebar-section">
                <div className="sidebar-section-label">Legend</div>
                <div className="legend">
                    {LEGEND_ITEMS.map(item => (
                        <div key={item.label} className="legend-item">
                            <div
                                className="legend-swatch"
                                style={{ backgroundColor: item.color, border: "1px solid rgba(255,255,255,0.08)" }}
                            />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}