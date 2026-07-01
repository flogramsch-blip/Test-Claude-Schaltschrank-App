import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import { contentSize } from '@/utils/exportImage'

/**
 * Zeichnet die Gehäusewand (Schaltschrank-Korpus) rund um die Hutschienen.
 * Kabeldurchführungen sitzen symbolisch in dieser Wand.
 */
export default function CabinetWall() {
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const show = useUIStore(s => s.showCabinetWall)
  if (!show) return null

  const { width, height } = contentSize(schaltschrank)
  const pad = 14
  const x = -pad
  const y = -pad
  const w = width + pad * 2
  const h = height + pad * 2
  const wall = 10

  return (
    <g pointerEvents="none">
      {/* Äußerer Korpus */}
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#94a3b8" />
      {/* Innenkante (Montageplatte) */}
      <rect x={x + wall} y={y + wall} width={w - 2 * wall} height={h - 2 * wall} rx={3} fill="#cbd5e1" />
      {/* Innenfläche (Montageplatte grau, halbtransparent, damit dunkler Hintergrund durchscheint) */}
      <rect x={x + wall} y={y + wall} width={w - 2 * wall} height={h - 2 * wall} rx={3} fill="#0f172a" opacity={0.82} />

      {/* Eckschrauben */}
      {[[x + wall / 2, y + wall / 2], [x + w - wall / 2, y + wall / 2], [x + wall / 2, y + h - wall / 2], [x + w - wall / 2, y + h - wall / 2]].map(([sx, sy], i) => (
        <g key={i}>
          <circle cx={sx} cy={sy} r={3} fill="#475569" stroke="#e2e8f0" strokeWidth={0.6} />
          <line x1={sx - 2} y1={sy} x2={sx + 2} y2={sy} stroke="#e2e8f0" strokeWidth={0.6} />
        </g>
      ))}

      {/* Türscharniere links */}
      {[y + h * 0.2, y + h * 0.8].map((hy, i) => (
        <rect key={i} x={x - 3} y={hy - 6} width={5} height={12} rx={1} fill="#64748b" />
      ))}

      {/* Beschriftung */}
      <text x={x + w - 6} y={y + h - 4} textAnchor="end" fontSize={7} fill="#64748b" fontFamily="monospace">
        Schaltschrank · IP54
      </text>
    </g>
  )
}
