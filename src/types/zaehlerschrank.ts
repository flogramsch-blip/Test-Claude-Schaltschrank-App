/**
 * Datenmodell des Zählerschrank-Planers (Hager-Stil).
 * Völlig getrennt vom Schaltschrank-Simulator: eigener Store, eigener
 * Autosave-Schlüssel. Ein Schrank besteht aus Feldern (Spalten), jedes Feld
 * aus fixen Reihen; der Typ jeder Reihe ist konfigurierbar.
 */

export type ZaehlerReihenTyp =
  | 'anschlussraum-oben'   // oberer Anschlussraum (Klemmen, SLS, ÜSS)
  | 'zaehlerplatz'         // Zählerfeld (eHZ / 3-Punkt) – genau 1 Gerät, nicht TE-basiert
  | 'apz'                  // APZ-Feld (plombierbar): SLS, SPD, Hauptschalter, Kommunikation
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

/** Feldtyp (Spaltenzweck) – bestimmt das Start-Layout der Reihen. */
export type ZaehlerFeldTyp =
  | 'zaehler'
  | 'verteiler'
  | 'multimedia'
  | 'lastmanagement'
  | 'leer'
  | 'schrankgehaeuse'
  | 'einspeise'

export interface ZaehlerFeld {
  id: string
  type: ZaehlerFeldTyp      // Feldzweck (setzt das Reihen-Startlayout)
  reihen: ZaehlerReihe[]    // vertikale Struktur, Typ je Reihe konfigurierbar
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
  'apz': 'APZ-Feld',
  'verteiler': 'Verteilerreihe (12 TE)',
  'anschlussraum-unten': 'Unterer Anschlussraum',
  'reserve': 'Reserve / Baufreiheit',
}

export const ZAEHLER_FELD_LABELS: Record<ZaehlerFeldTyp, string> = {
  'zaehler': 'Zählerfeld',
  'verteiler': 'Verteilerfeld',
  'multimedia': 'Multimedia-Feld',
  'lastmanagement': 'Lastmanagement-Feld',
  'leer': 'Leerfeld',
  'schrankgehaeuse': 'Schrankgehäuse',
  'einspeise': 'Einspeisegehäuse',
}
