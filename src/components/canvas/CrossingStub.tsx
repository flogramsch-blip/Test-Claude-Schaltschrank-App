import type { CrossingSystem } from '@/types/schaltschrank'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'

interface Props {
  wireId: string
  x: number
  y: number
  up: boolean          // Klemme oben (Leitung geht nach oben) oder unten
  label: string        // Kennzeichen der Gegenseite
  crossing: CrossingSystem
}

export const CROSSING_LABELS: Record<CrossingSystem, string> = {
  harting: 'Harting-Steckverbinder',
  conduit: 'Kabelschlauch / Wellrohr',
  terminal: 'Reihenklemme (Durchgang)',
}

/**
 * Symbol an der Übergabestelle einer flächenübergreifenden Leitung
 * (Gehäusewand-Durchführung). Wählbar: Harting, Kabelschlauch, Klemme.
 */
export default function CrossingStub({ wireId, x, y, up, label, crossing }: Props) {
  const selectWire = useUIStore(s => s.selectWire)
  const mode = useUIStore(s => s.mode)
  const removeWire = useSchaltschrankStore(s => s.removeWire)
  const selectedWireId = useUIStore(s => s.selectedWireId)
  const selected = selectedWireId === wireId

  const dir = up ? -1 : 1
  const yTip = y + dir * 20  // Ende der Anschlussleitung
  const sy = y + dir * 24    // Symbol-Position

  function onClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (mode === 'delete') removeWire(wireId)
    else selectWire(wireId)
  }

  return (
    <g onClick={onClick} style={{ cursor: mode === 'delete' ? 'not-allowed' : 'pointer' }}>
      {/* Anschlussleitung zur Klemme */}
      <line x1={x} y1={y} x2={x} y2={yTip} stroke="#f59e0b" strokeWidth={2} />
      {/* fette unsichtbare Trefferfläche */}
      <rect x={x - 12} y={sy - 10} width={24} height={20} fill="transparent" />

      <g transform={`translate(${x}, ${sy})`}>
        {crossing === 'harting' && (
          <g>
            {/* Harting-Gehäuse (Rechteck-Steckverbinder mit Bügeln + Pins) */}
            <rect x={-10} y={-7} width={20} height={14} rx={1.5} fill="#1f2937" stroke={selected ? '#f59e0b' : '#9ca3af'} strokeWidth={1.2} />
            <rect x={-13} y={-4} width={3} height={8} rx={1} fill="#6b7280" />
            <rect x={10} y={-4} width={3} height={8} rx={1} fill="#6b7280" />
            {[-6, -2, 2, 6].map(px => (
              <g key={px}>
                <circle cx={px} cy={-2.5} r={1.1} fill="#fbbf24" />
                <circle cx={px} cy={2.5} r={1.1} fill="#fbbf24" />
              </g>
            ))}
          </g>
        )}
        {crossing === 'conduit' && (
          <g>
            {/* Kabelschlauch / Wellrohr (geripptes Rohr) */}
            <rect x={-11} y={-6} width={22} height={12} rx={6} fill="#334155" stroke={selected ? '#f59e0b' : '#64748b'} strokeWidth={1.2} />
            {[-7, -3.5, 0, 3.5, 7].map(px => (
              <line key={px} x1={px} y1={-6} x2={px} y2={6} stroke="#0f172a" strokeWidth={1} />
            ))}
          </g>
        )}
        {crossing === 'terminal' && (
          <g>
            {/* Reihenklemme */}
            <rect x={-7} y={-8} width={14} height={16} rx={1.5} fill="#475569" stroke={selected ? '#f59e0b' : '#94a3b8'} strokeWidth={1.2} />
            <circle cx={0} cy={-4} r={2} fill="#1f2937" stroke="#cbd5e1" strokeWidth={0.6} />
            <circle cx={0} cy={4} r={2} fill="#1f2937" stroke="#cbd5e1" strokeWidth={0.6} />
          </g>
        )}
      </g>

      {/* Kennzeichen der Gegenseite */}
      <text x={x} y={sy + dir * 16 + (up ? 0 : 4)} textAnchor="middle" fontSize={7} fill="#f59e0b" fontFamily="monospace">
        ⇄ {label}
      </text>
    </g>
  )
}
