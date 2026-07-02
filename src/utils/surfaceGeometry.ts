import type { Schaltschrank, PanelComponent, InterfacePanel } from '@/types/schaltschrank'
import type { ConnectionPoint } from '@/types/components'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { resolveConnectionPos } from './teGrid'

export const PANEL_CELL = 60          // Frontplatten-Element-Größe
export const IFACE_PIN_SPACING = 22   // Pin-Abstand im Übergabefeld
export const IFACE_PAD = 16           // linker/rechter Rand im Block

/** Absolute Klemmenposition eines Frontplatten-Bauteils (Door-Canvas) */
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

export function interfacePanelWidth(pinCount: number): number {
  return IFACE_PAD * 2 + Math.max(1, pinCount) * IFACE_PIN_SPACING
}
export const IFACE_HEIGHT = 34

/** Position eines Pins im Übergabefeld (pro Fläche). Pins sitzen an der Oberkante. */
export function resolveInterfacePinPos(panel: InterfacePanel, surface: 'interior' | 'door', pinIndex: number): { x: number; y: number } {
  const pos = surface === 'interior' ? panel.interior : panel.door
  const x = pos.x + IFACE_PAD + pinIndex * IFACE_PIN_SPACING + IFACE_PIN_SPACING / 2
  const y = pos.y - 6
  return { x, y }
}

/** Übergabefeld-Pins als Connection-Points (für die Verdrahtung) */
export function interfacePins(panel: InterfacePanel): ConnectionPoint[] {
  return Array.from({ length: panel.pinCount }, (_, i) => ({
    id: `p${i}`,
    label: `${i + 1}`,
    type: 'bidirectional' as const,
    relativeX: i,
    relativeY: 0,
  }))
}

/**
 * Löst einen Leitungs-Endpunkt auf der angegebenen Fläche auf.
 * Behandelt Schienen-Bauteile, Frontplatten-Bauteile und Übergabefeld-Pins.
 * Liefert null, wenn der Endpunkt auf dieser Fläche nicht existiert.
 */
export function resolveWireEndpoint(
  s: Schaltschrank, instanceId: string, connectionId: string, surface: 'interior' | 'door'
): { x: number; y: number } | null {
  // Übergabefeld (auf beiden Flächen vorhanden)
  if (s.interfacePanel && instanceId === s.interfacePanel.id) {
    const idx = parseInt(connectionId.replace('p', ''), 10)
    if (Number.isNaN(idx) || idx >= s.interfacePanel.pinCount) return null
    return resolveInterfacePinPos(s.interfacePanel, surface, idx)
  }
  if (surface === 'interior') {
    for (const rail of s.rails) {
      const c = rail.placedComponents.find(c => c.instanceId === instanceId)
      if (c) {
        const def = COMPONENT_MAP.get(c.definitionId)
        const cp = def?.connections.find(cc => cc.id === connectionId)
        if (!cp) return null
        return resolveConnectionPos(cp.relativeX, cp.relativeY, c.tePosition, rail.yPosition)
      }
    }
    return null
  } else {
    const pc = s.panelComponents?.find(c => c.instanceId === instanceId)
    if (pc) {
      const def = COMPONENT_MAP.get(pc.definitionId)
      const cp = def?.connections.find(cc => cc.id === connectionId)
      if (!cp) return null
      return resolvePanelConnectionPos(pc, cp)
    }
    return null
  }
}

/** Auf welcher Fläche liegt ein Bauteil? (Übergabefeld = beide) */
export function componentSurface(s: Schaltschrank, instanceId: string): 'interior' | 'door' | 'both' | null {
  if (s.interfacePanel && instanceId === s.interfacePanel.id) return 'both'
  if (s.rails.some(r => r.placedComponents.some(c => c.instanceId === instanceId))) return 'interior'
  if (s.panelComponents?.some(c => c.instanceId === instanceId)) return 'door'
  return null
}
