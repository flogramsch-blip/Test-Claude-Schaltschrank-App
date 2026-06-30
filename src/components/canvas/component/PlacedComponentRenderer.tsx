import type { PlacedComponent, DINRail } from '@/types/schaltschrank'
import type { ComponentSimState } from '@/types/simulation'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { TE_WIDTH_PX, RAIL_HEIGHT_PX, RAIL_TOP_OFFSET_PX, RAIL_X_OFFSET, resolveConnectionPos } from '@/utils/teGrid'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import ConnectionPointMarker from './ConnectionPointMarker'
import LSSRenderer from './renderers/LSSRenderer'
import MotorschutzRenderer from './renderers/MotorschutzRenderer'
import FIRenderer from './renderers/FIRenderer'
import SchuetzRenderer from './renderers/SchuetzRenderer'
import KlemmeRenderer from './renderers/KlemmeRenderer'
import ButtonRenderer from './renderers/ButtonRenderer'
import LampRenderer from './renderers/LampRenderer'
import GenericRenderer from './renderers/GenericRenderer'

interface Props {
  placed: PlacedComponent
  rail: DINRail
  simState?: ComponentSimState
}

export default function PlacedComponentRenderer({ placed, rail, simState }: Props) {
  const mode = useUIStore(s => s.mode)
  const selectedId = useUIStore(s => s.selectedInstanceId)
  const selectComponent = useUIStore(s => s.selectComponent)
  const removeComponent = useSchaltschrankStore(s => s.removeComponent)

  const def = COMPONENT_MAP.get(placed.definitionId)
  if (!def) return null

  const x = RAIL_X_OFFSET + placed.tePosition * TE_WIDTH_PX
  const y = rail.yPosition + RAIL_TOP_OFFSET_PX
  const w = def.teWidth * TE_WIDTH_PX

  const isSelected = selectedId === placed.instanceId
  const tripped = simState?.tripped ?? false

  function handlePointerDown(e: React.PointerEvent) {
    if (mode === 'wire') return
    if (mode === 'delete') {
      e.stopPropagation()
      removeComponent(placed.instanceId)
      return
    }
    e.stopPropagation()
    selectComponent(placed.instanceId)
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
        return <SchuetzRenderer def={def!} placed={placed} closed={simState?.closed} />
      case 'terminal':
        return <KlemmeRenderer def={def!} />
      case 'button':
      case 'selector':
      case 'emergency-stop':
        return <ButtonRenderer def={def!} placed={placed} />
      case 'indicator':
        return <LampRenderer def={def!} placed={placed} energized={simState?.energized} />
      default:
        return <GenericRenderer def={def!} placed={placed} />
    }
  }

  const label = placed.settings.label || def.shortName

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: mode === 'delete' ? 'not-allowed' : mode === 'select' ? 'grab' : 'default' }}
      onPointerDown={handlePointerDown}
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
