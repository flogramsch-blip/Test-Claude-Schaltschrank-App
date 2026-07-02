import { useEffect, useRef, useState } from 'react'
import type { Schaltschrank } from '@/types/schaltschrank'
import { useUIStore } from '@/store/uiStore'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { computeControlState, type ControlState } from './controlSim'

interface TimerState { inSince: number | null; out: boolean; prevInput?: boolean; latched?: boolean }

/**
 * Liefert den Steuerzustand inkl. Zeitrelais-Verzögerung. Läuft während der
 * Simulation über ein Intervall, damit anzug-/abfallverzögerte Zeitrelais
 * über die Zeit schalten.
 */
export function useControlState(schaltschrank: Schaltschrank): ControlState | null {
  const simulationRunning = useUIStore(s => s.simulationRunning)
  const pressedButtons = useUIStore(s => s.pressedButtons)
  const [now, setNow] = useState(() => Date.now())
  const timers = useRef<Map<string, TimerState>>(new Map())

  useEffect(() => {
    if (!simulationRunning) {
      timers.current.clear()
      return
    }
    setNow(Date.now())
    const iv = setInterval(() => setNow(Date.now()), 150)
    return () => clearInterval(iv)
  }, [simulationRunning])

  if (!simulationRunning) return null

  // Bauteil-Einstellungen für Zeitrelais nachschlagen
  const settingsById = new Map<string, { definitionId: string; timerMode?: string; timerSeconds?: number }>()
  for (const rail of schaltschrank.rails) {
    for (const c of rail.placedComponents) {
      settingsById.set(c.instanceId, { definitionId: c.definitionId, timerMode: c.settings.timerMode, timerSeconds: c.settings.timerSeconds })
    }
  }
  for (const c of schaltschrank.panelComponents ?? []) {
    settingsById.set(c.instanceId, { definitionId: c.definitionId, timerMode: c.settings.timerMode, timerSeconds: c.settings.timerSeconds })
  }

  function resolveOutput(id: string, inputActive: boolean): boolean {
    const info = settingsById.get(id)
    if (!info) return inputActive
    const def = COMPONENT_MAP.get(info.definitionId)
    if (!def) return inputActive

    // Stromstoßschalter: Verriegelung, wechselt bei jeder steigenden Flanke
    if (def.electricalModel.type === 'impulse-relay') {
      const t = timers.current.get(id) ?? { inSince: null, out: false, prevInput: false, latched: false }
      if (inputActive && !t.prevInput) t.latched = !t.latched
      t.prevInput = inputActive
      t.out = !!t.latched
      timers.current.set(id, t)
      return t.out
    }

    // Zeitrelais (anzug-/abfallverzögert)
    if (def.id.startsWith('zeitrelais')) {
      const mode = info.timerMode ?? def.electricalModel.timerModeDefault ?? 'on-delay'
      const ms = (info.timerSeconds ?? 5) * 1000
      const t = timers.current.get(id) ?? { inSince: null, out: false }
      if (mode === 'on-delay') {
        if (inputActive) {
          if (t.inSince == null) t.inSince = now
          t.out = now - t.inSince >= ms
        } else {
          t.inSince = null
          t.out = false
        }
      } else {
        if (inputActive) {
          t.inSince = now
          t.out = true
        } else {
          t.out = t.inSince != null && now - t.inSince < ms
        }
      }
      timers.current.set(id, t)
      return t.out
    }

    return inputActive
  }

  return computeControlState(schaltschrank, pressedButtons, resolveOutput)
}
