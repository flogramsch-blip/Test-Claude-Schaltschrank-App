import type { ComponentDefinition, ConnectionPoint } from '@/types/components'
import { COMPONENT_MAP } from '@/data/componentDefinitions'

/**
 * Bauteil-Katalog NUR für den Zählerschrank-Planer. Bewusst getrennt von
 * COMPONENT_DEFINITIONS, damit die Palette des Simulators unverändert bleibt.
 * Wiederverwendete Geräte kommen per Whitelist aus dem bestehenden Katalog,
 * einige zählerschrankspezifische Geräte kommen hier neu dazu.
 */

const slsConnections: ConnectionPoint[] = [
  { id: '1', label: '1', type: 'input',  relativeX: 0.5, relativeY: 0 },
  { id: '3', label: '3', type: 'input',  relativeX: 1.5, relativeY: 0 },
  { id: '5', label: '5', type: 'input',  relativeX: 2.5, relativeY: 0 },
  { id: '2', label: '2', type: 'output', relativeX: 0.5, relativeY: 1 },
  { id: '4', label: '4', type: 'output', relativeX: 1.5, relativeY: 1 },
  { id: '6', label: '6', type: 'output', relativeX: 2.5, relativeY: 1 },
]

/** Neue, nur im Zählerschrank-Planer verwendete Definitionen. */
export const ZAEHLER_NEW_DEFINITIONS: ComponentDefinition[] = [
  {
    id: 'sls-3p',
    name: 'SLS-Schalter 3-polig (selektiver Hauptleitungsschutzschalter)',
    shortName: 'SLS 50A',
    category: 'protection',
    teWidth: 3,
    color: '#0ea5e9',
    connections: slsConnections,
    electricalModel: { type: 'breaker', nominalCurrentDefault: 50, nominalCurrentOptions: [35, 50, 63], breakingCapacity: 25, poleCount: 3 },
    description: 'Selektiver Hauptleitungsschutzschalter (SLS) mit E-Charakteristik, plombierbar. Sitzt im oberen Anschlussraum vor dem Zähler und schützt die Zählerzuleitung (VDE-AR-N 4100). Typische Bemessungsströme 35/50/63 A.',
  },
  {
    id: 'zaehler-ehz',
    name: 'eHZ – elektronischer Haushaltszähler',
    shortName: 'eHZ',
    category: 'accessory',
    teWidth: 0,   // Zählerplatz-Gerät, nicht TE-basiert
    color: '#334155',
    connections: [],
    electricalModel: { type: 'ct', nominalCurrentDefault: 60, poleCount: 3 },
    description: 'Elektronischer Haushaltszähler (eHZ) für die moderne Messeinrichtung (mME) auf dem Zählersteckplatz (BKE-I). Zeigt Verbrauch und optional Einspeisung. Wird auf den Zählerkreuz-/Steckplatz im Zählerfeld gesetzt.',
  },
  {
    id: 'zaehler-3punkt',
    name: 'Drehstromzähler (3-Punkt-Befestigung)',
    shortName: 'Zähler 3P',
    category: 'accessory',
    teWidth: 0,
    color: '#475569',
    connections: [],
    electricalModel: { type: 'ct', nominalCurrentDefault: 60, poleCount: 3 },
    description: 'Klassischer Drehstrom-Ferraris-/Digitalzähler mit 3-Punkt-Befestigung im Zählerfeld. Für Bestandsanlagen; im Neubau überwiegend durch eHZ ersetzt.',
  },
  {
    id: 'n-pe-klemmenblock',
    name: 'N/PE-Sammelklemmenblock',
    shortName: 'N/PE-Block',
    category: 'terminal',
    teWidth: 4,
    color: '#2563eb',
    connections: [],
    electricalModel: { type: 'terminal', nominalCurrentDefault: 63, poleCount: 2 },
    description: 'Kombinierter Sammelklemmenblock für Neutralleiter (N, blau) und Schutzleiter (PE, grün-gelb) im Anschlussraum. Rangiert die Abgänge der Verteilerstromkreise.',
  },
]

/** Vorhandene Geräte, die im Zählerschrank sinnvoll sind (aus dem Simulator-Katalog). */
export const ZAEHLER_WHITELIST_IDS = [
  'lss-1p', 'lss-2p', 'lss-3p', 'rcbo-1p', 'fi-2p', 'fi-4p', 'spd-t2',
  'hauptschalter-3p', 'neozed-1', 'neozed-3', 'klemme', 'pe-klemme',
  'schuko', 'steckdose', 'stromstossschalter', 'zeitrelais', 'relais',
] as const

export const ZAEHLER_DEFINITIONS: ComponentDefinition[] = [
  ...ZAEHLER_NEW_DEFINITIONS,
  ...ZAEHLER_WHITELIST_IDS.map(id => COMPONENT_MAP.get(id)).filter((d): d is ComponentDefinition => !!d),
]

export const ZAEHLER_COMPONENT_MAP = new Map<string, ComponentDefinition>(
  ZAEHLER_DEFINITIONS.map(d => [d.id, d])
)

/** Geräte, die ausschließlich auf den Zählerplatz gehören (genau eines je Platz). */
export const METER_DEVICE_IDS = new Set(['zaehler-ehz', 'zaehler-3punkt'])

/** Palettengruppen des Zählerschrank-Planers (unabhängig von CATEGORIES). */
export const ZAEHLER_CATEGORIES: Array<{ id: string; label: string; ids: string[] }> = [
  { id: 'zaehlertechnik', label: 'Zähler & SLS', ids: ['zaehler-ehz', 'zaehler-3punkt', 'sls-3p', 'hauptschalter-3p'] },
  { id: 'schutz',         label: 'Schutzorgane', ids: ['lss-1p', 'lss-2p', 'lss-3p', 'rcbo-1p', 'fi-2p', 'fi-4p', 'spd-t2'] },
  { id: 'sicherungen',    label: 'Sicherungen',  ids: ['neozed-1', 'neozed-3'] },
  { id: 'klemmen',        label: 'Klemmen',      ids: ['klemme', 'pe-klemme', 'n-pe-klemmenblock'] },
  { id: 'sonstiges',      label: 'Sonstiges',    ids: ['schuko', 'steckdose', 'stromstossschalter', 'zeitrelais', 'relais'] },
]
