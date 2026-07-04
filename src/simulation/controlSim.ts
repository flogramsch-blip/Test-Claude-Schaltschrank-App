import type { Schaltschrank, PlacedComponent } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

export interface ControlState {
  energizedCoils: Set<string>   // Schütze/Relais mit angezogener Spule
  closedContactors: Set<string> // Schütze mit geschlossenen Hauptkontakten
  litLamps: Set<string>         // leuchtende Meldeleuchten
  plcInputs: Set<string>        // energisierte SPS-Eingänge, Schlüssel `${plcId}::${connId}`
  plcOutputs: Set<string>       // aktive SPS-Ausgänge, Schlüssel `${plcId}::${connId}`
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
 * Schalter (oder aktiven SPS-Ausgang) verbunden ist. Eine Meldeleuchte
 * leuchtet, wenn sie mit einer leitenden Quelle oder angezogenen Spule
 * verbunden ist.
 *
 * SPS-Module (type 'plc') werten ihre hinterlegte Verknüpfungslogik aus:
 * Jeder Ausgang Q ist ODER über Zeilen, jede Zeile UND über Terme (I/Q,
 * ggf. als Öffner). Ausgänge dürfen auf eigene Ausgänge verweisen
 * (Selbsthaltung) – deshalb Auswertung bis zum Fixpunkt.
 */
export function computeControlState(
  s: Schaltschrank,
  pressed: Set<string>,
  resolveOutput: (instanceId: string, inputActive: boolean) => boolean = (_id, a) => a,
  prevOutputs?: Set<string>   // Ausgangszustand des letzten Takts (für Selbsthaltung)
): ControlState {
  const byId = new Map<string, { definitionId: string; type: string }>()
  const settingsById = new Map<string, PlacedComponent['settings']>()
  const register = (instanceId: string, definitionId: string, settings: PlacedComponent['settings']) => {
    const def = COMPONENT_MAP.get(definitionId)
    if (def) { byId.set(instanceId, { definitionId, type: def.electricalModel.type }); settingsById.set(instanceId, settings) }
  }
  for (const rail of s.rails) {
    for (const c of rail.placedComponents) register(c.instanceId, c.definitionId, c.settings)
  }
  for (const c of s.panelComponents ?? []) register(c.instanceId, c.definitionId, c.settings)
  const ifaceId = s.interfacePanel?.id

  const typeOf = (id: string) => byId.get(id)?.type
  const isTerminal = (id: string) => typeOf(id) === 'terminal'
  const isPlc = (id: string) => typeOf(id) === 'plc'
  // Durchgangs-Knoten: Klemmen/Durchführungen und Übergabefeld-Pins leiten durch.
  const isTransit = (id: string) => id === ifaceId || isTerminal(id)
  // Pro-Pin-Knoten: Durchgänge UND SPS (jeder Ein-/Ausgang ist ein eigener Knoten,
  // aber die SPS leitet NICHT einfach durch – ihre Ausgänge werden berechnet).
  const perPin = (id: string) => isTransit(id) || isPlc(id)
  const nodeOf = (id: string, conn: string) => (perPin(id) ? `${id}::${conn}` : id)
  const ownerOf = (node: string) => { const i = node.indexOf('::'); return i < 0 ? node : node.slice(0, i) }

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
  const isTransitNode = (node: string) => isTransit(ownerOf(node))

  // Erreichbarkeit vom Startknoten aus – nur durch Durchgangs-Knoten hindurch.
  function reaches(startNode: string, pred: (nodeKey: string) => boolean): boolean {
    const visited = new Set<string>([startNode])
    const queue = [...(adj.get(startNode) ?? [])]
    while (queue.length) {
      const n = queue.shift()!
      if (visited.has(n)) continue
      visited.add(n)
      if (pred(n)) return true
      if (isTransitNode(n)) for (const m of adj.get(n) ?? []) if (!visited.has(m)) queue.push(m)
    }
    return false
  }

  // ── SPS-Verknüpfungslogik: Fixpunkt über die aktiven Ausgänge ──
  const plcs = [...byId.entries()]
    .filter(([, c]) => c.type === 'plc')
    .map(([id]) => ({ id, def: COMPONENT_MAP.get(byId.get(id)!.definitionId)! }))
    .filter(p => p.def)

  // Vom letzten Takt gehaltene Ausgänge übernehmen (Selbsthaltung), aber nur
  // solche, die zu einer aktuell vorhandenen SPS gehören.
  const plcIds = new Set(plcs.map(p => p.id))
  const plcOutputs = new Set<string>()  // Knotenschlüssel aktiver Ausgänge `${id}::${conn}`
  if (prevOutputs) for (const k of prevOutputs) if (plcIds.has(k.slice(0, k.indexOf('::')))) plcOutputs.add(k)
  const sourcePred = (n: string) => conductingSwitchAt(n) || plcOutputs.has(n)

  for (let iter = 0; iter < 30; iter++) {
    let changed = false
    for (const p of plcs) {
      const logic = settingsById.get(p.id)?.plcLogic ?? {}
      const connType = new Map(p.def.connections.map(cp => [cp.id, cp.type]))
      const value = (ref: string): boolean => {
        if (connType.get(ref) === 'output') return plcOutputs.has(`${p.id}::${ref}`)
        return reaches(`${p.id}::${ref}`, sourcePred)  // Eingang: energisiert?
      }
      for (const cp of p.def.connections) {
        if (cp.type !== 'output') continue
        const rungs = logic[cp.id]
        const key = `${p.id}::${cp.id}`
        const active = !!rungs && rungs.some(rung => rung.length > 0 && rung.every(t => (t.negated ? !value(t.ref) : value(t.ref))))
        if (active !== plcOutputs.has(key)) {
          changed = true
          if (active) plcOutputs.add(key); else plcOutputs.delete(key)
        }
      }
    }
    if (!changed) break
  }

  const plcInputs = new Set<string>()
  for (const p of plcs) {
    for (const cp of p.def.connections) {
      if (cp.type === 'input' && reaches(`${p.id}::${cp.id}`, sourcePred)) plcInputs.add(`${p.id}::${cp.id}`)
    }
  }

  const energizedCoils = new Set<string>()
  const closedContactors = new Set<string>()
  for (const [id, c] of byId) {
    if (!COIL_TYPES.has(c.type)) continue
    const inputActive = reaches(id, sourcePred)
    if (resolveOutput(id, inputActive)) {
      energizedCoils.add(id)
      if (c.type === 'contactor') closedContactors.add(id)
    }
  }

  const litLamps = new Set<string>()
  for (const [id, c] of byId) {
    if (c.type !== 'indicator') continue
    if (reaches(id, n => sourcePred(n) || energizedCoils.has(n))) litLamps.add(id)
  }

  return { energizedCoils, closedContactors, litLamps, plcInputs, plcOutputs }
}
