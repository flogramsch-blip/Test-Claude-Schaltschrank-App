/**
 * Spannungsebenen für Leitungen. In der Simulation werden die Leitungen nach
 * ihrer Spannungsebene eingefärbt; die Labels erscheinen in der Info-Box und
 * beim Überfahren mit der Maus.
 */
export interface VoltageLevel {
  id: string       // zugleich der gespeicherte Wert in Wire.voltage
  label: string    // Anzeige
  color: string    // Simulationsfarbe
  short: string     // Kurzform für Badges
}

export const VOLTAGE_LEVELS: VoltageLevel[] = [
  { id: '400 V AC', label: '400 V AC (3~)',        color: '#dc2626', short: '400 V~' },
  { id: '230 V AC', label: '230 V AC (L-N)',       color: '#f97316', short: '230 V~' },
  { id: '110 V AC', label: '110 V AC (Steuerung)', color: '#a855f7', short: '110 V~' },
  { id: '24 V DC',  label: '24 V DC (+)',          color: '#2563eb', short: '24 V=' },
  { id: '12 V DC',  label: '12 V DC (+)',          color: '#06b6d4', short: '12 V=' },
  { id: '0 V',      label: '0 V / GND (Bezug)',    color: '#94a3b8', short: '0 V' },
  { id: 'PE',       label: 'PE (Schutzleiter)',    color: '#16a34a', short: 'PE' },
]

const BY_ID = new Map(VOLTAGE_LEVELS.map(v => [v.id, v]))

/** Farbe einer Spannungsebene (für die Simulation). null wenn nicht gesetzt. */
export function voltageColor(v?: string): string | null {
  if (!v) return null
  return BY_ID.get(v)?.color ?? '#e5e7eb'  // unbekannt/eigen → hell
}

/** Anzeige-Label (fällt auf den Rohwert zurück, z. B. bei eigener Eingabe). */
export function voltageLabel(v?: string): string {
  if (!v) return ''
  return BY_ID.get(v)?.label ?? v
}

/** Kurzform für Badges/Overlays. */
export function voltageShort(v?: string): string {
  if (!v) return ''
  return BY_ID.get(v)?.short ?? v
}
