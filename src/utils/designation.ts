import type { DINRail } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import type { ElectricalModel } from '@/types/components'

// Betriebsmittelkennzeichen nach IEC 81346 (vereinfacht)
export function designationPrefix(type: ElectricalModel['type']): string {
  switch (type) {
    case 'breaker':
    case 'motor-protection':
    case 'switch-disconnector':
      return 'Q' // Schalten/Trennen mit Schutz
    case 'contactor':
    case 'relay':
    case 'monitoring-relay':
      return 'K' // Schütze/Relais
    case 'fuse':
    case 'rcd':
    case 'spd':
      return 'F' // Schutz
    case 'button':
    case 'selector':
    case 'emergency-stop':
      return 'S' // Befehlsgeräte
    case 'indicator':
      return 'P' // Melde-/Anzeigegeräte
    case 'transformer':
    case 'ct':
      return 'T' // Transformatoren/Wandler
    case 'power-supply':
      return 'G' // Spannungsversorgung
    case 'fan':
      return 'E' // sonstige Betriebsmittel
    case 'terminal':
    case 'socket':
      return 'X' // Klemmen/Anschlüsse
    default:
      return 'A'
  }
}

/** Nächstes freies Kennzeichen (z. B. Q1, Q2 …) für ein Bauteil bestimmen */
export function nextDesignation(rails: DINRail[], definitionId: string): string {
  const def = COMPONENT_MAP.get(definitionId)
  if (!def) return ''
  const prefix = designationPrefix(def.electricalModel.type)
  let max = 0
  for (const rail of rails) {
    for (const c of rail.placedComponents) {
      const label = c.settings.label
      if (!label) continue
      const m = new RegExp(`^${prefix}(\\d+)$`).exec(label)
      if (m) max = Math.max(max, parseInt(m[1], 10))
    }
  }
  return `${prefix}${max + 1}`
}
