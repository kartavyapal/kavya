import React from 'react';
import { Check } from 'lucide-react';
import { COLOR_PALETTE } from '../data/palette';

interface PaletteBarProps {
  selectedColor: string;
  onSelectColor: (hex: string) => void;
  disabled?: boolean;
}

export const PaletteBar: React.FC<PaletteBarProps> = ({
  selectedColor,
  onSelectColor,
  disabled = false,
}) => {
  const activeSwatch = COLOR_PALETTE.find(
    (c) => c.hex.toLowerCase() === selectedColor.toLowerCase()
  );

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="w-4 h-4 rounded-full border border-black/15 shrink-0"
            style={{ backgroundColor: selectedColor }}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-[#1F2430]">
            {activeSwatch ? activeSwatch.name : 'Custom Color'}
          </span>
        </div>
        <span className="text-xs font-medium text-[#5C6475]">
          Pick a color to paint
        </span>
      </div>

      <div
        className="grid grid-cols-9 sm:grid-cols-18 gap-2"
        role="radiogroup"
        aria-label="Color palette"
      >
        {COLOR_PALETTE.map((swatch) => {
          const isSelected = swatch.hex.toLowerCase() === selectedColor.toLowerCase();
          return (
            <button
              key={swatch.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={swatch.name}
              title={swatch.name}
              disabled={disabled}
              onClick={() => onSelectColor(swatch.hex)}
              className={`relative h-10 sm:h-11 w-full rounded-xl transition-transform duration-150 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B5BDB] ${
                isSelected
                  ? '-translate-y-1.5 scale-105 ring-2 ring-[#1F2430] ring-offset-2 shadow-md'
                  : 'hover:-translate-y-0.5 hover:scale-[1.03] border border-black/10'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: swatch.hex }}
            >
              {isSelected && (
                <Check
                  className={`w-4 h-4 stroke-[3] ${
                    swatch.isLight ? 'text-[#1F2430]' : 'text-white'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
