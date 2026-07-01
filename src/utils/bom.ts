import type { Schaltschrank } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

export interface BomEntry {
  definitionId: string
  name: string
  shortName: string
  count: number
  teEach: number
  teTotal: number
  labels: string[]
  currents: string
}

export function buildBOM(s: Schaltschrank): { entries: BomEntry[]; totalTE: number; totalCount: number } {
  const map = new Map<string, BomEntry>()
  for (const rail of s.rails) {
    for (const c of rail.placedComponents) {
      const def = COMPONENT_MAP.get(c.definitionId)
      if (!def) continue
      let e = map.get(c.definitionId)
      if (!e) {
        e = {
          definitionId: c.definitionId,
          name: def.name,
          shortName: def.shortName,
          count: 0,
          teEach: def.teWidth,
          teTotal: 0,
          labels: [],
          currents: '',
        }
        map.set(c.definitionId, e)
      }
      e.count++
      e.teTotal += def.teWidth
      if (c.settings.label) e.labels.push(c.settings.label)
    }
  }
  // Stromwerte zusammenfassen
  for (const e of map.values()) {
    const currents = new Set<string>()
    for (const rail of s.rails) {
      for (const c of rail.placedComponents) {
        if (c.definitionId === e.definitionId && c.settings.nominalCurrent != null) {
          currents.add(`${c.settings.nominalCurrent} A`)
        }
      }
    }
    e.currents = [...currents].join(', ')
    e.labels.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }
  const entries = [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  const totalTE = entries.reduce((s, e) => s + e.teTotal, 0)
  const totalCount = entries.reduce((s, e) => s + e.count, 0)
  return { entries, totalTE, totalCount }
}
