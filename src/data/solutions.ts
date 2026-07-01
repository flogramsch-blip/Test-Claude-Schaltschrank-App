import type { Preset } from '@/data/presets'

// Musterlösungen je Übung – erfüllen jeweils die Prüfkriterien der Aufgabe.
export const SOLUTIONS: Record<string, Preset> = {
  ex1: {
    id: 'sol-ex1', name: 'Lösung 1', description: 'LSS 1-polig, 16 A',
    components: [{ key: 'Q1', definitionId: 'lss-1p', railIndex: 0, tePosition: 2, label: 'Q1', settings: { nominalCurrent: 16 } }],
    wires: [],
  },
  ex2: {
    id: 'sol-ex2', name: 'Lösung 2', description: 'FI-Schutzschalter',
    components: [{ key: 'F1', definitionId: 'fi-2p', railIndex: 0, tePosition: 2, label: 'F1' }],
    wires: [],
  },
  ex3: {
    id: 'sol-ex3', name: 'Lösung 3', description: 'FI + LSS verdrahtet',
    components: [
      { key: 'F1', definitionId: 'fi-2p', railIndex: 0, tePosition: 2, label: 'F1' },
      { key: 'Q1', definitionId: 'lss-1p', railIndex: 0, tePosition: 6, label: 'Q1', settings: { nominalCurrent: 16 } },
    ],
    wires: [{ from: ['F1', 'L-out'], to: ['Q1', '1'], color: 'brown' }],
  },
  ex4: {
    id: 'sol-ex4', name: 'Lösung 4', description: 'Motorschutz → Schütz',
    components: [
      { key: 'Q1', definitionId: 'motorschutz-3p', railIndex: 0, tePosition: 2, label: 'Q1', settings: { nominalCurrent: 6.3 } },
      { key: 'K1', definitionId: 'schuetz-3p', railIndex: 0, tePosition: 7, label: 'K1' },
    ],
    wires: [
      { from: ['Q1', '2'], to: ['K1', '1'], color: 'brown' },
      { from: ['Q1', '4'], to: ['K1', '3'], color: 'black' },
      { from: ['Q1', '6'], to: ['K1', '5'], color: 'grey' },
    ],
  },
  ex5: {
    id: 'sol-ex5', name: 'Lösung 5', description: 'PE-Klemme + Steuertrafo',
    components: [
      { key: 'X1', definitionId: 'pe-klemme', railIndex: 0, tePosition: 2, label: 'X1' },
      { key: 'T1', definitionId: 'transformator', railIndex: 0, tePosition: 4, label: 'T1' },
    ],
    wires: [],
  },
  ex6: {
    id: 'sol-ex6', name: 'Lösung 6', description: 'Wendeschützschaltung',
    components: [
      { key: 'Q1', definitionId: 'motorschutz-3p', railIndex: 0, tePosition: 2, label: 'Q1', settings: { nominalCurrent: 6.3 } },
      { key: 'K1', definitionId: 'schuetz-3p', railIndex: 0, tePosition: 7, label: 'K1' },
      { key: 'K2', definitionId: 'schuetz-3p', railIndex: 0, tePosition: 12, label: 'K2' },
    ],
    wires: [
      { from: ['Q1', '2'], to: ['K1', '1'], color: 'brown' },
      { from: ['Q1', '4'], to: ['K1', '3'], color: 'black' },
      { from: ['Q1', '6'], to: ['K1', '5'], color: 'grey' },
      { from: ['Q1', '2'], to: ['K2', '1'], color: 'brown' },
      { from: ['Q1', '4'], to: ['K2', '5'], color: 'grey' },
    ],
  },
  ex7: {
    id: 'sol-ex7', name: 'Lösung 7', description: 'Selbsthaltung',
    components: [
      { key: 'S1', definitionId: 'taster-no', railIndex: 0, tePosition: 2, label: 'S1' },
      { key: 'S2', definitionId: 'taster-nc', railIndex: 0, tePosition: 4, label: 'S2' },
      { key: 'K1', definitionId: 'schuetz-3p', railIndex: 0, tePosition: 6, label: 'K1' },
    ],
    wires: [{ from: ['S1', '14'], to: ['K1', 'A1'], color: 'red' }],
  },
  ex8: {
    id: 'sol-ex8', name: 'Lösung 8', description: 'Not-Aus im Steuerkreis',
    components: [
      { key: 'S0', definitionId: 'not-aus', railIndex: 0, tePosition: 2, label: 'S0' },
      { key: 'K1', definitionId: 'schuetz-3p', railIndex: 0, tePosition: 5, label: 'K1' },
    ],
    wires: [{ from: ['S0', '12'], to: ['K1', 'A1'], color: 'red' }],
  },
  ex9: {
    id: 'sol-ex9', name: 'Lösung 9', description: 'Beleuchtung mit Zeitrelais',
    components: [
      { key: 'K1T', definitionId: 'zeitrelais', railIndex: 0, tePosition: 2, label: 'K1T' },
      { key: 'S1', definitionId: 'taster-no', railIndex: 0, tePosition: 4, label: 'S1' },
      { key: 'P1', definitionId: 'meldeleuchte', railIndex: 0, tePosition: 6, label: 'P1' },
    ],
    wires: [{ from: ['S1', '14'], to: ['K1T', '15'], color: 'red' }],
  },
  ex10: {
    id: 'sol-ex10', name: 'Lösung 10', description: 'Kompletter Motorabgang',
    components: [
      { key: 'F1', definitionId: 'fi-4p', railIndex: 0, tePosition: 1, label: 'F1' },
      { key: 'Q1', definitionId: 'motorschutz-3p', railIndex: 0, tePosition: 6, label: 'Q1', settings: { nominalCurrent: 6.3 } },
      { key: 'K1', definitionId: 'schuetz-3p', railIndex: 0, tePosition: 10, label: 'K1' },
      { key: 'P1', definitionId: 'meldeleuchte', railIndex: 0, tePosition: 15, label: 'P1' },
      { key: 'X1', definitionId: 'pe-klemme', railIndex: 0, tePosition: 17, label: 'X1' },
    ],
    wires: [
      { from: ['Q1', '2'], to: ['K1', '1'], color: 'brown' },
      { from: ['Q1', '4'], to: ['K1', '3'], color: 'black' },
      { from: ['Q1', '6'], to: ['K1', '5'], color: 'grey' },
    ],
  },
}
