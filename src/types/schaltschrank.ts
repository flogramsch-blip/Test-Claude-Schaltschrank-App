import type { WireColor } from './components'

export interface PlacedComponent {
  instanceId: string
  definitionId: string
  railId: string
  tePosition: number
  settings: {
    nominalCurrent?: number
    label?: string
    residualCurrent?: number
    tripCurve?: string
    // Netzteil / Spannungsquelle
    voltage?: number
    outputCurrent?: number
    voltageType?: 'AC' | 'DC'
    // Zeitrelais
    timerMode?: 'on-delay' | 'off-delay'
    timerSeconds?: number
    // Reihenklemme: farbliche Zuordnung zur Spannungsebene
    terminalLevel?: 'PE' | 'N' | 'L' | '24VDC' | '0V' | 'none'
  }
}

export interface Wire {
  id: string
  fromInstanceId: string
  fromConnectionId: string
  toInstanceId: string
  toConnectionId: string
  color: WireColor
  crossSection?: number  // mm²
  label?: string
  waypoints: Array<{ x: number; y: number }>
}

export interface DINRail {
  id: string
  label: string
  lengthTE: number
  yPosition: number
  placedComponents: PlacedComponent[]
}

export interface Schaltschrank {
  id: string
  name: string
  description: string
  createdAt: string
  modifiedAt: string
  rails: DINRail[]
  wires: Wire[]
}
