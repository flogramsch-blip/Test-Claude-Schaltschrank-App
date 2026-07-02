import { useRef, useState } from 'react'
import type { PanelComponent } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'

// Größe eines Frontplatten-Elements (frei platziert)
export const PANEL_CELL = 60

interface Props {
  pc: PanelComponent
  controlOverride?: { energized?: boolean }
}

/**
 * Frei platziertes HMI-Gerät auf der Fronttür. Große, runde Front-Optik.
 * Klemmen (connection points) sitzen an Ober-/Unterkante zum Verdrahten.
 */
export default function PanelComponentRenderer({ pc, controlOverride }: Props) {
  const def = COMPONENT_MAP.get(pc.definitionId)
  const mode = useUIStore(s => s.mode)
  const selectedId = useUIStore(s => s.selectedInstanceId)
  const selectComponent = useUIStore(s => s.selectComponent)
  const simulationRunning = useUIStore(s => s.simulationRunning)
  const toggleButton = useUIStore(s => s.toggleButton)
  const isPressed = useUIStore(s => s.pressedButtons.has(pc.instanceId))
  const removeComponent = useSchaltschrankStore(s => s.removeComponent)
  const movePanelComponent = useSchaltschrankStore(s => s.movePanelComponent)

  const dragRef = useRef<{ dx: number; dy: number; moved: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)

  if (!def) return null

  const size = PANEL_CELL
  const isSelected = selectedId === pc.instanceId
  const type = def.electricalModel.type
  const isSwitch = type === 'button' || type === 'selector' || type === 'emergency-stop'
  const isLamp = type === 'indicator'
  const energized = controlOverride?.energized ?? false

  function clientToCanvas(el: SVGGraphicsElement, clientX: number, clientY: number) {
    const parent = el.parentNode as SVGGraphicsElement | null
    const svg = el.ownerSVGElement
    const ctm = parent?.getScreenCTM?.()
    if (!svg || !ctm) return null
    const p = svg.createSVGPoint(); p.x = clientX; p.y = clientY
    return p.matrixTransform(ctm.inverse())
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (mode === 'wire') return
    if (simulationRunning && isSwitch) { e.stopPropagation(); toggleButton(pc.instanceId); return }
    if (mode === 'delete') { e.stopPropagation(); removeComponent(pc.instanceId); return }
    if (e.button !== 0) return
    e.stopPropagation()
    selectComponent(pc.instanceId)
    const el = e.currentTarget as unknown as SVGGraphicsElement
    el.setPointerCapture?.(e.pointerId)
    const loc = clientToCanvas(el, e.clientX, e.clientY)
    dragRef.current = { dx: loc ? loc.x - pc.x : 0, dy: loc ? loc.y - pc.y : 0, moved: false }
  }
  function handlePointerMove(e: React.PointerEvent) {
    const st = dragRef.current
    if (!st) return
    st.moved = true
    if (!dragging) setDragging(true)
    const loc = clientToCanvas(e.currentTarget as unknown as SVGGraphicsElement, e.clientX, e.clientY)
    if (loc) movePanelComponent(pc.instanceId, Math.max(0, loc.x - st.dx), Math.max(0, loc.y - st.dy))
  }
  function handlePointerUp(e: React.PointerEvent) {
    dragRef.current = null
    setDragging(false)
    try { (e.currentTarget as unknown as SVGGraphicsElement).releasePointerCapture?.(e.pointerId) } catch { /* ignore */ }
  }

  const faceColor = isLamp
    ? (energized ? def.color : '#1e293b')
    : type === 'emergency-stop' ? '#dc2626' : def.color

  return (
    <g
      transform={`translate(${pc.x}, ${pc.y})`}
      style={{ cursor: mode === 'delete' ? 'not-allowed' : simulationRunning && isSwitch ? 'pointer' : 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={e => e.stopPropagation()}
      opacity={dragging ? 0.7 : 1}
    >
      {/* Montageplatte / Einbaurahmen */}
      <rect x={0} y={0} width={size} height={size} rx={6} fill="#0f172a" stroke={isSelected ? '#f59e0b' : '#334155'} strokeWidth={isSelected ? 2 : 1} />

      {/* Aktuator / Leuchtfläche */}
      {type === 'selector' ? (
        <g transform={`translate(${size / 2}, ${size / 2 - 4})`}>
          <circle r={15} fill="#334155" stroke={def.color} strokeWidth={2} />
          <line x1={0} y1={0} x2={10} y2={-10} stroke="#e2e8f0" strokeWidth={3} strokeLinecap="round" />
        </g>
      ) : (
        <>
          {isLamp && energized && <circle cx={size / 2} cy={size / 2 - 4} r={20} fill={def.color} opacity={0.35} />}
          <circle cx={size / 2} cy={size / 2 - 4} r={type === 'emergency-stop' ? 17 : 14} fill={faceColor} stroke="#0f172a" strokeWidth={2} />
          {isPressed && <circle cx={size / 2} cy={size / 2 - 4} r={type === 'emergency-stop' ? 19 : 16} fill="none" stroke="#22c55e" strokeWidth={2} />}
          {type === 'emergency-stop' && <text x={size / 2} y={size / 2 - 1} textAnchor="middle" fontSize={7} fill="#fff" fontWeight="bold">STOP</text>}
          {isLamp && (
            <>
              <line x1={size / 2 - 8} y1={size / 2 - 12} x2={size / 2 + 8} y2={size / 2 + 4} stroke={energized ? '#0f172a' : '#475569'} strokeWidth={1.5} />
              <line x1={size / 2 - 8} y1={size / 2 + 4} x2={size / 2 + 8} y2={size / 2 - 12} stroke={energized ? '#0f172a' : '#475569'} strokeWidth={1.5} />
            </>
          )}
        </>
      )}

      {/* Label */}
      <text x={size / 2} y={size - 5} textAnchor="middle" fontSize={9} fill={isSelected ? '#f59e0b' : '#94a3b8'} fontFamily="monospace" fontWeight="bold">
        {pc.settings.label || def.shortName}
      </text>
    </g>
  )
}
