import { useRef, useState } from 'react'
import { WIRE_COLORS, resolveConnectionPos } from '@/utils/teGrid'
import { buildWirePath, buildCrossRailPath, autoChannelY } from '@/utils/wireRouting'
import type { Wire } from '@/types/schaltschrank'
import type { DINRail } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'

interface Props {
  wire: Wire
  rails: DINRail[]
  index: number
  isSimRunning: boolean
  isFault?: boolean
  current?: number
}

function loadColor(ratio: number): string {
  if (ratio < 0.5) return '#22c55e'   // grün: gering
  if (ratio < 0.8) return '#eab308'   // gelb: mittel
  if (ratio < 1.0) return '#f97316'   // orange: hoch
  return '#ef4444'                    // rot: Überlast
}

export default function WireRenderer({ wire, rails, index, isSimRunning, isFault, current }: Props) {
  const selectedWireId = useUIStore(s => s.selectedWireId)
  const mode = useUIStore(s => s.mode)
  const selectWire = useUIStore(s => s.selectWire)
  const removeWire = useSchaltschrankStore(s => s.removeWire)
  const updateWire = useSchaltschrankStore(s => s.updateWire)
  const isSelected = selectedWireId === wire.id

  const dragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Find from component
  const fromRail = rails.find(r => r.placedComponents.some(c => c.instanceId === wire.fromInstanceId))
  const toRail = rails.find(r => r.placedComponents.some(c => c.instanceId === wire.toInstanceId))
  if (!fromRail || !toRail) return null

  const fromPlaced = fromRail.placedComponents.find(c => c.instanceId === wire.fromInstanceId)
  const toPlaced = toRail.placedComponents.find(c => c.instanceId === wire.toInstanceId)
  if (!fromPlaced || !toPlaced) return null

  const fromDef = COMPONENT_MAP.get(fromPlaced.definitionId)
  const toDef = COMPONENT_MAP.get(toPlaced.definitionId)
  if (!fromDef || !toDef) return null

  const fromConn = fromDef.connections.find(c => c.id === wire.fromConnectionId)
  const toConn = toDef.connections.find(c => c.id === wire.toConnectionId)
  if (!fromConn || !toConn) return null

  const fromPos = resolveConnectionPos(fromConn.relativeX, fromConn.relativeY, fromPlaced.tePosition, fromRail.yPosition)
  const toPos = resolveConnectionPos(toConn.relativeX, toConn.relativeY, toPlaced.tePosition, toRail.yPosition)

  const samRail = fromRail.id === toRail.id
  const wpt = wire.waypoints?.[0]
  const channelY = samRail ? (wpt?.y ?? autoChannelY(fromPos.y, toPos.y, index % 4, fromRail.yPosition)) : 0
  const laneX = !samRail ? wpt?.x : undefined
  const pathD = samRail
    ? buildWirePath(fromPos.x, fromPos.y, toPos.x, toPos.y, index % 4, fromRail.yPosition, channelY)
    : buildCrossRailPath(fromPos.x, fromPos.y, toPos.x, toPos.y, index % 6, laneX)

  // Position des Zieh-Griffs (Mitte des horizontalen bzw. vertikalen Kanals)
  const handleX = samRail ? (fromPos.x + toPos.x) / 2 : (laneX ?? (fromPos.x + toPos.x) / 2)
  const handleY = samRail ? channelY : (fromPos.y + toPos.y) / 2

  const baseColor = WIRE_COLORS[wire.color] ?? '#94a3b8'
  const fromNominal = fromDef.electricalModel.nominalCurrentDefault
  const nominal = fromPlaced.settings.nominalCurrent ?? fromNominal
  const loadRatio = current && nominal ? current / nominal : 0
  const showLoad = isSimRunning && !isFault && current != null && current > 0.01
  const color = showLoad ? loadColor(loadRatio) : baseColor
  const strokeWidth = isSelected ? 3.5 : showLoad ? 3 : 2.5

  function canvasCoords(el: SVGGraphicsElement, cx: number, cy: number) {
    const parent = el.parentNode as SVGGraphicsElement | null
    const svg = el.ownerSVGElement
    const ctm = parent?.getScreenCTM?.()
    if (!svg || !ctm) return null
    const pt = svg.createSVGPoint()
    pt.x = cx; pt.y = cy
    return pt.matrixTransform(ctm.inverse())
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (mode === 'delete') {
      e.stopPropagation()
      removeWire(wire.id)
      return
    }
    e.stopPropagation()
    selectWire(wire.id)
    const el = e.currentTarget as unknown as SVGGraphicsElement
    el.setPointerCapture?.(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, moved: false }
  }

  function handlePointerMove(e: React.PointerEvent) {
    const st = dragRef.current
    if (!st) return
    if (!st.moved && Math.hypot(e.clientX - st.startX, e.clientY - st.startY) < 3) return
    if (!st.moved) setDragging(true)
    st.moved = true
    const loc = canvasCoords(e.currentTarget as unknown as SVGGraphicsElement, e.clientX, e.clientY)
    if (!loc) return
    // Kanal verschieben: gleich-Schiene → Y, kreuz-Schiene → X
    updateWire(wire.id, {
      waypoints: [{ x: samRail ? (fromPos.x + toPos.x) / 2 : loc.x, y: samRail ? loc.y : (fromPos.y + toPos.y) / 2 }],
    })
  }

  function handlePointerUp(e: React.PointerEvent) {
    dragRef.current = null
    setDragging(false)
    try { (e.currentTarget as unknown as SVGGraphicsElement).releasePointerCapture?.(e.pointerId) } catch { /* ignore */ }
  }

  return (
    <g
      style={{ cursor: mode === 'delete' ? 'not-allowed' : dragging ? 'grabbing' : 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={e => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Breite unsichtbare Trefferfläche (leichtes Greifen) */}
      <path d={pathD} stroke="transparent" strokeWidth={18} fill="none" />

      {/* Actual wire */}
      <path
        d={pathD}
        stroke={isFault ? '#dc2626' : color}
        strokeWidth={isSelected || hovered ? strokeWidth + 1.2 : strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isSimRunning && !isFault ? 'wire-animated' : ''}
        style={{
          filter: isSelected ? 'drop-shadow(0 0 3px #f59e0b)' : hovered ? 'drop-shadow(0 0 2px #f59e0b)' : isFault ? 'drop-shadow(0 0 4px #dc2626)' : 'none',
        }}
      />

      {/* Zieh-Griff bei Auswahl ODER Hover (zeigt: verschiebbar) */}
      {(isSelected || hovered) && mode !== 'delete' && (
        <circle cx={handleX} cy={handleY} r={5} fill="#f59e0b" stroke="#0f172a" strokeWidth={1} opacity={isSelected ? 1 : 0.7}>
          <title>Leitung verschieben (ziehen)</title>
        </circle>
      )}

      {/* Strom-Anzeige während der Simulation */}
      {showLoad && (
        <text
          x={(fromPos.x + toPos.x) / 2}
          y={handleY - 4}
          textAnchor="middle"
          fontSize={7}
          fill={color}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {current!.toFixed(1)} A
        </text>
      )}

      {/* Wire label */}
      {!showLoad && wire.label && (
        <text
          x={(fromPos.x + toPos.x) / 2}
          y={handleY - 4}
          textAnchor="middle"
          fontSize={7}
          fill="#94a3b8"
          fontFamily="monospace"
        >
          {wire.label}
        </text>
      )}
    </g>
  )
}
