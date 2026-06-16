import type { ComponentDefinition, PlacedComponent as PC } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
  placed: PC
}

export default function GenericRenderer({ def, placed }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#1e293b" />
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={1} fill="#334155" />

      {/* Accent color bar */}
      <rect x={4} y={4} width={w - 8} height={6} rx={1} fill={def.color} />

      {/* Short name */}
      <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontSize={7} fill="#e2e8f0" fontFamily="monospace" fontWeight="bold">
        {def.shortName}
      </text>

      <text x={w / 2} y={h + 12} textAnchor="middle" fontSize={7} fill="#64748b" fontFamily="monospace">
        {placed.settings.nominalCurrent}A
      </text>
    </g>
  )
}
