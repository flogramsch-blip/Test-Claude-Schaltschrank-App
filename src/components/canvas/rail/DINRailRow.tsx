import type { DINRail } from '@/types/schaltschrank'
import type { SimulationState } from '@/types/simulation'
import { useDroppable } from '@dnd-kit/core'
import DINRailTrack from './DINRailTrack'
import PlacedComponentRenderer, { PlacedComponentConnections } from '../component/PlacedComponentRenderer'
import { RAIL_TOP_OFFSET_PX, RAIL_X_OFFSET, ROW_TOTAL_HEIGHT_PX, TE_WIDTH_PX } from '@/utils/teGrid'

interface Props {
  rail: DINRail
  simState?: SimulationState
}

export default function DINRailRow({ rail, simState }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `rail-${rail.id}`,
    data: { railId: rail.id, railYPosition: rail.yPosition },
  })

  const railW = rail.lengthTE * TE_WIDTH_PX

  return (
    <g>
      {/* Drop zone + Schiene: verschoben auf rail.yPosition */}
      <g transform={`translate(0, ${rail.yPosition})`}>
        {/* Drop zone indicator */}
        {isOver && (
          <rect
            x={RAIL_X_OFFSET - 2}
            y={-2}
            width={railW + 4}
            height={ROW_TOTAL_HEIGHT_PX + 4}
            rx={4}
            fill="#3b82f620"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="6 3"
          />
        )}

        {/* Drop target rect (SVG rect for @dnd-kit) */}
        <rect
          ref={setNodeRef as unknown as React.Ref<SVGRectElement>}
          x={RAIL_X_OFFSET}
          y={0}
          width={railW}
          height={ROW_TOTAL_HEIGHT_PX}
          fill="transparent"
        />

        {/* Rail track */}
        <g transform={`translate(0, ${RAIL_TOP_OFFSET_PX})`}>
          <DINRailTrack lengthTE={rail.lengthTE} label={rail.label} />
        </g>
      </g>

      {/* Bauteile + Klemmen liegen in absoluten Canvas-Koordinaten
          (PlacedComponentRenderer / resolveConnectionPos rechnen rail.yPosition
          selbst ein – daher NICHT in das verschobene <g> packen). */}
      {rail.placedComponents.map(placed => (
        <PlacedComponentRenderer
          key={placed.instanceId}
          placed={placed}
          rail={rail}
          simState={simState?.componentStates.get(placed.instanceId)}
        />
      ))}

      {/* Connection points (rendered on top of everything) */}
      {rail.placedComponents.map(placed => (
        <PlacedComponentConnections key={placed.instanceId} placed={placed} rail={rail} />
      ))}
    </g>
  )
}
