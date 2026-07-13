/**
 * Datenmodell des Zählerschrank-Planers (Hager-Stil).
 * Völlig getrennt vom Schaltschrank-Simulator: eigener Store, eigener
 * Autosave-Schlüssel. Ein Schrank besteht aus Feldern (Spalten), jedes Feld
 * aus fixen Reihen; der Typ jeder Reihe ist konfigurierbar.
 */

export type ZaehlerReihenTyp =
  | 'anschlussraum-oben'   // oberer Anschlussraum (Klemmen, SLS, ÜSS)
  | 'zaehlerplatz'         // Zählerfeld (eHZ / 3-Punkt) – genau 1 Gerät, nicht TE-basiert
  | 'verteiler'            // Verteilerreihe à 12 TE (Hutschiene)
  | 'anschlussraum-unten'  // unterer Anschlussraum (Zuleitung, Klemmen)
  | 'reserve'              // Baufreiheit / Reserve – keine Geräte zulässig

export interface PlacedZaehlerDevice {
  instanceId: string
  definitionId: string
  tePosition: number       // 0 für Zählerplatz-Geräte (dort irrelevant)
}

export interface ZaehlerReihe {
  id: string
  type: ZaehlerReihenTyp
  devices: PlacedZaehlerDevice[]
}

export interface ZaehlerFeld {
  id: string
  reihen: ZaehlerReihe[]    // feste vertikale Struktur, Typ je Reihe konfigurierbar
}

export interface ZaehlerschrankProjekt {
  id: string
  name: string
  bauherr?: string
  ort?: string
  bemerkung?: string
  felder: ZaehlerFeld[]
  createdAt: string
  modifiedAt: string
}

export const ZAEHLER_REIHEN_LABELS: Record<ZaehlerReihenTyp, string> = {
  'anschlussraum-oben': 'Oberer Anschlussraum',
  'zaehlerplatz': 'Zählerfeld',
  'verteiler': 'Verteilerreihe (12 TE)',
  'anschlussraum-unten': 'Unterer Anschlussraum',
  'reserve': 'Reserve / Baufreiheit',
}
