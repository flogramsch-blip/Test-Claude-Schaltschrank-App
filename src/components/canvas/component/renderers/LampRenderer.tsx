import type { ComponentDefinition, PlacedComponent as PC } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
  placed: PC
  energized?: boolean
}

export default function LampRenderer({ def, energized = false }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX
  const cx = w / 2
  const cy = h / 2

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#1e293b" />
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={1} fill="#0f172a" />

      {/* Glow when energized */}
      {energized && (
        <circle cx={cx} cy={cy} r={12} fill={def.color} opacity={0.35} />
      )}

      {/* Lamp body */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={energized ? def.color : '#334155'}
        stroke={def.color}
        strokeWidth={1.5}
      />
      {/* IEC lamp cross symbol */}
      <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} stroke={energized ? '#0f172a' : '#64748b'} strokeWidth={1.5} />
      <line x1={cx - 5} y1={cy + 5} x2={cx + 5} y2={cy - 5} stroke={energized ? '#0f172a' : '#64748b'} strokeWidth={1.5} />

      <text x={cx} y={h - 3} textAnchor="middle" fontSize={5} fill="#94a3b8" fontFamily="monospace" fontWeight="bold">
        {def.shortName}
      </text>
    </g>
  )
}
