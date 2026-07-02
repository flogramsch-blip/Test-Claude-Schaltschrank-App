import { v4 as uuidv4 } from 'uuid'
import type { Schaltschrank } from '@/types/schaltschrank'

export function createDefaultSchaltschrank(): Schaltschrank {
  return {
    id: uuidv4(),
    name: 'Neues Projekt',
    description: '',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    rails: [
      {
        id: uuidv4(),
        label: 'Hutschiene 1',
        lengthTE: 36,
        yPosition: 60,
        placedComponents: [],
      },
      {
        id: uuidv4(),
        label: 'Hutschiene 2',
        lengthTE: 36,
        yPosition: 230,
        placedComponents: [],
      },
    ],
    wires: [],
    panelComponents: [],
  }
}
