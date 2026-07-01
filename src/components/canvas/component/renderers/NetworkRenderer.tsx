import type { ComponentDefinition } from '@/types'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX } from '@/utils/teGrid'

interface Props {
  def: ComponentDefinition
}

// LAN-Switch / Patchfeld: Reihe von RJ45-Ports
export default function NetworkRenderer({ def }: Props) {
  const w = def.teWidth * TE_WIDTH_PX
  const h = RAIL_HEIGHT_PX
  const isPatch = def.id === 'patchfeld'
  const portCount = isPatch ? 12 : 8

  const margin = 6
  const gap = 3
  const portW = (w - margin * 2 - gap * (portCount - 1)) / portCount
  const portH = 12
  const portY = h / 2 - portH / 2 + 2

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={2} fill="#0f172a" />
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={1} fill={isPatch ? '#0b3a52' : '#0c4a6e'} />

      {/* Beschriftung */}
      <text x={margin} y={12} fontSize={7} fill="#7dd3fc" fontFamily="monospace" fontWeight="bold">
        {def.shortName}
      </text>

      {/* RJ45-Ports */}
      {Array.from({ length: portCount }).map((_, i) => {
        const x = margin + i * (portW + gap)
        return (
          <g key={i}>
            <rect x={x} y={portY} width={portW} height={portH} rx={1} fill="#1e293b" stroke="#38bdf8" strokeWidth={0.8} />
            {/* RJ45-Nase */}
            <rect x={x + portW / 2 - 1.5} y={portY + portH - 2} width={3} height={2} fill="#38bdf8" />
            {/* Link-LED */}
            {!isPatch && <circle cx={x + 2} cy={portY + 2} r={0.9} fill="#22c55e" />}
          </g>
        )
      })}
    </g>
  )
}
