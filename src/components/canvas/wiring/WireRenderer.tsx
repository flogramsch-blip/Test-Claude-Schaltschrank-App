import { WIRE_COLORS, resolveConnectionPos } from '@/utils/teGrid'
import { buildWirePath, buildCrossRailPath } from '@/utils/wireRouting'
import type { Wire } from '@/types/schaltschrank'
import type { DINRail } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { useUIStore } from '@/store/uiStore'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'

interface Props {
  wire: Wire
  rails: DINRail[]
  index: number
  isSimRunning: boolean
  isFault?: boolean
}

export default function WireRenderer({ wire, rails, index, isSimRunning, isFault }: Props) {
  const selectedWireId = useUIStore(s => s.selectedWireId)
  const mode = useUIStore(s => s.mode)
  const selectWire = useUIStore(s => s.selectWire)
  const removeWire = useSchaltschrankStore(s => s.removeWire)
  const isSelected = selectedWireId === wire.id

  // Find from component
  const fromRail = rails.find(r => r.placedComponents.some(c => c.instanceId === wire.fromInstanceId))
  const toRail = rails.find(r => r.placedComponents.some(c => c.instanceId === wire.toInstanceId))
  if (!fromRail || !toRail) return null

  const fromPlaced = fromRail.placedComponents.find(c => c.instanceId === wire.fromInstanceId)
  const toPlaced = toRail.placedComponents.find(c => c.instanceId === wire.toInstanceId)
  if (!fromPlaced || !toPlaced) return null

  const fromDef = COMPONENT_MAP.get(fromPlaced.definitionId)
  const toDef = COMPONENT_MAP.get(toPlaced.definitionId)
  if (!fromDef || !toDef) return null

  const fromConn = fromDef.connections.find(c => c.id === wire.fromConnectionId)
  const toConn = toDef.connections.find(c => c.id === wire.toConnectionId)
  if (!fromConn || !toConn) return null

  const fromPos = resolveConnectionPos(fromConn.relativeX, fromConn.relativeY, fromPlaced.tePosition, fromRail.yPosition)
  const toPos = resolveConnectionPos(toConn.relativeX, toConn.relativeY, toPlaced.tePosition, toRail.yPosition)

  const samRail = fromRail.id === toRail.id
  const pathD = samRail
    ? buildWirePath(fromPos.x, fromPos.y, toPos.x, toPos.y, index % 4, fromRail.yPosition)
    : buildCrossRailPath(fromPos.x, fromPos.y, toPos.x, toPos.y, index % 6)

  const color = WIRE_COLORS[wire.color] ?? '#94a3b8'
  const strokeWidth = isSelected ? 3.5 : 2.5

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (mode === 'delete') {
      removeWire(wire.id)
    } else {
      selectWire(wire.id)
    }
  }

  return (
    <g onClick={handleClick} style={{ cursor: mode === 'delete' ? 'not-allowed' : 'pointer' }}>
      {/* Fat invisible hit target */}
      <path d={pathD} stroke="transparent" strokeWidth={12} fill="none" />

      {/* Actual wire */}
      <path
        d={pathD}
        stroke={isFault ? '#dc2626' : color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isSimRunning && !isFault ? 'wire-animated' : ''}
        style={{
          filter: isSelected ? 'drop-shadow(0 0 3px #f59e0b)' : isFault ? 'drop-shadow(0 0 4px #dc2626)' : 'none',
        }}
      />

      {/* Wire label */}
      {wire.label && (
        <text
          x={(fromPos.x + toPos.x) / 2}
          y={(fromPos.y + toPos.y) / 2 - 4}
          textAnchor="middle"
          fontSize={7}
          fill="#94a3b8"
          fontFamily="monospace"
        >
          {wire.label}
        </text>
      )}
    </g>
  )
}
