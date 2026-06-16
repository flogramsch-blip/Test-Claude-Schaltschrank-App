import type { ComponentDefinition } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
}

export default function KlemmeRenderer({ def }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX
  const isPE = def.id === 'pe-klemme'

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={1} fill={isPE ? '#14532d' : '#374151'} />
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={1} fill={isPE ? '#166534' : '#475569'} />

      {/* Screw head (top) */}
      <circle cx={w / 2} cy={8} r={4} fill="#1f2937" stroke="#9ca3af" strokeWidth={1} />
      <line x1={w / 2 - 2.5} y1={8} x2={w / 2 + 2.5} y2={8} stroke="#9ca3af" strokeWidth={1} />
      <line x1={w / 2} y1={5.5} x2={w / 2} y2={10.5} stroke="#9ca3af" strokeWidth={1} />

      {/* Conductor inlet */}
      <rect x={4} y={14} width={w - 8} height={h / 2 - 8} rx={1} fill="#111827" />

      {/* Screw head (bottom) */}
      <circle cx={w / 2} cy={h - 8} r={4} fill="#1f2937" stroke="#9ca3af" strokeWidth={1} />
      <line x1={w / 2 - 2.5} y1={h - 8} x2={w / 2 + 2.5} y2={h - 8} stroke="#9ca3af" strokeWidth={1} />
      <line x1={w / 2} y1={h - 10.5} x2={w / 2} y2={h - 5.5} stroke="#9ca3af" strokeWidth={1} />

      {/* PE symbol */}
      {isPE && (
        <g transform={`translate(${w / 2}, ${h / 2})`}>
          <circle cx={0} cy={0} r={4} fill="none" stroke="#22c55e" strokeWidth={1} />
          <line x1={0} y1={-4} x2={0} y2={4} stroke="#22c55e" strokeWidth={1} />
          <line x1={-4} y1={0} x2={4} y2={0} stroke="#22c55e" strokeWidth={1} />
        </g>
      )}
    </g>
  )
}
