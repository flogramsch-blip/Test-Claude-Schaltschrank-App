import { TE_WIDTH_PX, RAIL_HEIGHT_PX, RAIL_X_OFFSET } from '@/utils/teGrid'

interface Props {
  lengthTE: number
  label: string
  railType?: 'din' | 'sps'
}

export default function DINRailTrack({ lengthTE, label, railType = 'din' }: Props) {
  const w = lengthTE * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX
  const isSps = railType === 'sps'

  return (
    <g>
      {/* Rail label */}
      <text x={RAIL_X_OFFSET - 6} y={h / 2 + 4} textAnchor="end" fontSize={9} fill={isSps ? '#0d9488' : '#64748b'} fontFamily="monospace">
        {label}
      </text>

      {/* Rail body — T35-Hutschiene bzw. SPS-Profilschiene */}
      <g transform={`translate(${RAIL_X_OFFSET}, 0)`}>
        {/* Bottom base */}
        <rect x={0} y={0} width={w} height={h} rx={1} fill={isSps ? '#334155' : '#6b7280'} />

        {/* Top mounting lip */}
        <rect x={0} y={0} width={w} height={5} fill={isSps ? '#1e293b' : '#4b5563'} />

        {/* Main channel body */}
        <rect x={0} y={5} width={w} height={h - 10} fill={isSps ? '#64748b' : '#9ca3af'} />

        {/* Center channel groove */}
        <rect x={0} y={h / 2 - 3} width={w} height={6} fill={isSps ? '#0f766e' : '#6b7280'} />

        {/* Bottom mounting lip */}
        <rect x={0} y={h - 5} width={w} height={5} fill={isSps ? '#1e293b' : '#4b5563'} />

        {/* SPS-Profilschiene: Befestigungslöcher */}
        {isSps && Array.from({ length: Math.floor(lengthTE / 4) }).map((_, i) => (
          <circle key={i} cx={(i + 0.5) * 4 * TE_WIDTH_PX} cy={h / 2} r={2} fill="#1e293b" stroke="#94a3b8" strokeWidth={0.5} />
        ))}

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
