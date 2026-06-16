import { TE_WIDTH_PX, RAIL_HEIGHT_PX, RAIL_X_OFFSET } from '@/utils/teGrid'

interface Props {
  lengthTE: number
  label: string
}

export default function DINRailTrack({ lengthTE, label }: Props) {
  const w = lengthTE * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX

  return (
    <g>
      {/* Rail label */}
      <text x={RAIL_X_OFFSET - 6} y={h / 2 + 4} textAnchor="end" fontSize={9} fill="#64748b" fontFamily="monospace">
        {label}
      </text>

      {/* DIN rail body — T35 profile */}
      <g transform={`translate(${RAIL_X_OFFSET}, 0)`}>
        {/* Bottom base */}
        <rect x={0} y={0} width={w} height={h} rx={1} fill="#6b7280" />

        {/* Top mounting lip */}
        <rect x={0} y={0} width={w} height={5} fill="#4b5563" />

        {/* Main channel body */}
        <rect x={0} y={5} width={w} height={h - 10} fill="#9ca3af" />

        {/* Center channel groove */}
        <rect x={0} y={h / 2 - 3} width={w} height={6} fill="#6b7280" />

        {/* Bottom mounting lip */}
        <rect x={0} y={h - 5} width={w} height={5} fill="#4b5563" />

        {/* TE marks every 5 TE */}
        {Array.from({ length: Math.floor(lengthTE / 5) + 1 }).map((_, i) => (
          <line
            key={i}
            x1={i * 5 * TE_WIDTH_PX}
            y1={0}
            x2={i * 5 * TE_WIDTH_PX}
            y2={h}
            stroke="#4b5563"
            strokeWidth={0.5}
            opacity={0.6}
          />
        ))}

        {/* TE number labels */}
        {Array.from({ length: Math.floor(lengthTE / 5) + 1 }).map((_, i) => (
          <text
            key={i}
            x={i * 5 * TE_WIDTH_PX + 2}
            y={h - 1}
            fontSize={5}
            fill="#374151"
            fontFamily="monospace"
          >
            {i * 5}
          </text>
        ))}
      </g>
    </g>
  )
}
