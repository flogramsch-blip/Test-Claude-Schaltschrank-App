import type { Schaltschrank, Wire } from '@/types/schaltschrank'
import type { SimulationState, ComponentSimState, ActiveFault, SelectivityResult, SelectivityEntry } from '@/types/simulation'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

const NETWORK_VOLTAGE = 230   // V (phase-to-neutral)
const SOURCE_IMPEDANCE = 0.05  // Ω (internal impedance of supply)

/** Compute tripping time in ms for a given current and breaker settings */
function tripTimeMs(
  current: number,
  nominalCurrent: number,
  tripCurve: string
): number {
  const ratio = current / nominalCurrent
  if (ratio <= 1) return Infinity  // no trip

  switch (tripCurve) {
    case 'B':
      if (ratio < 3)  return 10000  // slow thermal region
      if (ratio < 5)  return 100
      return 10  // instant above 5×
    case 'C':
      if (ratio < 5)  return 10000
      if (ratio < 10) return 100
      return 10
    case 'D':
      if (ratio < 10) return 10000
      if (ratio < 20) return 100
      return 10
    case 'thermal-magnetic':
      if (ratio < 1.2) return 10000
      if (ratio < 6)   return 5000
      return 50
    case 'gG': {
      // Simplified IEC 60269 gG fuse curve
      if (ratio < 1.25) return 3600000  // 1 hour
      if (ratio < 2)    return 120000   // 2 min
      if (ratio < 4)    return 5000
      if (ratio < 10)   return 300
      return 10
    }
    default:
      return ratio > 1 ? 100 : Infinity
  }
}

export function runSimulation(
  schaltschrank: Schaltschrank,
  faults: ActiveFault[],
  trippedComponents: Set<string>
): SimulationState {
  const componentStates = new Map<string, ComponentSimState>()
  const branches = new Map<string, { wireId: string; current: number; energized: boolean }>()

  // Build a map: instanceId → its component and definition
  const instanceMap = new Map<string, { instanceId: string; definitionId: string; settings: Record<string, unknown> }>()
  for (const rail of schaltschrank.rails) {
    for (const placed of rail.placedComponents) {
      instanceMap.set(placed.instanceId, {
        instanceId: placed.instanceId,
        definitionId: placed.definitionId,
        settings: placed.settings,
      })
    }
  }

  // Initialize all components as non-tripped, energized
  for (const [instanceId, inst] of instanceMap) {
    const def = COMPONENT_MAP.get(inst.definitionId)
    if (!def) continue
    const nominalCurrent = (inst.settings.nominalCurrent as number) ?? def.electricalModel.nominalCurrentDefault
    const isTripped = trippedComponents.has(instanceId)
    componentStates.set(instanceId, {
      instanceId,
      tripped: isTripped,
      closed: true,
      currentL1: 0,
      currentL2: 0,
      currentL3: 0,
      powerDissipation: 0,
      energized: !isTripped,
      tripReason: isTripped ? 'Manuell ausgelöst' : undefined,
    })
    void nominalCurrent
  }

  // Simulate fault currents
  for (const fault of faults) {
    if (fault.type === 'short-circuit' && fault.wireId) {
      const wire = schaltschrank.wires.find(w => w.id === fault.wireId)
      if (!wire) continue

      // Find all protection devices upstream of the fault
      const faultCurrent = fault.faultCurrent
      branches.set(wire.id, { wireId: wire.id, current: faultCurrent, energized: true })

      // Determine which breaker should trip
      const upstreamBreakers = findUpstreamBreakers(wire, schaltschrank, instanceMap)
      for (const breakerId of upstreamBreakers) {
        const inst = instanceMap.get(breakerId)
        if (!inst) continue
        const def = COMPONENT_MAP.get(inst.definitionId)
        if (!def) continue
        const nominalCurrent = (inst.settings.nominalCurrent as number) ?? def.electricalModel.nominalCurrentDefault
        const tripCurve = (inst.settings.tripCurve as string) ?? def.electricalModel.tripCurve ?? 'C'
        const tripTime = tripTimeMs(faultCurrent, nominalCurrent, tripCurve)

        if (tripTime < Infinity) {
          const state = componentStates.get(breakerId)
          if (state && !state.tripped) {
            state.tripped = true
            state.energized = false
            state.currentL1 = faultCurrent
            state.tripReason = `Kurzschluss: ${Math.round(faultCurrent)} A > ${Math.round(nominalCurrent * 5)} A Auslösestrom (${tripCurve}-Kennlinie, Auslösung nach ${tripTime} ms)`
          }
        }
      }
    }
  }

  // Normal load current simulation (simplified: 50% of nominal through each breaker)
  if (faults.length === 0) {
    for (const [instanceId, inst] of instanceMap) {
      const def = COMPONENT_MAP.get(inst.definitionId)
      if (!def) continue
      const state = componentStates.get(instanceId)
      if (!state || state.tripped) continue
      const nominalCurrent = (inst.settings.nominalCurrent as number) ?? def.electricalModel.nominalCurrentDefault
      const loadCurrent = nominalCurrent * 0.5  // simulate 50% load
      state.currentL1 = def.electricalModel.poleCount >= 1 ? loadCurrent : 0
      state.currentL2 = def.electricalModel.poleCount >= 2 ? loadCurrent : 0
      state.currentL3 = def.electricalModel.poleCount >= 3 ? loadCurrent : 0
      state.powerDissipation = loadCurrent ** 2 * (def.electricalModel.internalResistance ?? 0.01)
    }

    // Assign currents to wires
    for (const wire of schaltschrank.wires) {
      const fromState = componentStates.get(wire.fromInstanceId)
      const current = fromState ? (fromState.currentL1 + fromState.currentL2 + fromState.currentL3) / 3 : 0
      branches.set(wire.id, { wireId: wire.id, current, energized: !!fromState?.energized })
    }
  }

  return {
    running: true,
    networkVoltage: NETWORK_VOLTAGE,
    frequency: 50,
    nodes: new Map(),
    branches: new Map(Object.entries(Object.fromEntries(branches))),
    componentStates,
    faults,
    timestamp: Date.now(),
  }
}

