import { useUIStore } from '@/store/uiStore'
import { WIRE_COLORS } from '@/utils/teGrid'

export default function WireInProgress() {
  const wireDrawing = useUIStore(s => s.wireDrawing)

  if (!wireDrawing.active) return null

  const color = WIRE_COLORS[wireDrawing.pendingColor] ?? '#94a3b8'

  const x1 = wireDrawing.fromX
  const y1 = wireDrawing.fromY
  const x2 = wireDrawing.currentX
  const y2 = wireDrawing.currentY

  // Simple elbow path
  const midY = Math.min(y1, y2) - 12
  const d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`

  return (
    <g pointerEvents="none">
      <path
        d={d}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="6 3"
        opacity={0.8}
      />
      {/* Start dot */}
      <circle cx={x1} cy={y1} r={3} fill={color} />
      {/* End dot */}
      <circle cx={x2} cy={y2} r={3} fill={color} opacity={0.5} />
    </g>
  )
}
