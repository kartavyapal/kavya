import React from 'react';
import {
  ColoringAccent,
  ColoringPage,
  ColoringRegion,
  PageDrawingState,
  StampType,
  StickerData,
  StrokeData,
  StrokePoint,
} from '../types/coloring';

interface SvgArtworkProps {
  page: ColoringPage;
  drawing: PageDrawingState;
  activeStroke?: StrokeData | null;
  svgRef?: React.Ref<SVGSVGElement>;
  interactive?: boolean;
  isBucketMode?: boolean;
  isEraserMode?: boolean;
  hoveredRegionId?: string | null;
  onRegionClick?: (regionId: string, label: string) => void;
  onRegionHover?: (regionId: string | null) => void;
  onPointerDown?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp?: (e: React.PointerEvent<SVGSVGElement>) => void;
  className?: string;
}

function buildSmoothPath(points: StrokePoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} L ${(p.x + 0.1).toFixed(1)} ${(p.y + 0.1).toFixed(1)}`;
  }
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

export function renderStampShape(stamp: StampType): string {
  switch (stamp) {
    case 'star':
      return 'M0,-24 L6.8,-7.8 L24,-6.5 L10.8,4.8 L14.8,22 L0,12.5 L-14.8,22 L-10.8,4.8 L-24,-6.5 L-6.8,-7.8 Z';
    case 'heart':
      return 'M0,20 C0,20 -24,3 -24,-10 C-24,-20 -15,-25 -7,-20 C-3,-17 0,-12 0,-12 C0,-12 3,-17 7,-20 C15,-25 24,-20 24,-10 C24,3 0,20 0,20 Z';
    case 'flower':
      return 'M0,-22 C7,-22 10,-12 6,-7 C12,-10 22,-7 22,0 C22,7 12,10 6,7 C10,13 7,22 0,22 C-7,22 -10,13 -6,7 C-12,10 -22,7 -22,0 C-22,-7 -12,-10 -6,-7 C-10,-12 -7,-22 0,-22 Z';
    case 'crown':
      return 'M-22,14 L-24,-12 L-10,0 L0,-16 L10,0 L24,-12 L22,14 Z';
    case 'sparkle':
      return 'M0,-24 Q3,-3 24,0 Q3,3 0,24 Q-3,3 -24,0 Q-3,-3 0,-24 Z';
  }
}

function renderRegionElement(
  region: ColoringRegion,
  fill: string | undefined,
  strokeOnly: boolean,
  interactiveProps?: {
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }
) {
  const commonProps = {
    fill: strokeOnly ? 'none' : fill || '#FFFFFF',
    stroke: strokeOnly ? '#231F20' : 'none',
    strokeWidth: strokeOnly ? region.strokeWidth ?? 4 : 0,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...(strokeOnly ? { style: { pointerEvents: 'none' as const } } : interactiveProps),
  };

  switch (region.type) {
    case 'rect':
      return (
        <rect
          key={`${region.id}-${strokeOnly ? 'outline' : 'fill'}`}
          x={region.x}
          y={region.y}
          width={region.width}
          height={region.height}
          rx={region.cornerRadius}
          ry={region.cornerRadius}
          {...commonProps}
        />
      );
    case 'circle':
      return (
        <circle
          key={`${region.id}-${strokeOnly ? 'outline' : 'fill'}`}
          cx={region.cx}
          cy={region.cy}
          r={region.r}
          {...commonProps}
        />
      );
    case 'ellipse':
      return (
        <ellipse
          key={`${region.id}-${strokeOnly ? 'outline' : 'fill'}`}
          cx={region.cx}
          cy={region.cy}
          rx={region.rx}
          ry={region.ry}
          {...commonProps}
        />
      );
    case 'polygon':
      return (
        <polygon
          key={`${region.id}-${strokeOnly ? 'outline' : 'fill'}`}
          points={region.points}
          {...commonProps}
        />
      );
    case 'path':
    default:
      return (
        <path
          key={`${region.id}-${strokeOnly ? 'outline' : 'fill'}`}
          d={region.d}
          {...commonProps}
        />
      );
  }
}

function renderAccent(accent: ColoringAccent, index: number) {
  const common = {
    fill: accent.fill ?? 'none',
    stroke: accent.stroke ?? 'none',
    strokeWidth: accent.strokeWidth ?? 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { pointerEvents: 'none' as const },
  };
  if (accent.type === 'circle') {
    return <circle key={`acc-${index}`} cx={accent.cx} cy={accent.cy} r={accent.r} {...common} />;
  }
  if (accent.type === 'ellipse') {
    return (
      <ellipse
        key={`acc-${index}`}
        cx={accent.cx}
        cy={accent.cy}
        rx={accent.rx}
        ry={accent.ry}
        {...common}
      />
    );
  }
  return <path key={`acc-${index}`} d={accent.d} {...common} />;
}

function renderStroke(stroke: StrokeData, filterId: string) {
  if (stroke.tool === 'rainbow') {
    if (stroke.points.length < 2) {
      const p = stroke.points[0];
      if (!p) return null;
      return (
        <circle
          key={stroke.id}
          cx={p.x}
          cy={p.y}
          r={stroke.size / 2}
          fill="#EF4444"
          style={{ pointerEvents: 'none' }}
        />
      );
    }
    return (
      <g key={stroke.id} style={{ pointerEvents: 'none' }}>
        {stroke.points.slice(0, -1).map((pt, i) => {
          const next = stroke.points[i + 1];
          const hue = (i * 14) % 360;
          return (
            <line
              key={`${stroke.id}-${i}`}
              x1={pt.x}
              y1={pt.y}
              x2={next.x}
              y2={next.y}
              stroke={`hsl(${hue}, 88%, 55%)`}
              strokeWidth={stroke.size}
              strokeLinecap="round"
            />
          );
        })}
      </g>
    );
  }

  const d = buildSmoothPath(stroke.points);
  return (
    <path
      key={stroke.id}
      d={d}
      fill="none"
      stroke={stroke.color}
      strokeWidth={stroke.size}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={stroke.tool === 'crayon' ? 0.85 : 0.96}
      filter={stroke.tool === 'crayon' ? `url(#${filterId})` : undefined}
      style={{ pointerEvents: 'none' }}
    />
  );
}

