import type { ComponentDefinition } from '@/types/components'
import type { DINRail, PlacedComponent, Schaltschrank } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

export interface ValidationResult {
  valid: boolean
  reason?: string
}

export interface ValidationIssue {
  severity: 'error' | 'warning'
  message: string
  instanceId?: string
  wireId?: string
}

export function canPlaceComponent(
  def: ComponentDefinition,
  tePosition: number,
  rail: DINRail,
  excludeInstanceId?: string
): ValidationResult {
  if (tePosition < 0) {
    return { valid: false, reason: 'Position außerhalb der Hutschiene' }
  }
  if (tePosition + def.teWidth > rail.lengthTE) {
    return { valid: false, reason: `Bauteil (${def.teWidth} TE) passt nicht auf die Hutschiene (nur ${rail.lengthTE - tePosition} TE frei)` }
  }

  void rail.placedComponents
    .filter(c => c.instanceId !== excludeInstanceId)

  return { valid: true }
}

export function getOccupiedTERange(placed: PlacedComponent, teWidth: number): [number, number] {
  return [placed.tePosition, placed.tePosition + teWidth]
}

export function checkTECollision(
  newTePos: number,
  newTeWidth: number,
  existingComponents: Array<{ tePosition: number; teWidth: number; instanceId: string }>,
  excludeInstanceId?: string
): string | null {
  for (const c of existingComponents) {
    if (c.instanceId === excludeInstanceId) continue
    const [existStart, existEnd] = [c.tePosition, c.tePosition + c.teWidth]
    const [newStart, newEnd] = [newTePos, newTePos + newTeWidth]
    if (newStart < existEnd && newEnd > existStart) {
      return `Kollision mit vorhandenem Bauteil an Position ${c.tePosition}`
    }
  }
  return null
}

/**
 * Prüft, ob ein Bauteil (teWidth) an tePosition auf railId platziert/verschoben
 * werden darf: passt auf die Schiene und keine Kollision. Für die visuelle
 * Platzierungs-Vorschau (Schattenmodell) verwendet.
 */
export function placementValidity(
  rails: DINRail[],
  railId: string,
  tePosition: number,
  teWidth: number,
  excludeInstanceId?: string
): boolean {
  const rail = rails.find(r => r.id === railId)
  if (!rail) return false
  if (tePosition < 0 || tePosition + teWidth > rail.lengthTE) return false
  const existing = rail.placedComponents.map(c => ({
    tePosition: c.tePosition,
    teWidth: COMPONENT_MAP.get(c.definitionId)?.teWidth ?? 1,
    instanceId: c.instanceId,
  }))
  return checkTECollision(tePosition, teWidth, existing, excludeInstanceId) === null
}

// Maximal zulässiger Absicherungsstrom je Querschnitt (vereinfacht, übliche Praxis)
const MAX_CURRENT_BY_CROSS: Array<{ mm2: number; maxA: number }> = [
  { mm2: 0.75, maxA: 6 },
  { mm2: 1.0, maxA: 10 },
  { mm2: 1.5, maxA: 16 },
  { mm2: 2.5, maxA: 20 },
  { mm2: 4, maxA: 25 },
  { mm2: 6, maxA: 32 },
  { mm2: 10, maxA: 50 },
  { mm2: 16, maxA: 63 },
]

function maxCurrentForCross(mm2: number): number {
  const hit = MAX_CURRENT_BY_CROSS.find(x => x.mm2 === mm2)
  return hit ? hit.maxA : Infinity
}

const PROTECTIVE_TYPES = new Set(['breaker', 'motor-protection', 'fuse', 'rcd'])

/**
 * Live-Analyse des Schaltschranks: Querschnitts- und Verdrahtungsprüfung.
 * Liefert Hinweise (Fehler/Warnungen) für das Prüf-Panel.
 */
export function analyzeSchaltschrank(s: Schaltschrank): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const byId = new Map<string, PlacedComponent>()
  for (const rail of s.rails) for (const c of rail.placedComponents) byId.set(c.instanceId, c)

  for (const wire of s.wires) {
    const from = byId.get(wire.fromInstanceId)
    const to = byId.get(wire.toInstanceId)
    if (!from || !to) continue
    const fromDef = COMPONENT_MAP.get(from.definitionId)
    const toDef = COMPONENT_MAP.get(to.definitionId)
    if (!fromDef || !toDef) continue
    const fromConn = fromDef.connections.find(c => c.id === wire.fromConnectionId)
    const toConn = toDef.connections.find(c => c.id === wire.toConnectionId)

    // — Querschnittsprüfung: Absicherung darf Querschnitt nicht überlasten —
    if (wire.crossSection) {
      const maxA = maxCurrentForCross(wire.crossSection)
      for (const [comp, def] of [[from, fromDef], [to, toDef]] as const) {
        if (PROTECTIVE_TYPES.has(def.electricalModel.type)) {
          const nominal = comp.settings.nominalCurrent ?? def.electricalModel.nominalCurrentDefault
          if (nominal > maxA) {
            issues.push({
              severity: 'warning',
              message: `${comp.settings.label || def.shortName}: Leiter ${wire.crossSection} mm² ist für ${nominal} A zu dünn (max. ${maxA} A).`,
              instanceId: comp.instanceId,
              wireId: wire.id,
            })
          }
        }
      }
    }

    // — Verdrahtungstyp: PE mit aktivem Leiter verbunden —
    const isPE = (t?: string, phase?: string) => t === 'pe' || phase === 'PE'
    const isActive = (t?: string, phase?: string) =>
      (t === 'input' || t === 'output' || t === 'neutral') && phase !== 'PE'
    if (
      (isPE(fromConn?.type, fromConn?.phase) && isActive(toConn?.type, toConn?.phase)) ||
      (isPE(toConn?.type, toConn?.phase) && isActive(fromConn?.type, fromConn?.phase))
    ) {
      issues.push({
        severity: 'error',
        message: `Schutzleiter (PE) mit aktivem Leiter verbunden: ${from.settings.label || fromDef.shortName} ↔ ${to.settings.label || toDef.shortName}.`,
        wireId: wire.id,
      })
    }

    // — Zwei Ausgänge direkt verbunden (möglicher Kurzschluss) —
    if (fromConn?.type === 'output' && toConn?.type === 'output') {
      issues.push({
        severity: 'warning',
        message: `Zwei Ausgänge direkt verbunden (${from.settings.label || fromDef.shortName} ↔ ${to.settings.label || toDef.shortName}) – möglicher Kurzschluss.`,
        wireId: wire.id,
      })
    }
  }

  return issues
}
