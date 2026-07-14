import type { ZaehlerschrankProjekt, PlacedZaehlerDevice } from '@/types/zaehlerschrank'
import { ZAEHLER_COMPONENT_MAP, METER_DEVICE_IDS } from '@/data/zaehlerComponents'
import { FELD_TE } from '@/components/zaehler/zaehlerGeometry'

export interface ZaehlerIssue {
  severity: 'error' | 'warning' | 'hint'
  message: string
  norm?: string
}

function allDevices(p: ZaehlerschrankProjekt): PlacedZaehlerDevice[] {
  return p.felder.flatMap(f => f.reihen.flatMap(r => r.devices))
}
function hasDef(p: ZaehlerschrankProjekt, ...ids: string[]): boolean {
  const set = new Set(ids)
  return allDevices(p).some(d => set.has(d.definitionId))
}

/**
 * Vereinfachte Regelprüfung eines Haushalts-Zählerschranks nach den
 * Grundregeln von VDE-AR-N 4100 (TAB) und DIN VDE 0100 / DIN 18015-1.
 * Didaktisch – ersetzt keine normkonforme Planung.
 */
export function analyzeZaehlerschrank(p: ZaehlerschrankProjekt): ZaehlerIssue[] {
  const issues: ZaehlerIssue[] = []

  // (a) Zähler auf Zählerplatz vorhanden?
  const meterOnPlatz = p.felder.some(f =>
    f.reihen.some(r => r.type === 'zaehlerplatz' && r.devices.some(d => METER_DEVICE_IDS.has(d.definitionId))))
  if (!meterOnPlatz) {
    issues.push({ severity: 'error', message: 'Kein Zähler auf dem Zählerfeld gesetzt.', norm: 'VDE-AR-N 4100 (Messeinrichtung)' })
  }

  // (b) SLS vorhanden?
  const hasSLS = hasDef(p, 'sls-3p')
  if (!hasSLS) {
    issues.push({ severity: 'error', message: 'Kein SLS-Schalter (selektiver Hauptleitungsschutzschalter) vorhanden.', norm: 'VDE-AR-N 4100 §7' })
  } else {
    // (c) SLS-Position: gehört ins APZ-Feld oder in einen Anschlussraum (plombierbarer Bereich)
    const slsWellPlaced = p.felder.some(f =>
      f.reihen.some(r =>
        (r.type === 'apz' || r.type === 'anschlussraum-oben' || r.type === 'anschlussraum-unten') &&
        r.devices.some(d => d.definitionId === 'sls-3p')))
    if (!slsWellPlaced) {
      issues.push({ severity: 'warning', message: 'SLS sollte im APZ-Feld bzw. Anschlussraum (plombierbarer Bereich) sitzen.', norm: 'VDE-AR-N 4100' })
    }
  }

  // (d) Überspannungsschutz Typ 2
  if (!hasDef(p, 'spd-t2')) {
    issues.push({ severity: 'warning', message: 'Kein Überspannungsschutz (SPD Typ 2) vorgesehen.', norm: 'DIN VDE 0100-443/-534' })
  }

  // (e) Fehlerstromschutz 30 mA
  if (!hasDef(p, 'fi-2p', 'fi-4p', 'rcbo-1p')) {
    issues.push({ severity: 'warning', message: 'Kein Fehlerstromschutz (RCD/RCBO 30 mA) vorhanden.', norm: 'DIN VDE 0100-410' })
  }

  // (f) Reserveplatz ≥ 20 % in Verteilerreihen
  const verteilerReihen = p.felder.flatMap(f => f.reihen.filter(r => r.type === 'verteiler'))
  if (verteilerReihen.length > 0) {
    const totalTE = verteilerReihen.length * FELD_TE
    const usedTE = verteilerReihen.reduce((s, r) =>
      s + r.devices.reduce((t, d) => t + (ZAEHLER_COMPONENT_MAP.get(d.definitionId)?.teWidth ?? 0), 0), 0)
    const freeRatio = totalTE > 0 ? (totalTE - usedTE) / totalTE : 1
    if (freeRatio < 0.2) {
      issues.push({ severity: 'warning', message: `Zu wenig Reserveplatz in den Verteilerreihen (${Math.round(freeRatio * 100)} % frei, ≥ 20 % empfohlen).`, norm: 'DIN 18015-1' })
    }
  }

  // (g) TE-Überbelegung je Reihe (defensiv)
  for (const feld of p.felder) {
    for (const reihe of feld.reihen) {
      if (reihe.type === 'zaehlerplatz' || reihe.type === 'reserve') continue
      const sorted = [...reihe.devices].sort((a, b) => a.tePosition - b.tePosition)
      for (let i = 0; i < sorted.length; i++) {
        const w = ZAEHLER_COMPONENT_MAP.get(sorted[i].definitionId)?.teWidth ?? 0
        if (sorted[i].tePosition + w > FELD_TE) {
          issues.push({ severity: 'error', message: 'TE-Überbelegung: Gerät ragt über die Reihenbreite (12 TE) hinaus.' })
          break
        }
        if (i > 0) {
          const pw = ZAEHLER_COMPONENT_MAP.get(sorted[i - 1].definitionId)?.teWidth ?? 0
          if (sorted[i].tePosition < sorted[i - 1].tePosition + pw) {
            issues.push({ severity: 'error', message: 'TE-Überbelegung: Geräte überlappen in einer Reihe.' })
            break
          }
        }
      }
    }
  }

  // (h) Verteiler bestückt, aber kein Zähler → Hinweis
  const verteilerBestueckt = verteilerReihen.some(r => r.devices.length > 0)
  if (verteilerBestueckt && !meterOnPlatz) {
    issues.push({ severity: 'hint', message: 'Verteilerreihen sind bestückt, aber es fehlt noch der Zähler.' })
  }

  const order = { error: 0, warning: 1, hint: 2 }
  return issues.sort((a, b) => order[a.severity] - order[b.severity])
}

export function trafficLight(issues: ZaehlerIssue[]): 'red' | 'yellow' | 'green' {
  if (issues.some(i => i.severity === 'error')) return 'red'
  if (issues.some(i => i.severity === 'warning')) return 'yellow'
  return 'green'
}
