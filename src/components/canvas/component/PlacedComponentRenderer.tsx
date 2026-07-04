import { useRef, useState } from 'react'
import type { PlacedComponent, DINRail } from '@/types/schaltschrank'
import type { ComponentSimState } from '@/types/simulation'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX, RAIL_TOP_OFFSET_PX, RAIL_X_OFFSET, ROW_TOTAL_HEIGHT_PX, resolveConnectionPos } from '@/utils/teGrid'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { placementValidity } from '@/utils/validation'
import ConnectionPointMarker from './ConnectionPointMarker'
import LSSRenderer from './renderers/LSSRenderer'
import MotorschutzRenderer from './renderers/MotorschutzRenderer'
import FIRenderer from './renderers/FIRenderer'
import SchuetzRenderer from './renderers/SchuetzRenderer'
import KlemmeRenderer from './renderers/KlemmeRenderer'
import ButtonRenderer from './renderers/ButtonRenderer'
import LampRenderer from './renderers/LampRenderer'
import ScrewFuseRenderer from './renderers/ScrewFuseRenderer'
import NetworkRenderer from './renderers/NetworkRenderer'
import PlcRenderer from './renderers/PlcRenderer'
import CableGlandRenderer from './renderers/CableGlandRenderer'
import GenericRenderer from './renderers/GenericRenderer'

interface Props {
  placed: PlacedComponent
  rail: DINRail
  simState?: ComponentSimState
  controlOverride?: { closed?: boolean; energized?: boolean; plcIO?: Set<string> }
}

