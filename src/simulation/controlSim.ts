import type { Schaltschrank } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

export interface ControlState {
  energizedCoils: Set<string>   // Schütze/Relais mit angezogener Spule
  closedContactors: Set<string> // Schütze mit geschlossenen Hauptkontakten
  litLamps: Set<string>         // leuchtende Meldeleuchten
}

const SWITCH_TYPES = new Set(['button', 'selector', 'emergency-stop'])
const COIL_TYPES = new Set(['contactor', 'relay', 'monitoring-relay'])

/**
 * Leitet ab, ob ein Schalter aktuell Strom durchlässt (leitet):
 *  - Schließer (taster-no, Wahlschalter): leitet wenn betätigt
 *  - Öffner (taster-nc): leitet wenn NICHT betätigt
 *  - Not-Aus (Öffner): leitet wenn NICHT betätigt
 */
function conducting(definitionId: string, pressed: boolean): boolean {
  switch (definitionId) {
    case 'taster-no':
    case 'wahlschalter':
      return pressed
    case 'taster-nc':
    case 'not-aus':
      return !pressed
    default:
      return pressed
  }
}

/**
 * Vereinfachte Steuerstromkreis-Simulation (didaktisch):
 * Eine Spule zieht an, wenn sie über eine Leitung mit einem leitenden
 * Schalter verbunden ist. Eine Meldeleuchte leuchtet, wenn sie mit einem
 * leitenden Schalter oder einer angezogenen Spule verbunden ist.
 */
export function computeControlState(
  s: Schaltschrank,
  pressed: Set<string>,
  resolveOutput: (instanceId: string, inputActive: boolean) => boolean = (_id, a) => a
): ControlState {
  const byId = new Map<string, { definitionId: string; type: string }>()
  for (const rail of s.rails) {
    for (const c of rail.placedComponents) {
      const def = COMPONENT_MAP.get(c.definitionId)
      if (def) byId.set(c.instanceId, { definitionId: c.definitionId, type: def.electricalModel.type })
    }
  }

  // Nachbarschaft über Leitungen
  const neighbors = new Map<string, Set<string>>()
  const add = (a: string, b: string) => {
    if (!neighbors.has(a)) neighbors.set(a, new Set())
    neighbors.get(a)!.add(b)
  }
  for (const w of s.wires) {
    add(w.fromInstanceId, w.toInstanceId)
    add(w.toInstanceId, w.fromInstanceId)
  }

  const isConductingSwitch = (id: string) => {
    const c = byId.get(id)
    return !!c && SWITCH_TYPES.has(c.type) && conducting(c.definitionId, pressed.has(id))
  }

  const energizedCoils = new Set<string>()
  const closedContactors = new Set<string>()
  for (const [id, c] of byId) {
    if (!COIL_TYPES.has(c.type)) continue
    const ns = neighbors.get(id)
    const inputActive = !!ns && [...ns].some(isConductingSwitch)
    // resolveOutput erlaubt Zeitverzögerung (Zeitrelais anzug-/abfallverzögert)
    if (resolveOutput(id, inputActive)) {
      energizedCoils.add(id)
      if (c.type === 'contactor') closedContactors.add(id)
    }
  }

  const litLamps = new Set<string>()
  for (const [id, c] of byId) {
    if (c.type !== 'indicator') continue
    const ns = neighbors.get(id)
    if (!ns) continue
    if ([...ns].some(n => isConductingSwitch(n) || energizedCoils.has(n))) {
      litLamps.add(id)
    }
  }

  return { energizedCoils, closedContactors, litLamps }
}
