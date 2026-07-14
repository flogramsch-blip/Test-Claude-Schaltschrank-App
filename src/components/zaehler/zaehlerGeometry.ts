import { TE_WIDTH_PX } from '@/utils/teGrid'
import type { ZaehlerReihenTyp, ZaehlerFeld } from '@/types/zaehlerschrank'

/** Zählerschrank-Geometrie (SVG-Pixel bei 100 % Zoom). */
export const FELD_TE = 12                       // 250-mm-Feld = 12 TE
export const ZTE_PX = TE_WIDTH_PX               // 18 px/TE (wie im Simulator)
export const FELD_INNER_W = FELD_TE * ZTE_PX    // 216
export const FELD_PADDING = 14                  // Rahmen um die Reihen
export const FELD_GAP = 28                      // horizontaler Abstand zwischen Feldern
export const FELD_HEADER = 22                   // Kopfzeile „Feld n"
export const RAIL_Y_IN_ROW = 42                 // y der Hutschiene innerhalb einer Verteilerreihe
export const ROW_INSET_X = 30                   // linker Innenabstand (Platz für Reihen-Label)

export const ROW_HEIGHTS: Record<ZaehlerReihenTyp, number> = {
  'anschlussraum-oben': 92,
  'zaehlerplatz': 188,
  'apz': 92,
  'verteiler': 82,
  'anschlussraum-unten': 92,
  'reserve': 78,
}

export const FELD_OUTER_W = FELD_INNER_W + 2 * FELD_PADDING

/** Höhe eines Feldes (Kopfzeile + Summe der Reihenhöhen). */
export function feldHeight(feld: ZaehlerFeld): number {
  return FELD_HEADER + feld.reihen.reduce((h, r) => h + ROW_HEIGHTS[r.type], 0)
}

/** x-Ursprung (linke Rahmenkante) eines Feldes anhand seines Index. */
export function feldOriginX(index: number): number {
  return 40 + index * (FELD_OUTER_W + FELD_GAP)
}

/** y-Ursprung (Oberkante) einer Reihe innerhalb ihres Feldes (relativ zum Feld-Top). */
export function reiheOffsetY(feld: ZaehlerFeld, reiheId: string): number {
  let y = FELD_HEADER
  for (const r of feld.reihen) {
    if (r.id === reiheId) return y
    y += ROW_HEIGHTS[r.type]
  }
  return y
}

/** Breite der TE-Nutzfläche innerhalb einer Reihe (px). */
export const ROW_USABLE_W = FELD_TE * ZTE_PX
