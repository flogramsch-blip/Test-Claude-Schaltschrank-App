import { useState } from 'react'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import { runSimulation, checkSelectivity, estimateShortCircuitCurrent } from '@/simulation/simulationEngine'
import type { SimulationState } from '@/types/simulation'
import type { ActiveFault } from '@/types/simulation'

interface Props {
  simState?: SimulationState | null
  setSimState: (s: SimulationState | null) => void
  trippedComponents: Set<string>
  setTrippedComponents: (s: Set<string>) => void
}

export default function SimulationPanel({ setSimState, trippedComponents, setTrippedComponents }: Props) {
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const { simulationRunning, setSimulationRunning, faultWireId, setFaultWire } = useUIStore()
  const [showSelectivity, setShowSelectivity] = useState(false)

  function handleStart() {
    const state = runSimulation(schaltschrank, [], trippedComponents)
    setSimState(state)
    setSimulationRunning(true)
  }

  function handleStop() {
    setSimState(null)
    setSimulationRunning(false)
    setFaultWire(null)
    setTrippedComponents(new Set())
    setShowSelectivity(false)
  }

  function handleFault() {
    if (!simulationRunning || schaltschrank.wires.length === 0) return
    // Use faultWireId if set, otherwise pick first wire
    const targetWireId = faultWireId ?? schaltschrank.wires[0]?.id
    if (!targetWireId) return
    setFaultWire(targetWireId)

    const faultCurrent = estimateShortCircuitCurrent(targetWireId, schaltschrank)
    const fault: ActiveFault = {
      id: targetWireId,
      type: 'short-circuit',
      wireId: targetWireId,
      faultCurrent,
    }
    const newTripped = new Set(trippedComponents)
    const state = runSimulation(schaltschrank, [fault], newTripped)
    // Apply trips from simulation
    state.componentStates.forEach((cs, id) => {
      if (cs.tripped) newTripped.add(id)
    })
    setTrippedComponents(newTripped)
    setSimState(state)
  }

  function handleSelectivity() {
    if (!faultWireId) return
    setShowSelectivity(true)
  }

  function handleResetFault() {
    setFaultWire(null)
    setTrippedComponents(new Set())
    if (simulationRunning) {
      const state = runSimulation(schaltschrank, [], new Set())
      setSimState(state)
    }
    setShowSelectivity(false)
  }

  const selectivityResult = faultWireId && showSelectivity
    ? checkSelectivity(schaltschrank, estimateShortCircuitCurrent(faultWireId, schaltschrank), faultWireId)
    : null

  const trippedCount = trippedComponents.size

  return (
    <div className="flex flex-col gap-2">
      {/* Main buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {!simulationRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors"
            style={{ background: '#166534', color: '#86efac' }}
          >
            ▶ Simulation starten
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors"
            style={{ background: '#7f1d1d', color: '#fca5a5' }}
          >
            ◼ Stopp
          </button>
        )}

        {simulationRunning && (
          <>
            <button
              onClick={handleFault}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded"
              style={{ background: '#78350f', color: '#fcd34d' }}
              title={faultWireId ? 'Kurzschluss auf markierter Leitung' : 'Leitung anklicken, dann hier klicken'}
            >
              ⚡ Kurzschluss
            </button>

            {faultWireId && (
              <button
                onClick={handleSelectivity}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded"
                style={{ background: '#1e3a5f', color: '#93c5fd' }}
              >
                📊 Selektivität
              </button>
            )}

            {trippedCount > 0 && (
              <button
                onClick={handleResetFault}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded"
                style={{ background: '#374151', color: '#9ca3af' }}
              >
                ↺ Reset
              </button>
            )}
          </>
        )}
      </div>

      {/* Simulation info */}
      {simulationRunning && (
        <div className="text-xs text-slate-500">
          {trippedCount > 0
            ? <span className="text-red-400">{trippedCount} Bauteil(e) ausgelöst</span>
            : <span className="text-green-400">Netz aktiv · 230/400V · 50Hz</span>
          }
          {faultWireId && !trippedCount && <span className="text-amber-400"> · Leitung für Kurzschluss markiert</span>}
        </div>
      )}

      {/* Selectivity results */}
      {selectivityResult && (
        <div className="border border-slate-700 rounded p-2 text-xs">
          <div className="font-semibold text-slate-300 mb-2">
            Selektivitätsanalyse · Ik = {Math.round(selectivityResult.faultCurrent)} A
          </div>
          {selectivityResult.entries.length === 0 ? (
            <div className="text-slate-500">Keine Schutzorgane im Pfad gefunden</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500">
                  <th className="pr-2">Bauteil</th>
                  <th className="pr-2">Auslösezeit</th>
                  <th>Auslösung</th>
                </tr>
              </thead>
              <tbody>
                {selectivityResult.entries.map((entry, i) => (
                  <tr key={entry.instanceId} className={i === 0 && entry.willTrip ? 'text-green-400' : 'text-slate-400'}>
                    <td className="pr-2 font-mono">{entry.label}</td>
                    <td className="pr-2 font-mono">
                      {entry.tripTime === Infinity ? '—' : entry.tripTime >= 1000 ? `${(entry.tripTime / 1000).toFixed(1)} s` : `${entry.tripTime} ms`}
                    </td>
                    <td className={entry.willTrip ? 'text-green-400' : 'text-slate-600'}>
                      {entry.willTrip ? (i === 0 ? '✓ Zuerst' : '✓ Folgt') : '✗ Kein'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {selectivityResult.selectiveOrder.length > 1 && (
            <div className="mt-2 text-amber-400">
              ⚠ Nicht selektiv: Mehrere Schutzschalter lösen aus
            </div>
          )}
          {selectivityResult.selectiveOrder.length === 1 && (
            <div className="mt-2 text-green-400">
              ✓ Selektiv: Nur {selectivityResult.entries[0]?.label} löst aus
            </div>
          )}
        </div>
      )}
    </div>
  )
}
