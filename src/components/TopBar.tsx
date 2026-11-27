import React from 'react';
import { Download } from 'lucide-react';
import { AppView } from '../types/coloring';

interface TopBarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onSavePicture: () => void;
  isSaving: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onNavigate,
  onSavePicture,
  isSaving,
}) => {
  return (
    <header className="bg-white border-b border-[#E5E0D8] px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8 shrink-0">
      {/* Zone 1: Brand Wordmark */}
      <button
        type="button"
        onClick={() => onNavigate('studio')}
        className="font-display text-2xl font-bold tracking-tight text-[#1F2430] whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] rounded-md px-1"
      >
        Crayon Box
      </button>

      {/* Zone 2: Clean single-line nav links */}
      <nav aria-label="Primary navigation" className="flex items-center gap-5 sm:gap-7">
        <button
          type="button"
          onClick={() => onNavigate('studio')}
          className={`text-sm font-semibold py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] rounded-t ${
            activeView === 'studio'
              ? 'text-[#1F2430] border-[#3B5BDB]'
              : 'text-[#5C6475] border-transparent hover:text-[#1F2430]'
          }`}
        >
          Coloring Studio
        </button>
        <button
          type="button"
          onClick={() => onNavigate('pictures')}
          className={`text-sm font-semibold py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] rounded-t ${
            activeView === 'pictures'
              ? 'text-[#1F2430] border-[#3B5BDB]'
              : 'text-[#5C6475] border-transparent hover:text-[#1F2430]'
          }`}
        >
          All Pictures
        </button>
        <button
          type="button"
          onClick={() => onNavigate('gallery')}
          className={`text-sm font-semibold py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] rounded-t ${
            activeView === 'gallery'
              ? 'text-[#1F2430] border-[#3B5BDB]'
              : 'text-[#5C6475] border-transparent hover:text-[#1F2430]'
          }`}
        >
          My Artwork
        </button>
      </nav>

      {/* Zone 3: Single primary action */}
      <div className="shrink-0">
        <button
          type="button"
          onClick={onSavePicture}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-[#3B5BDB] hover:bg-[#364FC7] active:scale-[0.98] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B5BDB]"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Picture'}</span>
          <span className="sm:hidden">Save</span>
        </button>
      </div>
    </header>
  );
};
