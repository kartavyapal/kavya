import { BrushSize, StampType, SwatchColor } from '../types/coloring';

export const COLOR_PALETTE: SwatchColor[] = [
  { id: 'cherry-red', name: 'Cherry Red', hex: '#EF4444' },
  { id: 'tangerine', name: 'Tangerine', hex: '#F97316' },
  { id: 'sunny-yellow', name: 'Sunny Yellow', hex: '#FACC15', isLight: true },
  { id: 'lime-green', name: 'Lime Green', hex: '#84CC16' },
  { id: 'meadow-green', name: 'Meadow Green', hex: '#22C55E' },
  { id: 'teal-mint', name: 'Ocean Teal', hex: '#14B8A6' },
  { id: 'sky-blue', name: 'Sky Blue', hex: '#38BDF8' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#3B82F6' },
  { id: 'indigo', name: 'Blueberry', hex: '#6366F1' },
  { id: 'grape-purple', name: 'Grape Purple', hex: '#A855F7' },
  { id: 'bubblegum', name: 'Bubblegum Pink', hex: '#EC4899' },
  { id: 'coral-peach', name: 'Soft Peach', hex: '#FDBA74', isLight: true },
  { id: 'lavender', name: 'Soft Lavender', hex: '#C4B5FD', isLight: true },
  { id: 'mint-cream', name: 'Mint Ice', hex: '#86EFAC', isLight: true },
  { id: 'caramel', name: 'Warm Caramel', hex: '#D97706' },
  { id: 'cocoa', name: 'Cocoa Brown', hex: '#78350F' },
  { id: 'charcoal', name: 'Charcoal', hex: '#334155' },
  { id: 'cloud-white', name: 'Paper White', hex: '#FFFFFF', isLight: true },
];

export const BRUSH_SIZE_MAP: Record<BrushSize, { label: string; px: number }> = {
  sm: { label: 'Fine', px: 8 },
  md: { label: 'Medium', px: 18 },
  lg: { label: 'Jumbo', px: 32 },
};

export const STAMPS: { id: StampType; label: string }[] = [
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'flower', label: 'Flower' },
  { id: 'crown', label: 'Crown' },
  { id: 'sparkle', label: 'Sparkle' },
];
