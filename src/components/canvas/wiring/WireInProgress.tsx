import { useUIStore } from '@/store/uiStore'
import { WIRE_COLORS } from '@/utils/teGrid'

export default function WireInProgress() {
  const wireDrawing = useUIStore(s => s.wireDrawing)

  if (!wireDrawing.active) return null

  const color = WIRE_COLORS[wireDrawing.pendingColor] ?? '#94a3b8'

  const start = { x: wireDrawing.fromX, y: wireDrawing.fromY }
  const cursor = { x: wireDrawing.currentX, y: wireDrawing.currentY }
  const pts = [start, ...wireDrawing.waypoints, cursor]
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <g pointerEvents="none">
      <path
        d={d}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 3"
        opacity={0.85}
      />
      {/* Startpunkt */}
      <circle cx={start.x} cy={start.y} r={3} fill={color} />
      {/* gesetzte Zwischenstops (Ecken) */}
      {wireDrawing.waypoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.2} fill="#f59e0b" stroke="#0f172a" strokeWidth={1} />
      ))}
      {/* aktueller Cursor */}
      <circle cx={cursor.x} cy={cursor.y} r={3} fill={color} opacity={0.5} />
    </g>
  )
}
