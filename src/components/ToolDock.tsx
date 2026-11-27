import React from 'react';
import {
  PaintBucket,
  Pencil,
  Brush,
  Sparkles,
  Sticker,
  Eraser,
  Undo2,
  Redo2,
  Volume2,
  VolumeX,
  Trash2,
} from 'lucide-react';
import { BRUSH_SIZE_MAP, STAMPS } from '../data/palette';
import { BrushSize, StampType, ToolType } from '../types/coloring';
import { renderStampShape } from './SvgArtwork';

interface ToolDockProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  brushSize: BrushSize;
  onSelectBrushSize: (size: BrushSize) => void;
  activeStamp: StampType;
  onSelectStamp: (stamp: StampType) => void;
  selectedColor: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRequestClear: () => void;
}

const TOOLS: { id: ToolType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'bucket', label: 'Fill', icon: PaintBucket },
  { id: 'crayon', label: 'Crayon', icon: Pencil },
  { id: 'marker', label: 'Marker', icon: Brush },
  { id: 'rainbow', label: 'Rainbow', icon: Sparkles },
  { id: 'stamp', label: 'Stamps', icon: Sticker },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
];

export const ToolDock: React.FC<ToolDockProps> = ({
  activeTool,
  onSelectTool,
  brushSize,
  onSelectBrushSize,
  activeStamp,
  onSelectStamp,
  selectedColor,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  soundEnabled,
  onToggleSound,
  onRequestClear,
}) => {
  const showSizePicker =
    activeTool === 'crayon' ||
    activeTool === 'marker' ||
    activeTool === 'rainbow' ||
    activeTool === 'eraser';
  const showStampPicker = activeTool === 'stamp';

  return (
    <aside
      aria-label="Coloring tools"
      className="bg-white border border-[#E5E0D8] rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-4"
    >
      {/* Primary tools grid */}
      <div>
        <div className="text-xs font-semibold text-[#5C6475] mb-2 px-1">Tools</div>
        <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool(tool.id)}
                aria-pressed={isActive}
                className={`min-h-[52px] flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] ${
                  isActive
                    ? 'bg-[#3B5BDB] text-white shadow-sm'
                    : 'bg-[#F7F5F0] text-[#1F2430] hover:bg-[#ECE7DD]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Brush Size or Stamp Selector */}
      {showSizePicker && (
        <div className="border-t border-[#E5E0D8] pt-3">
          <div className="text-xs font-semibold text-[#5C6475] mb-2 px-1">Brush Size</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['sm', 'md', 'lg'] as BrushSize[]).map((size) => {
              const isSelected = brushSize === size;
              const dotSize = size === 'sm' ? 8 : size === 'md' ? 14 : 20;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSelectBrushSize(size)}
                  aria-pressed={isSelected}
                  title={BRUSH_SIZE_MAP[size].label}
                  className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] ${
                    isSelected
                      ? 'border-[#3B5BDB] bg-[#EDF2FF] text-[#3B5BDB]'
                      : 'border-[#E5E0D8] bg-white text-[#5C6475] hover:bg-[#F7F5F0]'
                  }`}
                >
                  <span
                    className="rounded-full bg-current block"
                    style={{ width: dotSize, height: dotSize }}
                  />
                  <span className="text-[11px] font-semibold">
                    {BRUSH_SIZE_MAP[size].label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showStampPicker && (
        <div className="border-t border-[#E5E0D8] pt-3">
          <div className="text-xs font-semibold text-[#5C6475] mb-2 px-1">Pick a Stamp</div>
          <div className="grid grid-cols-5 lg:grid-cols-3 gap-1.5">
            {STAMPS.map((st) => {
              const isSelected = activeStamp === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStamp(st.id)}
                  aria-pressed={isSelected}
                  title={st.label}
                  className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl border p-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] ${
                    isSelected
                      ? 'border-[#3B5BDB] bg-[#EDF2FF]'
                      : 'border-[#E5E0D8] bg-white hover:bg-[#F7F5F0]'
                  }`}
                >
                  <svg viewBox="-28 -28 56 56" className="w-6 h-6">
                    <path
                      d={renderStampShape(st.id)}
                      fill={selectedColor}
                      stroke="#231F20"
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[10px] font-semibold text-[#1F2430]">
                    {st.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* History & Canvas Actions */}
      <div className="border-t border-[#E5E0D8] pt-3 mt-auto flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F7F5F0] hover:bg-[#ECE7DD] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-[#1F2430] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Undo2 className="w-4 h-4" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F7F5F0] hover:bg-[#ECE7DD] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-[#1F2430] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Redo2 className="w-4 h-4" />
            <span>Redo</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F7F5F0] hover:bg-[#ECE7DD] text-xs font-semibold text-[#1F2430] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-[#3B5BDB]" />
                <span>Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[#5C6475]" />
                <span>Muted</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onRequestClear}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FFF5F5] hover:bg-[#FFE3E3] text-xs font-semibold text-[#C92A2A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Start Over</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
