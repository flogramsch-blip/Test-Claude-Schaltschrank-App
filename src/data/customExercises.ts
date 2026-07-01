import type { Schaltschrank } from '@/types/schaltschrank'
import type { ExerciseStep } from '@/data/exercises'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

export interface CustomExercise {
  id: string
  title: string
  requiredComponents: Array<{ definitionId: string; count: number }>
  minWires: number
}

const KEY = 'custom-exercises-v1'

export function loadCustomExercises(): CustomExercise[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

export function saveCustomExercises(list: CustomExercise[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

export function checkCustom(ex: CustomExercise, s: Schaltschrank): ExerciseStep[] {
  const steps: ExerciseStep[] = []
  const counts = new Map<string, number>()
  for (const rail of s.rails) for (const c of rail.placedComponents) {
    counts.set(c.definitionId, (counts.get(c.definitionId) ?? 0) + 1)
  }
  for (const rc of ex.requiredComponents) {
    const have = counts.get(rc.definitionId) ?? 0
    const name = COMPONENT_MAP.get(rc.definitionId)?.shortName ?? rc.definitionId
    steps.push({
      label: `${rc.count}× ${name} (${Math.min(have, rc.count)}/${rc.count})`,
      done: have >= rc.count,
    })
  }
  if (ex.minWires > 0) {
    steps.push({
      label: `Mindestens ${ex.minWires} Leitung(en) (${Math.min(s.wires.length, ex.minWires)}/${ex.minWires})`,
      done: s.wires.length >= ex.minWires,
    })
  }
  return steps
}
