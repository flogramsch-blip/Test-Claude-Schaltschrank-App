import type { ComponentDefinition, PlacedComponent as PC } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
  placed: PC
  tripped?: boolean
}

export default function FIRenderer({ def, placed, tripped }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#1e293b" />
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={1} fill="#2d1b4e" />

      {/* Toggle handle */}
      <rect x={4} y={tripped ? 4 : h / 2 - 6} width={w - 8} height={14} rx={2} fill={tripped ? '#dc2626' : '#a855f7'} />

      {/* Test button */}
      <circle cx={w / 2} cy={h - 10} r={5} fill="#334155" stroke="#a855f7" strokeWidth={1.5} />
      <text x={w / 2} y={h - 7} textAnchor="middle" fontSize={4} fill="#a855f7" fontFamily="monospace">T</text>

      {/* mA rating */}
      <text x={w / 2} y={h / 2 + 14} textAnchor="middle" fontSize={5} fill="#c4b5fd" fontFamily="monospace">
        {placed.settings.residualCurrent ?? 30}mA
      </text>

      <text x={w / 2} y={h + 12} textAnchor="middle" fontSize={7} fill="#64748b" fontFamily="monospace">
        {placed.settings.nominalCurrent}A
      </text>
    </g>
  )
}
