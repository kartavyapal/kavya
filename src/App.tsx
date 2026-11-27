import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ColoringCanvas } from './components/ColoringCanvas';
import { ConfirmModal } from './components/ConfirmModal';
import { PaletteBar } from './components/PaletteBar';
import { PictureGallery } from './components/PictureGallery';
import { SvgArtwork } from './components/SvgArtwork';
import { ToolDock } from './components/ToolDock';
import { TopBar } from './components/TopBar';
import { COLORING_PAGES } from './data/coloringPages';
import { COLOR_PALETTE } from './data/palette';
import {
  AppView,
  BrushSize,
  PageDrawingState,
  StampType,
  StickerData,
  StrokeData,
  ToolType,
} from './types/coloring';
import { exportSvgToPng } from './utils/exportImage';
import { soundEngine } from './utils/sound';

const STORAGE_KEY = 'crayon_box_drawings_v1';

const EMPTY_DRAWING: PageDrawingState = {
  fills: {},
  strokes: [],
  stickers: [],
  updatedAt: 0,
};

function loadSavedDrawings(): Record<string, PageDrawingState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('studio');
  const [currentPageId, setCurrentPageId] = useState<string>(COLORING_PAGES[0].id);
  const [drawingsByPage, setDrawingsByPage] = useState<Record<string, PageDrawingState>>(
    loadSavedDrawings
  );

  const [historyByPage, setHistoryByPage] = useState<
    Record<string, { past: PageDrawingState[]; future: PageDrawingState[] }>
  >({});

  const [activeTool, setActiveTool] = useState<ToolType>('bucket');
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_PALETTE[0].hex);
  const [brushSize, setBrushSize] = useState<BrushSize>('md');
  const [activeStamp, setActiveStamp] = useState<StampType>('star');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [celebratingPageId, setCelebratingPageId] = useState<string | null>(null);

  const studioSvgRef = useRef<SVGSVGElement | null>(null);
  const offscreenSvgRef = useRef<SVGSVGElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const currentPage =
    COLORING_PAGES.find((p) => p.id === currentPageId) ?? COLORING_PAGES[0];
  const currentDrawing = drawingsByPage[currentPage.id] ?? EMPTY_DRAWING;
  const currentHistory = historyByPage[currentPage.id] ?? { past: [], future: [] };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drawingsByPage));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [drawingsByPage]);

  useEffect(() => {
    soundEngine.enabled = soundEnabled;
  }, [soundEnabled]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const commitDrawingChange = useCallback(
    (pageId: string, updater: (prev: PageDrawingState) => PageDrawingState) => {
      setDrawingsByPage((prevMap) => {
        const prev = prevMap[pageId] ?? EMPTY_DRAWING;
        const next = updater(prev);
        if (next === prev) return prevMap;

        setHistoryByPage((histMap) => {
          const h = histMap[pageId] ?? { past: [], future: [] };
          return {
            ...histMap,
            [pageId]: {
              past: [...h.past.slice(-29), prev],
              future: [],
            },
          };
        });

        return {
          ...prevMap,
          [pageId]: { ...next, updatedAt: Date.now() },
        };
      });
    },
    []
  );

  const handleFillRegion = useCallback(
    (regionId: string) => {
      const existing = currentDrawing.fills[regionId];
      if (existing === selectedColor) return;

      const prevCount = Object.keys(currentDrawing.fills).length;
      const nextCount = existing ? prevCount : prevCount + 1;

      commitDrawingChange(currentPage.id, (prev) => ({
        ...prev,
        fills: {
          ...prev.fills,
          [regionId]: selectedColor,
        },
      }));

      if (nextCount === currentPage.regions.length && prevCount < currentPage.regions.length) {
        soundEngine.playCelebrate();
        setCelebratingPageId(currentPage.id);
        window.setTimeout(() => {
          setCelebratingPageId((id) => (id === currentPage.id ? null : id));
        }, 4200);
      } else {
        soundEngine.playPop(nextCount % 5);
      }
    },
    [commitDrawingChange, currentDrawing.fills, currentPage.id, currentPage.regions.length, selectedColor]
  );

  const handleAddStroke = useCallback(
    (stroke: StrokeData) => {
      commitDrawingChange(currentPage.id, (prev) => ({
        ...prev,
        strokes: [...prev.strokes, stroke],
      }));
      soundEngine.playPop(2);
    },
    [commitDrawingChange, currentPage.id]
  );

  const handleAddSticker = useCallback(
    (sticker: StickerData) => {
      commitDrawingChange(currentPage.id, (prev) => ({
        ...prev,
        stickers: [...prev.stickers, sticker],
      }));
      soundEngine.playStamp();
    },
    [commitDrawingChange, currentPage.id]
  );

  const handleEraseAtPoint = useCallback(
    (x: number, y: number, radius: number, regionId?: string) => {
      if (regionId) {
        if (!currentDrawing.fills[regionId]) return;
        commitDrawingChange(currentPage.id, (prev) => {
          const updatedFills = { ...prev.fills };
          delete updatedFills[regionId];
          return { ...prev, fills: updatedFills };
        });
        soundEngine.playUndo();
        return;
      }

      const hitStroke = currentDrawing.strokes.some((s) =>
        s.points.some((p) => Math.hypot(p.x - x, p.y - y) <= radius + s.size / 2)
      );
      const hitSticker = currentDrawing.stickers.some(
        (st) => Math.hypot(st.x - x, st.y - y) <= radius + 24 * st.size
      );

      if (!hitStroke && !hitSticker) return;

      commitDrawingChange(currentPage.id, (prev) => ({
        ...prev,
        strokes: prev.strokes.filter(
          (s) => !s.points.some((p) => Math.hypot(p.x - x, p.y - y) <= radius + s.size / 2)
        ),
        stickers: prev.stickers.filter(
          (st) => Math.hypot(st.x - x, st.y - y) > radius + 24 * st.size
        ),
      }));
    },
    [commitDrawingChange, currentDrawing.fills, currentDrawing.stickers, currentDrawing.strokes, currentPage.id]
  );

  const handleUndo = useCallback(() => {
    const h = historyByPage[currentPage.id];
    if (!h || h.past.length === 0) return;

    const previousState = h.past[h.past.length - 1];
    const remainingPast = h.past.slice(0, -1);

    setDrawingsByPage((prev) => ({
      ...prev,
      [currentPage.id]: previousState,
    }));

    setHistoryByPage((prev) => ({
      ...prev,
      [currentPage.id]: {
        past: remainingPast,
        future: [currentDrawing, ...h.future],
      },
    }));

    soundEngine.playUndo();
  }, [currentDrawing, currentPage.id, historyByPage]);

  const handleRedo = useCallback(() => {
    const h = historyByPage[currentPage.id];
    if (!h || h.future.length === 0) return;

    const nextState = h.future[0];
    const remainingFuture = h.future.slice(1);

    setDrawingsByPage((prev) => ({
      ...prev,
      [currentPage.id]: nextState,
    }));

    setHistoryByPage((prev) => ({
      ...prev,
      [currentPage.id]: {
        past: [...h.past, currentDrawing],
        future: remainingFuture,
      },
    }));

    soundEngine.playPop(3);
  }, [currentDrawing, currentPage.id, historyByPage]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRedo, handleUndo]);

  const handleConfirmClear = () => {
    commitDrawingChange(currentPage.id, () => ({
      fills: {},
      strokes: [],
      stickers: [],
      updatedAt: Date.now(),
    }));
    setCelebratingPageId(null);
    setIsClearModalOpen(false);
    soundEngine.playUndo();
    showToast('Fresh page ready to color!');
  };

  const handleSavePicture = async () => {
    const targetSvg =
      activeView === 'studio' ? studioSvgRef.current : offscreenSvgRef.current;
    if (!targetSvg) return;

    setIsSaving(true);
    try {
      const slug = currentPage.title.toLowerCase().replace(/\s+/g, '-');
      await exportSvgToPng(targetSvg, `crayon-box-${slug}`);
      soundEngine.playCelebrate();
      showToast(`Saved "${currentPage.title}" as a PNG picture!`);
    } catch {
      showToast('Could not save the picture. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPage = (pageId: string) => {
    setCurrentPageId(pageId);
    setActiveView('studio');
    setCelebratingPageId(null);
    soundEngine.playPop(1);
  };

  return (
    <div className="min-h-screen flex flex-col studio-desk-bg text-[#1F2430]">
      <TopBar
        activeView={activeView}
        onNavigate={setActiveView}
        onSavePicture={handleSavePicture}
        isSaving={isSaving}
      />

      {activeView === 'studio' ? (
        <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col lg:grid lg:grid-cols-[210px_minmax(0,1fr)_210px] gap-5 items-start">
          {/* Left Column: Tool Dock */}
          <div className="w-full lg:sticky lg:top-5 order-2 lg:order-1">
            <ToolDock
              activeTool={activeTool}
              onSelectTool={(t) => {
                setActiveTool(t);
                soundEngine.playPop(0);
              }}
              brushSize={brushSize}
              onSelectBrushSize={setBrushSize}
              activeStamp={activeStamp}
              onSelectStamp={setActiveStamp}
              selectedColor={selectedColor}
              canUndo={currentHistory.past.length > 0}
              canRedo={currentHistory.future.length > 0}
              onUndo={handleUndo}
              onRedo={handleRedo}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((s) => !s)}
              onRequestClear={() => setIsClearModalOpen(true)}
            />
          </div>

          {/* Center Column: Dominant Coloring Sheet + Crayon Palette */}
          <div className="w-full flex flex-col gap-4 order-1 lg:order-2">
            <ColoringCanvas
              page={currentPage}
              drawing={currentDrawing}
              activeTool={activeTool}
              selectedColor={selectedColor}
              brushSize={brushSize}
              activeStamp={activeStamp}
              svgRef={studioSvgRef}
              onFillRegion={handleFillRegion}
              onAddStroke={handleAddStroke}
              onAddSticker={handleAddSticker}
              onEraseAtPoint={handleEraseAtPoint}
              showCelebration={celebratingPageId === currentPage.id}
            />

            <PaletteBar
              selectedColor={selectedColor}
              onSelectColor={(hex) => {
                setSelectedColor(hex);
                if (activeTool === 'eraser') {
                  setActiveTool('bucket');
                }
                soundEngine.playPop(1);
              }}
            />
          </div>

          {/* Right Column: Quick Picture Switcher */}
          <aside
            aria-label="Choose another picture"
            className="w-full bg-white border border-[#E5E0D8] rounded-2xl p-3 sm:p-4 shadow-sm order-3 lg:sticky lg:top-5"
          >
            <div className="flex items-center justify-between gap-2 mb-3 px-1">
              <span className="text-xs font-semibold text-[#5C6475]">Pictures</span>
              <button
                type="button"
                onClick={() => setActiveView('pictures')}
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#3B5BDB] hover:underline cursor-pointer whitespace-nowrap"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-2 gap-2">
              {COLORING_PAGES.map((p) => {
                const isSelected = p.id === currentPage.id;
                const pageDrawing = drawingsByPage[p.id] ?? EMPTY_DRAWING;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPage(p.id)}
                    title={p.title}
                    className={`group rounded-xl p-1 border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] ${
                      isSelected
                        ? 'border-[#3B5BDB] bg-[#EDF2FF] shadow-sm'
                        : 'border-[#E5E0D8] bg-white hover:border-[#C7BFB1]'
                    }`}
                  >
                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-white">
                      <SvgArtwork
                        page={p}
                        drawing={pageDrawing}
                        className="w-full h-full block"
                      />
                    </div>
                    <span className="hidden lg:block text-[11px] font-semibold text-[#1F2430] truncate mt-1 px-0.5 text-center">
                      {p.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        </main>
      ) : (
        <main className="flex-1">
          <PictureGallery
            pages={COLORING_PAGES}
            drawingsByPage={drawingsByPage}
            currentPageId={currentPage.id}
            onlyStarted={activeView === 'gallery'}
            onSelectPage={handleSelectPage}
          />
        </main>
      )}

      {/* Offscreen SVG so Save Picture always works from any view */}
      {activeView !== 'studio' && (
        <div className="sr-only" aria-hidden="true">
          <SvgArtwork page={currentPage} drawing={currentDrawing} svgRef={offscreenSvgRef} />
        </div>
      )}

      {/* Gentle toast notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-40 bg-[#1F2430] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg"
        >
          {toastMessage}
        </div>
      )}

      <ConfirmModal
        open={isClearModalOpen}
        title="Start this picture fresh?"
        message={`This will erase your colors and stickers on "${currentPage.title}" so you can color it again from scratch.`}
        confirmLabel="Start Over"
        onConfirm={handleConfirmClear}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
}
