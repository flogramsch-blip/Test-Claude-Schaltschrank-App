import type { PanelComponent } from '@/types/schaltschrank'
import type { ConnectionPoint } from '@/types/components'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { PANEL_CELL } from './PanelComponentRenderer'

/** Absolute Position einer Klemme eines Frontplatten-Bauteils (Door-Canvas-Koordinaten) */
export function resolvePanelConnectionPos(pc: PanelComponent, cp: ConnectionPoint): { x: number; y: number } {
  const def = COMPONENT_MAP.get(pc.definitionId)
  if (!def) return { x: pc.x, y: pc.y }
  const side = cp.relativeY === 0 ? def.connections.filter(c => c.relativeY === 0) : def.connections.filter(c => c.relativeY === 1)
  const idx = side.findIndex(c => c.id === cp.id)
  const n = side.length
  const x = pc.x + ((idx + 1) / (n + 1)) * PANEL_CELL
  const y = cp.relativeY === 0 ? pc.y - 5 : pc.y + PANEL_CELL + 5
  return { x, y }
}
