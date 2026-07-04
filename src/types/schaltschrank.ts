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
    // SPS: symbolische Namen der Ein-/Ausgänge (Operanden), key = connectionId
    ioNames?: Record<string, string>
    // SPS: Verknüpfungslogik je Ausgang. key = Ausgangs-connectionId (z. B. Q1 / Q0.0)
    // Wert = ODER-verknüpfte Zeilen (Rungs); jede Zeile = UND-verknüpfte Terme.
    // term.ref verweist auf eine Ein-/Ausgangs-connectionId derselben SPS
    // (Ausgänge erlauben Selbsthaltung). negated = Öffner-Kontakt (NICHT).
    plcLogic?: Record<string, PlcRung[]>
  }
}

/** Ein Term in der SPS-Verknüpfung: Verweis auf einen Operanden (I/Q) der SPS. */
export interface PlcTerm {
  ref: string       // connectionId eines Ein-/Ausgangs derselben SPS
  negated: boolean  // true = Öffner (NICHT-Kontakt)
}
/** Eine UND-verknüpfte Kontaktreihe (Strompfad). Mehrere Zeilen = ODER. */
export type PlcRung = PlcTerm[]

/** Frei platziertes HMI-Gerät auf der Fronttür/Frontplatte */
export interface PanelComponent {
  instanceId: string
  definitionId: string
  x: number   // freie Position auf der Frontplatte (px)
  y: number
  settings: PlacedComponent['settings']
}

export type CrossingSystem = 'harting' | 'conduit' | 'terminal'

/** Festes Übergabefeld (Klemmen-/Steckerblock) an der Gehäusewand,
 *  auf beiden Flächen (Innenausbau + Außeneinheit) gespiegelt sichtbar. */
export interface InterfacePanel {
  id: string
  label: string
  system: 'harting' | 'terminal'
  pinCount: number
  orientation?: 'horizontal' | 'vertical'  // vertikal = Industriestecker an der Seitenwand
  interior: { x: number; y: number }
  door: { x: number; y: number }
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
  crossing?: CrossingSystem  // Durchführung bei flächenübergreifenden Leitungen
  crossingRotated?: boolean  // Durchführungs-Symbol um 90° gedreht (Seiteneinführung)
}

export interface DINRail {
  id: string
  label: string
  lengthTE: number
  yPosition: number
  placedComponents: PlacedComponent[]
  railType?: 'din' | 'sps'  // Hutschiene (Default) oder SPS-Profilschiene
}

export interface Schaltschrank {
  id: string
  name: string
  description: string
  createdAt: string
  modifiedAt: string
  rails: DINRail[]
  wires: Wire[]
  panelComponents?: PanelComponent[]  // Fronttür/Frontplatte (frei platziert)
  interfacePanel?: InterfacePanel     // festes Übergabefeld (beide Flächen)
}
