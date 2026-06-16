import type { ComponentDefinition } from '@/types/components'
import type { DINRail, PlacedComponent } from '@/types/schaltschrank'

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
