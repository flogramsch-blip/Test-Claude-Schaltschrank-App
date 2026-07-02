import { useRef } from 'react'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import DINRailRow from './rail/DINRailRow'
import WireRenderer from './wiring/WireRenderer'
import WireInProgress from './wiring/WireInProgress'
import WireColorPicker from './wiring/WireColorPicker'
import PlacementShadow from './PlacementShadow'
import CabinetWall from './CabinetWall'
import CrossingStub from './CrossingStub'
import { useControlState } from '@/simulation/useControlState'
import { resolveConnectionPos } from '@/utils/teGrid'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import type { SimulationState } from '@/types/simulation'

interface Props {
  simState: SimulationState | null
}

export default function SchaltschrankCanvas({ simState }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { schaltschrank } = useSchaltschrankStore()
  const { zoom, panX, panY, setZoom, setPan, updateWireDrawingMouse, cancelWireDrawing, wireDrawing, mode, selectComponent, selectWire, faultWireId, lightCanvas, defaultCrossing } = useUIStore()

  const controlState = useControlState(schaltschrank)

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(zoom + delta)
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!wireDrawing.active) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const svgX = (e.clientX - rect.left - panX) / zoom
    const svgY = (e.clientY - rect.top - panY) / zoom
    updateWireDrawingMouse(svgX, svgY)
  }

  function handleCanvasClick() {
    if (wireDrawing.active) {
      cancelWireDrawing()
    }
    selectComponent(null)
    selectWire(null)
  }

  // Pan with middle mouse / right mouse
  const panStart = useRef<{ x: number; y: number } | null>(null)

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button === 1 || e.button === 2) {
      panStart.current = { x: e.clientX - panX, y: e.clientY - panY }
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (panStart.current) {
      setPan(e.clientX - panStart.current.x, e.clientY - panStart.current.y)
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (e.button === 1 || e.button === 2) {
      panStart.current = null
    }
  }

  return (
      <div
        className="relative flex-1 overflow-hidden"
        style={{ background: lightCanvas ? '#e2e8f0' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        onContextMenu={e => e.preventDefault()}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ cursor: wireDrawing.active ? 'crosshair' : mode === 'delete' ? 'not-allowed' : 'default' }}
          onWheel={handleWheel}
          onPointerMove={handlePointerMove}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Cabinet background */}
          <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
            {/* Gehäusewand (Schaltschrank-Korpus) */}
            <CabinetWall />

            {/* Wires (below components) */}
            <g>
              {schaltschrank.wires.map((wire, i) => (
                <WireRenderer
                  key={wire.id}
                  wire={wire}
                  rails={schaltschrank.rails}
                  index={i}
                  isSimRunning={simState?.running ?? false}
                  isFault={wire.id === faultWireId}
                  current={simState?.branches?.get(wire.id)?.current}
                />
              ))}
            </g>

            {/* DIN Rails */}
            {schaltschrank.rails.map(rail => (
              <DINRailRow
                key={rail.id}
                rail={rail}
                simState={simState ?? undefined}
                controlState={controlState}
              />
            ))}

            {/* Flächenübergreifende Leitungen (Innenausbau-Ende): Stub + Fronttür-Verweis */}
            {(() => {
              const panels = schaltschrank.panelComponents ?? []
              if (panels.length === 0) return null
              const isPanel = (id: string) => panels.some(p => p.instanceId === id)
              const railById = new Map(schaltschrank.rails.flatMap(r => r.placedComponents.map(c => [c.instanceId, { c, rail: r }] as const)))
              return schaltschrank.wires.filter(w => isPanel(w.fromInstanceId) !== isPanel(w.toInstanceId)).map(w => {
                const railId = isPanel(w.fromInstanceId) ? w.toInstanceId : w.fromInstanceId
                const railConnId = isPanel(w.fromInstanceId) ? w.toConnectionId : w.fromConnectionId
                const panelId = isPanel(w.fromInstanceId) ? w.fromInstanceId : w.toInstanceId
                const entry = railById.get(railId)
                if (!entry) return null
                const def = COMPONENT_MAP.get(entry.c.definitionId)
                const cp = def?.connections.find(c => c.id === railConnId)
                if (!cp) return null
                const pos = resolveConnectionPos(cp.relativeX, cp.relativeY, entry.c.tePosition, entry.rail.yPosition)
                const panel = panels.find(p => p.instanceId === panelId)
                const pLabel = panel ? (panel.settings.label || (COMPONENT_MAP.get(panel.definitionId)?.shortName ?? 'Tür')) : 'Tür'
                return (
                  <CrossingStub key={w.id} wireId={w.id} x={pos.x} y={pos.y} up={cp.relativeY === 0}
                    label={pLabel} crossing={w.crossing ?? defaultCrossing} />
                )
              })
            })()}

            {/* Platzierungs-Schatten (Vorschau beim Ziehen) */}
            <PlacementShadow />

            {/* Wire being drawn */}
            <WireInProgress />
          </g>
        </svg>

        {/* Wire color picker overlay */}
        <WireColorPicker />

        {/* Mode indicator */}
        <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded" style={{ background: '#1e293b99', color: '#64748b' }}>
          {mode === 'select' && 'Auswahl'}
          {mode === 'wire' && '⚡ Verdrahten — Klemme anklicken'}
          {mode === 'delete' && '🗑 Löschen — Element anklicken'}
          {mode === 'simulate' && '▶ Simulation'}
          {'  '}Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>
  )
}
