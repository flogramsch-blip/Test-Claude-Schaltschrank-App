import { useRef, useState } from 'react'
import type { Wire, PanelComponent } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { WIRE_COLORS } from '@/utils/teGrid'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { resolvePanelConnectionPos } from './panelGeometry'

interface Props {
  wire: Wire
  panels: PanelComponent[]
}

/** Leitung zwischen zwei Frontplatten-Bauteilen */
export default function DoorWireRenderer({ wire, panels }: Props) {
  const selectedWireId = useUIStore(s => s.selectedWireId)
  const mode = useUIStore(s => s.mode)
  const selectWire = useUIStore(s => s.selectWire)
  const removeWire = useSchaltschrankStore(s => s.removeWire)
  const updateWire = useSchaltschrankStore(s => s.updateWire)
  const isSelected = selectedWireId === wire.id
  const dragRef = useRef<{ moved: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)

  const from = panels.find(p => p.instanceId === wire.fromInstanceId)
  const to = panels.find(p => p.instanceId === wire.toInstanceId)
  if (!from || !to) return null
  const fromDef = COMPONENT_MAP.get(from.definitionId)
  const toDef = COMPONENT_MAP.get(to.definitionId)
  if (!fromDef || !toDef) return null
  const fromCp = fromDef.connections.find(c => c.id === wire.fromConnectionId)
  const toCp = toDef.connections.find(c => c.id === wire.toConnectionId)
  if (!fromCp || !toCp) return null

  const a = resolvePanelConnectionPos(from, fromCp)
  const b = resolvePanelConnectionPos(to, toCp)
  const midY = wire.waypoints?.[0]?.y ?? (a.y + b.y) / 2
  const pathD = `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`
  const color = WIRE_COLORS[wire.color] ?? '#94a3b8'

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
    if (!dragRef.current) return
    dragRef.current.moved = true
    if (!dragging) setDragging(true)
    const loc = canvasCoords(e.currentTarget as unknown as SVGGraphicsElement, e.clientX, e.clientY)
    if (loc) updateWire(wire.id, { waypoints: [{ x: (a.x + b.x) / 2, y: loc.y }] })
  }
  function onUp(e: React.PointerEvent) {
    dragRef.current = null; setDragging(false)
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
      {(isSelected || hovered) && <circle cx={(a.x + b.x) / 2} cy={midY} r={5} fill="#f59e0b" stroke="#0f172a" strokeWidth={1} opacity={isSelected ? 1 : 0.7}>
        <title>Leitung verschieben (ziehen)</title>
      </circle>}
    </g>
  )
}
