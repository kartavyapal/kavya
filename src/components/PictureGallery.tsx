import React, { useState } from 'react';
import { ColoringPage, PageDrawingState } from '../types/coloring';
import { SvgArtwork } from './SvgArtwork';

interface PictureGalleryProps {
  pages: ColoringPage[];
  drawingsByPage: Record<string, PageDrawingState>;
  currentPageId: string;
  onlyStarted?: boolean;
  onSelectPage: (pageId: string) => void;
}

const CATEGORIES = ['All', 'Animals', 'Space', 'Nature', 'Fantasy', 'Vehicles', 'Treats'] as const;

export const PictureGallery: React.FC<PictureGalleryProps> = ({
  pages,
  drawingsByPage,
  currentPageId,
  onlyStarted = false,
  onSelectPage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('All');

  const emptyDrawing: PageDrawingState = {
    fills: {},
    strokes: [],
    stickers: [],
    updatedAt: 0,
  };

  const filteredPages = pages.filter((page) => {
    if (onlyStarted) {
      const drawing = drawingsByPage[page.id];
      const hasWork =
        drawing &&
        (Object.keys(drawing.fills).length > 0 ||
          drawing.strokes.length > 0 ||
          drawing.stickers.length > 0);
      if (!hasWork) return false;
    }
    if (selectedCategory !== 'All' && page.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <section className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F2430]">
            {onlyStarted ? 'My Colored Artwork' : 'Choose a Coloring Picture'}
          </h1>
          <p className="text-sm text-[#5C6475] mt-1">
            {onlyStarted
              ? 'All the drawings you have started or finished are saved right here.'
              : 'Pick any picture to start coloring. Your progress saves automatically.'}
          </p>
        </div>

        {/* Category Filter Tabs */}
        {!onlyStarted && (
          <div
            className="flex items-center gap-1 p-1 bg-white border border-[#E5E0D8] rounded-xl overflow-x-auto"
            role="tablist"
            aria-label="Picture categories"
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#3B5BDB] text-white'
                      : 'text-[#5C6475] hover:text-[#1F2430] hover:bg-[#F7F5F0]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filteredPages.length === 0 ? (
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-10 text-center max-w-md mx-auto mt-8">
          <h2 className="font-display text-xl font-bold text-[#1F2430] mb-2">
            No artwork saved yet
          </h2>
          <p className="text-sm text-[#5C6475] mb-5">
            Color any picture in the studio and it will appear here automatically.
          </p>
          <button
            type="button"
            onClick={() => onSelectPage(pages[0].id)}
            className="bg-[#3B5BDB] hover:bg-[#364FC7] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Start Coloring
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredPages.map((page) => {
            const drawing = drawingsByPage[page.id] || emptyDrawing;
            const coloredCount = Object.keys(drawing.fills).length;
            const totalRegions = page.regions.length;
            const isCurrent = page.id === currentPageId;

            return (
              <button
                key={page.id}
                type="button"
                onClick={() => onSelectPage(page.id)}
                className={`group text-left bg-white rounded-2xl border transition-all p-3 flex flex-col gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] ${
                  isCurrent
                    ? 'border-[#3B5BDB] shadow-md'
                    : 'border-[#E5E0D8] hover:border-[#C7BFB1] hover:shadow-md'
                }`}
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-[#E5E0D8] bg-white">
                  <SvgArtwork page={page} drawing={drawing} className="w-full h-full block" />
                </div>

                <div className="px-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-base font-bold text-[#1F2430] truncate group-hover:text-[#3B5BDB] transition-colors">
                      {page.title}
                    </h2>
                    {isCurrent && (
                      <span className="text-xs font-semibold text-[#3B5BDB] shrink-0">
                        Open
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5C6475] mt-0.5 tabular-nums">
                    {page.category} · {coloredCount} of {totalRegions} colored
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
