import type { ComponentDefinition, PlacedComponent as PC } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
  placed: PC
  tripped?: boolean
}

export default function MotorschutzRenderer({ def, placed, tripped }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#1e293b" />
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={1} fill="#1e3a5f" />

      {/* Trip button / reset */}
      <rect x={4} y={4} width={w - 8} height={10} rx={2} fill={tripped ? '#dc2626' : '#3b82f6'} />
      <text x={w / 2} y={13} textAnchor="middle" fontSize={5} fill="white" fontFamily="monospace" fontWeight="bold">
        {tripped ? 'TRIP' : 'MSS'}
      </text>

      {/* Adjustment dial */}
      <circle cx={w / 2} cy={h / 2 + 4} r={8} fill="#334155" stroke="#64748b" strokeWidth={1} />
      <line
        x1={w / 2} y1={h / 2 + 4 - 6}
        x2={w / 2} y2={h / 2 + 4 - 2}
        stroke="#f97316" strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Bimetal symbol — 3 wavy lines */}
      {[0.3, 0.5, 0.7].map((f, i) => (
        <path
          key={i}
          d={`M ${w * f - 4} ${h - 10} Q ${w * f} ${h - 7} ${w * f + 4} ${h - 10}`}
          stroke="#f59e0b"
          strokeWidth={1.5}
          fill="none"
        />
      ))}

      <text x={w / 2} y={h + 12} textAnchor="middle" fontSize={7} fill="#64748b" fontFamily="monospace">
        {placed.settings.nominalCurrent}A
      </text>
    </g>
  )
}
