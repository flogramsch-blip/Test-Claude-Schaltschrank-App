import { useRef } from 'react'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import { TE_WIDTH_PX, RAIL_X_OFFSET } from '@/utils/teGrid'
import DINRailRow from './rail/DINRailRow'
import WireRenderer from './wiring/WireRenderer'
import WireInProgress from './wiring/WireInProgress'
import WireColorPicker from './wiring/WireColorPicker'
import type { SimulationState } from '@/types/simulation'

interface Props {
  simState: SimulationState | null
}

export default function SchaltschrankCanvas({ simState }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { schaltschrank } = useSchaltschrankStore()
  const { zoom, panX, panY, setZoom, setPan, updateWireDrawingMouse, cancelWireDrawing, wireDrawing, mode, selectComponent, selectWire, faultWireId } = useUIStore()

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
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
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
            {/* Cabinet interior */}
            <rect
              x={0} y={0}
              width={schaltschrank.rails.reduce((max, r) => Math.max(max, r.lengthTE * TE_WIDTH_PX + RAIL_X_OFFSET + 40), 800)}
              height={schaltschrank.rails.reduce((max, r) => Math.max(max, r.yPosition + 170), 400)}
              rx={4}
              fill="#dde3e940"
              stroke="#334155"
              strokeWidth={1}
            />

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
                />
              ))}
            </g>

            {/* DIN Rails */}
            {schaltschrank.rails.map(rail => (
              <DINRailRow
                key={rail.id}
                rail={rail}
                simState={simState ?? undefined}
              />
            ))}

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
