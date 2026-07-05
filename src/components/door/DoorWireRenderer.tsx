import { useRef, useState } from 'react'
import type { Wire } from '@/types/schaltschrank'
import { WIRE_COLORS } from '@/utils/teGrid'
import { voltageColor, voltageShort, voltageLabel } from '@/utils/voltageLevels'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { resolveWireEndpoint } from '@/utils/surfaceGeometry'

interface Props {
  wire: Wire
}

/** Leitung auf der Fronttür (Frontplatten-Bauteile und/oder Übergabefeld-Pins) */
export default function DoorWireRenderer({ wire }: Props) {
  const selectedWireId = useUIStore(s => s.selectedWireId)
  const mode = useUIStore(s => s.mode)
  const isSimRunning = useUIStore(s => s.simulationRunning)
  const selectWire = useUIStore(s => s.selectWire)
  const removeWire = useSchaltschrankStore(s => s.removeWire)
  const updateWire = useSchaltschrankStore(s => s.updateWire)
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const isSelected = selectedWireId === wire.id
  const dragRef = useRef<{ moved: boolean } | null>(null)
  const wpDragRef = useRef<{ index: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)

  const a = resolveWireEndpoint(schaltschrank, wire.fromInstanceId, wire.fromConnectionId, 'door')
  const b = resolveWireEndpoint(schaltschrank, wire.toInstanceId, wire.toConnectionId, 'door')
  if (!a || !b) return null

  const manual = !!wire.manualRoute && (wire.waypoints?.length ?? 0) > 0
  let pathD: string
  let handleX: number, handleY: number
  if (manual) {
    const pts = [a, ...wire.waypoints, b]
    pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const mid = wire.waypoints[Math.floor((wire.waypoints.length - 1) / 2)]
    handleX = mid.x; handleY = mid.y
  } else {
    const midY = wire.waypoints?.[0]?.y ?? (a.y + b.y) / 2
    pathD = `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`
    handleX = (a.x + b.x) / 2; handleY = midY
  }

  const baseColor = WIRE_COLORS[wire.color] ?? '#94a3b8'
  const vColor = voltageColor(wire.voltage)
  const color = isSimRunning && vColor ? vColor : baseColor
  const showVoltageBadge = isSimRunning && hovered && !!wire.voltage

  function canvasCoords(el: SVGGraphicsElement, cx: number, cy: number) {
    const parent = el.parentNode as SVGGraphicsElement | null
    const svg = el.ownerSVGElement
    const ctm = parent?.getScreenCTM?.()
    if (!svg || !ctm) return null
    const p = svg.createSVGPoint(); p.x = cx; p.y = cy
    return p.matrixTransform(ctm.inverse())
  }
  function onDown(e: React.PointerEvent) {
    if (mode === 'delete') { e.stopPropagation(); removeWire(wire.id); return }
    e.stopPropagation()
    selectWire(wire.id)
    ;(e.currentTarget as unknown as SVGGraphicsElement).setPointerCapture?.(e.pointerId)
    dragRef.current = { moved: false }
  }
  function onMove(e: React.PointerEvent) {
    if (!dragRef.current || manual) return
    dragRef.current.moved = true
    if (!dragging) setDragging(true)
    const loc = canvasCoords(e.currentTarget as unknown as SVGGraphicsElement, e.clientX, e.clientY)
    if (loc) updateWire(wire.id, { waypoints: [{ x: (a!.x + b!.x) / 2, y: loc.y }] })
  }
  function onUp(e: React.PointerEvent) {
    dragRef.current = null; setDragging(false)
    try { (e.currentTarget as unknown as SVGGraphicsElement).releasePointerCapture?.(e.pointerId) } catch { /* ignore */ }
  }
  function wpDown(e: React.PointerEvent, i: number) {
    if (mode === 'delete') return
    e.stopPropagation()
    ;(e.currentTarget as unknown as SVGGraphicsElement).setPointerCapture?.(e.pointerId)
    wpDragRef.current = { index: i }
    selectWire(wire.id)
  }
  function wpMove(e: React.PointerEvent) {
    const st = wpDragRef.current
    if (!st) return
    const loc = canvasCoords(e.currentTarget as unknown as SVGGraphicsElement, e.clientX, e.clientY)
    if (!loc) return
    const wps = (wire.waypoints ?? []).map(p => ({ ...p }))
    wps[st.index] = { x: loc.x, y: loc.y }
    updateWire(wire.id, { waypoints: wps })
  }
  function wpUp(e: React.PointerEvent) {
    wpDragRef.current = null
    try { (e.currentTarget as unknown as SVGGraphicsElement).releasePointerCapture?.(e.pointerId) } catch { /* ignore */ }
  }

  return (
    <g
      style={{ cursor: mode === 'delete' ? 'not-allowed' : dragging ? 'grabbing' : 'grab' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onClick={e => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <path d={pathD} stroke="transparent" strokeWidth={18} fill="none" />
      <path d={pathD} stroke={color} strokeWidth={isSelected || hovered ? 3.7 : 2.5} fill="none" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: isSelected ? 'drop-shadow(0 0 3px #f59e0b)' : hovered ? 'drop-shadow(0 0 2px #f59e0b)' : 'none' }} />

      {!manual && (isSelected || hovered) && mode !== 'delete' && (
        <circle cx={handleX} cy={handleY} r={5} fill="#f59e0b" stroke="#0f172a" strokeWidth={1} opacity={isSelected ? 1 : 0.7}>
          <title>Leitung verschieben (ziehen)</title>
        </circle>
      )}

      {manual && (isSelected || hovered) && mode !== 'delete' && wire.waypoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill="#f59e0b" stroke="#0f172a" strokeWidth={1} opacity={isSelected ? 1 : 0.7}
          style={{ cursor: 'grab' }} onPointerDown={e => wpDown(e, i)} onPointerMove={wpMove} onPointerUp={wpUp}>
          <title>Ecke verschieben</title>
        </circle>
      ))}

      {showVoltageBadge && (
        <g pointerEvents="none">
          <rect x={handleX - 26} y={handleY - 22} width={52} height={13} rx={3} fill="#0f172a" stroke={vColor ?? '#94a3b8'} strokeWidth={1} />
          <text x={handleX} y={handleY - 13} textAnchor="middle" fontSize={7.5} fill={vColor ?? '#e5e7eb'} fontFamily="monospace" fontWeight="bold">
            {voltageShort(wire.voltage)}
          </text>
        </g>
      )}

      {wire.voltage && <title>{voltageLabel(wire.voltage)}</title>}
    </g>
  )
}
