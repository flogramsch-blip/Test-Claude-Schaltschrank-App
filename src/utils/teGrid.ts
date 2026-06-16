export const TE_WIDTH_PX = 18
export const RAIL_HEIGHT_PX = 45
export const RAIL_TOP_OFFSET_PX = 35
export const RAIL_BOTTOM_OFFSET_PX = 35
export const ROW_TOTAL_HEIGHT_PX = RAIL_TOP_OFFSET_PX + RAIL_HEIGHT_PX + RAIL_BOTTOM_OFFSET_PX
export const RAIL_X_OFFSET = 40  // left padding for rail labels

export const WIRE_COLORS: Record<string, string> = {
  'brown':        '#92400e',
  'black':        '#1a1a1a',
  'grey':         '#6b7280',
  'blue':         '#1d4ed8',
  'green-yellow': '#16a34a',
  'red':          '#dc2626',
  'orange':       '#f97316',
  'purple':       '#7c3aed',
  'white':        '#e5e7eb',
}

export function teToPixel(te: number): number {
  return te * TE_WIDTH_PX
}

export function pixelToTe(px: number): number {
  return Math.round(px / TE_WIDTH_PX)
}

export function snapToTEPixel(px: number): number {
  return pixelToTe(px) * TE_WIDTH_PX
}

/** Convert a connection point's relative coords to absolute SVG coords within a rail row */
export function resolveConnectionPos(
  relativeX: number,
  relativeY: number,
  tePosition: number,
  railYPosition: number
): { x: number; y: number } {
  const x = RAIL_X_OFFSET + (tePosition + relativeX) * TE_WIDTH_PX
  const y =
    railYPosition +
    (relativeY === 0
      ? RAIL_TOP_OFFSET_PX - 6   // slightly above the rail
      : RAIL_TOP_OFFSET_PX + RAIL_HEIGHT_PX + 6)  // slightly below
  return { x, y }
}
