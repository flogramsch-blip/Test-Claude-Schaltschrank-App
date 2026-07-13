import type { ZaehlerschrankProjekt } from '@/types/zaehlerschrank'
import { ZAEHLER_COMPONENT_MAP } from '@/data/zaehlerComponents'

export interface ZaehlerBomEntry {
  definitionId: string
  name: string
  shortName: string
  count: number
  teEach: number
  teTotal: number
}

/** Stückliste (ohne Preise/Artikelnummern) über alle Felder/Reihen/Geräte. */
export function buildZaehlerBOM(p: ZaehlerschrankProjekt): { entries: ZaehlerBomEntry[]; totalTE: number; totalCount: number } {
  const map = new Map<string, ZaehlerBomEntry>()
  for (const feld of p.felder) {
    for (const reihe of feld.reihen) {
      for (const dev of reihe.devices) {
        const def = ZAEHLER_COMPONENT_MAP.get(dev.definitionId)
        if (!def) continue
        let e = map.get(dev.definitionId)
        if (!e) {
          e = { definitionId: dev.definitionId, name: def.name, shortName: def.shortName, count: 0, teEach: def.teWidth, teTotal: 0 }
          map.set(dev.definitionId, e)
        }
        e.count++
        e.teTotal += def.teWidth
      }
    }
  }
  const entries = [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  const totalTE = entries.reduce((s, e) => s + e.teTotal, 0)
  const totalCount = entries.reduce((s, e) => s + e.count, 0)
  return { entries, totalTE, totalCount }
}
