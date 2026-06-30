import { create } from 'zustand'
import { produce } from 'immer'
import { v4 as uuidv4 } from 'uuid'
import type { Schaltschrank, Wire, DINRail } from '@/types/schaltschrank'
import { createDefaultSchaltschrank } from '@/data/defaultSchaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { checkTECollision } from '@/utils/validation'
import type { Preset } from '@/data/presets'

interface HistoryEntry {
  schaltschrank: Schaltschrank
}

interface SchaltschrankStore {
  schaltschrank: Schaltschrank
  past: HistoryEntry[]
  future: HistoryEntry[]

  addComponent: (definitionId: string, railId: string, tePosition: number) => string | null
  moveComponent: (instanceId: string, newRailId: string, newTePosition: number) => boolean
  removeComponent: (instanceId: string) => void
  updateComponentSettings: (instanceId: string, settings: Record<string, unknown>) => void
  updateComponentLabel: (instanceId: string, label: string) => void

  addRail: (lengthTE?: number) => void
  removeRail: (railId: string) => void

  addWire: (wire: Omit<Wire, 'id' | 'waypoints'>) => void
  removeWire: (wireId: string) => void
  updateWire: (wireId: string, updates: Partial<Wire>) => void

  updateProjectName: (name: string) => void

  insertPreset: (preset: Preset) => void

  undo: () => void
  redo: () => void

  exportJSON: () => string
  importJSON: (json: string) => void
  reset: () => void
}

const MAX_HISTORY = 50

// Tiefe Kopie über JSON-Roundtrip. Funktioniert auch auf Immer-Draft-Proxies
// (strukturiertes Klonen scheitert an Proxies). Schaltschrank ist reines JSON.
function snapshot(value: Schaltschrank): Schaltschrank {
  return JSON.parse(JSON.stringify(value)) as Schaltschrank
}

function pushHistory(past: HistoryEntry[], current: Schaltschrank): HistoryEntry[] {
  const next = [...past, { schaltschrank: snapshot(current) }]
  if (next.length > MAX_HISTORY) next.shift()
  return next
}

