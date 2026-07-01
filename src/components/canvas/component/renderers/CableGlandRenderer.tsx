import type { ComponentDefinition } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
}

// Kabelverschraubung / Kabeldurchführung: obere Klemme innen, untere extern
export default function CableGlandRenderer({ def }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX
  const cx = w / 2

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#1e293b" />

      {/* Gehäusewand-Linie (Grenze innen/außen) */}
      <line x1={2} y1={h / 2} x2={w - 2} y2={h / 2} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" />

      {/* Verschraubung (Sechskant) */}
      <g transform={`translate(${cx}, ${h / 2})`}>
        <circle r={7} fill="#475569" stroke="#94a3b8" strokeWidth={1} />
        {[0, 60, 120, 180, 240, 300].map(a => {
          const r1 = 5, r2 = 7
          const rad = (a * Math.PI) / 180
          return <line key={a} x1={Math.cos(rad) * r1} y1={Math.sin(rad) * r1} x2={Math.cos(rad) * r2} y2={Math.sin(rad) * r2} stroke="#94a3b8" strokeWidth={1.5} />
        })}
        {/* Kabel */}
        <circle r={2.5} fill="#111827" />
      </g>

      {/* Labels */}
      <text x={cx} y={11} textAnchor="middle" fontSize={5} fill="#64748b" fontFamily="monospace">innen</text>
      <text x={cx} y={h - 5} textAnchor="middle" fontSize={5} fill="#f59e0b" fontFamily="monospace">extern ↓</text>
    </g>
  )
}
