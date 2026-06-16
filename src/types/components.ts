export type WireColor =
  | 'brown'
  | 'black'
  | 'grey'
  | 'blue'
  | 'green-yellow'
  | 'red'
  | 'orange'
  | 'purple'
  | 'white'

export type ConnectionType = 'input' | 'output' | 'neutral' | 'pe' | 'control-in' | 'control-out' | 'bidirectional'

export type ComponentCategory =
  | 'protection'
  | 'switching'
  | 'terminal'
  | 'power'
  | 'fuse'

export type TripCurve = 'B' | 'C' | 'D' | 'gG' | 'thermal-magnetic'

export interface ConnectionPoint {
  id: string
  label: string
  type: ConnectionType
  relativeX: number  // in TE units from left edge
  relativeY: number  // 0 = top, 1 = bottom
  phase?: 'L1' | 'L2' | 'L3' | 'N' | 'PE' | 'A1' | 'A2'
}

export interface ElectricalModel {
  type: 'breaker' | 'motor-protection' | 'rcd' | 'contactor' | 'terminal' | 'fuse' | 'transformer' | 'relay'
  nominalCurrentDefault: number
  nominalCurrentOptions?: number[]
  breakingCapacity?: number  // kA
  tripCurve?: TripCurve
  residualCurrentDefault?: number  // mA for RCDs
  internalResistance?: number  // Ω
  poleCount: number
}

export interface ComponentDefinition {
  id: string
  name: string
  shortName: string
  category: ComponentCategory
  teWidth: number
  connections: ConnectionPoint[]
  electricalModel: ElectricalModel
  description: string
  color: string  // primary housing accent color for SVG
}
