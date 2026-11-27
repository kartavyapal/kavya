export type ToolType = 'bucket' | 'crayon' | 'marker' | 'rainbow' | 'stamp' | 'eraser';

export type BrushSize = 'sm' | 'md' | 'lg';

export type StampType = 'star' | 'heart' | 'flower' | 'crown' | 'sparkle';

export type AppView = 'studio' | 'pictures' | 'gallery';

export interface SwatchColor {
  id: string;
  name: string;
  hex: string;
  isLight?: boolean;
}

export interface ColoringRegion {
  id: string;
  label: string;
  type: 'path' | 'circle' | 'ellipse' | 'rect' | 'polygon';
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  rx?: number;
  ry?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  cornerRadius?: number;
  points?: string;
  strokeWidth?: number;
}

export interface ColoringAccent {
  type: 'path' | 'circle' | 'ellipse';
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  rx?: number;
  ry?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface ColoringPage {
  id: string;
  title: string;
  category: 'Animals' | 'Space' | 'Nature' | 'Fantasy' | 'Vehicles' | 'Treats';
  difficulty: 'Easy' | 'Medium' | 'Detailed';
  regions: ColoringRegion[];
  accents: ColoringAccent[];
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface StrokeData {
  id: string;
  tool: 'crayon' | 'marker' | 'rainbow';
  color: string;
  size: number;
  points: StrokePoint[];
}

export interface StickerData {
  id: string;
  stamp: StampType;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

export interface PageDrawingState {
  fills: Record<string, string>;
  strokes: StrokeData[];
  stickers: StickerData[];
  updatedAt: number;
}
