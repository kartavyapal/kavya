import React, { useRef, useState } from 'react';
import { BRUSH_SIZE_MAP } from '../data/palette';
import {
  BrushSize,
  ColoringPage,
  PageDrawingState,
  StampType,
  StickerData,
  StrokeData,
  StrokePoint,
  ToolType,
} from '../types/coloring';
import { SvgArtwork } from './SvgArtwork';

interface ColoringCanvasProps {
  page: ColoringPage;
  drawing: PageDrawingState;
  activeTool: ToolType;
  selectedColor: string;
  brushSize: BrushSize;
  activeStamp: StampType;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onFillRegion: (regionId: string) => void;
  onAddStroke: (stroke: StrokeData) => void;
  onAddSticker: (sticker: StickerData) => void;
  onEraseAtPoint: (x: number, y: number, radius: number, regionId?: string) => void;
  showCelebration: boolean;
}

const CONFETTI_PIECES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 3.7 + 4) % 94}%`,
  delay: `${(i % 7) * 0.08}s`,
  color: ['#EF4444', '#FACC15', '#22C55E', '#38BDF8', '#A855F7', '#EC4899'][i % 6],
  rotate: `${(i * 47) % 360}deg`,
}));

export const ColoringCanvas: React.FC<ColoringCanvasProps> = ({
  page,
  drawing,
  activeTool,
  selectedColor,
  brushSize,
  activeStamp,
  svgRef,
  onFillRegion,
  onAddStroke,
  onAddSticker,
  onEraseAtPoint,
  showCelebration,
}) => {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [activeStroke, setActiveStroke] = useState<StrokeData | null>(null);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef<StrokePoint[]>([]);
  const activeStrokeRef = useRef<StrokeData | null>(null);

  const isBucket = activeTool === 'bucket';
  const isEraser = activeTool === 'eraser';
  const isDrawTool =
    activeTool === 'crayon' || activeTool === 'marker' || activeTool === 'rainbow';

  const getSvgCoords = (e: React.PointerEvent<SVGSVGElement>): StrokePoint => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 600;
    return {
      x: Math.max(0, Math.min(800, x)),
      y: Math.max(0, Math.min(600, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const pt = getSvgCoords(e);

    if (activeTool === 'stamp') {
      const sizeScale = brushSize === 'sm' ? 0.75 : brushSize === 'md' ? 1.05 : 1.4;
      const rotation = Math.round((Math.random() - 0.5) * 24);
      onAddSticker({
        id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        stamp: activeStamp,
        x: Math.round(pt.x),
        y: Math.round(pt.y),
        color: selectedColor,
        size: sizeScale,
        rotation,
      });
      return;
    }

    if (isEraser) {
      isDrawingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      onEraseAtPoint(pt.x, pt.y, BRUSH_SIZE_MAP[brushSize].px * 1.1);
      return;
    }

    if (isDrawTool) {
      isDrawingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      pointsRef.current = [pt];
      const newStroke: StrokeData = {
        id: `str-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        tool: activeTool,
        color: selectedColor,
        size: BRUSH_SIZE_MAP[brushSize].px,
        points: [pt],
      };
      activeStrokeRef.current = newStroke;
      setActiveStroke(newStroke);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingRef.current) return;
    const pt = getSvgCoords(e);

    if (isEraser) {
      onEraseAtPoint(pt.x, pt.y, BRUSH_SIZE_MAP[brushSize].px * 1.1);
      return;
    }

    if (isDrawTool && activeStrokeRef.current) {
      const prev = pointsRef.current[pointsRef.current.length - 1];
      if (prev && Math.hypot(pt.x - prev.x, pt.y - prev.y) < 3) return;
      pointsRef.current = [...pointsRef.current, pt];
      const updated: StrokeData = {
        ...activeStrokeRef.current,
        points: pointsRef.current,
      };
      activeStrokeRef.current = updated;
      setActiveStroke(updated);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const finished = activeStrokeRef.current;
    if (finished && finished.points.length > 0) {
      onAddStroke(finished);
    }
    activeStrokeRef.current = null;
    setActiveStroke(null);
    pointsRef.current = [];
  };

  const handleRegionClick = (regionId: string) => {
    if (isBucket) {
      onFillRegion(regionId);
    } else if (isEraser) {
      onEraseAtPoint(-999, -999, 0, regionId);
    }
  };

  const filledCount = Object.keys(drawing.fills).length;
  const totalRegions = page.regions.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Subtle canvas header bar */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[#1F2430] truncate">
            {page.title}
          </h1>
          <span className="text-xs font-medium text-[#5C6475] hidden sm:inline whitespace-nowrap">
            {hoveredLabel && (isBucket || isEraser)
              ? hoveredLabel
              : `${page.category} · ${page.difficulty}`}
          </span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-24 sm:w-32 h-2.5 bg-[#E5E0D8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22C55E] transition-all duration-300 rounded-full"
              style={{ width: `${Math.round((filledCount / totalRegions) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-[#5C6475] tabular-nums whitespace-nowrap">
            {filledCount} / {totalRegions} colored
          </span>
        </div>
      </div>

      {/* Main White Paper Canvas Frame */}
      <div className="relative bg-white rounded-2xl border border-[#E5E0D8] shadow-[0_10px_30px_rgba(31,36,48,0.08)] p-2 sm:p-3 overflow-hidden">
        <div
          className={`w-full aspect-[4/3] rounded-xl overflow-hidden ${
            activeTool === 'crayon' || activeTool === 'marker' || activeTool === 'rainbow'
              ? 'cursor-crosshair'
              : activeTool === 'stamp'
              ? 'cursor-copy'
              : activeTool === 'eraser'
              ? 'cursor-cell'
              : 'cursor-pointer'
          }`}
        >
          <SvgArtwork
            page={page}
            drawing={drawing}
            activeStroke={activeStroke}
            svgRef={svgRef}
            interactive
            isBucketMode={isBucket}
            isEraserMode={isEraser}
            hoveredRegionId={hoveredRegionId}
            onRegionClick={handleRegionClick}
            onRegionHover={(id) => {
              setHoveredRegionId(id);
              const region = page.regions.find((r) => r.id === id);
              setHoveredLabel(region ? region.label : null);
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-full block"
          />
        </div>

        {/* Celebratory confetti overlay when picture is 100% colored */}
        {showCelebration && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden flex items-start justify-center"
            aria-live="polite"
          >
            {CONFETTI_PIECES.map((piece) => (
              <span
                key={piece.id}
                className="absolute top-0 w-3 h-3 rounded-sm animate-bounce opacity-90"
                style={{
                  left: piece.left,
                  backgroundColor: piece.color,
                  animationDelay: piece.delay,
                  transform: `rotate(${piece.rotate})`,
                }}
              />
            ))}
            <div className="mt-6 bg-white/95 border border-[#E5E0D8] shadow-lg rounded-2xl px-5 py-3 text-center">
              <p className="font-display text-lg font-bold text-[#1F2430]">
                Picture Complete!
              </p>
              <p className="text-xs font-medium text-[#5C6475]">
                Great job! You can keep adding stickers or save your picture.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
