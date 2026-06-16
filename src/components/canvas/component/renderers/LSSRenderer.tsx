import type { ComponentDefinition, PlacedComponent as PC } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
  placed: PC
  tripped?: boolean
}

export default function LSSRenderer({ def, placed, tripped }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX
  const poleCount = def.electricalModel.poleCount
  const poleW = w / poleCount

  return (
    <g>
      {/* Housing */}
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#1e293b" />

      {/* Poles */}
      {Array.from({ length: poleCount }).map((_, i) => (
        <g key={i} transform={`translate(${i * poleW}, 0)`}>
          {/* Pole body */}
          <rect x={2} y={2} width={poleW - 4} height={h - 4} rx={1} fill="#334155" />
          {/* Toggle handle */}
          <rect
            x={3}
            y={tripped ? 6 : h / 2 - 8}
            width={poleW - 6}
            height={16}
            rx={2}
            fill={tripped ? '#dc2626' : '#f97316'}
          />
          {/* IEC symbol: breaker contact line */}
          <line x1={poleW / 2} y1={tripped ? 22 : 30} x2={poleW / 2} y2={h - 8} stroke="#64748b" strokeWidth={1.5} />
        </g>
      ))}

      {/* AUSGELÖST label when tripped */}
      {tripped && (
        <text
          x={w / 2} y={h - 2}
          textAnchor="middle"
          fontSize={5}
          fill="#dc2626"
          fontWeight="bold"
          fontFamily="monospace"
        >
          AUS
        </text>
      )}

      {/* Nominal current display */}
      <text
        x={w / 2}
        y={h + 12}
        textAnchor="middle"
        fontSize={7}
        fill="#64748b"
        fontFamily="monospace"
      >
        {placed.settings.nominalCurrent}A
      </text>
    </g>
  )
}
