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
  difficulty: 'Einsteiger' | 'Leicht' | 'Mittel' | 'Profi'
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
  {
    id: 'ex6',
    nr: 6,
    title: 'Wendeschützschaltung',
    difficulty: 'Mittel',
    task: 'Eine Wendeschaltung dreht die Drehrichtung eines Motors um. Platziere einen Motorschutzschalter und zwei Schütze (K1 Rechtslauf, K2 Linkslauf) und verbinde beide Schütz-Eingänge mit den Motorschutz-Ausgängen (mindestens 4 Leitungen).',
    hints: [
      'Zwei Schütze platzieren – sie schalten später gegeneinander verriegelt.',
      'Vom Motorschutz (T1/T2/T3) zu beiden Schützen verdrahten.',
      'Tipp: Bei echter Wendeschaltung werden bei einem Schütz zwei Phasen getauscht.',
    ],
    check: (s) => {
      const hasMSS = countByType(s, 'motor-protection') >= 1
      const schuetze = countByType(s, 'contactor')
      const wires = wiresBetween(
        s,
        c => compType(c) === 'motor-protection',
        c => compType(c) === 'contactor',
      )
      return [
        { label: 'Motorschutzschalter vorhanden', done: hasMSS },
        { label: `Zwei Schütze platziert (${Math.min(schuetze, 2)}/2)`, done: schuetze >= 2 },
        { label: `Leitungen MSS → Schütze (${Math.min(wires, 4)}/4)`, done: wires >= 4 },
      ]
    },
  },
  {
    id: 'ex7',
    nr: 7,
    title: 'Selbsthaltung aufbauen',
    difficulty: 'Mittel',
    task: 'Baue einen Steuerstromkreis mit Selbsthaltung: EIN-Taster (Schließer), AUS-Taster (Öffner) und ein Schütz. Verbinde einen Taster mit der Schützspule (A1).',
    hints: [
      'EIN-Taster = Taster (Schließer), AUS-Taster = Taster (Öffner) aus „Befehls-/Meldegeräte".',
      'Die Spule des Schützes sind die Klemmen A1/A2.',
      'Im Verdrahten-Modus den Taster-Ausgang mit A1 des Schützes verbinden.',
    ],
    check: (s) => {
      const hasNO = countByDefinition(s, 'taster-no') >= 1
      const hasNC = countByDefinition(s, 'taster-nc') >= 1
      const hasSchuetz = countByType(s, 'contactor') >= 1
      const wiredToCoil = wiresBetween(
        s,
        c => compType(c) === 'button',
        c => compType(c) === 'contactor',
      ) >= 1
      return [
        { label: 'EIN-Taster (Schließer) platziert', done: hasNO },
        { label: 'AUS-Taster (Öffner) platziert', done: hasNC },
        { label: 'Schütz platziert', done: hasSchuetz },
        { label: 'Taster mit Schütz verbunden', done: wiredToCoil },
      ]
    },
  },
  {
    id: 'ex8',
    nr: 8,
    title: 'Not-Aus einbinden',
    difficulty: 'Mittel',
    task: 'Sicherheit zuerst: Platziere einen Not-Aus-Schalter und binde ihn in den Steuerkreis ein. Verbinde den Not-Aus mit einem Schütz, sodass im Notfall abgeschaltet wird.',
    hints: [
      'Der Not-Aus-Schalter liegt in „Schaltgeräte".',
      'Not-Aus immer in Reihe in den Steuerkreis (Öffnerkontakt 11-12).',
      'Verbinde einen Not-Aus-Kontakt mit der Schützspule oder dem Taster.',
    ],
    check: (s) => {
      const hasNotAus = countByType(s, 'emergency-stop') >= 1
      const hasSchuetz = countByType(s, 'contactor') >= 1
      const wired = wiresBetween(
        s,
        c => compType(c) === 'emergency-stop',
        c => compType(c) === 'contactor' || compType(c) === 'button',
      ) >= 1
      return [
        { label: 'Not-Aus-Schalter platziert', done: hasNotAus },
        { label: 'Schütz vorhanden', done: hasSchuetz },
        { label: 'Not-Aus in Steuerkreis verdrahtet', done: wired },
      ]
    },
  },
  {
    id: 'ex9',
    nr: 9,
    title: 'Beleuchtung mit Zeitrelais',
    difficulty: 'Leicht',
    task: 'Treppenhaus-Prinzip: Platziere ein Zeitrelais, einen Taster und eine Meldeleuchte (als Lampe). Verbinde den Taster mit dem Zeitrelais, damit das Licht zeitverzögert ausgeht.',
    hints: [
      'Zeitrelais aus „Schaltgeräte", Taster und Meldeleuchte aus „Befehls-/Meldegeräte".',
      'Taster-Ausgang mit dem Zeitrelais-Eingang verbinden.',
      'Die Meldeleuchte stellt die Treppenhausbeleuchtung dar.',
    ],
    check: (s) => {
      const hasTimer = countByDefinition(s, 'zeitrelais') >= 1
      const hasButton = countByType(s, 'button') >= 1
      const hasLamp = countByType(s, 'indicator') >= 1
      const wired = wiresBetween(
        s,
        c => compType(c) === 'button',
        c => c.definitionId === 'zeitrelais',
      ) >= 1
      return [
        { label: 'Zeitrelais platziert', done: hasTimer },
        { label: 'Taster platziert', done: hasButton },
        { label: 'Meldeleuchte platziert', done: hasLamp },
        { label: 'Taster mit Zeitrelais verbunden', done: wired },
      ]
    },
  },
  {
    id: 'ex10',
    nr: 10,
    title: 'Abschlussprüfung: Kompletter Motorabgang',
    difficulty: 'Profi',
    task: 'Baue einen vollständigen, normgerechten Motorabgang auf: FI-Schutzschalter, Motorschutzschalter, Schütz, eine Meldeleuchte (Betrieb) und eine PE-Klemme. Verdrahte Motorschutz → Schütz (3 Leitungen).',
    hints: [
      'Diese Aufgabe kombiniert alles aus den vorherigen Übungen.',
      'Reihenfolge im Hauptstromkreis: FI → Motorschutz → Schütz → Motor.',
      'Die Meldeleuchte zeigt den Betrieb an, die PE-Klemme den Schutzleiter.',
    ],
    check: (s) => {
      const hasFI = countByType(s, 'rcd') >= 1
      const hasMSS = countByType(s, 'motor-protection') >= 1
      const hasSchuetz = countByType(s, 'contactor') >= 1
      const hasLamp = countByType(s, 'indicator') >= 1
      const hasPE = countByDefinition(s, 'pe-klemme') >= 1
      const wires = wiresBetween(
        s,
        c => compType(c) === 'motor-protection',
        c => compType(c) === 'contactor',
      )
      return [
        { label: 'FI-Schutzschalter', done: hasFI },
        { label: 'Motorschutzschalter', done: hasMSS },
        { label: 'Schütz', done: hasSchuetz },
        { label: 'Meldeleuchte', done: hasLamp },
        { label: 'PE-Klemme', done: hasPE },
        { label: `Leitungen MSS → Schütz (${Math.min(wires, 3)}/3)`, done: wires >= 3 },
      ]
    },
  },
]

