import type { Schaltschrank, PlacedComponent } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

export interface ExerciseStep {
  label: string
  done: boolean
}

export interface Exercise {
  id: string
  nr: number
  title: string
  difficulty: 'Einsteiger' | 'Leicht' | 'Mittel'
  task: string
  hints: string[]
  check: (s: Schaltschrank) => ExerciseStep[]
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────
function allComponents(s: Schaltschrank): PlacedComponent[] {
  return s.rails.flatMap(r => r.placedComponents)
}

function compType(c: PlacedComponent): string | undefined {
  return COMPONENT_MAP.get(c.definitionId)?.electricalModel.type
}

function countByDefinition(s: Schaltschrank, defId: string): number {
  return allComponents(s).filter(c => c.definitionId === defId).length
}

function countByType(s: Schaltschrank, type: string): number {
  return allComponents(s).filter(c => compType(c) === type).length
}

function countByDefinitionPrefix(s: Schaltschrank, prefix: string): number {
  return allComponents(s).filter(c => c.definitionId.startsWith(prefix)).length
}

// Zählt Leitungen zwischen zwei Bauteil-Mengen (richtungsunabhängig)
function wiresBetween(
  s: Schaltschrank,
  isA: (c: PlacedComponent) => boolean,
  isB: (c: PlacedComponent) => boolean,
): number {
  const byId = new Map(allComponents(s).map(c => [c.instanceId, c]))
  let count = 0
  for (const w of s.wires) {
    const from = byId.get(w.fromInstanceId)
    const to = byId.get(w.toInstanceId)
    if (!from || !to) continue
    if ((isA(from) && isB(to)) || (isA(to) && isB(from))) count++
  }
  return count
}

// ── Die 5 Einführungs-Übungen ────────────────────────────────────────────
export const EXERCISES: Exercise[] = [
  {
    id: 'ex1',
    nr: 1,
    title: 'Erste Hutschiene bestücken',
    difficulty: 'Einsteiger',
    task: 'Ziehe einen Leitungsschutzschalter 1-polig (LSS 1P) aus der Palette auf eine Hutschiene und stelle im Eigenschaften-Panel den Nennstrom auf 16 A.',
    hints: [
      'Die Palette ist links – Kategorie „Schutzorgane".',
      'Bauteil anklicken und auf die graue Schiene ziehen.',
      'Danach das platzierte Bauteil anklicken → rechts Nennstrom wählen.',
    ],
    check: (s) => {
      const lss = allComponents(s).filter(c => c.definitionId === 'lss-1p')
      return [
        { label: 'Ein LSS 1-polig platziert', done: lss.length >= 1 },
        { label: 'Nennstrom auf 16 A gestellt', done: lss.some(c => c.settings.nominalCurrent === 16) },
      ]
    },
  },
  {
    id: 'ex2',
    nr: 2,
    title: 'Fehlerstromschutz einbauen',
    difficulty: 'Einsteiger',
    task: 'Platziere einen FI-Schutzschalter (2- oder 4-polig). Der FI schützt Personen vor gefährlichen Fehlerströmen.',
    hints: [
      'Kategorie „Schutzorgane" → FI-Schutzschalter.',
      'Ein FI braucht mehr Platz (2 bzw. 4 TE) – achte auf freien Raum auf der Schiene.',
    ],
    check: (s) => {
      return [
        { label: 'Ein FI-Schutzschalter platziert', done: countByType(s, 'rcd') >= 1 },
      ]
    },
  },
  {
    id: 'ex3',
    nr: 3,
    title: 'Absicherung verdrahten',
    difficulty: 'Leicht',
    task: 'Baue FI + LSS auf und verbinde sie: Verdrahte einen Ausgang des FI-Schutzschalters mit einem Eingang eines LSS. Wechsle dazu in den Modus „Verdrahten" (Taste W).',
    hints: [
      'Erst beide Bauteile platzieren (FI und einen LSS).',
      'Oben auf „Verdrahten" klicken oder Taste W drücken.',
      'Leitungsfarbe wählen, dann erst die FI-Klemme, dann die LSS-Klemme anklicken.',
    ],
    check: (s) => {
      const hasFI = countByType(s, 'rcd') >= 1
      const hasLSS = countByDefinitionPrefix(s, 'lss-') >= 1
      const wired = wiresBetween(
        s,
        c => compType(c) === 'rcd',
        c => c.definitionId.startsWith('lss-'),
      ) >= 1
      return [
        { label: 'FI-Schutzschalter vorhanden', done: hasFI },
        { label: 'LSS vorhanden', done: hasLSS },
        { label: 'Leitung FI ↔ LSS gezogen', done: wired },
      ]
    },
  },
  {
    id: 'ex4',
    nr: 4,
    title: 'Motorabgang aufbauen',
    difficulty: 'Mittel',
    task: 'Platziere einen Motorschutzschalter und ein Schütz und verbinde die drei Motorschutz-Ausgänge (T1/T2/T3) mit den drei Schütz-Eingängen (1/3/5) – also 3 Leitungen. Tipp: Das Stern-Dreieck-Set liefert eine vorverdrahtete Vorlage.',
    hints: [
      'Motorschutzschalter und Schütz findest du in „Schutzorgane" bzw. „Schaltgeräte".',
      'Im Verdrahten-Modus drei Leitungen ziehen: T1→1, T2→3, T3→5.',
      'Über den Button „Stern-Dreieck-Set einfügen" bekommst du eine fertige Vorlage zum Ansehen.',
    ],
    check: (s) => {
      const hasMSS = countByType(s, 'motor-protection') >= 1
      const hasSchuetz = countByType(s, 'contactor') >= 1
      const wires = wiresBetween(
        s,
        c => compType(c) === 'motor-protection',
        c => compType(c) === 'contactor',
      )
      return [
        { label: 'Motorschutzschalter vorhanden', done: hasMSS },
        { label: 'Schütz vorhanden', done: hasSchuetz },
        { label: `3 Leitungen MSS → Schütz (${Math.min(wires, 3)}/3)`, done: wires >= 3 },
      ]
    },
  },
  {
    id: 'ex5',
    nr: 5,
    title: 'Schutzleiter & Steuerspannung',
    difficulty: 'Mittel',
    task: 'Vervollständige den Schrank: Platziere eine PE-Klemme (Schutzleiter) und eine Steuerspannungsquelle – entweder einen Steuertransformator oder ein 24V-Schaltnetzteil.',
    hints: [
      'PE-Klemme findest du in „Klemmen" (grün-gelb).',
      'Transformator: Kategorie „Stromversorgung". Netzteil 24V ebenfalls dort.',
    ],
    check: (s) => {
      const hasPE = countByDefinition(s, 'pe-klemme') >= 1
      const hasSteuer = countByType(s, 'transformer') >= 1 || countByType(s, 'power-supply') >= 1
      return [
        { label: 'PE-Klemme platziert', done: hasPE },
        { label: 'Steuertrafo oder 24V-Netzteil platziert', done: hasSteuer },
      ]
    },
  },
]

export function isExerciseDone(steps: ExerciseStep[]): boolean {
  return steps.length > 0 && steps.every(st => st.done)
}
