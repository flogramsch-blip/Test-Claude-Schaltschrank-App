import { useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useSchaltschrankStore, findPlacedComponent } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { useControlState } from '@/simulation/useControlState'
import PanelComponentRenderer from './PanelComponentRenderer'
import PanelConnections from './PanelConnections'
import DoorWireRenderer from './DoorWireRenderer'
import { resolvePanelConnectionPos } from './panelGeometry'
import WireInProgress from '@/components/canvas/wiring/WireInProgress'
import WireColorPicker from '@/components/canvas/wiring/WireColorPicker'
import CrossingStub from '@/components/canvas/CrossingStub'

export default function DoorCanvas() {
  const svgRef = useRef<SVGSVGElement>(null)
  const schaltschrank = useSchaltschrankStore(s => s.schaltschrank)
  const { zoom, panX, panY, setZoom, setPan, updateWireDrawingMouse, cancelWireDrawing, wireDrawing, mode, selectComponent, selectWire, lightCanvas, defaultCrossing } = useUIStore()
  const { setNodeRef } = useDroppable({ id: 'door-panel' })
  const panels = schaltschrank.panelComponents ?? []
  const controlState = useControlState(schaltschrank)

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    setZoom(zoom + (e.deltaY > 0 ? -0.1 : 0.1))
  }
  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!wireDrawing.active) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    updateWireDrawingMouse((e.clientX - rect.left - panX) / zoom, (e.clientY - rect.top - panY) / zoom)
  }
  function handleCanvasClick() {
    if (wireDrawing.active) cancelWireDrawing()
    selectComponent(null); selectWire(null)
  }
  const panStart = useRef<{ x: number; y: number } | null>(null)
  function md(e: React.MouseEvent) { if (e.button === 1 || e.button === 2) panStart.current = { x: e.clientX - panX, y: e.clientY - panY } }
  function mm(e: React.MouseEvent) { if (panStart.current) setPan(e.clientX - panStart.current.x, e.clientY - panStart.current.y) }
  function mu(e: React.MouseEvent) { if (e.button === 1 || e.button === 2) panStart.current = null }

  // Leitungen einteilen: rein-Frontplatte vs. flächenübergreifend
  const isPanel = (id: string) => panels.some(p => p.instanceId === id)
  const doorWires = schaltschrank.wires.filter(w => isPanel(w.fromInstanceId) && isPanel(w.toInstanceId))
  const crossWires = schaltschrank.wires.filter(w => isPanel(w.fromInstanceId) !== isPanel(w.toInstanceId))

  return (
    <div
      ref={setNodeRef}
      className="relative flex-1 overflow-hidden"
      style={{ background: lightCanvas ? '#cbd5e1' : 'linear-gradient(135deg,#111827 0%,#1f2937 100%)' }}
      onContextMenu={e => e.preventDefault()}
    >
      <svg ref={svgRef} width="100%" height="100%"
        style={{ cursor: wireDrawing.active ? 'crosshair' : mode === 'delete' ? 'not-allowed' : 'default' }}
        onWheel={handleWheel} onPointerMove={handlePointerMove} onClick={handleCanvasClick}
        onMouseDown={md} onMouseMove={mm} onMouseUp={mu}
      >
        <g transform={`translate(${panX},${panY}) scale(${zoom})`}>
          {/* Türplatte */}
          <rect x={0} y={0} width={720} height={460} rx={8} fill="#334155" />
          <rect x={10} y={10} width={700} height={440} rx={5} fill="#1e293b" stroke="#475569" strokeWidth={1} />
          {/* Türgriff */}
          <rect x={702} y={200} width={10} height={60} rx={3} fill="#64748b" />
          <text x={20} y={30} fontSize={11} fill="#64748b" fontFamily="monospace">Fronttür / Bedienfeld</text>

          {/* Frontplatten-Leitungen */}
          {doorWires.map(w => <DoorWireRenderer key={w.id} wire={w} panels={panels} />)}

          {/* Flächenübergreifende Leitungen: Durchführung am Frontplatten-Ende */}
          {crossWires.map(w => {
            const panelId = isPanel(w.fromInstanceId) ? w.fromInstanceId : w.toInstanceId
            const panelConnId = isPanel(w.fromInstanceId) ? w.fromConnectionId : w.toConnectionId
            const otherId = isPanel(w.fromInstanceId) ? w.toInstanceId : w.fromInstanceId
            const pc = panels.find(p => p.instanceId === panelId)!
            const def = COMPONENT_MAP.get(pc.definitionId)
            const cp = def?.connections.find(c => c.id === panelConnId)
            if (!cp) return null
            const pos = resolvePanelConnectionPos(pc, cp)
            const other = findPlacedComponent(schaltschrank.rails, otherId)
            const otherLabel = other ? (other.component.settings.label || (COMPONENT_MAP.get(other.component.definitionId)?.shortName ?? '?')) : '?'
            return (
              <CrossingStub key={w.id} wireId={w.id} x={pos.x} y={pos.y} up={cp.relativeY === 0}
                label={otherLabel} crossing={w.crossing ?? defaultCrossing} />
            )
          })}

          {/* Frontplatten-Bauteile */}
          {panels.map(pc => (
            <PanelComponentRenderer key={pc.instanceId} pc={pc}
              controlOverride={controlState ? { energized: controlState.litLamps.has(pc.instanceId) || controlState.energizedCoils.has(pc.instanceId) } : undefined} />
          ))}
          {panels.map(pc => <PanelConnections key={pc.instanceId} pc={pc} />)}

          <WireInProgress />
        </g>
      </svg>

      <WireColorPicker />

      {panels.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-slate-500 text-sm">
            <div className="text-3xl mb-2">🚪</div>
            Fronttür – Befehls- und Meldegeräte hierher ziehen<br />
            <span className="text-xs text-slate-600">(Taster, Wahlschalter, Not-Aus, Meldeleuchten)</span>
          </div>
        </div>
      )}
    </div>
  )
}