function renderSticker(sticker: StickerData) {
  return (
    <g
      key={sticker.id}
      transform={`translate(${sticker.x}, ${sticker.y}) rotate(${sticker.rotation}) scale(${sticker.size})`}
      style={{ pointerEvents: 'none' }}
    >
      <path
        d={renderStampShape(sticker.stamp)}
        fill={sticker.color}
        stroke="#231F20"
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      {sticker.stamp === 'flower' && (
        <circle cx={0} cy={0} r={6} fill="#FACC15" stroke="#231F20" strokeWidth={1.8} />
      )}
    </g>
  );
}

export const SvgArtwork: React.FC<SvgArtworkProps> = ({
  page,
  drawing,
  activeStroke,
  svgRef,
  interactive = false,
  isBucketMode = false,
  isEraserMode = false,
  hoveredRegionId,
  onRegionClick,
  onRegionHover,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  className = '',
}) => {
  const filterId = `crayon-rough-${page.id}`;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 600"
      className={`select-none ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ touchAction: interactive ? 'none' : 'auto' }}
    >
      <defs>
        <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
        </filter>
      </defs>

      {/* Base paper */}
      <rect x={0} y={0} width={800} height={600} fill="#FFFFFF" />

      {/* Layer 1: Fillable regions */}
      <g>
        {page.regions.map((region) => {
          const isHovered = interactive && (isBucketMode || isEraserMode) && hoveredRegionId === region.id;
          return renderRegionElement(
            region,
            drawing.fills[region.id],
            false,
            interactive
              ? {
                  className: `coloring-region ${isBucketMode || isEraserMode ? 'coloring-region-bucket cursor-pointer' : ''}`,
                  onClick: (e) => {
                    if (isBucketMode || isEraserMode) {
                      e.stopPropagation();
                      onRegionClick?.(region.id, region.label);
                    }
                  },
                  onMouseEnter: () => onRegionHover?.(region.id),
                  onMouseLeave: () => onRegionHover?.(null),
                  ...(isHovered ? { filter: 'brightness(0.95)' } : {}),
                }
              : undefined
          );
        })}
      </g>

      {/* Layer 2: Freehand brush/crayon/rainbow strokes (staying under crisp ink lines) */}
      <g style={{ pointerEvents: 'none' }}>
        {drawing.strokes.map((s) => renderStroke(s, filterId))}
        {activeStroke && renderStroke(activeStroke, filterId)}
      </g>

      {/* Layer 3: Crisp black coloring-book ink outlines */}
      <g style={{ pointerEvents: 'none' }}>
        {page.regions.map((region) => renderRegionElement(region, undefined, true))}
        {page.accents.map((acc, i) => renderAccent(acc, i))}
      </g>

      {/* Layer 4: Vector sticker stamps */}
      <g style={{ pointerEvents: 'none' }}>
        {drawing.stickers.map((st) => renderSticker(st))}
      </g>

      {/* Crisp inner framing border */}
      <rect
        x={2}
        y={2}
        width={796}
        height={596}
        fill="none"
        stroke="#231F20"
        strokeWidth={4}
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  );
};
