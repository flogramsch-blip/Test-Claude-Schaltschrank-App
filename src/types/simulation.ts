export interface NodeState {
  nodeId: string
  voltage: number  // V relative to PE
  phase?: 'L1' | 'L2' | 'L3' | 'N' | 'PE'
}

export interface BranchState {
  wireId: string
  current: number  // A
  energized: boolean
}

export interface ComponentSimState {
  instanceId: string
  tripped: boolean
  closed: boolean  // for contactors
  currentL1: number
  currentL2: number
  currentL3: number
  powerDissipation: number  // W
  tripReason?: string
  energized: boolean  // has voltage on input
}

export interface ActiveFault {
  id: string
  type: 'short-circuit' | 'overcurrent' | 'residual-current'
  wireId?: string
  instanceId?: string
  faultCurrent: number  // A
}

export interface SelectivityEntry {
  instanceId: string
  label: string
  tripTime: number  // ms
  tripCurrent: number  // A
  willTrip: boolean
}

export interface SelectivityResult {
  faultCurrent: number
  entries: SelectivityEntry[]
  selectiveOrder: string[]  // instanceIds in order of tripping
}

export interface SimulationState {
  running: boolean
  networkVoltage: number  // V (230 L-N, 400 L-L)
  frequency: number  // Hz
  nodes: Map<string, NodeState>
  branches: Map<string, BranchState>
  componentStates: Map<string, ComponentSimState>
  faults: ActiveFault[]
  selectivityResult?: SelectivityResult
  timestamp: number
}
