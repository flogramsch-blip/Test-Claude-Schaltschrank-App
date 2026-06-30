import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import type { SimulationState } from '@/types/simulation'
import TopBar from '@/components/layout/TopBar'
import ComponentPalette from '@/components/palette/ComponentPalette'
import SchaltschrankCanvas from '@/components/canvas/SchaltschrankCanvas'
import PropertiesPanel from '@/components/panels/PropertiesPanel'
import ExercisePanel from '@/components/exercises/ExercisePanel'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSchaltschrankStore } from '@/store/schaltschrankStore'
import { useUIStore } from '@/store/uiStore'
import { COMPONENT_MAP } from '@/data/componentDefinitions'
import { TE_WIDTH_PX } from '@/utils/teGrid'

export default function App() {
  const [simState, setSimState] = useState<SimulationState | null>(null)
  const [trippedComponents, setTrippedComponents] = useState<Set<string>>(new Set())
  const [dragDefId, setDragDefId] = useState<string | null>(null)

  const addComponent = useSchaltschrankStore(s => s.addComponent)
  const zoom = useUIStore(s => s.zoom)

  useKeyboardShortcuts()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  function handleDragStart(event: DragStartEvent) {
    setDragDefId((event.active.data.current?.definitionId as string) ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragDefId(null)
    const { active, over } = event
    if (!over) return

    const overId = String(over.id)
    if (!overId.startsWith('rail-')) return

    const railId = overId.replace('rail-', '')
    const definitionId = active.data.current?.definitionId as string
    if (!definitionId) return

    // Finale Cursor-Position = Start-Position + Drag-Delta
    const activator = event.activatorEvent as PointerEvent | undefined
    const pointerX = (activator?.clientX ?? over.rect.left) + event.delta.x
    const offsetX = pointerX - over.rect.left
    const tePosition = Math.max(0, Math.round(offsetX / (TE_WIDTH_PX * zoom)))

    addComponent(definitionId, railId, tePosition)
  }

  const dragDef = dragDefId ? COMPONENT_MAP.get(dragDefId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        <TopBar
          simState={simState}
          setSimState={setSimState}
          trippedComponents={trippedComponents}
          setTrippedComponents={setTrippedComponents}
        />
        <div className="flex flex-1 overflow-hidden">
          <ComponentPalette />
          <div className="relative flex flex-1 overflow-hidden">
            <SchaltschrankCanvas simState={simState} />
            <ExercisePanel />
          </div>
          <PropertiesPanel simState={simState} />
        </div>
      </div>

      {/* Vorschau beim Ziehen */}
      <DragOverlay dropAnimation={null}>
        {dragDef ? (
          <div
            style={{
              padding: '4px 10px',
              background: '#1e293b',
              border: `2px solid ${dragDef.color}`,
              borderRadius: 4,
              color: '#e2e8f0',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {dragDef.shortName} · {dragDef.teWidth} TE
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