export default function PlacedComponentRenderer({ placed, rail, simState, controlOverride }: Props) {
  const mode = useUIStore(s => s.mode)
  const selectedId = useUIStore(s => s.selectedInstanceId)
  const selectComponent = useUIStore(s => s.selectComponent)
  const setHover = useUIStore(s => s.setHover)
  const clearHover = useUIStore(s => s.clearHover)
  const setPlacementPreview = useUIStore(s => s.setPlacementPreview)
  const simulationRunning = useUIStore(s => s.simulationRunning)
  const toggleButton = useUIStore(s => s.toggleButton)
  const toggleTrip = useUIStore(s => s.toggleTrip)
  const isPressed = useUIStore(s => s.pressedButtons.has(placed.instanceId))
  const isManualTripped = useUIStore(s => s.manualTripped.has(placed.instanceId))
  const removeComponent = useSchaltschrankStore(s => s.removeComponent)
  const moveComponent = useSchaltschrankStore(s => s.moveComponent)
  const rails = useSchaltschrankStore(s => s.schaltschrank.rails)

  // Drag-Zustand für Verschieben auf/zwischen Hutschienen
  const dragRef = useRef<{ startX: number; startY: number; moved: boolean; pointerId: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const def = COMPONENT_MAP.get(placed.definitionId)
  if (!def) return null

  const w = def.teWidth * TE_WIDTH_PX
  const isSelected = selectedId === placed.instanceId
  const tripped = (simState?.tripped ?? false) || isManualTripped
  const isProtective = ['breaker', 'rcd', 'motor-protection', 'fuse', 'switch-disconnector'].includes(def.electricalModel.type)

  // Original-Position: das Bauteil bleibt beim Ziehen gedimmt an seiner Stelle,
  // das Schattenmodell (PlacementShadow) zeigt die Zielposition.
  const x = RAIL_X_OFFSET + placed.tePosition * TE_WIDTH_PX
  const y = rail.yPosition + RAIL_TOP_OFFSET_PX

  // Client-Koordinaten → absolute Canvas-Koordinaten (über CTM der Elternebene = DINRailRow-g)
  function clientToCanvas(el: SVGGraphicsElement, clientX: number, clientY: number) {
    const parent = el.parentNode as SVGGraphicsElement | null
    const svg = el.ownerSVGElement
    const ctm = parent?.getScreenCTM?.()
    if (!svg || !ctm) return null
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    return pt.matrixTransform(ctm.inverse())
  }

  function computeTarget(el: SVGGraphicsElement, clientX: number, clientY: number) {
    const loc = clientToCanvas(el, clientX, clientY)
    if (!loc) return null
    const tePosition = Math.max(0, Math.round((loc.x - RAIL_X_OFFSET) / TE_WIDTH_PX))
    const targetRail =
      rails.find(r => loc.y >= r.yPosition && loc.y <= r.yPosition + ROW_TOTAL_HEIGHT_PX) ?? rail
    const valid = placementValidity(rails, targetRail.id, tePosition, def!, placed.instanceId)
    return { railId: targetRail.id, tePosition, valid }
  }

  const isSwitch = def.electricalModel.type === 'button' || def.electricalModel.type === 'selector' || def.electricalModel.type === 'emergency-stop'

  function handlePointerDown(e: React.PointerEvent) {
    if (mode === 'wire') return
    // In der Simulation: Schalter/Taster betätigen statt auswählen
    if (simulationRunning && isSwitch) {
      e.stopPropagation()
      toggleButton(placed.instanceId)
      return
    }
    // In der Simulation: Schutzorgane manuell auslösen/zurücksetzen
    if (simulationRunning && isProtective) {
      e.stopPropagation()
      toggleTrip(placed.instanceId)
      return
    }
    if (mode === 'delete') {
      e.stopPropagation()
      removeComponent(placed.instanceId)
      return
    }
    // Nur linke Maustaste (button 0) startet Auswahl/Verschieben
    if (e.button !== 0) return
    e.stopPropagation()
    clearHover()
    selectComponent(placed.instanceId)
    const el = e.currentTarget as unknown as SVGGraphicsElement
    el.setPointerCapture?.(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, moved: false, pointerId: e.pointerId }
  }

  function handleComponentPointerMove(e: React.PointerEvent) {
    const st = dragRef.current
    if (!st) return
    if (!st.moved && Math.hypot(e.clientX - st.startX, e.clientY - st.startY) < 4) return
    if (!st.moved) setIsDragging(true)
    st.moved = true
    const target = computeTarget(e.currentTarget as unknown as SVGGraphicsElement, e.clientX, e.clientY)
    if (target) {
      setPlacementPreview({
        railId: target.railId,
        tePosition: target.tePosition,
        teWidth: def!.teWidth,
        valid: target.valid,
      })
    }
  }

  function handleComponentPointerUp(e: React.PointerEvent) {
    const st = dragRef.current
    dragRef.current = null
    const el = e.currentTarget as unknown as SVGGraphicsElement
    try { el.releasePointerCapture?.(e.pointerId) } catch { /* ignore */ }
    if (st?.moved) {
      const target = computeTarget(el, e.clientX, e.clientY)
      if (target && target.valid) moveComponent(placed.instanceId, target.railId, target.tePosition)
    }
    setPlacementPreview(null)
    setIsDragging(false)
  }

  function handleMouseEnter(e: React.MouseEvent) {
    if (dragRef.current) return
    setHover(placed.instanceId, e.clientX, e.clientY)
  }
  function handleMouseMoveHover(e: React.MouseEvent) {
    if (dragRef.current) return
    setHover(placed.instanceId, e.clientX, e.clientY)
  }

  function getComponentBody() {
    switch (def!.electricalModel.type) {
      case 'breaker':
        return <LSSRenderer def={def!} placed={placed} tripped={tripped} />
      case 'motor-protection':
        return <MotorschutzRenderer def={def!} placed={placed} tripped={tripped} />
      case 'rcd':
        return <FIRenderer def={def!} placed={placed} tripped={tripped} />
      case 'contactor':
        return <SchuetzRenderer def={def!} placed={placed} closed={controlOverride?.closed ?? simState?.closed} />
      case 'terminal':
        return def!.id === 'kabeldurchfuehrung'
          ? <CableGlandRenderer def={def!} />
          : <KlemmeRenderer def={def!} placed={placed} />
      case 'button':
      case 'selector':
      case 'emergency-stop':
        return <ButtonRenderer def={def!} placed={placed} pressed={isPressed} />
      case 'indicator':
        return <LampRenderer def={def!} placed={placed} energized={controlOverride?.energized ?? simState?.energized} />
      case 'network':
        return <NetworkRenderer def={def!} />
      case 'plc':
        return <PlcRenderer def={def!} placed={placed} activeIO={controlOverride?.plcIO} />
      case 'fuse':
        // Schraubsicherungen (DIAZED/NEOZED) mit eigenem Renderer, NH bleibt generisch
        return def!.id.startsWith('diazed') || def!.id.startsWith('neozed')
          ? <ScrewFuseRenderer def={def!} placed={placed} tripped={tripped} />
          : <GenericRenderer def={def!} placed={placed} />
      default:
        return <GenericRenderer def={def!} placed={placed} />
    }
  }

  const label = placed.settings.label || def.shortName

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{
        cursor: mode === 'delete' ? 'not-allowed' : mode === 'select' ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
      opacity={isDragging ? 0.4 : 1}
      onPointerDown={handlePointerDown}
      onPointerMove={handleComponentPointerMove}
      onPointerUp={handleComponentPointerUp}
      onClick={e => e.stopPropagation()}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMoveHover}
      onMouseLeave={clearHover}
    >
      {/* Selection highlight */}
      {isSelected && (
        <rect
          x={-2} y={-2}
          width={w + 4}
          height={RAIL_HEIGHT_PX + 4}
          rx={3}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      )}

      {/* Component body */}
      {getComponentBody()}

      {/* Tripped overlay */}
      {tripped && (
        <g className="tripped-overlay">
          <rect x={0} y={0} width={w} height={RAIL_HEIGHT_PX} rx={2} fill="#dc262640" />
          <text x={w / 2} y={RAIL_HEIGHT_PX / 2 + 3} textAnchor="middle" fontSize={6} fill="#ef4444" fontWeight="bold" fontFamily="monospace">
            AUSGELÖST
          </text>
        </g>
      )}

      {/* Label above */}
      <text
        x={w / 2}
        y={-6}
        textAnchor="middle"
        fontSize={8}
        fill={isSelected ? '#f59e0b' : '#94a3b8'}
        fontFamily="monospace"
        fontWeight="bold"
      >
        {label}
      </text>

      {/* DIN rail clips at bottom */}
      <rect x={4}      y={RAIL_HEIGHT_PX - 5} width={6} height={5} rx={1} fill="#6b7280" />
      <rect x={w - 10} y={RAIL_HEIGHT_PX - 5} width={6} height={5} rx={1} fill="#6b7280" />
    </g>
  )
}

export function PlacedComponentConnections({ placed, rail }: { placed: PlacedComponent; rail: DINRail }) {
  const def = COMPONENT_MAP.get(placed.definitionId)
  if (!def) return null

  return (
    <>
      {def.connections.map(cp => {
        const pos = resolveConnectionPos(cp.relativeX, cp.relativeY, placed.tePosition, rail.yPosition)
        return (
          <ConnectionPointMarker
            key={cp.id}
            cp={cp}
            instanceId={placed.instanceId}
            absoluteX={pos.x}
            absoluteY={pos.y}
          />
        )
      })}
    </>
  )
}