export function isExerciseDone(steps: ExerciseStep[]): boolean {
  return steps.length > 0 && steps.every(st => st.done)
}

// ── Auswertung über alle Übungen ─────────────────────────────────────────
export interface Evaluation {
  solved: number
  total: number
  percent: number
  stepsSolved: number
  stepsTotal: number
  grade: number       // deutsche Schulnote 1–6
  gradeLabel: string
}

const GRADE_LABELS: Record<number, string> = {
  1: 'Sehr gut',
  2: 'Gut',
  3: 'Befriedigend',
  4: 'Ausreichend',
  5: 'Mangelhaft',
  6: 'Ungenügend',
}

function percentToGrade(p: number): number {
  if (p >= 92) return 1
  if (p >= 81) return 2
  if (p >= 67) return 3
  if (p >= 50) return 4
  if (p >= 30) return 5
  return 6
}

export function evaluateAll(check: (id: string) => ExerciseStep[]): Evaluation {
  let solved = 0
  let stepsSolved = 0
  let stepsTotal = 0
  for (const ex of EXERCISES) {
    const steps = check(ex.id)
    stepsTotal += steps.length
    stepsSolved += steps.filter(st => st.done).length
    if (isExerciseDone(steps)) solved++
  }
  // Note basiert auf erreichten Teilschritten (feinere Bewertung)
  const percent = stepsTotal > 0 ? Math.round((stepsSolved / stepsTotal) * 100) : 0
  const grade = percentToGrade(percent)
  return {
    solved,
    total: EXERCISES.length,
    percent,
    stepsSolved,
    stepsTotal,
    grade,
    gradeLabel: GRADE_LABELS[grade],
  }
}
