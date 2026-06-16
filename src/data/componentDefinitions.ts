import type { ComponentDefinition } from '@/types/components'

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  // ─── Leitungsschutzschalter 1-polig ───────────────────────────────────
  {
    id: 'lss-1p',
    name: 'Leitungsschutzschalter 1-polig',
    shortName: 'LSS 1P',
    category: 'protection',
    teWidth: 1,
    color: '#f97316',
    connections: [
      { id: '1', label: '1', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: '2', label: '2', type: 'output', relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'breaker',
      nominalCurrentDefault: 16,
      nominalCurrentOptions: [6, 10, 13, 16, 20, 25, 32, 40, 50, 63],
      breakingCapacity: 6,
      tripCurve: 'C',
      internalResistance: 0.01,
      poleCount: 1,
    },
    description: 'Der Leitungsschutzschalter (LSS) schützt Leitungen vor Überlast und Kurzschluss. Auslösekennlinien: B (3-5×In, z.B. Licht), C (5-10×In, Allgemein), D (10-20×In, Motoren).',
  },

  // ─── Leitungsschutzschalter 2-polig ───────────────────────────────────
  {
    id: 'lss-2p',
    name: 'Leitungsschutzschalter 2-polig',
    shortName: 'LSS 2P',
    category: 'protection',
    teWidth: 2,
    color: '#f97316',
    connections: [
      { id: '1', label: '1', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: '3', label: '3', type: 'input',  relativeX: 1.5, relativeY: 0 },
      { id: '2', label: '2', type: 'output', relativeX: 0.5, relativeY: 1 },
      { id: '4', label: '4', type: 'output', relativeX: 1.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'breaker',
      nominalCurrentDefault: 16,
      nominalCurrentOptions: [6, 10, 13, 16, 20, 25, 32, 40, 50, 63],
      breakingCapacity: 6,
      tripCurve: 'C',
      internalResistance: 0.01,
      poleCount: 2,
    },
    description: 'Zweipoliger LSS für L+N-Trennung. Schützt einphasige Verbraucher mit gleichzeitiger Nullleitertrennung.',
  },

  // ─── Leitungsschutzschalter 3-polig ───────────────────────────────────
  {
    id: 'lss-3p',
    name: 'Leitungsschutzschalter 3-polig',
    shortName: 'LSS 3P',
    category: 'protection',
    teWidth: 3,
    color: '#f97316',
    connections: [
      { id: '1', label: '1', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: '3', label: '3', type: 'input',  relativeX: 1.5, relativeY: 0 },
      { id: '5', label: '5', type: 'input',  relativeX: 2.5, relativeY: 0 },
      { id: '2', label: '2', type: 'output', relativeX: 0.5, relativeY: 1 },
      { id: '4', label: '4', type: 'output', relativeX: 1.5, relativeY: 1 },
      { id: '6', label: '6', type: 'output', relativeX: 2.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'breaker',
      nominalCurrentDefault: 16,
      nominalCurrentOptions: [6, 10, 13, 16, 20, 25, 32, 40, 50, 63],
      breakingCapacity: 6,
      tripCurve: 'C',
      internalResistance: 0.01,
      poleCount: 3,
    },
    description: 'Dreipoliger LSS für dreiphasige Verbraucher. Klemmenbezeichnung nach IEC 60947: ungerade = Eingang, gerade = Ausgang.',
  },

  // ─── Motorschutzschalter ──────────────────────────────────────────────
  {
    id: 'motorschutz-3p',
    name: 'Motorschutzschalter 3-polig',
    shortName: 'MSS',
    category: 'protection',
    teWidth: 3,
    color: '#3b82f6',
    connections: [
      { id: '1', label: '1',  type: 'input',       relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: '3', label: '3',  type: 'input',       relativeX: 1.5, relativeY: 0, phase: 'L2' },
      { id: '5', label: '5',  type: 'input',       relativeX: 2.5, relativeY: 0, phase: 'L3' },
      { id: '2', label: 'T1', type: 'output',      relativeX: 0.5, relativeY: 1, phase: 'L1' },
      { id: '4', label: 'T2', type: 'output',      relativeX: 1.5, relativeY: 1, phase: 'L2' },
      { id: '6', label: 'T3', type: 'output',      relativeX: 2.5, relativeY: 1, phase: 'L3' },
    ],
    electricalModel: {
      type: 'motor-protection',
      nominalCurrentDefault: 6,
      nominalCurrentOptions: [0.16, 0.25, 0.4, 0.63, 1, 1.6, 2.5, 4, 6.3, 10, 16, 25],
      breakingCapacity: 100,
      tripCurve: 'thermal-magnetic',
      internalResistance: 0.02,
      poleCount: 3,
    },
    description: 'Der Motorschutzschalter (MSS) schützt Elektromotoren vor Überlast, Kurzschluss und Phasenausfall. Einstellbarer Strombereich. Bimetallauslöser für thermischen Schutz.',
  },

  // ─── FI-Schutzschalter 2-polig ────────────────────────────────────────
  {
    id: 'fi-2p',
    name: 'FI-Schutzschalter 2-polig',
    shortName: 'RCD 2P',
    category: 'protection',
    teWidth: 2,
    color: '#a855f7',
    connections: [
      { id: 'L-in',  label: 'L',  type: 'input',   relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: 'N-in',  label: 'N',  type: 'neutral',  relativeX: 1.5, relativeY: 0, phase: 'N' },
      { id: 'L-out', label: 'L',  type: 'output',  relativeX: 0.5, relativeY: 1, phase: 'L1' },
      { id: 'N-out', label: 'N',  type: 'output',  relativeX: 1.5, relativeY: 1, phase: 'N' },
    ],
    electricalModel: {
      type: 'rcd',
      nominalCurrentDefault: 25,
      nominalCurrentOptions: [16, 25, 40, 63],
      residualCurrentDefault: 30,
      breakingCapacity: 6,
      internalResistance: 0.01,
      poleCount: 2,
    },
    description: 'FI-Schutzschalter (Fehlerstromschutzschalter / RCD) löst bei Fehlerströmen ≥ 30 mA aus und schützt vor gefährlichen Körperströmen. Pflicht in Feuchträumen und Außenanlagen.',
  },

  // ─── FI-Schutzschalter 4-polig ────────────────────────────────────────
  {
    id: 'fi-4p',
    name: 'FI-Schutzschalter 4-polig',
    shortName: 'RCD 4P',
    category: 'protection',
    teWidth: 4,
    color: '#a855f7',
    connections: [
      { id: 'L1-in', label: 'L1', type: 'input',   relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: 'L2-in', label: 'L2', type: 'input',   relativeX: 1.5, relativeY: 0, phase: 'L2' },
      { id: 'L3-in', label: 'L3', type: 'input',   relativeX: 2.5, relativeY: 0, phase: 'L3' },
      { id: 'N-in',  label: 'N',  type: 'neutral',  relativeX: 3.5, relativeY: 0, phase: 'N' },
      { id: 'L1-out',label: 'L1', type: 'output',  relativeX: 0.5, relativeY: 1, phase: 'L1' },
      { id: 'L2-out',label: 'L2', type: 'output',  relativeX: 1.5, relativeY: 1, phase: 'L2' },
      { id: 'L3-out',label: 'L3', type: 'output',  relativeX: 2.5, relativeY: 1, phase: 'L3' },
      { id: 'N-out', label: 'N',  type: 'output',  relativeX: 3.5, relativeY: 1, phase: 'N' },
    ],
    electricalModel: {
      type: 'rcd',
      nominalCurrentDefault: 40,
      nominalCurrentOptions: [25, 40, 63, 80],
      residualCurrentDefault: 30,
      breakingCapacity: 6,
      internalResistance: 0.01,
      poleCount: 4,
    },
    description: 'Vierpoliger FI für dreiphasige Anlagen (L1/L2/L3+N). Schützt gesamte Unterverteilungen vor Fehlerströmen.',
  },

  // ─── Schütz ───────────────────────────────────────────────────────────
  {
    id: 'schuetz-3p',
    name: 'Schütz 3-polig',
    shortName: 'Schütz',
    category: 'switching',
    teWidth: 4,
    color: '#10b981',
    connections: [
      { id: '1',  label: 'L1', type: 'input',       relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: '3',  label: 'L2', type: 'input',       relativeX: 1.5, relativeY: 0, phase: 'L2' },
      { id: '5',  label: 'L3', type: 'input',       relativeX: 2.5, relativeY: 0, phase: 'L3' },
      { id: 'A1', label: 'A1', type: 'control-in',  relativeX: 3.5, relativeY: 0 },
      { id: '2',  label: 'T1', type: 'output',      relativeX: 0.5, relativeY: 1, phase: 'L1' },
      { id: '4',  label: 'T2', type: 'output',      relativeX: 1.5, relativeY: 1, phase: 'L2' },
      { id: '6',  label: 'T3', type: 'output',      relativeX: 2.5, relativeY: 1, phase: 'L3' },
      { id: 'A2', label: 'A2', type: 'control-out', relativeX: 3.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'contactor',
      nominalCurrentDefault: 9,
      nominalCurrentOptions: [9, 12, 18, 25, 32, 40, 65, 80, 95],
      internalResistance: 0.005,
      poleCount: 3,
    },
    description: 'Der Schütz schaltet große Lasten über eine Steuerspannung (A1/A2). Hauptkontakte (1-6) für den Laststromkreis, Spule (A1/A2) für die Steuerung. Typische Spulenspannungen: 24V DC, 230V AC.',
  },

  // ─── Relais ───────────────────────────────────────────────────────────
  {
    id: 'relais',
    name: 'Relais',
    shortName: 'Relais',
    category: 'switching',
    teWidth: 2,
    color: '#f59e0b',
    connections: [
      { id: 'A1',  label: 'A1', type: 'control-in',  relativeX: 0.5, relativeY: 0 },
      { id: '13',  label: '13', type: 'input',        relativeX: 1.5, relativeY: 0 },
      { id: 'A2',  label: 'A2', type: 'control-out', relativeX: 0.5, relativeY: 1 },
      { id: '14',  label: '14', type: 'output',       relativeX: 1.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'relay',
      nominalCurrentDefault: 6,
      nominalCurrentOptions: [6, 10, 16],
      internalResistance: 0.01,
      poleCount: 1,
    },
    description: 'Relais zur Steuerung und galvanischen Trennung. Spule A1/A2 zieht an und schließt Hilfskontakte (13/14 = Schließer, 11/12 = Öffner).',
  },

  // ─── Reihenklemme ─────────────────────────────────────────────────────
  {
    id: 'klemme',
    name: 'Reihenklemme',
    shortName: 'Klemme',
    category: 'terminal',
    teWidth: 1,
    color: '#6b7280',
    connections: [
      { id: 'top',    label: 'X', type: 'bidirectional', relativeX: 0.5, relativeY: 0 },
      { id: 'bottom', label: 'X', type: 'bidirectional', relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'terminal',
      nominalCurrentDefault: 16,
      nominalCurrentOptions: [10, 16, 32, 63],
      internalResistance: 0.001,
      poleCount: 1,
    },
    description: 'Reihenklemme zur Verbindung und Abzweigung von Leitern. Schraubklemme nach IEC 60947-7. Typisch für Klemmenblöcke im Schaltschrank.',
  },

  // ─── PE-Klemme ────────────────────────────────────────────────────────
  {
    id: 'pe-klemme',
    name: 'PE-Klemme (Schutzleiter)',
    shortName: 'PE',
    category: 'terminal',
    teWidth: 1,
    color: '#16a34a',
    connections: [
      { id: 'top',    label: 'PE', type: 'pe', relativeX: 0.5, relativeY: 0, phase: 'PE' },
      { id: 'bottom', label: 'PE', type: 'pe', relativeX: 0.5, relativeY: 1, phase: 'PE' },
    ],
    electricalModel: {
      type: 'terminal',
      nominalCurrentDefault: 16,
      nominalCurrentOptions: [10, 16, 32],
      internalResistance: 0.0005,
      poleCount: 1,
    },
    description: 'Schutzleiterklemme (grün-gelb). Direkt mit dem PE-Sammelleiter verbunden. Pflicht für alle Betriebsmittel mit Berührschutz.',
  },

  // ─── NH-Sicherung ─────────────────────────────────────────────────────
  {
    id: 'nh-sicherung',
    name: 'NH-Sicherungsleiste',
    shortName: 'NH-Sich.',
    category: 'fuse',
    teWidth: 3,
    color: '#dc2626',
    connections: [
      { id: 'in',  label: '1', type: 'input',  relativeX: 1.5, relativeY: 0 },
      { id: 'out', label: '2', type: 'output', relativeX: 1.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'fuse',
      nominalCurrentDefault: 63,
      nominalCurrentOptions: [16, 25, 35, 50, 63, 80, 100, 125, 160, 200, 250],
      breakingCapacity: 120,
      tripCurve: 'gG',
      internalResistance: 0.003,
      poleCount: 1,
    },
    description: 'NH-Sicherung (Niederspannungs-Hochleistungs-Sicherung) für hohe Kurzschlussströme bis 120 kA. gG-Kennlinie: Allgemeine Anwendung. Sicherungseinsatz wechselbar.',
  },

  // ─── Transformator ────────────────────────────────────────────────────
  {
    id: 'transformator',
    name: 'Steuertransformator',
    shortName: 'Trafo',
    category: 'power',
    teWidth: 4,
    color: '#0ea5e9',
    connections: [
      { id: 'L1-in',  label: 'L1',   type: 'input',  relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: 'N-in',   label: 'N',    type: 'neutral', relativeX: 1.5, relativeY: 0, phase: 'N' },
      { id: '24V-out',label: '24V',  type: 'output', relativeX: 2.5, relativeY: 1 },
      { id: '0V-out', label: '0V',   type: 'output', relativeX: 3.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'transformer',
      nominalCurrentDefault: 4,
      nominalCurrentOptions: [1, 2, 4, 6.3, 10, 16, 25, 40, 63],
      internalResistance: 0.5,
      poleCount: 1,
    },
    description: 'Steuertransformator wandelt 230V/400V in Steuerspannung (typisch 24V AC/DC) um. Galvanische Trennung zwischen Haupt- und Steuerkreis. Leistung in VA angegeben.',
  },
]

export const COMPONENT_MAP = new Map<string, ComponentDefinition>(
  COMPONENT_DEFINITIONS.map(d => [d.id, d])
)

export const CATEGORIES: Array<{ id: string; label: string; order: number }> = [
  { id: 'protection', label: 'Schutzorgane', order: 1 },
  { id: 'switching',  label: 'Schaltgeräte', order: 2 },
  { id: 'terminal',   label: 'Klemmen',      order: 3 },
  { id: 'fuse',       label: 'Sicherungen',  order: 4 },
  { id: 'power',      label: 'Stromversorgung', order: 5 },
]
