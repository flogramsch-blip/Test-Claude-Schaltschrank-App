import { RAIL_TOP_OFFSET_PX, RAIL_HEIGHT_PX, RAIL_X_OFFSET } from './teGrid'

const WIRE_CHANNEL_HEIGHT = 8  // px per lane in the routing channel

/**
 * Build an SVG path string for a wire between two absolute SVG points.
 * Routes: up from start → horizontal → down to end.
 * Assigns a vertical "lane" offset to prevent perfect overlap.
 */
/** Auto-berechneter Kanal-Y für eine gleich-Schienen-Leitung */
export function autoChannelY(
  y1: number, y2: number, laneIndex: number, railYPosition: number
): number {
  const isTopSide1 = y1 < railYPosition + RAIL_TOP_OFFSET_PX
  const isTopSide2 = y2 < railYPosition + RAIL_TOP_OFFSET_PX
  if (isTopSide1 && isTopSide2) {
    return railYPosition + 8 + laneIndex * WIRE_CHANNEL_HEIGHT
  } else if (!isTopSide1 && !isTopSide2) {
    return railYPosition + RAIL_TOP_OFFSET_PX + RAIL_HEIGHT_PX + 12 + laneIndex * WIRE_CHANNEL_HEIGHT
  }
  return (y1 + y2) / 2
}

export function buildWirePath(
  x1: number, y1: number,
  x2: number, y2: number,
  laneIndex: number,
  railYPosition: number,
  channelOverride?: number
): string {
  const channelY = channelOverride ?? autoChannelY(y1, y2, laneIndex, railYPosition)
  // Simple L-shaped routing: go to channel, horizontal, then down
  return `M ${x1} ${y1} L ${x1} ${channelY} L ${x2} ${channelY} L ${x2} ${y2}`
}

/** Build wire path across rails (different Y positions) */
export function buildCrossRailPath(
  x1: number, y1: number,
  x2: number, y2: number,
  laneIndex: number,
  laneXOverride?: number
): string {
  const laneX = laneXOverride ?? (RAIL_X_OFFSET - 10 - laneIndex * WIRE_CHANNEL_HEIGHT)
  return `M ${x1} ${y1} L ${x1} ${y1 - 10} L ${laneX} ${y1 - 10} L ${laneX} ${y2 - 10} L ${x2} ${y2 - 10} L ${x2} ${y2}`
}
