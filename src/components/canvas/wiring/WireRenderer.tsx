import { useRef, useState } from 'react'
import { WIRE_COLORS } from '@/utils/teGrid'
import { buildWirePath, autoChannelY } from '@/utils/wireRouting'
import type { Wire } from '@/types/schaltschrank'
import type { DINRail } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { resolveWireEndpoint } from '@/utils/surfaceGeometry'
import { voltageColor, voltageShort, voltageLabel } from '@/utils/voltageLevels'
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
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const isSelected = selectedWireId === wire.id

  const dragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null)
  const wpDragRef = useRef<{ index: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Endpunkte auf der Innen-Fläche auflösen (Schienen-Bauteil oder Übergabefeld-Pin)
  const fromPos = resolveWireEndpoint(schaltschrank, wire.fromInstanceId, wire.fromConnectionId, 'interior')
  const toPos = resolveWireEndpoint(schaltschrank, wire.toInstanceId, wire.toConnectionId, 'interior')
  if (!fromPos || !toPos) return null

  // Kontext für Routing / Laststrom (nur bei Schienen-Bauteilen)
  const fromRail = rails.find(r => r.placedComponents.some(c => c.instanceId === wire.fromInstanceId))
  const toRail = rails.find(r => r.placedComponents.some(c => c.instanceId === wire.toInstanceId))
  const fromPlaced = fromRail?.placedComponents.find(c => c.instanceId === wire.fromInstanceId)
  const fromDef = fromPlaced ? COMPONENT_MAP.get(fromPlaced.definitionId) : undefined

  const samRail = !!fromRail && fromRail === toRail
  const wpt = wire.waypoints?.[0]
  const manual = !!wire.manualRoute && (wire.waypoints?.length ?? 0) > 0
  let pathD: string
  let handleX: number, handleY: number
  if (manual) {
    // Manuell gesetzte Ecken: Polyline durch alle Zwischenstops
    const pts = [fromPos, ...wire.waypoints, toPos]
    pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const mid = wire.waypoints[Math.floor((wire.waypoints.length - 1) / 2)]
    handleX = mid.x
    handleY = mid.y
  } else if (samRail) {
    const channelY = wpt?.y ?? autoChannelY(fromPos.y, toPos.y, index % 4, fromRail!.yPosition)
    pathD = buildWirePath(fromPos.x, fromPos.y, toPos.x, toPos.y, index % 4, fromRail!.yPosition, channelY)
    handleX = (fromPos.x + toPos.x) / 2
    handleY = channelY
  } else {
    // generisches orthogonales Routing (u. a. zum Übergabefeld)
    const midY = wpt?.y ?? (fromPos.y + toPos.y) / 2
    pathD = `M ${fromPos.x} ${fromPos.y} L ${fromPos.x} ${midY} L ${toPos.x} ${midY} L ${toPos.x} ${toPos.y}`
    handleX = (fromPos.x + toPos.x) / 2
    handleY = midY
  }
  const baseColor = WIRE_COLORS[wire.color] ?? '#94a3b8'
  const nominal = fromPlaced?.settings.nominalCurrent ?? fromDef?.electricalModel.nominalCurrentDefault ?? 0
  const loadRatio = current && nominal ? current / nominal : 0
  const showLoad = isSimRunning && !isFault && current != null && current > 0.01
  const vColor = voltageColor(wire.voltage)
  // Priorität in der Simulation: Fehler(rot) > Spannungsebene > Laststrom > Grundfarbe
  const color = isFault
    ? '#dc2626'
    : isSimRunning && vColor
      ? vColor
      : showLoad
        ? loadColor(loadRatio)
        : baseColor
  const strokeWidth = isSelected ? 3.5 : (showLoad || (isSimRunning && vColor)) ? 3 : 2.5
  const showVoltageBadge = isSimRunning && hovered && !!wire.voltage

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
    // Bei manuell gerouteten Leitungen wird über die Eck-Griffe verschoben
    if (manual) return
    if (!st.moved && Math.hypot(e.clientX - st.startX, e.clientY - st.startY) < 3) return
    if (!st.moved) setDragging(true)
    st.moved = true
    const loc = canvasCoords(e.currentTarget as unknown as SVGGraphicsElement, e.clientX, e.clientY)
    if (!loc) return
    // Kanal-Y der horizontalen Führung verschieben
    updateWire(wire.id, { waypoints: [{ x: (fromPos!.x + toPos!.x) / 2, y: loc.y }] })
  }

  function handlePointerUp(e: React.PointerEvent) {
    dragRef.current = null
    setDragging(false)
    try { (e.currentTarget as unknown as SVGGraphicsElement).releasePointerCapture?.(e.pointerId) } catch { /* ignore */ }
  }

  // Eck-Griffe manuell gerouteter Leitungen einzeln verschieben
  function wpDown(e: React.PointerEvent, i: number) {
    if (mode === 'delete') return
    e.stopPropagation()
    const el = e.currentTarget as unknown as SVGGraphicsElement
    el.setPointerCapture?.(e.pointerId)
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

      {/* Zieh-Griff bei Auswahl ODER Hover (nur Auto-Routing) */}
      {!manual && (isSelected || hovered) && mode !== 'delete' && (
        <circle cx={handleX} cy={handleY} r={5} fill="#f59e0b" stroke="#0f172a" strokeWidth={1} opacity={isSelected ? 1 : 0.7}>
          <title>Leitung verschieben (ziehen)</title>
        </circle>
      )}

      {/* Eck-Griffe manuell gesetzter Zwischenstops (einzeln verschiebbar) */}
      {manual && (isSelected || hovered) && mode !== 'delete' && wire.waypoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y} r={5}
          fill="#f59e0b" stroke="#0f172a" strokeWidth={1}
          opacity={isSelected ? 1 : 0.7}
          style={{ cursor: 'grab' }}
          onPointerDown={e => wpDown(e, i)}
          onPointerMove={wpMove}
          onPointerUp={wpUp}
        >
          <title>Ecke verschieben</title>
        </circle>
      ))}

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
      {!showLoad && !showVoltageBadge && wire.label && (
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

      {/* Spannungs-Anzeige beim Überfahren während der Simulation */}
      {showVoltageBadge && (
        <g pointerEvents="none">
          <rect
            x={handleX - 26} y={handleY - 22} width={52} height={13} rx={3}
            fill="#0f172a" stroke={vColor ?? '#94a3b8'} strokeWidth={1}
          />
          <text x={handleX} y={handleY - 13} textAnchor="middle" fontSize={7.5} fill={vColor ?? '#e5e7eb'} fontFamily="monospace" fontWeight="bold">
            {voltageShort(wire.voltage)}
          </text>
        </g>
      )}

      {/* Native Tooltip mit voller Spannungsbezeichnung */}
      {wire.voltage && <title>{voltageLabel(wire.voltage)}</title>}
    </g>
  )
}
