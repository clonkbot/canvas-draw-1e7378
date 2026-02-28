import { useRef, useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eraser,
  Trash2,
  Download,
  Share2,
  Palette,
  Minus,
  Plus,
  Save,
  Check,
  Undo,
} from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  size: number;
}

const COLORS = [
  "#fbbf24", // amber-400
  "#f87171", // red-400
  "#fb923c", // orange-400
  "#a3e635", // lime-400
  "#34d399", // emerald-400
  "#22d3ee", // cyan-400
  "#60a5fa", // blue-400
  "#a78bfa", // violet-400
  "#f472b6", // pink-400
  "#ffffff", // white
  "#a8a29e", // stone-400
  "#292524", // stone-800
];

const BRUSH_SIZES = [4, 8, 16, 24, 32];

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(8);
  const [backgroundColor] = useState("#0c0a09");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentDrawingId, setCurrentDrawingId] = useState<Id<"drawings"> | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const createDrawing = useMutation(api.drawings.create);
  const updateDrawing = useMutation(api.drawings.update);
  const shareToGallery = useMutation(api.gallery.share);
  const drawings = useQuery(api.drawings.list);

  // Draw all strokes on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const allStrokes = [...strokes, { points: currentStroke, color, size: brushSize }];

    allStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        const prev = stroke.points[i - 1];
        const curr = stroke.points[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      }

      ctx.stroke();
    });
  }, [strokes, currentStroke, color, brushSize, backgroundColor]);

  // Resize canvas to fit container
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      drawCanvas();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getEventPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    setIsSaved(false);
    const pos = getEventPos(e);
    setCurrentStroke([pos]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getEventPos(e);
    setCurrentStroke((prev) => [...prev, pos]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 1) {
      setStrokes((prev) => [...prev, { points: currentStroke, color, size: brushSize }]);
    }
    setCurrentStroke([]);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setCurrentDrawingId(null);
    setIsSaved(false);
  };

  const undo = () => {
    setStrokes((prev) => prev.slice(0, -1));
    setIsSaved(false);
  };

  const saveDrawing = async () => {
    if (strokes.length === 0) return;

    try {
      if (currentDrawingId) {
        await updateDrawing({
          id: currentDrawingId,
          strokes,
          backgroundColor,
        });
      } else {
        const id = await createDrawing({
          title: `Drawing ${new Date().toLocaleDateString()}`,
          strokes,
          backgroundColor,
        });
        setCurrentDrawingId(id);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const shareDrawing = async () => {
    if (strokes.length === 0) return;
    setIsSharing(true);

    try {
      let drawingId = currentDrawingId;

      if (!drawingId) {
        drawingId = await createDrawing({
          title: `Drawing ${new Date().toLocaleDateString()}`,
          strokes,
          backgroundColor,
        });
        setCurrentDrawingId(drawingId);
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const thumbnail = canvas.toDataURL("image/png", 0.5);

      await shareToGallery({
        drawingId,
        thumbnail,
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Failed to share:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `canvas-draw-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const loadDrawing = (drawing: NonNullable<typeof drawings>[0]) => {
    setStrokes(drawing.strokes);
    setCurrentDrawingId(drawing._id);
    setIsSaved(true);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Tools Panel - Horizontal on mobile, vertical on desktop */}
      <div className="flex lg:flex-col gap-2 p-3 lg:p-4 bg-stone-900/50 border-b lg:border-b-0 lg:border-r border-stone-800 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto">
        {/* Color picker */}
        <div className="relative shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl border-2 border-stone-700 shadow-lg flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Palette className="w-5 h-5 text-stone-900 mix-blend-difference" />
          </motion.button>

          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute left-0 lg:left-full top-full lg:top-0 mt-2 lg:mt-0 lg:ml-2 bg-stone-900 border border-stone-700 rounded-xl p-3 grid grid-cols-4 gap-2 z-50 shadow-xl"
              >
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setShowColorPicker(false);
                    }}
                    className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                      color === c ? "ring-2 ring-white ring-offset-2 ring-offset-stone-900" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Brush size */}
        <div className="flex lg:flex-col items-center gap-1 shrink-0">
          <button
            onClick={() => setBrushSize(Math.max(2, brushSize - 4))}
            className="p-2 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex lg:flex-col gap-1">
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  brushSize === size
                    ? "bg-amber-400 text-stone-900"
                    : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                }`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: Math.min(size, 20), height: Math.min(size, 20) }}
                />
              </button>
            ))}
          </div>
          <button
            onClick={() => setBrushSize(Math.min(64, brushSize + 4))}
            className="p-2 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px lg:w-full h-full lg:h-px bg-stone-700 shrink-0" />

        {/* Actions */}
        <div className="flex lg:flex-col gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={undo}
            disabled={strokes.length === 0}
            className="p-2.5 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-50 transition-all"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setColor(backgroundColor)}
            className="p-2.5 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-200 transition-all"
            title="Eraser"
          >
            <Eraser className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearCanvas}
            className="p-2.5 rounded-xl bg-stone-800 text-stone-400 hover:text-rose-400 transition-all"
            title="Clear canvas"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="w-px lg:w-full h-full lg:h-px bg-stone-700 shrink-0" />

        {/* Save/Export */}
        <div className="flex lg:flex-col gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveDrawing}
            disabled={strokes.length === 0}
            className={`p-2.5 rounded-xl transition-all ${
              isSaved
                ? "bg-emerald-500 text-white"
                : "bg-stone-800 text-stone-400 hover:text-amber-400"
            } disabled:opacity-50`}
            title="Save"
          >
            {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareDrawing}
            disabled={strokes.length === 0 || isSharing}
            className="p-2.5 rounded-xl bg-stone-800 text-stone-400 hover:text-amber-400 disabled:opacity-50 transition-all"
            title="Share to gallery"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadCanvas}
            className="p-2.5 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-200 transition-all"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div
          ref={containerRef}
          className="flex-1 relative bg-stone-950 overflow-hidden cursor-crosshair touch-none"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute inset-0"
          />
        </div>

        {/* Saved Drawings - Hidden on very small screens */}
        {drawings && drawings.length > 0 && (
          <div className="hidden md:block w-full lg:w-48 border-t lg:border-t-0 lg:border-l border-stone-800 bg-stone-900/50 p-3 overflow-y-auto">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Your Drawings
            </h3>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              {drawings.slice(0, 6).map((drawing: typeof drawings[number]) => (
                <motion.button
                  key={drawing._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => loadDrawing(drawing)}
                  className={`p-2 rounded-lg border transition-all ${
                    currentDrawingId === drawing._id
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-stone-700 hover:border-stone-600 bg-stone-800"
                  }`}
                >
                  <p className="text-xs text-stone-300 truncate">{drawing.title}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    {drawing.strokes.length} strokes
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