export function checkSelectivity(
  schaltschrank: Schaltschrank,
  faultCurrent: number,
  faultWireId: string
): SelectivityResult {
  const entries: SelectivityEntry[] = []
  const instanceMap = new Map<string, { instanceId: string; definitionId: string; settings: Record<string, unknown> }>()

  for (const rail of schaltschrank.rails) {
    for (const placed of rail.placedComponents) {
      instanceMap.set(placed.instanceId, {
        instanceId: placed.instanceId,
        definitionId: placed.definitionId,
        settings: placed.settings,
      })
    }
  }

  const wire = schaltschrank.wires.find(w => w.id === faultWireId)
  if (!wire) {
    return { faultCurrent, entries: [], selectiveOrder: [] }
  }

  const upstreamIds = findUpstreamBreakers(wire, schaltschrank, instanceMap)

  for (const breakerId of upstreamIds) {
    const inst = instanceMap.get(breakerId)
    if (!inst) continue
    const def = COMPONENT_MAP.get(inst.definitionId)
    if (!def) continue
    if (def.electricalModel.type !== 'breaker' && def.electricalModel.type !== 'motor-protection' && def.electricalModel.type !== 'fuse') continue

    const nominalCurrent = (inst.settings.nominalCurrent as number) ?? def.electricalModel.nominalCurrentDefault
    const tripCurve = (inst.settings.tripCurve as string) ?? def.electricalModel.tripCurve ?? 'C'
    const tt = tripTimeMs(faultCurrent, nominalCurrent, tripCurve)
    const label = (inst.settings.label as string) ?? def.shortName

    entries.push({
      instanceId: breakerId,
      label,
      tripTime: tt,
      tripCurrent: faultCurrent,
      willTrip: tt < Infinity,
    })
  }

  // Sort by trip time (fastest first = most selective)
  entries.sort((a, b) => a.tripTime - b.tripTime)

  return {
    faultCurrent,
    entries,
    selectiveOrder: entries.filter(e => e.willTrip).map(e => e.instanceId),
  }
}

function findUpstreamBreakers(
  wire: Wire,
  schaltschrank: Schaltschrank,
  instanceMap: Map<string, { instanceId: string; definitionId: string; settings: Record<string, unknown> }>
): string[] {
  const results: string[] = []
  const visited = new Set<string>()

  function traverse(instanceId: string) {
    if (visited.has(instanceId)) return
    visited.add(instanceId)

    const inst = instanceMap.get(instanceId)
    if (!inst) return
    const def = COMPONENT_MAP.get(inst.definitionId)
    if (!def) return

    if (def.electricalModel.type === 'breaker' ||
        def.electricalModel.type === 'motor-protection' ||
        def.electricalModel.type === 'fuse') {
      results.push(instanceId)
    }

    // Find wires coming into this component
    const inputConnIds = new Set(def.connections.filter(c => c.type === 'input').map(c => c.id))
    const upstreamWires = schaltschrank.wires.filter(
      w => w.toInstanceId === instanceId && inputConnIds.has(w.toConnectionId)
    )
    for (const uw of upstreamWires) {
      traverse(uw.fromInstanceId)
    }
  }

  traverse(wire.fromInstanceId)
  return results
}

export function estimateShortCircuitCurrent(
  wireId: string,
  schaltschrank: Schaltschrank
): number {
  // Walk upstream to find total series resistance
  let totalR = SOURCE_IMPEDANCE
  const wire = schaltschrank.wires.find(w => w.id === wireId)
  if (!wire) return 0

  const instanceMap = new Map<string, { instanceId: string; definitionId: string; settings: Record<string, unknown> }>()
  for (const rail of schaltschrank.rails) {
    for (const placed of rail.placedComponents) {
      instanceMap.set(placed.instanceId, {
        instanceId: placed.instanceId,
        definitionId: placed.definitionId,
        settings: placed.settings,
      })
    }
  }

  const upstream = findUpstreamBreakers(wire, schaltschrank, instanceMap)
  for (const id of upstream) {
    const inst = instanceMap.get(id)
    if (!inst) continue
    const def = COMPONENT_MAP.get(inst.definitionId)
    if (def?.electricalModel.internalResistance) {
      totalR += def.electricalModel.internalResistance
    }
  }

  return NETWORK_VOLTAGE / totalR
}
