import type { Schaltschrank } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

export interface ControlState {
  energizedCoils: Set<string>   // Schütze/Relais mit angezogener Spule
  closedContactors: Set<string> // Schütze mit geschlossenen Hauptkontakten
  litLamps: Set<string>         // leuchtende Meldeleuchten
}

const SWITCH_TYPES = new Set(['button', 'selector', 'emergency-stop'])
const COIL_TYPES = new Set(['contactor', 'relay', 'monitoring-relay', 'impulse-relay', 'safety-relay'])

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
  const register = (instanceId: string, definitionId: string) => {
    const def = COMPONENT_MAP.get(definitionId)
    if (def) byId.set(instanceId, { definitionId, type: def.electricalModel.type })
  }
  for (const rail of s.rails) {
    for (const c of rail.placedComponents) register(c.instanceId, c.definitionId)
  }
  for (const c of s.panelComponents ?? []) register(c.instanceId, c.definitionId)
  const ifaceId = s.interfacePanel?.id

  // Durchgangs-Knoten: Klemmen/Durchführungen und Übergabefeld-Pins leiten durch.
  const passThrough = (id: string) => (id === ifaceId) || byId.get(id)?.type === 'terminal'
  // Knotenschlüssel: aktive Bauteile = ein Knoten (id); Durchgänge = pro Pin (id::conn)
  const nodeOf = (id: string, conn: string) => (passThrough(id) ? `${id}::${conn}` : id)

  const adj = new Map<string, Set<string>>()
  const edge = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set())
    if (!adj.has(b)) adj.set(b, new Set())
    adj.get(a)!.add(b); adj.get(b)!.add(a)
  }
  for (const w of s.wires) {
    edge(nodeOf(w.fromInstanceId, w.fromConnectionId), nodeOf(w.toInstanceId, w.toConnectionId))
  }
  // Interne Brücken der Durchgangs-Bauteile (Klemme top↔bottom, Durchführung innen↔außen).
  // Übergabefeld: KEINE internen Brücken – jeder Pin verbindet nur seine eigenen Leitungen.
  for (const [id, c] of byId) {
    if (c.type !== 'terminal') continue
    const def = COMPONENT_MAP.get(c.definitionId)
    const nodes = (def?.connections ?? []).map(cp => `${id}::${cp.id}`)
    for (let i = 1; i < nodes.length; i++) edge(nodes[0], nodes[i])
  }

  const conductingSwitchAt = (nodeKey: string) => {
    const c = byId.get(nodeKey) // Schalter sind keine Durchgänge → Knoten = id
    return !!c && SWITCH_TYPES.has(c.type) && conducting(c.definitionId, pressed.has(nodeKey))
  }
  const isPassNode = (nodeKey: string) => nodeKey.includes('::')

  // Erreichbarkeit vom Startknoten aus – durch Durchgangs-Knoten hindurch.
  function reaches(startId: string, pred: (nodeKey: string) => boolean): boolean {
    const visited = new Set<string>([startId])
    const queue = [...(adj.get(startId) ?? [])]
    while (queue.length) {
      const n = queue.shift()!
      if (visited.has(n)) continue
      visited.add(n)
      if (pred(n)) return true
      if (isPassNode(n)) for (const m of adj.get(n) ?? []) if (!visited.has(m)) queue.push(m)
    }
    return false
  }

  const energizedCoils = new Set<string>()
  const closedContactors = new Set<string>()
  for (const [id, c] of byId) {
    if (!COIL_TYPES.has(c.type)) continue
    const inputActive = reaches(id, conductingSwitchAt)
    if (resolveOutput(id, inputActive)) {
      energizedCoils.add(id)
      if (c.type === 'contactor') closedContactors.add(id)
    }
  }

  const litLamps = new Set<string>()
  for (const [id, c] of byId) {
    if (c.type !== 'indicator') continue
    if (reaches(id, n => conductingSwitchAt(n) || energizedCoils.has(n))) litLamps.add(id)
  }

  return { energizedCoils, closedContactors, litLamps }
}
