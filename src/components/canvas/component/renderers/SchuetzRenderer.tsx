import type { ComponentDefinition, PlacedComponent as PC } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
  placed: PC
  closed?: boolean
}

export default function SchuetzRenderer({ def, placed, closed = false }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#1e293b" />
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={1} fill="#0f2417" />

      {/* Status LED */}
      <circle cx={w / 2} cy={8} r={4} fill={closed ? '#22c55e' : '#374151'} />

      {/* Coil symbol */}
      <rect x={w / 2 - 8} y={14} width={16} height={8} rx={1} fill="none" stroke="#10b981" strokeWidth={1.5} />
      <text x={w / 2} y={21} textAnchor="middle" fontSize={5} fill="#10b981" fontFamily="monospace">A1/A2</text>

      {/* Main contact lines (3 poles) */}
      {[0.2, 0.5, 0.8].map((f, i) => {
        const cx = w * f
        return (
          <g key={i}>
            <line x1={cx} y1={26} x2={cx} y2={34} stroke="#64748b" strokeWidth={2} />
            {/* Contact switch indicator */}
            <line
              x1={cx - 5} y1={34}
              x2={cx + 5} y2={closed ? 34 : 28}
              stroke={closed ? '#10b981' : '#64748b'}
              strokeWidth={2}
            />
            <line x1={cx} y1={34} x2={cx} y2={h - 4} stroke="#64748b" strokeWidth={2} />
          </g>
        )
      })}

      <text x={w / 2} y={h + 12} textAnchor="middle" fontSize={7} fill="#64748b" fontFamily="monospace">
        {placed.settings.nominalCurrent}A
      </text>
    </g>
  )
}
