import { useRef, useState } from 'react'
import type { InterfacePanel } from '@/types/schaltschrank'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import ConnectionPointMarker from './component/ConnectionPointMarker'
import { interfacePins, interfacePanelSize, IFACE_PAD, IFACE_PIN_SPACING, resolveInterfacePinPos } from '@/utils/surfaceGeometry'

interface Props {
  panel: InterfacePanel
  surface: 'interior' | 'door'
}

/** Festes Übergabefeld / Industriestecker – auf Innenausbau und Außeneinheit gespiegelt. */
export default function InterfacePanelBlock({ panel, surface }: Props) {
  const mode = useUIStore(s => s.mode)
  const selectedId = useUIStore(s => s.selectedInstanceId)
  const selectComponent = useUIStore(s => s.selectComponent)
  const moveInterfacePanel = useSchaltschrankStore(s => s.moveInterfacePanel)
  const removeInterfacePanel = useSchaltschrankStore(s => s.removeInterfacePanel)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)

  const pos = surface === 'interior' ? panel.interior : panel.door
  const { w, h } = interfacePanelSize(panel)
  const vertical = panel.orientation === 'vertical'
  const isSelected = selectedId === panel.id
  const pins = interfacePins(panel)
  const isHarting = panel.system === 'harting'

  function clientToCanvas(el: SVGGraphicsElement, cx: number, cy: number) {
    const parent = el.parentNode as SVGGraphicsElement | null
    const svg = el.ownerSVGElement
    const ctm = parent?.getScreenCTM?.()
    if (!svg || !ctm) return null
    const p = svg.createSVGPoint(); p.x = cx; p.y = cy
    return p.matrixTransform(ctm.inverse())
  }
  function onDown(e: React.PointerEvent) {
    if (mode === 'wire') return
    if (mode === 'delete') { e.stopPropagation(); removeInterfacePanel(); return }
    e.stopPropagation()
    selectComponent(panel.id)
    const el = e.currentTarget as unknown as SVGGraphicsElement
    el.setPointerCapture?.(e.pointerId)
    const loc = clientToCanvas(el, e.clientX, e.clientY)
    dragRef.current = { dx: loc ? loc.x - pos.x : 0, dy: loc ? loc.y - pos.y : 0 }
  }
  function onMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    if (!dragging) setDragging(true)
    const loc = clientToCanvas(e.currentTarget as unknown as SVGGraphicsElement, e.clientX, e.clientY)
    if (loc) moveInterfacePanel(surface, Math.max(0, loc.x - dragRef.current.dx), Math.max(0, loc.y - dragRef.current.dy))
  }
  function onUp(e: React.PointerEvent) {
    dragRef.current = null; setDragging(false)
    try { (e.currentTarget as unknown as SVGGraphicsElement).releasePointerCapture?.(e.pointerId) } catch { /* ignore */ }
  }

  // Pin-Mittelpunkte innerhalb des Blocks
  const pinCenter = (i: number) => {
    const off = IFACE_PAD + i * IFACE_PIN_SPACING + IFACE_PIN_SPACING / 2
    return vertical ? { x: w / 2, y: off } : { x: off, y: h / 2 }
  }

  return (
    <g>
      {/* Block-Körper (verschiebbar) */}
      <g
        transform={`translate(${pos.x}, ${pos.y})`}
        style={{ cursor: mode === 'delete' ? 'not-allowed' : dragging ? 'grabbing' : 'grab' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onClick={e => e.stopPropagation()}
        opacity={dragging ? 0.8 : 1}
      >
        {/* Gehäuse */}
        <rect x={0} y={0} width={w} height={h} rx={3}
          fill={isHarting ? '#1f2937' : '#475569'} stroke={isSelected ? '#f59e0b' : '#9ca3af'} strokeWidth={isSelected ? 2 : 1.2} />
        {/* Harting-Verriegelungsbügel an den Schmalseiten */}
        {isHarting && (vertical ? (
          <>
            <rect x={w / 2 - 5} y={-4} width={10} height={4} rx={1} fill="#6b7280" />
            <rect x={w / 2 - 5} y={h} width={10} height={4} rx={1} fill="#6b7280" />
          </>
        ) : (
          <>
            <rect x={-4} y={h / 2 - 5} width={4} height={10} rx={1} fill="#6b7280" />
            <rect x={w} y={h / 2 - 5} width={4} height={10} rx={1} fill="#6b7280" />
          </>
        ))}
        {/* Pin-Kontakte + Nummern */}
        {pins.map((_, i) => {
          const c = pinCenter(i)
          return (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={isHarting ? 2 : 2.5} fill={isHarting ? '#fbbf24' : '#1f2937'} stroke="#111827" strokeWidth={0.5} />
              <text
                x={vertical ? w - 6 : c.x}
                y={vertical ? c.y + 2 : h - 4}
                textAnchor="middle" fontSize={5} fill="#94a3b8" fontFamily="monospace"
              >{i + 1}</text>
            </g>
          )
        })}
        {/* Beschriftung */}
        {vertical ? (
          <text x={w + 4} y={10} fontSize={7} fill={isSelected ? '#f59e0b' : '#cbd5e1'} fontFamily="monospace" fontWeight="bold"
            transform={`rotate(90, ${w + 4}, 10)`}>
            {panel.label} · {isHarting ? 'Harting' : 'Klemmen'} · {surface === 'interior' ? 'innen' : 'außen'}
          </text>
        ) : (
          <text x={2} y={-3} fontSize={7} fill={isSelected ? '#f59e0b' : '#cbd5e1'} fontFamily="monospace" fontWeight="bold">
            {panel.label} · {isHarting ? 'Harting' : 'Klemmen'} · {surface === 'interior' ? 'innen' : 'außen'}
          </text>
        )}
      </g>

      {/* Pins als Anschlussklemmen (Verdrahtung) */}
      {pins.map((cp, i) => {
        const pp = resolveInterfacePinPos(panel, surface, i)
        return <ConnectionPointMarker key={cp.id} cp={cp} instanceId={panel.id} absoluteX={pp.x} absoluteY={pp.y} />
      })}
    </g>
  )
}
