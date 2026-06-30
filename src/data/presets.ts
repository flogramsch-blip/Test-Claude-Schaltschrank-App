import type { WireColor } from '@/types/components'

export interface PresetComponent {
  key: string
  definitionId: string
  railIndex: number
  tePosition: number
  label: string
  settings?: { nominalCurrent?: number; tripCurve?: string; residualCurrent?: number }
}

export interface PresetWire {
  from: [string, string]  // [componentKey, connectionId]
  to: [string, string]
  color: WireColor
}

export interface Preset {
  id: string
  name: string
  description: string
  components: PresetComponent[]
  wires: PresetWire[]
}

// Stern-Dreieck-Anlauf: Motorschutz Q1 + 3 Schütze (K1 Netz, K2 Dreieck, K3 Stern) + Zeitrelais K1T.
// Der Hauptstromkreis (Einspeisung → Q1 → Schütze) ist vorverdrahtet; die Brücken zum Motor
// bleiben als Übung offen.
export const STERN_DREIECK_PRESET: Preset = {
  id: 'stern-dreieck',
  name: 'Stern-Dreieck-Anlauf',
  description: 'Motorschutzschalter, drei Schütze und Zeitrelais – Hauptstromkreis vorverdrahtet.',
  components: [
    { key: 'Q1', definitionId: 'motorschutz-3p', railIndex: 0, tePosition: 1,  label: 'Q1', settings: { nominalCurrent: 6.3 } },
    { key: 'K1', definitionId: 'schuetz-3p',      railIndex: 0, tePosition: 6,  label: 'K1', settings: { nominalCurrent: 9 } },
    { key: 'K2', definitionId: 'schuetz-3p',      railIndex: 0, tePosition: 11, label: 'K2', settings: { nominalCurrent: 9 } },
    { key: 'K3', definitionId: 'schuetz-3p',      railIndex: 0, tePosition: 16, label: 'K3', settings: { nominalCurrent: 9 } },
    { key: 'K1T', definitionId: 'zeitrelais',     railIndex: 0, tePosition: 21, label: 'K1T' },
  ],
  wires: [
    // Q1-Ausgänge (T1/T2/T3) → Netzschütz K1-Eingänge (1/3/5)
    { from: ['Q1', '2'], to: ['K1', '1'], color: 'brown' },
    { from: ['Q1', '4'], to: ['K1', '3'], color: 'black' },
    { from: ['Q1', '6'], to: ['K1', '5'], color: 'grey' },
    // Netzschütz K1-Ausgänge → Dreieckschütz K2-Eingänge
    { from: ['K1', '2'], to: ['K2', '1'], color: 'brown' },
    { from: ['K1', '4'], to: ['K2', '3'], color: 'black' },
    { from: ['K1', '6'], to: ['K2', '5'], color: 'grey' },
    // Sternschütz K3 parallel an K1-Ausgänge (Sternpunkt-Bildung an K3-Ausgängen)
    { from: ['K1', '2'], to: ['K3', '1'], color: 'brown' },
    { from: ['K1', '4'], to: ['K3', '3'], color: 'black' },
    { from: ['K1', '6'], to: ['K3', '5'], color: 'grey' },
  ],
}

export const PRESETS: Preset[] = [STERN_DREIECK_PRESET]
