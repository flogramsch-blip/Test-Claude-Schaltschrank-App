import { useState } from 'react'
import type { ConnectionPoint } from '@/types/components'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import type { WireColor } from '@/types/components'

interface Props {
  cp: ConnectionPoint
  instanceId: string
  absoluteX: number
  absoluteY: number
}

export default function ConnectionPointMarker({ cp, instanceId, absoluteX, absoluteY }: Props) {
  const [hovered, setHovered] = useState(false)
  const mode = useUIStore(s => s.mode)
  const wireDrawing = useUIStore(s => s.wireDrawing)
  const startWireDrawing = useUIStore(s => s.startWireDrawing)
  const cancelWireDrawing = useUIStore(s => s.cancelWireDrawing)
  const pendingColor = useUIStore(s => s.wireDrawing.pendingColor)
  const addWire = useSchaltschrankStore(s => s.addWire)

  const wires = useSchaltschrankStore(s => s.schaltschrank.wires)
  const connectedWiresCount = wires.filter(
    w => (w.fromInstanceId === instanceId && w.fromConnectionId === cp.id) ||
         (w.toInstanceId === instanceId && w.toConnectionId === cp.id)
  ).length

  const isFull = connectedWiresCount >= 2
  const isDrawingFrom = wireDrawing.active && wireDrawing.fromInstanceId === instanceId && wireDrawing.fromConnectionId === cp.id
  const canConnect = mode === 'wire' || wireDrawing.active

  function getFill() {
    if (isDrawingFrom) return '#f59e0b'
    if (hovered && canConnect) return isFull ? '#ef4444' : '#22c55e'
    if (connectedWiresCount > 0) return '#3b82f6'
    return '#94a3b8'
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (mode !== 'wire' && !wireDrawing.active) return

    if (wireDrawing.active) {
      // Complete wire
      if (wireDrawing.fromInstanceId === instanceId && wireDrawing.fromConnectionId === cp.id) {
        cancelWireDrawing()
        return
      }
      addWire({
        fromInstanceId: wireDrawing.fromInstanceId!,
        fromConnectionId: wireDrawing.fromConnectionId!,
        toInstanceId: instanceId,
        toConnectionId: cp.id,
        color: pendingColor as WireColor,
        crossSection: 1.5,
      })
      cancelWireDrawing()
    } else {
      startWireDrawing(instanceId, cp.id, absoluteX, absoluteY)
    }
  }

  const r = hovered ? 5.5 : 4

  return (
    <circle
      cx={absoluteX}
      cy={absoluteY}
      r={r}
      fill={getFill()}
      stroke="#0f172a"
      strokeWidth={1}
      style={{ cursor: canConnect ? 'crosshair' : 'default', transition: 'r 0.1s, fill 0.1s' }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <title>{cp.label} ({cp.type})</title>
    </circle>
  )
}