export const useSchaltschrankStore = create<SchaltschrankStore>((set, get) => ({
  schaltschrank: createDefaultSchaltschrank(),
  past: [],
  future: [],

  addComponent: (definitionId, railId, tePosition) => {
    const def = COMPONENT_MAP.get(definitionId)
    if (!def) return null
    const state = get()
    const rail = state.schaltschrank.rails.find(r => r.id === railId)
    if (!rail) return null

    const existing = rail.placedComponents.map(c => ({
      tePosition: c.tePosition,
      teWidth: COMPONENT_MAP.get(c.definitionId)?.teWidth ?? 1,
      instanceId: c.instanceId,
    }))

    const collision = checkTECollision(tePosition, def.teWidth, existing)
    if (collision) return null
    if (tePosition + def.teWidth > rail.lengthTE) return null

    const instanceId = uuidv4()
    set(produce((draft: SchaltschrankStore) => {
      draft.past = pushHistory(draft.past, draft.schaltschrank)
      draft.future = []
      const r = draft.schaltschrank.rails.find(r => r.id === railId)!
      r.placedComponents.push({
        instanceId,
        definitionId,
        railId,
        tePosition,
        settings: {
          nominalCurrent: def.electricalModel.nominalCurrentDefault,
          label: '',
        },
      })
      draft.schaltschrank.modifiedAt = new Date().toISOString()
    }))
    return instanceId
  },

  moveComponent: (instanceId, newRailId, newTePosition) => {
    const state = get()
    const def = (() => {
      for (const rail of state.schaltschrank.rails) {
        const c = rail.placedComponents.find(c => c.instanceId === instanceId)
        if (c) return COMPONENT_MAP.get(c.definitionId)
      }
    })()
    if (!def) return false

    const targetRail = state.schaltschrank.rails.find(r => r.id === newRailId)
    if (!targetRail) return false

    const existing = targetRail.placedComponents
      .filter(c => c.instanceId !== instanceId)
      .map(c => ({
        tePosition: c.tePosition,
        teWidth: COMPONENT_MAP.get(c.definitionId)?.teWidth ?? 1,
        instanceId: c.instanceId,
      }))

    const collision = checkTECollision(newTePosition, def.teWidth, existing)
    if (collision) return false
    if (newTePosition < 0 || newTePosition + def.teWidth > targetRail.lengthTE) return false

    set(produce((draft: SchaltschrankStore) => {
      draft.past = pushHistory(draft.past, draft.schaltschrank)
      draft.future = []
      // Remove from old rail
      for (const rail of draft.schaltschrank.rails) {
        const idx = rail.placedComponents.findIndex(c => c.instanceId === instanceId)
        if (idx !== -1) {
          rail.placedComponents.splice(idx, 1)
          break
        }
      }
      // Add to new rail
      const targetR = draft.schaltschrank.rails.find(r => r.id === newRailId)!
      targetR.placedComponents.push({
        instanceId,
        definitionId: def.id,
        railId: newRailId,
        tePosition: newTePosition,
        settings: state.schaltschrank.rails
          .flatMap(r => r.placedComponents)
          .find(c => c.instanceId === instanceId)?.settings ?? {},
      })
      draft.schaltschrank.modifiedAt = new Date().toISOString()
    }))
    return true
  },

  removeComponent: (instanceId) => {
    set(produce((draft: SchaltschrankStore) => {
      draft.past = pushHistory(draft.past, draft.schaltschrank)
      draft.future = []
      for (const rail of draft.schaltschrank.rails) {
        const idx = rail.placedComponents.findIndex(c => c.instanceId === instanceId)
        if (idx !== -1) {
          rail.placedComponents.splice(idx, 1)
          break
        }
      }
      // Also remove all wires connected to this component
      draft.schaltschrank.wires = draft.schaltschrank.wires.filter(
        w => w.fromInstanceId !== instanceId && w.toInstanceId !== instanceId
      )
      draft.schaltschrank.modifiedAt = new Date().toISOString()
    }))
  },

  updateComponentSettings: (instanceId, settings) => {
    set(produce((draft: SchaltschrankStore) => {
      for (const rail of draft.schaltschrank.rails) {
        const c = rail.placedComponents.find(c => c.instanceId === instanceId)
        if (c) {
          Object.assign(c.settings, settings)
          break
        }
      }
      draft.schaltschrank.modifiedAt = new Date().toISOString()
    }))
  },

  updateComponentLabel: (instanceId, label) => {
    set(produce((draft: SchaltschrankStore) => {
      for (const rail of draft.schaltschrank.rails) {
        const c = rail.placedComponents.find(c => c.instanceId === instanceId)
        if (c) { c.settings.label = label; break }
      }
    }))
  },

  addRail: (lengthTE = 36) => {
    const lastRail = get().schaltschrank.rails.at(-1)
    const yPos = lastRail ? lastRail.yPosition + 170 : 60
    set(produce((draft: SchaltschrankStore) => {
      draft.past = pushHistory(draft.past, draft.schaltschrank)
      draft.future = []
      draft.schaltschrank.rails.push({
        id: uuidv4(),
        label: `Hutschiene ${draft.schaltschrank.rails.length + 1}`,
        lengthTE,
        yPosition: yPos,
        placedComponents: [],
      })
    }))
  },

  removeRail: (railId) => {
    set(produce((draft: SchaltschrankStore) => {
      draft.past = pushHistory(draft.past, draft.schaltschrank)
      draft.future = []
      const rail = draft.schaltschrank.rails.find(r => r.id === railId)
      if (!rail) return
      const instanceIds = new Set(rail.placedComponents.map(c => c.instanceId))
      draft.schaltschrank.rails = draft.schaltschrank.rails.filter(r => r.id !== railId)
      draft.schaltschrank.wires = draft.schaltschrank.wires.filter(
        w => !instanceIds.has(w.fromInstanceId) && !instanceIds.has(w.toInstanceId)
      )
    }))
  },

  addWire: (wireData) => {
    set(produce((draft: SchaltschrankStore) => {
      draft.past = pushHistory(draft.past, draft.schaltschrank)
      draft.future = []
      draft.schaltschrank.wires.push({
        ...wireData,
        id: uuidv4(),
        waypoints: [],
      })
      draft.schaltschrank.modifiedAt = new Date().toISOString()
    }))
  },

  removeWire: (wireId) => {
    set(produce((draft: SchaltschrankStore) => {
      draft.past = pushHistory(draft.past, draft.schaltschrank)
      draft.future = []
      draft.schaltschrank.wires = draft.schaltschrank.wires.filter(w => w.id !== wireId)
    }))
  },

  updateWire: (wireId, updates) => {
    set(produce((draft: SchaltschrankStore) => {
      const wire = draft.schaltschrank.wires.find(w => w.id === wireId)
      if (wire) Object.assign(wire, updates)
    }))
  },

  updateProjectName: (name) => {
    set(produce((draft: SchaltschrankStore) => {
      draft.schaltschrank.name = name
    }))
  },

  insertPreset: (preset) => {
    set(produce((draft: SchaltschrankStore) => {
      draft.past = pushHistory(draft.past, draft.schaltschrank)
      draft.future = []

      // Sicherstellen, dass genug Hutschienen existieren
      const maxRailIndex = Math.max(...preset.components.map(c => c.railIndex))
      while (draft.schaltschrank.rails.length <= maxRailIndex) {
        const last = draft.schaltschrank.rails.at(-1)
        draft.schaltschrank.rails.push({
          id: uuidv4(),
          label: `Hutschiene ${draft.schaltschrank.rails.length + 1}`,
          lengthTE: 36,
          yPosition: last ? last.yPosition + 170 : 60,
          placedComponents: [],
        })
      }

      // Bauteile einfügen, key → instanceId merken
      const keyToInstance = new Map<string, string>()
      for (const pc of preset.components) {
        const def = COMPONENT_MAP.get(pc.definitionId)
        if (!def) continue
        const rail = draft.schaltschrank.rails[pc.railIndex]
        const instanceId = uuidv4()
        keyToInstance.set(pc.key, instanceId)
        rail.placedComponents.push({
          instanceId,
          definitionId: pc.definitionId,
          railId: rail.id,
          tePosition: pc.tePosition,
          settings: {
            nominalCurrent: pc.settings?.nominalCurrent ?? def.electricalModel.nominalCurrentDefault,
            label: pc.label,
            tripCurve: pc.settings?.tripCurve,
            residualCurrent: pc.settings?.residualCurrent,
          },
        })
      }

      // Leitungen einfügen
      for (const pw of preset.wires) {
        const fromId = keyToInstance.get(pw.from[0])
        const toId = keyToInstance.get(pw.to[0])
        if (!fromId || !toId) continue
        draft.schaltschrank.wires.push({
          id: uuidv4(),
          fromInstanceId: fromId,
          fromConnectionId: pw.from[1],
          toInstanceId: toId,
          toConnectionId: pw.to[1],
          color: pw.color,
          crossSection: 1.5,
          waypoints: [],
        })
      }

      draft.schaltschrank.modifiedAt = new Date().toISOString()
    }))
  },

  undo: () => {
    const { past, schaltschrank } = get()
    if (past.length === 0) return
    const prev = past[past.length - 1]
    set(produce((draft: SchaltschrankStore) => {
      draft.future = [{ schaltschrank: snapshot(schaltschrank) }, ...draft.future]
      draft.past = draft.past.slice(0, -1)
      draft.schaltschrank = prev.schaltschrank
    }))
  },

  redo: () => {
    const { future, schaltschrank } = get()
    if (future.length === 0) return
    const next = future[0]
    set(produce((draft: SchaltschrankStore) => {
      draft.past = [...draft.past, { schaltschrank: snapshot(schaltschrank) }]
      draft.future = draft.future.slice(1)
      draft.schaltschrank = next.schaltschrank
    }))
  },

  exportJSON: () => {
    return JSON.stringify(get().schaltschrank, null, 2)
  },

  importJSON: (json) => {
    const data = JSON.parse(json) as Schaltschrank
    set(produce((draft: SchaltschrankStore) => {
      draft.past = []
      draft.future = []
      draft.schaltschrank = data
    }))
  },

  reset: () => {
    set({
      schaltschrank: createDefaultSchaltschrank(),
      past: [],
      future: [],
    })
  },
}))

// Helper selectors
export function getAllPlacedComponents(rails: DINRail[]) {
  return rails.flatMap(r => r.placedComponents)
}

export function findPlacedComponent(rails: DINRail[], instanceId: string) {
  for (const rail of rails) {
    const c = rail.placedComponents.find(c => c.instanceId === instanceId)
    if (c) return { component: c, rail }
  }
  return null
}
