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

  // ─── FI/LS-Kombischalter (RCBO) ───────────────────────────────────────
  {
    id: 'rcbo-1p',
    name: 'FI/LS-Kombischalter (RCBO) 1+N',
    shortName: 'RCBO',
    category: 'protection',
    teWidth: 2,
    color: '#c026d3',
    connections: [
      { id: '1', label: '1', type: 'input',  relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: 'N-in', label: 'N', type: 'neutral', relativeX: 1.5, relativeY: 0, phase: 'N' },
      { id: '2', label: '2', type: 'output', relativeX: 0.5, relativeY: 1, phase: 'L1' },
      { id: 'N-out', label: 'N', type: 'output', relativeX: 1.5, relativeY: 1, phase: 'N' },
    ],
    electricalModel: {
      type: 'rcd',
      nominalCurrentDefault: 16,
      nominalCurrentOptions: [6, 10, 13, 16, 20, 25, 32, 40],
      residualCurrentDefault: 30,
      breakingCapacity: 6,
      tripCurve: 'B',
      internalResistance: 0.01,
      poleCount: 2,
    },
    description: 'Der FI/LS-Kombischalter (RCBO) vereint Leitungsschutzschalter und Fehlerstromschutz in einem Gerät. Schützt einen Stromkreis gleichzeitig vor Überlast, Kurzschluss und Fehlerströmen – spart Platz gegenüber getrennten Geräten.',
  },

  // ─── Leistungsschalter (MCCB) ─────────────────────────────────────────
  {
    id: 'mccb-3p',
    name: 'Leistungsschalter (MCCB) 3-polig',
    shortName: 'MCCB',
    category: 'protection',
    teWidth: 6,
    color: '#0891b2',
    connections: [
      { id: '1', label: '1', type: 'input',  relativeX: 1, relativeY: 0, phase: 'L1' },
      { id: '3', label: '3', type: 'input',  relativeX: 3, relativeY: 0, phase: 'L2' },
      { id: '5', label: '5', type: 'input',  relativeX: 5, relativeY: 0, phase: 'L3' },
      { id: '2', label: '2', type: 'output', relativeX: 1, relativeY: 1, phase: 'L1' },
      { id: '4', label: '4', type: 'output', relativeX: 3, relativeY: 1, phase: 'L2' },
      { id: '6', label: '6', type: 'output', relativeX: 5, relativeY: 1, phase: 'L3' },
    ],
    electricalModel: {
      type: 'breaker',
      nominalCurrentDefault: 100,
      nominalCurrentOptions: [40, 50, 63, 80, 100, 125, 160, 200, 250],
      breakingCapacity: 36,
      tripCurve: 'D',
      internalResistance: 0.005,
      poleCount: 3,
    },
    description: 'Der Leistungsschalter (MCCB, Moulded Case Circuit Breaker) schützt große Stromkreise und Hauptverteilungen. Höheres Schaltvermögen als LSS, oft mit einstellbarem Überlast- und Kurzschlussauslöser.',
  },

  // ─── Hauptschalter / Lasttrennschalter ────────────────────────────────
  {
    id: 'hauptschalter-3p',
    name: 'Hauptschalter / Lasttrennschalter 3-polig',
    shortName: 'Hauptsch.',
    category: 'protection',
    teWidth: 3,
    color: '#dc2626',
    connections: [
      { id: '1', label: '1', type: 'input',  relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: '3', label: '3', type: 'input',  relativeX: 1.5, relativeY: 0, phase: 'L2' },
      { id: '5', label: '5', type: 'input',  relativeX: 2.5, relativeY: 0, phase: 'L3' },
      { id: '2', label: '2', type: 'output', relativeX: 0.5, relativeY: 1, phase: 'L1' },
      { id: '4', label: '4', type: 'output', relativeX: 1.5, relativeY: 1, phase: 'L2' },
      { id: '6', label: '6', type: 'output', relativeX: 2.5, relativeY: 1, phase: 'L3' },
    ],
    electricalModel: {
      type: 'switch-disconnector',
      nominalCurrentDefault: 63,
      nominalCurrentOptions: [25, 40, 63, 80, 100, 125],
      internalResistance: 0.003,
      poleCount: 3,
    },
    description: 'Der Hauptschalter (Lasttrennschalter) trennt die gesamte Anlage allpolig vom Netz. Schaltet unter Last, bietet aber keinen Überlast- oder Kurzschlussschutz. Roter Griff auf gelbem Grund = Not-Aus-Hauptschalter (abschließbar).',
  },

  // ─── Überspannungsschutz (SPD) ────────────────────────────────────────
  {
    id: 'spd-t2',
    name: 'Überspannungsschutz (SPD Typ 2)',
    shortName: 'SPD',
    category: 'protection',
    teWidth: 4,
    color: '#eab308',
    connections: [
      { id: 'L1', label: 'L1', type: 'input', relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: 'L2', label: 'L2', type: 'input', relativeX: 1.5, relativeY: 0, phase: 'L2' },
      { id: 'L3', label: 'L3', type: 'input', relativeX: 2.5, relativeY: 0, phase: 'L3' },
      { id: 'N',  label: 'N',  type: 'neutral', relativeX: 3.5, relativeY: 0, phase: 'N' },
      { id: 'PE', label: 'PE', type: 'pe', relativeX: 2, relativeY: 1, phase: 'PE' },
    ],
    electricalModel: {
      type: 'spd',
      nominalCurrentDefault: 20,
      internalResistance: 1000,
      poleCount: 4,
    },
    description: 'Der Überspannungsschutz (SPD, Surge Protective Device) leitet Überspannungen durch Blitz oder Schalthandlungen gegen PE ab. Typ 2 für Verteilungen. Defekte Module werden über ein Sichtfenster (rot) angezeigt und gesteckt getauscht.',
  },

  // ─── Zeitrelais ───────────────────────────────────────────────────────
  {
    id: 'zeitrelais',
    name: 'Zeitrelais',
    shortName: 'Zeit-R',
    category: 'switching',
    teWidth: 1,
    color: '#f59e0b',
    connections: [
      { id: 'A1', label: 'A1', type: 'control-in',  relativeX: 0.5, relativeY: 0 },
      { id: '15', label: '15', type: 'input',        relativeX: 0.5, relativeY: 0 },
      { id: 'A2', label: 'A2', type: 'control-out', relativeX: 0.5, relativeY: 1 },
      { id: '18', label: '18', type: 'output',       relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'relay',
      nominalCurrentDefault: 6,
      nominalCurrentOptions: [6, 8, 10],
      internalResistance: 0.01,
      poleCount: 1,
    },
    description: 'Zeitrelais schalten Kontakte zeitverzögert (ansprech- oder rückfallverzögert). Einsatz z.B. bei Stern-Dreieck-Anlauf oder Treppenhausbeleuchtung. Zeitbereich am Drehknopf einstellbar.',
  },

  // ─── Phasenwächter / Überwachungsrelais ───────────────────────────────
  {
    id: 'phasenwaechter',
    name: 'Phasenwächter / Überwachungsrelais',
    shortName: 'Phasen-W',
    category: 'switching',
    teWidth: 2,
    color: '#14b8a6',
    connections: [
      { id: 'L1', label: 'L1', type: 'input',  relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: 'L2', label: 'L2', type: 'input',  relativeX: 1, relativeY: 0, phase: 'L2' },
      { id: 'L3', label: 'L3', type: 'input',  relativeX: 1.5, relativeY: 0, phase: 'L3' },
      { id: '15', label: '15', type: 'output', relativeX: 0.5, relativeY: 1 },
      { id: '18', label: '18', type: 'output', relativeX: 1.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'monitoring-relay',
      nominalCurrentDefault: 5,
      internalResistance: 0.01,
      poleCount: 3,
    },
    description: 'Der Phasenwächter überwacht Drehfeld, Phasenausfall und Unter-/Überspannung. Bei Fehler schaltet das Ausgangsrelais ab und schützt z.B. Motoren vor Zweiphasenlauf.',
  },

  // ─── Koppelrelais ─────────────────────────────────────────────────────
  {
    id: 'koppelrelais',
    name: 'Koppelrelais (Steckrelais)',
    shortName: 'Koppel-R',
    category: 'switching',
    teWidth: 1,
    color: '#fbbf24',
    connections: [
      { id: 'A1', label: 'A1', type: 'control-in',  relativeX: 0.5, relativeY: 0 },
      { id: '11', label: '11', type: 'input',        relativeX: 0.5, relativeY: 0 },
      { id: 'A2', label: 'A2', type: 'control-out', relativeX: 0.5, relativeY: 1 },
      { id: '14', label: '14', type: 'output',       relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'relay',
      nominalCurrentDefault: 6,
      nominalCurrentOptions: [6, 8, 10],
      internalResistance: 0.01,
      poleCount: 1,
    },
    description: 'Koppelrelais trennen Steuer- und Lastkreis galvanisch und passen Spannungsebenen an (z.B. SPS-Ausgang 24V steuert 230V-Last). Steckbar auf Sockel, mit Status-LED.',
  },

  // ─── Not-Aus-Schalter ─────────────────────────────────────────────────
  {
    id: 'not-aus',
    name: 'Not-Aus-Schalter',
    shortName: 'NOT-AUS',
    category: 'switching',
    teWidth: 2,
    color: '#dc2626',
    connections: [
      { id: '11', label: '11', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: '21', label: '21', type: 'input',  relativeX: 1.5, relativeY: 0 },
      { id: '12', label: '12', type: 'output', relativeX: 0.5, relativeY: 1 },
      { id: '22', label: '22', type: 'output', relativeX: 1.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'emergency-stop',
      nominalCurrentDefault: 6,
      internalResistance: 0.005,
      poleCount: 2,
    },
    description: 'Der Not-Aus-Schalter (Pilzdruck-Taster, rot/gelb) unterbricht im Gefahrfall zwangsöffnend den Steuerstromkreis (Öffnerkontakte 11-12, 21-22). Verrastet beim Drücken, muss entriegelt werden.',
  },

  // ─── Taster Schließer ─────────────────────────────────────────────────
  {
    id: 'taster-no',
    name: 'Taster (Schließer)',
    shortName: 'Taster NO',
    category: 'command',
    teWidth: 1,
    color: '#22c55e',
    connections: [
      { id: '13', label: '13', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: '14', label: '14', type: 'output', relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'button',
      nominalCurrentDefault: 6,
      internalResistance: 0.005,
      poleCount: 1,
    },
    description: 'Taster mit Schließerkontakt (NO, 13-14). Schließt den Kontakt nur solange gedrückt – typisch grüner EIN-Taster für Motorstart.',
  },

  // ─── Taster Öffner ────────────────────────────────────────────────────
  {
    id: 'taster-nc',
    name: 'Taster (Öffner)',
    shortName: 'Taster NC',
    category: 'command',
    teWidth: 1,
    color: '#ef4444',
    connections: [
      { id: '11', label: '11', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: '12', label: '12', type: 'output', relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'button',
      nominalCurrentDefault: 6,
      internalResistance: 0.005,
      poleCount: 1,
    },
    description: 'Taster mit Öffnerkontakt (NC, 11-12). Öffnet den Kontakt solange gedrückt – typisch roter AUS-Taster zum Motorstopp.',
  },

  // ─── Wahlschalter ─────────────────────────────────────────────────────
  {
    id: 'wahlschalter',
    name: 'Wahlschalter (2-Stellung)',
    shortName: 'Wahlsch.',
    category: 'command',
    teWidth: 1,
    color: '#0ea5e9',
    connections: [
      { id: '13', label: '13', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: '14', label: '14', type: 'output', relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'selector',
      nominalCurrentDefault: 6,
      internalResistance: 0.005,
      poleCount: 1,
    },
    description: 'Wahlschalter (Drehschalter) zur Auswahl von Betriebsarten, z.B. Hand-0-Automatik. Rastet in der gewählten Stellung ein.',
  },

  // ─── Meldeleuchte ─────────────────────────────────────────────────────
  {
    id: 'meldeleuchte',
    name: 'Meldeleuchte',
    shortName: 'Lampe',
    category: 'command',
    teWidth: 1,
    color: '#22c55e',
    connections: [
      { id: 'X1', label: 'X1', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: 'X2', label: 'X2', type: 'output', relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'indicator',
      nominalCurrentDefault: 1,
      internalResistance: 500,
      poleCount: 1,
    },
    description: 'Meldeleuchte (LED) zeigt Betriebszustände an: grün = Betrieb, rot = Störung, gelb = Warnung. Geringe Stromaufnahme.',
  },

  // ─── Schaltnetzteil 24V DC ────────────────────────────────────────────
  {
    id: 'netzteil-24v',
    name: 'Schaltnetzteil 24V DC',
    shortName: 'Netzteil',
    category: 'power',
    teWidth: 6,
    color: '#16a34a',
    connections: [
      { id: 'L', label: 'L', type: 'input',   relativeX: 1, relativeY: 0, phase: 'L1' },
      { id: 'N', label: 'N', type: 'neutral', relativeX: 2, relativeY: 0, phase: 'N' },
      { id: 'PE', label: 'PE', type: 'pe',    relativeX: 3, relativeY: 0, phase: 'PE' },
      { id: '+24V', label: '+', type: 'output', relativeX: 4.5, relativeY: 1 },
      { id: '0V',  label: '−', type: 'output', relativeX: 5.5, relativeY: 1 },
    ],
    electricalModel: {
      type: 'power-supply',
      nominalCurrentDefault: 5,
      nominalCurrentOptions: [2.5, 5, 10, 20, 40],
      internalResistance: 0.1,
      poleCount: 1,
    },
    description: 'Geregeltes Schaltnetzteil wandelt 230V AC in stabile 24V DC für Steuerungen (SPS, Sensoren, Relais). Strom in Ampere bei 24V angegeben.',
  },

  // ─── Stromwandler ─────────────────────────────────────────────────────
  {
    id: 'stromwandler',
    name: 'Stromwandler',
    shortName: 'Wandler',
    category: 'accessory',
    teWidth: 2,
    color: '#8b5cf6',
    connections: [
      { id: 'P1', label: 'P1', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: 'P2', label: 'P2', type: 'output', relativeX: 1.5, relativeY: 1 },
      { id: 'S1', label: 'S1', type: 'control-out', relativeX: 0.5, relativeY: 1 },
      { id: 'S2', label: 'S2', type: 'control-out', relativeX: 1.5, relativeY: 0 },
    ],
    electricalModel: {
      type: 'ct',
      nominalCurrentDefault: 100,
      nominalCurrentOptions: [50, 100, 150, 200, 400, 600],
      internalResistance: 0.001,
      poleCount: 1,
    },
    description: 'Der Stromwandler wandelt hohe Primärströme (z.B. 100A) in einen genormten Sekundärstrom (5A oder 1A) für Messgeräte herunter. Sekundärseite niemals offen betreiben!',
  },

  // ─── Schaltschranksteckdose ───────────────────────────────────────────
  {
    id: 'steckdose',
    name: 'Schaltschrank-Steckdose',
    shortName: 'Steckdose',
    category: 'accessory',
    teWidth: 3,
    color: '#64748b',
    connections: [
      { id: 'L', label: 'L', type: 'input',   relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: 'N', label: 'N', type: 'neutral', relativeX: 1.5, relativeY: 0, phase: 'N' },
      { id: 'PE', label: 'PE', type: 'pe',    relativeX: 2.5, relativeY: 0, phase: 'PE' },
    ],
    electricalModel: {
      type: 'socket',
      nominalCurrentDefault: 16,
      internalResistance: 0.01,
      poleCount: 1,
    },
    description: 'Servicesteckdose (Schuko) zur Hutschienenmontage – für Wartungsgeräte im Schaltschrank. Sollte separat über LSS abgesichert sein.',
  },

  // ─── Filterlüfter ─────────────────────────────────────────────────────
  {
    id: 'luefter',
    name: 'Filterlüfter',
    shortName: 'Lüfter',
    category: 'accessory',
    teWidth: 3,
    color: '#06b6d4',
    connections: [
      { id: 'L', label: 'L', type: 'input',   relativeX: 1, relativeY: 0, phase: 'L1' },
      { id: 'N', label: 'N', type: 'neutral', relativeX: 2, relativeY: 0, phase: 'N' },
    ],
    electricalModel: {
      type: 'fan',
      nominalCurrentDefault: 1,
      internalResistance: 50,
      poleCount: 1,
    },
    description: 'Filterlüfter führt Verlustwärme aus dem Schaltschrank ab. Oft über Thermostat geschaltet. Hält Geräte im zulässigen Temperaturbereich.',
  },

  // ─── Zeitrelais anzugverzögert ────────────────────────────────────────
  {
    id: 'zeitrelais-anzug',
    name: 'Zeitrelais anzugverzögert',
    shortName: 'Zeit-R ⟳',
    category: 'switching',
    teWidth: 1,
    color: '#f59e0b',
    connections: [
      { id: 'A1', label: 'A1', type: 'control-in',  relativeX: 0.5, relativeY: 0 },
      { id: '15', label: '15', type: 'input',        relativeX: 0.5, relativeY: 0 },
      { id: 'A2', label: 'A2', type: 'control-out', relativeX: 0.5, relativeY: 1 },
      { id: '18', label: '18', type: 'output',       relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: { type: 'relay', nominalCurrentDefault: 6, nominalCurrentOptions: [6, 8, 10], internalResistance: 0.01, poleCount: 1, timerModeDefault: 'on-delay' },
    description: 'Anzugverzögertes Zeitrelais (Ansprechverzögerung): Nach Anlegen der Steuerspannung schaltet der Kontakt erst nach Ablauf der eingestellten Zeit. Einsatz z.B. bei Stern-Dreieck-Anlauf.',
  },

  // ─── Zeitrelais abfallverzögert ───────────────────────────────────────
  {
    id: 'zeitrelais-abfall',
    name: 'Zeitrelais abfallverzögert',
    shortName: 'Zeit-R ⟲',
    category: 'switching',
    teWidth: 1,
    color: '#f59e0b',
    connections: [
      { id: 'A1', label: 'A1', type: 'control-in',  relativeX: 0.5, relativeY: 0 },
      { id: '15', label: '15', type: 'input',        relativeX: 0.5, relativeY: 0 },
      { id: 'A2', label: 'A2', type: 'control-out', relativeX: 0.5, relativeY: 1 },
      { id: '18', label: '18', type: 'output',       relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: { type: 'relay', nominalCurrentDefault: 6, nominalCurrentOptions: [6, 8, 10], internalResistance: 0.01, poleCount: 1, timerModeDefault: 'off-delay' },
    description: 'Abfallverzögertes Zeitrelais (Rückfallverzögerung): Der Kontakt bleibt nach Wegfall der Steuerspannung noch für die eingestellte Zeit geschlossen. Einsatz z.B. Nachlauf von Lüftern.',
  },

  // ─── Stromstoßschalter ────────────────────────────────────────────────
  {
    id: 'stromstossschalter',
    name: 'Stromstoßschalter',
    shortName: 'Stromstoß',
    category: 'switching',
    teWidth: 1,
    color: '#8b5cf6',
    connections: [
      { id: 'A1', label: 'A1', type: 'control-in',  relativeX: 0.5, relativeY: 0 },
      { id: '1',  label: '1',  type: 'input',        relativeX: 0.5, relativeY: 0 },
      { id: 'A2', label: 'A2', type: 'control-out', relativeX: 0.5, relativeY: 1 },
      { id: '2',  label: '2',  type: 'output',       relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: { type: 'impulse-relay', nominalCurrentDefault: 16, nominalCurrentOptions: [10, 16], internalResistance: 0.01, poleCount: 1 },
    description: 'Der Stromstoßschalter (Eltako) wechselt seinen Schaltzustand bei jedem Steuerimpuls (Taster-Betätigung). Typisch für Beleuchtung, die von mehreren Tastern geschaltet wird.',
  },

  // ─── Schraubsicherung DIAZED 1-fach ───────────────────────────────────
  {
    id: 'diazed-1',
    name: 'Schraubsicherung DIAZED 1-polig',
    shortName: 'DIAZED 1',
    category: 'fuse',
    teWidth: 2,
    color: '#dc2626',
    connections: [
      { id: 'in',  label: '1', type: 'input',  relativeX: 1, relativeY: 0 },
      { id: 'out', label: '2', type: 'output', relativeX: 1, relativeY: 1 },
    ],
    electricalModel: { type: 'fuse', nominalCurrentDefault: 25, nominalCurrentOptions: [6, 10, 16, 20, 25, 35, 50, 63], breakingCapacity: 50, tripCurve: 'gG', internalResistance: 0.005, poleCount: 1 },
    description: 'DIAZED-Schraubsicherung (D-System). Klassische Schmelzsicherung mit farbcodiertem Kennmelder je Nennstrom. Für einphasige Absicherung.',
  },

  // ─── Schraubsicherung DIAZED 3-fach ───────────────────────────────────
  {
    id: 'diazed-3',
    name: 'Schraubsicherung DIAZED 3-polig',
    shortName: 'DIAZED 3',
    category: 'fuse',
    teWidth: 6,
    color: '#dc2626',
    connections: [
      { id: '1', label: '1', type: 'input',  relativeX: 1, relativeY: 0 },
      { id: '3', label: '3', type: 'input',  relativeX: 3, relativeY: 0 },
      { id: '5', label: '5', type: 'input',  relativeX: 5, relativeY: 0 },
      { id: '2', label: '2', type: 'output', relativeX: 1, relativeY: 1 },
      { id: '4', label: '4', type: 'output', relativeX: 3, relativeY: 1 },
      { id: '6', label: '6', type: 'output', relativeX: 5, relativeY: 1 },
    ],
    electricalModel: { type: 'fuse', nominalCurrentDefault: 25, nominalCurrentOptions: [6, 10, 16, 20, 25, 35, 50, 63], breakingCapacity: 50, tripCurve: 'gG', internalResistance: 0.005, poleCount: 3 },
    description: 'Dreipolige DIAZED-Schraubsicherung für Drehstromkreise. Jede Phase einzeln abgesichert.',
  },

  // ─── Schraubsicherung NEOZED 1-fach ───────────────────────────────────
  {
    id: 'neozed-1',
    name: 'Schraubsicherung NEOZED 1-polig',
    shortName: 'NEOZED 1',
    category: 'fuse',
    teWidth: 1,
    color: '#b91c1c',
    connections: [
      { id: 'in',  label: '1', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: 'out', label: '2', type: 'output', relativeX: 0.5, relativeY: 1 },
    ],
    electricalModel: { type: 'fuse', nominalCurrentDefault: 25, nominalCurrentOptions: [6, 10, 16, 20, 25, 35, 50, 63], breakingCapacity: 50, tripCurve: 'gG', internalResistance: 0.005, poleCount: 1 },
    description: 'NEOZED-Schraubsicherung (D0-System). Kompakter als DIAZED, gleiche Funktion. Farbcodierter Kennmelder.',
  },

  // ─── Schraubsicherung NEOZED 3-fach ───────────────────────────────────
  {
    id: 'neozed-3',
    name: 'Schraubsicherung NEOZED 3-polig',
    shortName: 'NEOZED 3',
    category: 'fuse',
    teWidth: 3,
    color: '#b91c1c',
    connections: [
      { id: '1', label: '1', type: 'input',  relativeX: 0.5, relativeY: 0 },
      { id: '3', label: '3', type: 'input',  relativeX: 1.5, relativeY: 0 },
      { id: '5', label: '5', type: 'input',  relativeX: 2.5, relativeY: 0 },
      { id: '2', label: '2', type: 'output', relativeX: 0.5, relativeY: 1 },
      { id: '4', label: '4', type: 'output', relativeX: 1.5, relativeY: 1 },
      { id: '6', label: '6', type: 'output', relativeX: 2.5, relativeY: 1 },
    ],
    electricalModel: { type: 'fuse', nominalCurrentDefault: 25, nominalCurrentOptions: [6, 10, 16, 20, 25, 35, 50, 63], breakingCapacity: 50, tripCurve: 'gG', internalResistance: 0.005, poleCount: 3 },
    description: 'Dreipolige NEOZED-Schraubsicherung für Drehstromkreise. Platzsparend, 1 TE pro Phase.',
  },

  // ─── Schutzkontaktsteckdose (Schuko) ──────────────────────────────────
  {
    id: 'schuko',
    name: 'Schutzkontaktsteckdose (Schuko)',
    shortName: 'Schuko',
    category: 'accessory',
    teWidth: 3,
    color: '#475569',
    connections: [
      { id: 'L',  label: 'L',  type: 'input',   relativeX: 0.5, relativeY: 0, phase: 'L1' },
      { id: 'N',  label: 'N',  type: 'neutral', relativeX: 1.5, relativeY: 0, phase: 'N' },
      { id: 'PE', label: 'PE', type: 'pe',      relativeX: 2.5, relativeY: 0, phase: 'PE' },
    ],
    electricalModel: { type: 'socket', nominalCurrentDefault: 16, internalResistance: 0.01, poleCount: 1 },
    description: 'Schutzkontaktsteckdose (Schuko, Typ F) zur Hutschienenmontage. 230V/16A mit Schutzleiter. Für Wartungsgeräte im Schaltschrank – separat absichern.',
  },

  // ─── Not-Aus-Sicherheitsrelais 2-kanalig ──────────────────────────────
  {
    id: 'safety-relay-2ch',
    name: 'Not-Aus-Sicherheitsrelais 2-kanalig',
    shortName: 'Safety 2K',
    category: 'protection',
    teWidth: 4,
    color: '#eab308',
    connections: [
      { id: 'A1',  label: 'A1',  type: 'control-in',  relativeX: 0.5, relativeY: 0 },
      { id: 'S11', label: 'S11', type: 'input',        relativeX: 1.5, relativeY: 0 },
      { id: 'S21', label: 'S21', type: 'input',        relativeX: 2.5, relativeY: 0 },
      { id: 'S12', label: 'S12', type: 'input',        relativeX: 3.5, relativeY: 0 },
      { id: 'A2',  label: 'A2',  type: 'control-out', relativeX: 0.5, relativeY: 1 },
      { id: '13',  label: '13',  type: 'output',       relativeX: 1.5, relativeY: 1 },
      { id: '14',  label: '14',  type: 'output',       relativeX: 2.5, relativeY: 1 },
      { id: '23',  label: '23',  type: 'output',       relativeX: 3.5, relativeY: 1 },
    ],
    electricalModel: { type: 'safety-relay', nominalCurrentDefault: 6, internalResistance: 0.01, poleCount: 2 },
    description: 'Zweikanaliges Not-Aus-Sicherheitsrelais (Sicherheitsschaltgerät). Überwacht zwei redundante Not-Aus-Kreise (S11/S12, S21) und gibt bei Betätigung die Freigabekontakte (13/14, 23/24) sicher frei. Erfüllt Performance Level nach EN ISO 13849.',
  },

  // ─── LAN-Switch (Hutschiene) ──────────────────────────────────────────
  {
    id: 'lan-switch-8',
    name: 'Industrie-LAN-Switch 8-Port',
    shortName: 'LAN-Switch',
    category: 'network',
    teWidth: 8,
    color: '#0ea5e9',
    connections: [
      { id: '24V', label: '24V', type: 'input',   relativeX: 0.5, relativeY: 0 },
      { id: '0V',  label: '0V',  type: 'neutral', relativeX: 1.5, relativeY: 0 },
    ],
    electricalModel: { type: 'network', nominalCurrentDefault: 1, internalResistance: 24, poleCount: 1 },
    description: 'Managed Industrie-Ethernet-Switch mit 8 RJ45-Ports für die Hutschienenmontage. Versorgung über 24V DC. Vernetzt SPS, HMI und Feldgeräte.',
  },

  // ─── Patchfeld ────────────────────────────────────────────────────────
  {
    id: 'patchfeld',
    name: 'Patchfeld 12-Port',
    shortName: 'Patchfeld',
    category: 'network',
    teWidth: 12,
    color: '#0284c7',
    connections: [],
    electricalModel: { type: 'network', nominalCurrentDefault: 0, internalResistance: 1e9, poleCount: 0 },
    description: 'Patchfeld mit 12 RJ45-Buchsen (Keystone) zur strukturierten Verkabelung. Rangiert Feldleitungen auf Patchkabel. In 19"-Technik oder als Hutschienenvariante.',
  },
]

export const COMPONENT_MAP = new Map<string, ComponentDefinition>(
  COMPONENT_DEFINITIONS.map(d => [d.id, d])
)

export const CATEGORIES: Array<{ id: string; label: string; order: number }> = [
  { id: 'protection', label: 'Schutzorgane', order: 1 },
  { id: 'switching',  label: 'Schaltgeräte', order: 2 },
  { id: 'command',    label: 'Befehls-/Meldegeräte', order: 3 },
  { id: 'terminal',   label: 'Klemmen',      order: 4 },
  { id: 'fuse',       label: 'Sicherungen',  order: 5 },
  { id: 'power',      label: 'Stromversorgung', order: 6 },
  { id: 'accessory',  label: 'Mess-/Zubehör', order: 7 },
  { id: 'network',    label: 'Netzwerk', order: 8 },
]
