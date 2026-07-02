import type { PanelComponent } from '@/types/schaltschrank'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import ConnectionPointMarker from '@/components/canvas/component/ConnectionPointMarker'
import { resolvePanelConnectionPos } from './panelGeometry'

export default function PanelConnections({ pc }: { pc: PanelComponent }) {
  const def = COMPONENT_MAP.get(pc.definitionId)
  if (!def) return null
  return (
    <>
      {def.connections.map(cp => {
        const pos = resolvePanelConnectionPos(pc, cp)
        return (
          <ConnectionPointMarker
            key={cp.id}
            cp={cp}
            instanceId={pc.instanceId}
            absoluteX={pos.x}
            absoluteY={pos.y}
          />
        )
      })}
    </>
  )
}
